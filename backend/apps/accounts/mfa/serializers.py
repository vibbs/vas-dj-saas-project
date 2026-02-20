from rest_framework import serializers


class MFASetupSerializer(serializers.Serializer):
    """Response for MFA setup initiation."""

    secret = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True, help_text="Base64 encoded QR code image")
    otpauth_uri = serializers.CharField(read_only=True)


class MFAVerifySerializer(serializers.Serializer):
    """Request to verify a TOTP token (used during setup confirmation and login)."""

    token = serializers.CharField(max_length=6, min_length=6)


class MFABackupCodesSerializer(serializers.Serializer):
    """Response containing backup codes."""

    codes = serializers.ListField(child=serializers.CharField(), read_only=True)


class MFALoginSerializer(serializers.Serializer):
    """Request for MFA-challenged login."""

    mfa_token = serializers.CharField(help_text="Temporary token from initial login")
    totp_code = serializers.CharField(
        max_length=6, min_length=6, required=False, help_text="6-digit TOTP code"
    )
    backup_code = serializers.CharField(
        required=False, help_text="Backup code (format: XXXX-XXXX)"
    )

    def validate(self, data):
        if not data.get("totp_code") and not data.get("backup_code"):
            raise serializers.ValidationError(
                "Either totp_code or backup_code must be provided."
            )
        return data


class MFAStatusSerializer(serializers.Serializer):
    """Response for MFA status check."""

    enabled = serializers.BooleanField()
    confirmed = serializers.BooleanField()
    backup_codes_remaining = serializers.IntegerField()
