from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Account
from apps.accounts.serializers import (
    AccountSerializer,
    RegistrationResponseSerializer,
    RegistrationSerializer,
    ResendVerificationByEmailSerializer,
    SocialLoginSerializer,
    SocialRegistrationSerializer,
)
from apps.core.audit.models import AuditAction
from apps.core.audit.utils import log_authentication_event
from apps.core.codes import APIResponseCodes
from apps.core.exceptions import (
    AccountDisabledException,
    InvalidCredentialsException,
    InvalidRefreshTokenException,
    MissingRequiredFieldException,
)
from apps.core.exceptions.client_errors import ValidationException
from apps.core.responses import created, ok
from apps.core.utils.rate_limiting import rate_limit


def convert_serializer_errors_to_rfc7807(serializer_errors):
    """Convert Django serializer errors to RFC 7807 format with issues array."""
    issues = []

    for field_name, field_errors in serializer_errors.items():
        if not isinstance(field_errors, list):
            field_errors = [field_errors]

        for error in field_errors:
            issue = {
                "message": str(error),
                "path": [field_name] if field_name != "non_field_errors" else [],
            }
            if field_name == "password" or "password" in str(error).lower():
                issue["type"] = "password_validation"
            elif field_name == "email":
                issue["type"] = "email_validation"
            elif field_name == "non_field_errors":
                issue["type"] = "general_validation"
            else:
                issue["type"] = "field_validation"

            issues.append(issue)

    return issues


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
        missing_fields = []
        if not email:
            missing_fields.append("email")
        if not password:
            missing_fields.append("password")
        raise MissingRequiredFieldException(
            detail="Email and password are required",
            extra_data={"missing_fields": missing_fields},
        )

    user = authenticate(email=email, password=password)

    if user is None:
        # Log failed login attempt
        log_authentication_event(
            request=request,
            action=AuditAction.LOGIN_FAILED,
            success=False,
            details={"email": email, "reason": "invalid_credentials"},
            error_message="Invalid email or password",
        )

        # Check if user exists but might have other issues
        try:
            user_exists = Account.objects.get(email=email)
            if not user_exists.is_email_verified:
                # User exists but email not verified
                log_authentication_event(
                    request=request,
                    action=AuditAction.LOGIN_FAILED,
                    user=user_exists,
                    success=False,
                    details={"email": email, "reason": "email_not_verified"},
                )
                issues = [
                    {
                        "message": "Please verify your email address before logging in. Check your inbox for the verification email.",
                        "path": [],
                        "type": "email_verification_required",
                    }
                ]
                raise ValidationException(
                    detail="Email verification required",
                    issues=issues,
                    email_verification_required=True,
                    user_id=str(user_exists.id),
                )
            elif user_exists.status == "PENDING":
                # User account is pending
                log_authentication_event(
                    request=request,
                    action=AuditAction.LOGIN_FAILED,
                    user=user_exists,
                    success=False,
                    details={"email": email, "reason": "account_pending"},
                )
                issues = [
                    {
                        "message": "Your account is pending approval. Please verify your email address or contact support.",
                        "path": [],
                        "type": "email_verification_required",
                    }
                ]
                raise ValidationException(
                    detail="Account verification required",
                    issues=issues,
                    email_verification_required=True,
                    user_id=str(user_exists.id),
                )
            elif not user_exists.is_active:
                log_authentication_event(
                    request=request,
                    action=AuditAction.LOGIN_FAILED,
                    user=user_exists,
                    success=False,
                    details={"email": email, "reason": "account_disabled"},
                )
                raise AccountDisabledException()
            else:
                # User exists and is active, so it's likely a password issue
                log_authentication_event(
                    request=request,
                    action=AuditAction.LOGIN_FAILED,
                    user=user_exists,
                    success=False,
                    details={"email": email, "reason": "invalid_password"},
                )
                raise InvalidCredentialsException()
        except Account.DoesNotExist:
            # User doesn't exist - already logged above
            raise InvalidCredentialsException()

    if not user.is_active:
        raise AccountDisabledException()

    # Check if email is verified for login
    if not user.is_email_verified and user.status == "PENDING":
        issues = [
            {
                "message": "Please verify your email address before logging in. Check your inbox for the verification email.",
                "path": [],
                "type": "email_verification_required",
            }
        ]
        raise ValidationException(
            detail="Email verification required",
            issues=issues,
            email_verification_required=True,
            user_id=str(user.id),
        )

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

    # Log successful login
    log_authentication_event(
        request=request,
        action=AuditAction.LOGIN_SUCCESS,
        user=user,
        success=True,
        details={"email": email, "method": "email_password"},
    )

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
@permission_classes([permissions.IsAuthenticated])
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

    raise InvalidCredentialsException("Token is invalid or expired")


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
@transaction.atomic  # Ensure all-or-nothing: user, org, membership creation
def register(request):
    """
    Registration endpoint that creates a new user account with automatic organization setup.
    Uses transaction to ensure atomicity: if any step fails, everything rolls back.
    """
    serializer = RegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

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


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""

    email = serializers.EmailField(help_text="Email address of the account to reset")


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""

    token = serializers.CharField(help_text="Password reset token")
    new_password = serializers.CharField(
        write_only=True,
        help_text="New password (min 8 characters, must include uppercase, lowercase, number)",
        min_length=8,
    )
    new_password_confirm = serializers.CharField(
        write_only=True, help_text="Confirm new password", min_length=8
    )

    def validate(self, attrs):
        """Validate passwords match and meet requirements."""
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )

        # Use Django's password validators
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        try:
            validate_password(attrs["new_password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return attrs


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
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

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
            issues = [
                {
                    "message": "Invalid or expired verification token",
                    "path": ["token"],
                    "type": "token_validation",
                }
            ]
            raise ValidationException(detail="Validation failed", issues=issues)

    except Account.DoesNotExist:
        issues = [
            {
                "message": "Invalid or expired verification token",
                "path": ["token"],
                "type": "token_validation",
            }
        ]
        raise ValidationException(detail="Validation failed", issues=issues)


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

    try:
        if user.send_verification_email():
            return ok(
                data={"message": "Verification email sent successfully"},
                code=APIResponseCodes.EMAIL_SENT_200,
                i18n_key="email.verification.sent",
            )
        else:
            # Email sending failed but user.send_verification_email() returned False
            issues = [
                {
                    "message": "Unable to send verification email. Please check your email address or contact support.",
                    "path": [],
                    "type": "email_service_error",
                }
            ]
            raise ValidationException(
                detail="Email service error", issues=issues, email_service_error=True
            )
    except Exception as e:
        # Catch any exception during email sending and provide helpful error
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Email verification failed for user {user.email}: {str(e)}")

        issues = [
            {
                "message": "Unable to send verification email due to system issues. Please try again later or contact support.",
                "path": [],
                "type": "email_service_error",
            }
        ]
        raise ValidationException(
            detail="Email service error",
            issues=issues,
            email_service_error=True,
            technical_details=(
                str(e)
                if hasattr(e, "__str__")
                else "Email service temporarily unavailable"
            ),
        )


@extend_schema(
    summary="Resend Email Verification (Unauthenticated)",
    description="Resend email verification email using only email address. This endpoint allows users who haven't verified their email to request a new verification email without needing to authenticate. Includes rate limiting to prevent abuse.",
    request=ResendVerificationByEmailSerializer,
    responses={
        200: serializers.Serializer,
    },
    examples=[
        OpenApiExample(
            "Resend Verification by Email Request",
            summary="Example request to resend verification email",
            description="Provide email address to resend verification email",
            value={"email": "user@example.com"},
            request_only=True,
        ),
        OpenApiExample(
            "Resend Verification Success Response",
            summary="Successful resend response",
            description="Always returns success to prevent email enumeration",
            value={
                "message": "If this email exists in our system, we've sent a verification email"
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
@rate_limit(per_ip="100/hour", per_email="100/hour")
def resend_verification_by_email(request):
    """
    Resend email verification email using email address (unauthenticated).

    This endpoint allows users to request verification emails without authentication,
    solving the UX problem where users can't log in without verification but can't
    get verification emails without logging in.

    Security features:
    - Rate limited per IP and per email
    - No information disclosure (same response regardless of email existence)
    - Consistent response timing to prevent enumeration
    - Input validation and sanitization
    """
    import logging
    import time

    logger = logging.getLogger(__name__)
    start_time = time.time()

    serializer = ResendVerificationByEmailSerializer(data=request.data)

    if not serializer.is_valid():
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

    email = serializer.validated_data["email"]

    # Always return success response to prevent email enumeration
    success_response = ok(
        data={
            "message": "If this email exists in our system, we've sent a verification email"
        },
        code=APIResponseCodes.EMAIL_SENT_200,
        i18n_key="email.verification.sent",
    )

    try:
        # Try to find user with this email
        user = Account.objects.filter(email=email).first()

        if user and not user.is_email_verified:
            # User exists and needs verification - send email
            try:
                user.send_verification_email()
                logger.info(f"Verification email resent for {email}")
            except Exception as e:
                # Log the error but don't expose it to prevent information disclosure
                logger.error(f"Failed to send verification email to {email}: {str(e)}")
        elif user and user.is_email_verified:
            # User exists but already verified - log for monitoring
            logger.info(
                f"Verification email requested for already verified email: {email}"
            )
        else:
            # User doesn't exist - log for monitoring
            logger.info(f"Verification email requested for non-existent email: {email}")

    except Exception as e:
        # Don't expose any errors to prevent information disclosure
        logger.error(f"Error in resend_verification_by_email for {email}: {str(e)}")

    # Ensure consistent response timing (minimum 500ms to prevent timing attacks)
    elapsed_time = time.time() - start_time
    if elapsed_time < 0.5:
        time.sleep(0.5 - elapsed_time)

    return success_response


@extend_schema(
    summary="Request Password Reset",
    description="Request a password reset email. A reset token will be sent to the email address if an account exists. Response is always the same to prevent user enumeration.",
    request=PasswordResetRequestSerializer,
    responses={
        200: serializers.Serializer,
    },
    examples=[
        OpenApiExample(
            "Password Reset Request",
            summary="Request password reset",
            description="Request a reset token via email",
            value={"email": "user@example.com"},
            request_only=True,
        ),
        OpenApiExample(
            "Password Reset Response",
            summary="Success response",
            description="Generic response to prevent email enumeration",
            value={
                "message": "If an account exists with this email, a password reset link has been sent."
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
@rate_limit(per_ip="5/hour")
def password_reset_request(request):
    """
    Request a password reset email.

    Security features:
    - Constant-time response to prevent user enumeration
    - Rate limited to 5 requests per hour per IP
    - Generic response message regardless of whether account exists
    """
    start_time = time.time()

    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

    email = serializer.validated_data["email"]

    # Generic response to prevent user enumeration
    success_response = ok(
        data={
            "message": "If an account exists with this email, a password reset link has been sent."
        },
        code=APIResponseCodes.EMAIL_VERIFY_200,
        i18n_key="password.reset.request.success",
    )

    try:
        user = Account.objects.get(email=email)

        # Send password reset email
        if user.send_password_reset_email():
            logger.info(f"Password reset email sent to {email}")

            # Log audit event
            from apps.core.models import AuditLog

            AuditLog.log_event(
                event_type="password_reset_requested",
                resource_type="user",
                resource_id=str(user.id),
                user=user,
                organization=user.get_primary_organization(),
                outcome="success",
                details={"email": email},
            )
        else:
            logger.error(f"Failed to send password reset email to {email}")

    except Account.DoesNotExist:
        # User doesn't exist - log for monitoring but don't reveal this
        logger.info(f"Password reset requested for non-existent email: {email}")

    except Exception as e:
        # Don't expose any errors to prevent information disclosure
        logger.error(f"Error in password_reset_request for {email}: {str(e)}")

    # Ensure consistent response timing (minimum 500ms to prevent timing attacks)
    elapsed_time = time.time() - start_time
    if elapsed_time < 0.5:
        time.sleep(0.5 - elapsed_time)

    return success_response


@extend_schema(
    summary="Confirm Password Reset",
    description="Reset password using the token received via email.",
    request=PasswordResetConfirmSerializer,
    responses={
        200: serializers.Serializer,
    },
    examples=[
        OpenApiExample(
            "Password Reset Confirm Request",
            summary="Confirm password reset",
            description="Reset password with token",
            value={
                "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
                "new_password": "NewSecureP@ssw0rd123",
                "new_password_confirm": "NewSecureP@ssw0rd123",
            },
            request_only=True,
        ),
        OpenApiExample(
            "Password Reset Success",
            summary="Success response",
            description="Password was reset successfully",
            value={
                "message": "Password has been reset successfully. You can now login with your new password."
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(["POST"])
@permission_classes([AllowAny])
@rate_limit(per_ip="10/hour")
def password_reset_confirm(request):
    """
    Confirm password reset with token and new password.

    Security features:
    - Token validation with constant-time comparison
    - Django password validators enforced
    - Rate limited to 10 attempts per hour per IP
    - Audit logging
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

    token = serializer.validated_data["token"]
    new_password = serializer.validated_data["new_password"]

    try:
        # Find user with this reset token
        user = Account.objects.get(
            password_reset_token=token,
            password_reset_token_expires__gt=timezone.now(),
        )

        # Reset the password
        if user.reset_password(token, new_password):
            logger.info(f"Password reset successful for user: {user.email}")

            # Log audit event
            from apps.core.models import AuditLog

            AuditLog.log_event(
                event_type="password_reset_completed",
                resource_type="user",
                resource_id=str(user.id),
                user=user,
                organization=user.get_primary_organization(),
                outcome="success",
                details={"email": user.email},
            )

            return ok(
                data={
                    "message": "Password has been reset successfully. You can now login with your new password."
                },
                code=APIResponseCodes.EMAIL_VERIFY_200,
                i18n_key="password.reset.confirm.success",
            )
        else:
            issues = [
                {
                    "message": "Invalid or expired reset token",
                    "path": ["token"],
                    "type": "token_validation",
                }
            ]
            raise ValidationException(detail="Validation failed", issues=issues)

    except Account.DoesNotExist:
        issues = [
            {
                "message": "Invalid or expired reset token",
                "path": ["token"],
                "type": "token_validation",
            }
        ]
        raise ValidationException(detail="Validation failed", issues=issues)


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
@transaction.atomic  # Ensure atomicity for user/org creation in social auth
def social_auth(request):
    """
    Social authentication endpoint that handles both registration and login.
    Uses transaction to ensure atomicity if creating new account + organization.
    """
    serializer = SocialRegistrationSerializer(data=request.data)

    if not serializer.is_valid():
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

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
        issues = convert_serializer_errors_to_rfc7807(serializer.errors)
        raise ValidationException(detail="Validation failed", issues=issues)

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
