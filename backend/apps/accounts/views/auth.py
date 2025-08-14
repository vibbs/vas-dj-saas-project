from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.http import Http404

from apps.accounts.models import Account
from apps.accounts.serializers import (
    AccountSerializer,
    RegistrationSerializer,
    RegistrationResponseSerializer,
    SocialRegistrationSerializer,
    SocialLoginSerializer,
)
from apps.core.exceptions import (
    MissingRequiredFieldException,
    InvalidCredentialsException,
    AccountDisabledException,
    InvalidRefreshTokenException,
)
from apps.core.responses import ok, created
from apps.core.codes import APIResponseCodes


# Serializers for documentation purposes
class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="User's email address")
    password = serializers.CharField(write_only=True, help_text="User's password")


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField(help_text="JWT access token")
    refresh = serializers.CharField(help_text="JWT refresh token")
    user = AccountSerializer(help_text="User information")


class RefreshTokenRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="JWT refresh token")


class RefreshTokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField(help_text="New JWT access token")
    refresh = serializers.CharField(help_text="New JWT refresh token")


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="JWT refresh token to blacklist")


class LogoutResponseSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="Success message")


class TokenVerifyResponseSerializer(serializers.Serializer):
    valid = serializers.BooleanField(help_text="Whether the token is valid")
    user = AccountSerializer(
        help_text="User information if token is valid", required=False
    )


@extend_schema(
    summary="User Login",
    description="Authenticate user with email and password, returns JWT access and refresh tokens along with user information.",
    request=LoginRequestSerializer,
    responses={
        200: LoginResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Login Request",
            summary="Example login request",
            description="Login with email and password",
            value={"email": "user@example.com", "password": "securepassword123"},
            request_only=True,
        ),
        OpenApiExample(
            "Login Success Response",
            summary="Successful login response",
            description="Returns JWT tokens and user information",
            value={
                "data": {
                    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "user@example.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "role": "USER",
                        "isAdmin": False,
                    },
                }
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint that returns JWT tokens and user information
    """
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        raise MissingRequiredFieldException(
            detail="Email and password are required",
            extra_data={"missing_fields": ["email", "password"]},
        )

    user = authenticate(email=email, password=password)

    if user is None:
        raise InvalidCredentialsException()

    if not user.is_active:
        raise AccountDisabledException()

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Add custom claims
    access["email"] = user.email
    access["role"] = user.role
    access["is_admin"] = user.is_admin
    access["org_id"] = (
        str(user.organization.id)
        if hasattr(user, "organization") and user.organization
        else None
    )

    # Update last login
    update_last_login(None, user)

    # Serialize user data
    user_serializer = AccountSerializer(user)

    return ok(
        data={
            "access": str(access),
            "refresh": str(refresh),
            "user": user_serializer.data,
        },
        code=APIResponseCodes.AUTH_LOGIN_200,
        i18n_key="auth.login.success",
    )


@extend_schema(
    summary="Refresh JWT Token",
    description="Generate a new access token using a valid refresh token. Also returns a new refresh token if rotation is enabled.",
    request=RefreshTokenRequestSerializer,
    responses={
        200: RefreshTokenResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Refresh Token Request",
            summary="Example refresh token request",
            description="Provide refresh token to get new access token",
            value={"refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."},
            request_only=True,
        ),
        OpenApiExample(
            "Refresh Token Success Response",
            summary="Successful refresh response",
            description="Returns new access and refresh tokens",
            value={
                "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh JWT token endpoint
    """
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        raise MissingRequiredFieldException(
            detail="Refresh token is required",
            extra_data={"missing_fields": ["refresh"]},
        )

    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token

        # Get user and add custom claims
        user = Account.objects.get(id=refresh["user_id"])
        access["email"] = user.email
        access["role"] = user.role
        access["is_admin"] = user.is_admin
        access["org_id"] = (
            str(user.organization.id)
            if hasattr(user, "organization") and user.organization
            else None
        )

        return ok(
            data={"access": str(access), "refresh": str(refresh)},
            code=APIResponseCodes.AUTH_REFRESH_200,
            i18n_key="auth.refresh.success",
        )

    except Exception:
        raise InvalidRefreshTokenException()


@extend_schema(
    summary="User Logout",
    description="Logout user by blacklisting the provided refresh token. This prevents the refresh token from being used again.",
    request=LogoutRequestSerializer,
    responses={
        200: LogoutResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Logout Request",
            summary="Example logout request",
            description="Provide refresh token to logout",
            value={"refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."},
            request_only=True,
        ),
        OpenApiExample(
            "Logout Success Response",
            summary="Successful logout response",
            description="Confirms successful logout",
            value={"message": "Successfully logged out"},
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
def logout(request):
    """
    Logout endpoint that blacklists the refresh token
    """
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        raise MissingRequiredFieldException(
            detail="Refresh token is required",
            extra_data={"missing_fields": ["refresh"]},
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()

        return ok(
            data={"message": "Successfully logged out"},
            code=APIResponseCodes.AUTH_LOGOUT_200,
            i18n_key="auth.logout.success",
        )
    except Exception:
        raise InvalidRefreshTokenException()


@extend_schema(
    summary="Verify JWT Token",
    description="Verify if the current JWT token in the Authorization header is valid and return user information. Requires 'Bearer <token>' in Authorization header.",
    request=None,
    responses={
        200: TokenVerifyResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Token Verify Success Response",
            summary="Valid token response",
            description="Returns token validity and user information",
            value={
                "data": {
                    "valid": True,
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "user@example.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "role": "USER",
                        "isAdmin": False,
                    },
                }
            },
            response_only=True,
            status_codes=["200"],
        ),
        OpenApiExample(
            "Token Verify Invalid Response",
            summary="Invalid token response",
            description="Returns when token is invalid or expired",
            value={"valid": False, "error": "Token is invalid or expired"},
            response_only=True,
            status_codes=["401"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["GET"])
def verify_token(request):
    """
    Verify if the current JWT token is valid and return user info
    """
    if request.user.is_authenticated:
        user_serializer = AccountSerializer(request.user)
        return ok(
            data={"valid": True, "user": user_serializer.data},
            code=APIResponseCodes.AUTH_VERIFY_200,
            i18n_key="auth.verify.success",
        )

    raise AuthenticationFailed("Token is invalid or expired")


@extend_schema(
    summary="User Registration",
    description="Register a new user account with automatic organization creation and trial setup. Creates a personal organization for each user with a 14-day trial period.",
    request=RegistrationSerializer,
    responses={
        201: RegistrationResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Registration Request",
            summary="Example registration request",
            description="Register with email, password, and personal details",
            value={
                "email": "john.doe@example.com",
                "password": "securepassword123",
                "passwordConfirm": "securepassword123",
                "firstName": "John",
                "lastName": "Doe",
                "organizationName": "John's Company",
                "preferredSubdomain": "johns-company",
            },
            request_only=True,
        ),
        OpenApiExample(
            "Registration Success Response",
            summary="Successful registration response",
            description="Returns JWT tokens, user information, and organization details",
            value={
                "data": {
                    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "john.doe@example.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "role": "USER",
                        "isAdmin": True,
                        "status": "PENDING",
                    },
                    "organization": {
                        "id": "456e7890-e89b-12d3-a456-426614174001",
                        "name": "John's Company",
                        "subdomain": "johns-company",
                        "onTrial": True,
                        "trialEndsOn": "2024-02-01",
                    },
                }
            },
            response_only=True,
            status_codes=["201"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    Registration endpoint that creates a new user account with automatic organization setup
    """
    serializer = RegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        raise ValidationError(serializer.errors)

    # Create user with organization and trial setup
    user = serializer.save()

    # Generate tokens for immediate login
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Add custom claims
    access["email"] = user.email
    access["role"] = user.role
    access["is_admin"] = user.is_admin
    access["org_id"] = (
        str(user.organization.id)
        if hasattr(user, "organization") and user.organization
        else None
    )
    access["trial_ends_on"] = (
        user.organization.trial_ends_on.isoformat()
        if hasattr(user, "organization")
        and user.organization
        and user.organization.trial_ends_on
        else None
    )

    # Set last login for new registration (since they're automatically logged in)
    if hasattr(user, "last_login"):
        user.last_login = timezone.now()
        try:
            user.save(update_fields=["last_login"])
        except Exception:
            # If updating last_login fails, continue without it
            pass

    # Prepare response data
    response_data = {
        "access": str(access),
        "refresh": str(refresh),
        "user": user,
        "organization": user.organization if hasattr(user, "organization") else None,
    }

    # Serialize response
    response_serializer = RegistrationResponseSerializer(response_data)

    return created(
        data=response_serializer.data,
        code=APIResponseCodes.AUTH_REGISTER_201,
        i18n_key="auth.register.success",
    )


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification request."""

    token = serializers.CharField(help_text="Email verification token")


class EmailVerificationResponseSerializer(serializers.Serializer):
    """Serializer for email verification response."""

    message = serializers.CharField(help_text="Success message")
    user = AccountSerializer(help_text="Updated user information")


@extend_schema(
    summary="Verify Email Address",
    description="Verify user's email address using the verification token sent via email. Activates the user account upon successful verification.",
    request=EmailVerificationSerializer,
    responses={
        200: EmailVerificationResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Email Verification Request",
            summary="Example email verification request",
            description="Verify email with token from verification email",
            value={"token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"},
            request_only=True,
        ),
        OpenApiExample(
            "Email Verification Success Response",
            summary="Successful verification response",
            description="Returns success message and updated user information",
            value={
                "data": {
                    "message": "Email verified successfully! Your account is now active.",
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "john.doe@example.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "isEmailVerified": True,
                        "status": "ACTIVE",
                    },
                }
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Email verification endpoint that activates user account
    """
    serializer = EmailVerificationSerializer(data=request.data)

    if not serializer.is_valid():
        raise ValidationError(serializer.errors)

    token = serializer.validated_data["token"]

    try:
        # Find user with this verification token
        user = Account.objects.get(
            email_verification_token=token,
            email_verification_token_expires__gt=timezone.now(),
        )

        # Verify the email
        if user.verify_email(token):
            user_serializer = AccountSerializer(user)
            return ok(
                data={
                    "message": "Email verified successfully! Your account is now active.",
                    "user": user_serializer.data,
                },
                code=APIResponseCodes.EMAIL_VERIFY_200,
                i18n_key="email.verification.success",
            )
        else:
            raise ValidationError({"token": ["Invalid or expired verification token"]})

    except Account.DoesNotExist:
        raise ValidationError({"token": ["Invalid or expired verification token"]})


@extend_schema(
    summary="Resend Email Verification",
    description="Resend email verification email to the current user. Requires authentication.",
    request=None,
    responses={
        200: serializers.Serializer,
    },
    examples=[
        OpenApiExample(
            "Resend Verification Success Response",
            summary="Successful resend response",
            description="Confirms verification email was sent",
            value={"message": "Verification email sent successfully"},
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
def resend_verification_email(request):
    """
    Resend email verification email to the authenticated user
    """
    user = request.user

    if user.is_email_verified:
        return ok(
            data={"message": "Email is already verified"},
            code=APIResponseCodes.EMAIL_ALREADY_VERIFIED_200,
            i18n_key="email.already_verified",
        )

    if user.send_verification_email():
        return ok(
            data={"message": "Verification email sent successfully"},
            code=APIResponseCodes.EMAIL_SENT_200,
            i18n_key="email.verification.sent",
        )
    else:
        # This will be caught by the global exception handler as a 500 error
        raise Exception("Failed to send verification email")


@extend_schema(
    summary="Social Registration/Login",
    description="Register or login a user using social authentication providers (Google, GitHub, etc.). Creates a new account if the user doesn't exist, or links the provider to an existing account.",
    request=SocialRegistrationSerializer,
    responses={
        201: RegistrationResponseSerializer,
        200: RegistrationResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Social Auth Request",
            summary="Example social authentication request",
            description="Authenticate with Google",
            value={
                "provider": "google",
                "providerUserId": "123456789012345678901",
                "email": "john.doe@gmail.com",
                "firstName": "John",
                "lastName": "Doe",
                "avatar": "https://lh3.googleusercontent.com/a/example",
                "organizationName": "John's Company",
                "preferredSubdomain": "johns-company",
            },
            request_only=True,
        ),
        OpenApiExample(
            "Social Auth Success Response",
            summary="Successful social authentication response",
            description="Returns JWT tokens and user information (new or existing user)",
            value={
                "data": {
                    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "john.doe@gmail.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "isEmailVerified": True,
                        "status": "ACTIVE",
                    },
                    "organization": {
                        "id": "456e7890-e89b-12d3-a456-426614174001",
                        "name": "John's Company",
                        "subdomain": "johns-company",
                        "onTrial": True,
                        "trialEndsOn": "2024-02-01",
                    },
                }
            },
            response_only=True,
            status_codes=["200", "201"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def social_auth(request):
    """
    Social authentication endpoint that handles both registration and login
    """
    serializer = SocialRegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        raise ValidationError(serializer.errors)

    # Check if user already exists with this provider
    provider = serializer.validated_data["provider"]
    provider_user_id = serializer.validated_data["provider_user_id"]

    from apps.accounts.models import AccountAuthProvider

    existing_provider = AccountAuthProvider.objects.filter(
        provider=provider, provider_user_id=provider_user_id
    ).first()

    is_new_user = not existing_provider

    # Create or get user
    user = serializer.save()

    # Generate tokens for login
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Add custom claims
    access["email"] = user.email
    access["role"] = user.role
    access["is_admin"] = user.is_admin
    access["org_id"] = (
        str(user.organization.id)
        if hasattr(user, "organization") and user.organization
        else None
    )
    access["trial_ends_on"] = (
        user.organization.trial_ends_on.isoformat()
        if hasattr(user, "organization")
        and user.organization
        and user.organization.trial_ends_on
        else None
    )

    # Update last login
    update_last_login(None, user)

    # Prepare response data
    response_data = {
        "access": str(access),
        "refresh": str(refresh),
        "user": user,
        "organization": user.organization if hasattr(user, "organization") else None,
    }

    # Serialize response
    response_serializer = RegistrationResponseSerializer(response_data)

    # Return 201 for new user, 200 for existing user
    status_code = status.HTTP_201_CREATED if is_new_user else status.HTTP_200_OK

    if status_code == status.HTTP_201_CREATED:
        return created(
            data=response_serializer.data,
            code=APIResponseCodes.AUTH_SOCIAL_REGISTER_201,
            i18n_key="auth.social.register.success",
        )
    else:
        return ok(
            data=response_serializer.data,
            code=APIResponseCodes.AUTH_SOCIAL_LOGIN_200,
            i18n_key="auth.social.login.success",
        )


@extend_schema(
    summary="Social Login (Existing Users)",
    description="Login an existing user using social authentication. Requires the user to already have an account with the specified provider.",
    request=SocialLoginSerializer,
    responses={
        200: RegistrationResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Social Login Request",
            summary="Example social login request",
            description="Login with existing Google account",
            value={
                "provider": "google",
                "providerUserId": "123456789012345678901",
                "email": "john.doe@gmail.com",
            },
            request_only=True,
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
def social_login(request):
    """
    Social login endpoint for existing users
    """
    serializer = SocialLoginSerializer(data=request.data)

    if not serializer.is_valid():
        raise ValidationError(serializer.errors)

    user = serializer.validated_data["user"]

    # Check if user is active
    if not user.is_active:
        raise AccountDisabledException()

    # Generate tokens for login
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Add custom claims
    access["email"] = user.email
    access["role"] = user.role
    access["is_admin"] = user.is_admin
    access["org_id"] = (
        str(user.organization.id)
        if hasattr(user, "organization") and user.organization
        else None
    )
    access["trial_ends_on"] = (
        user.organization.trial_ends_on.isoformat()
        if hasattr(user, "organization")
        and user.organization
        and user.organization.trial_ends_on
        else None
    )

    # Update last login
    update_last_login(None, user)

    # Prepare response data
    response_data = {
        "access": str(access),
        "refresh": str(refresh),
        "user": user,
        "organization": user.organization if hasattr(user, "organization") else None,
    }

    # Serialize response
    response_serializer = RegistrationResponseSerializer(response_data)

    return ok(
        data=response_serializer.data,
        code=APIResponseCodes.AUTH_SOCIAL_LOGIN_200,
        i18n_key="auth.social.login.success",
    )
