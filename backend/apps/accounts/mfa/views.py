import base64
import io
import logging

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BackupCode, TOTPDevice
from .serializers import (
    MFABackupCodesSerializer,
    MFASetupSerializer,
    MFAStatusSerializer,
    MFAVerifySerializer,
)

log = logging.getLogger(f"{getattr(settings, 'LOG_APP_PREFIX', 'app')}.mfa")


class MFAStatusView(APIView):
    """Get current MFA status for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get MFA status",
        responses={200: MFAStatusSerializer},
        tags=["MFA"],
    )
    def get(self, request):
        device = TOTPDevice.objects.filter(user=request.user).first()
        backup_count = BackupCode.objects.filter(
            user=request.user, used=False
        ).count()

        data = {
            "enabled": device.confirmed if device else False,
            "confirmed": device.confirmed if device else False,
            "backup_codes_remaining": backup_count,
        }
        return Response(MFAStatusSerializer(data).data)


class MFASetupView(APIView):
    """Initiate MFA setup — generates secret and QR code."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Setup MFA",
        description="Generate a TOTP secret and QR code. Must be confirmed with a valid token before MFA is active.",
        responses={200: MFASetupSerializer},
        tags=["MFA"],
    )
    def post(self, request):
        # Check if already set up and confirmed
        existing = TOTPDevice.objects.filter(user=request.user, confirmed=True).first()
        if existing:
            return Response(
                {"detail": "MFA is already enabled. Disable it first to reconfigure."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create or reset device
        device, _ = TOTPDevice.objects.update_or_create(
            user=request.user,
            defaults={"secret": TOTPDevice.generate_secret(), "confirmed": False},
        )

        # Generate QR code
        qr_code_b64 = self._generate_qr_code(device.get_totp_uri())

        data = {
            "secret": device.secret,
            "qr_code": qr_code_b64,
            "otpauth_uri": device.get_totp_uri(),
        }
        return Response(MFASetupSerializer(data).data)

    def _generate_qr_code(self, uri: str) -> str:
        try:
            import qrcode

            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(uri)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
        except ImportError:
            log.warning("qrcode package not installed, returning empty QR")
            return ""


class MFAConfirmView(APIView):
    """Confirm MFA setup by verifying a TOTP token."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Confirm MFA setup",
        description="Verify a TOTP token to confirm MFA setup. Also generates backup codes.",
        request=MFAVerifySerializer,
        responses={200: MFABackupCodesSerializer},
        tags=["MFA"],
    )
    def post(self, request):
        serializer = MFAVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        device = TOTPDevice.objects.filter(user=request.user, confirmed=False).first()
        if not device:
            return Response(
                {"detail": "No pending MFA setup found. Call setup first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not device.verify_token(serializer.validated_data["token"]):
            return Response(
                {"detail": "Invalid TOTP code. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Confirm the device
        device.confirmed = True
        device.save(update_fields=["confirmed"])

        # Enable 2FA on account
        request.user.is_2fa_enabled = True
        request.user.save(update_fields=["is_2fa_enabled"])

        # Generate backup codes
        codes = BackupCode.generate_codes(request.user)

        return Response(MFABackupCodesSerializer({"codes": codes}).data)


class MFADisableView(APIView):
    """Disable MFA for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Disable MFA",
        description="Disable MFA. Requires current password for verification.",
        request={
            "application/json": {
                "type": "object",
                "properties": {"password": {"type": "string"}},
                "required": ["password"],
            }
        },
        tags=["MFA"],
    )
    def post(self, request):
        password = request.data.get("password")
        if not password or not request.user.check_password(password):
            return Response(
                {"detail": "Invalid password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remove device and backup codes
        TOTPDevice.objects.filter(user=request.user).delete()
        BackupCode.objects.filter(user=request.user).delete()

        # Disable 2FA on account
        request.user.is_2fa_enabled = False
        request.user.save(update_fields=["is_2fa_enabled"])

        return Response({"detail": "MFA has been disabled."})


class MFABackupCodesView(APIView):
    """Regenerate backup codes."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Regenerate backup codes",
        description="Generate new backup codes. Invalidates all existing unused codes.",
        responses={200: MFABackupCodesSerializer},
        tags=["MFA"],
    )
    def post(self, request):
        device = TOTPDevice.objects.filter(user=request.user, confirmed=True).first()
        if not device:
            return Response(
                {"detail": "MFA is not enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        codes = BackupCode.generate_codes(request.user)
        return Response(MFABackupCodesSerializer({"codes": codes}).data)


class MFAVerifyLoginView(APIView):
    """Verify TOTP during login (second factor)."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Verify MFA during login",
        description="Complete login by providing TOTP code or backup code after initial password authentication.",
        tags=["MFA"],
    )
    def post(self, request):
        from apps.accounts.serializers import AccountSerializer
        from apps.core.responses import ok

        mfa_token = request.data.get("mfa_token")
        totp_code = request.data.get("totp_code")
        backup_code = request.data.get("backup_code")

        if not mfa_token:
            return Response(
                {"detail": "mfa_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not totp_code and not backup_code:
            return Response(
                {"detail": "Either totp_code or backup_code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Retrieve user_id from cache
        cache_key = f"mfa_challenge:{mfa_token}"
        user_id = cache.get(cache_key)
        if not user_id:
            return Response(
                {"detail": "MFA challenge expired or invalid. Please login again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.accounts.models import Account

        try:
            user = Account.objects.get(id=user_id)
        except Account.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify TOTP or backup code
        verified = False
        if totp_code:
            device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            if device and device.verify_token(totp_code):
                device.last_used_at = timezone.now()
                device.save(update_fields=["last_used_at"])
                verified = True
        elif backup_code:
            verified = BackupCode.verify_code(user, backup_code)

        if not verified:
            return Response(
                {"detail": "Invalid code. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete the challenge token
        cache.delete(cache_key)

        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken

        from apps.accounts.views.auth import add_custom_claims

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        add_custom_claims(access, user)

        user_serializer = AccountSerializer(user)

        return ok(
            data={
                "access": str(access),
                "refresh": str(refresh),
                "user": user_serializer.data,
            },
        )
