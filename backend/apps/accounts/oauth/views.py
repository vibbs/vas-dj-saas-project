"""
OAuth callback views for server-side token verification.

Flow:
1. Frontend obtains an access_token/id_token from the OAuth provider (Google/GitHub)
2. Frontend POSTs the token + provider name to /api/v1/auth/oauth/callback/
3. Backend verifies the token server-side with the provider's API
4. Backend creates or links the account and returns JWT tokens
"""

from django.contrib.auth.models import update_last_login
from django.db import transaction
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Account, AccountAuthProvider
from apps.accounts.serializers import (
    AccountSerializer,
    RegistrationResponseSerializer,
    SocialRegistrationSerializer,
)
from apps.accounts.views.auth import add_custom_claims
from apps.core.audit.models import AuditAction
from apps.core.audit.utils import log_authentication_event
from apps.core.codes import APIResponseCodes
from apps.core.responses import created, ok

from .providers import OAuthProviderError, get_oauth_provider


class OAuthCallbackRequestSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(
        choices=["google", "github"],
        help_text="OAuth provider name",
    )
    token = serializers.CharField(
        help_text="Access token or ID token from the OAuth provider"
    )
    organization_name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Organization name for new users (optional)",
    )
    preferred_subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        min_length=3,
        max_length=50,
        help_text="Preferred subdomain for new users (optional)",
    )


@extend_schema(
    summary="OAuth Callback",
    description=(
        "Server-side OAuth token verification. The frontend sends the provider's "
        "access_token or id_token, and the backend verifies it directly with the "
        "provider's API. Creates a new account or logs in an existing user."
    ),
    request=OAuthCallbackRequestSerializer,
    responses={200: RegistrationResponseSerializer, 201: RegistrationResponseSerializer},
    examples=[
        OpenApiExample(
            "Google OAuth",
            value={
                "provider": "google",
                "token": "ya29.a0AfH6SMB...",
                "organization_name": "My Company",
            },
            request_only=True,
        ),
        OpenApiExample(
            "GitHub OAuth",
            value={"provider": "github", "token": "gho_xxxxx..."},
            request_only=True,
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
@transaction.atomic
def oauth_callback(request):
    """
    Verify an OAuth token server-side and create/login the user.

    This is the recommended OAuth flow. The frontend:
    1. Redirects user to provider's consent screen
    2. Receives an access_token/id_token via the provider's SDK
    3. POSTs the token here for server-side verification
    """
    serializer = OAuthCallbackRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return _error_response(serializer.errors)

    provider_name = serializer.validated_data["provider"]
    token = serializer.validated_data["token"]

    # 1. Verify token with the provider
    try:
        oauth_provider = get_oauth_provider(provider_name)
        user_info = oauth_provider.verify_token(token)
    except OAuthProviderError as e:
        log_authentication_event(
            request=request,
            action=AuditAction.LOGIN_FAILED,
            success=False,
            details={"provider": provider_name, "reason": str(e)},
            error_message=str(e),
        )
        return _error_response(
            {"token": [str(e)]}, status_code=status.HTTP_401_UNAUTHORIZED
        )

    # 2. Find or create the user
    existing_provider = AccountAuthProvider.objects.filter(
        provider=user_info.provider,
        provider_user_id=user_info.provider_user_id,
    ).first()

    is_new_user = False

    if existing_provider:
        user = existing_provider.user
    else:
        # Check if user exists with this email
        existing_user = Account.objects.filter(email=user_info.email).first()

        if existing_user:
            # Link provider to existing account
            AccountAuthProvider.objects.create(
                user=existing_user,
                provider=user_info.provider,
                provider_user_id=user_info.provider_user_id,
                email=user_info.email,
                is_primary=not existing_user.auth_providers.exists(),
            )
            user = existing_user
        else:
            # Create new user via the existing SocialRegistrationSerializer
            reg_data = {
                "provider": user_info.provider,
                "provider_user_id": user_info.provider_user_id,
                "email": user_info.email,
                "first_name": user_info.first_name,
                "last_name": user_info.last_name,
                "avatar": user_info.avatar,
                "organization_name": serializer.validated_data.get(
                    "organization_name", ""
                ),
                "preferred_subdomain": serializer.validated_data.get(
                    "preferred_subdomain", ""
                ),
            }
            reg_serializer = SocialRegistrationSerializer(data=reg_data)
            if reg_serializer.is_valid():
                user = reg_serializer.save()
                is_new_user = True
            else:
                return _error_response(reg_serializer.errors)

    if not user.is_active:
        return _error_response(
            {"detail": ["Account is disabled"]},
            status_code=status.HTTP_403_FORBIDDEN,
        )

    # 3. Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    add_custom_claims(access, user)

    primary_org = user.get_primary_organization()
    access["trial_ends_on"] = (
        primary_org.trial_ends_on.isoformat()
        if primary_org and primary_org.trial_ends_on
        else None
    )

    update_last_login(None, user)

    log_authentication_event(
        request=request,
        action=AuditAction.LOGIN_SUCCESS,
        user=user,
        success=True,
        details={
            "email": user.email,
            "method": f"oauth_{user_info.provider}",
            "is_new_user": is_new_user,
        },
    )

    response_data = {
        "access": str(access),
        "refresh": str(refresh),
        "user": user,
        "organization": user.organization if hasattr(user, "organization") else None,
    }
    response_serializer = RegistrationResponseSerializer(response_data)

    if is_new_user:
        return created(
            data=response_serializer.data,
            code=APIResponseCodes.AUTH_SOCIAL_REGISTER_201,
            i18n_key="auth.social.register.success",
        )
    return ok(
        data=response_serializer.data,
        code=APIResponseCodes.AUTH_SOCIAL_LOGIN_200,
        i18n_key="auth.social.login.success",
    )


def _error_response(errors, status_code=status.HTTP_400_BAD_REQUEST):
    from rest_framework.response import Response

    return Response({"errors": errors}, status=status_code)
