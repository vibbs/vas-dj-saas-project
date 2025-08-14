"""
RFC 7807 compliant serializers for exception documentation in OpenAPI/Swagger.

These serializers define the standardized Problem Details format used across
the API for all error responses, following RFC 7807 specification.
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample


# Import the standardized schemas from core
# Note: These are now references to the schema components defined in schema_hooks.py
# This file maintains backward compatibility while referencing the new RFC 7807 schemas


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Validation Error",
            summary="Validation Failed",
            description="Request contains invalid data with field-level details",
            value={
                "type": "https://docs.yourapp.com/problems/validation",
                "title": "Validation failed",
                "status": 400,
                "code": "VDJ-GEN-VAL-422",
                "i18n_key": "validation.failed",
                "detail": "The request contains invalid data.",
                "instance": "/api/v1/accounts/register/",
                "issues": [
                    {
                        "path": ["email"],
                        "message": "This field is required.",
                        "i18n_key": "validation.required"
                    },
                    {
                        "path": ["password"],
                        "message": "Password must be at least 8 characters long.",
                        "i18n_key": "validation.min_length"
                    }
                ]
            }
        ),
    ]
)
class ValidationErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for validation errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code")
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    issues = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text="Array of validation issues"
    )
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Authentication Required",
            summary="Authentication Required",
            description="Authentication credentials were not provided or are invalid",
            value={
                "type": "https://docs.yourapp.com/problems/authentication-required",
                "title": "Authentication Required",
                "status": 401,
                "code": "VDJ-AUTH-LOGIN-401",
                "i18n_key": "errors.authentication_required",
                "detail": "Authentication credentials were not provided or are invalid.",
                "instance": "/api/v1/organizations/"
            },
        ),
        OpenApiExample(
            "Invalid Credentials",
            summary="Invalid Login Credentials",
            description="Email or password is incorrect",
            value={
                "type": "https://docs.yourapp.com/problems/invalid-credentials",
                "title": "Invalid credentials",
                "status": 401,
                "code": "VDJ-ACC-CREDS-401",
                "i18n_key": "account.invalid_credentials",
                "detail": "The email or password provided is incorrect.",
                "instance": "/api/v1/auth/login/"
            },
        ),
        OpenApiExample(
            "Token Expired",
            summary="JWT Token Expired",
            description="The provided JWT token has expired",
            value={
                "type": "https://docs.yourapp.com/problems/authentication-required",
                "title": "Authentication Required",
                "status": 401,
                "code": "VDJ-AUTH-EXPIRED-401",
                "i18n_key": "errors.token_expired",
                "detail": "The provided JWT token has expired.",
                "instance": "/api/v1/organizations/"
            },
        ),
    ]
)
class UnauthorizedErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for unauthorized access errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=401)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Permission Denied",
            summary="Insufficient Permissions",
            description="User does not have permission to perform this action",
            value={
                "type": "https://docs.yourapp.com/problems/permission-denied",
                "title": "Permission Denied",
                "status": 403,
                "code": "VDJ-PERM-DENIED-403",
                "i18n_key": "errors.permission_denied",
                "detail": "You do not have permission to perform this action.",
                "instance": "/api/v1/organizations/"
            },
        ),
        OpenApiExample(
            "Organization Access Denied",
            summary="Organization Access Denied",
            description="User does not have access to this organization",
            value={
                "type": "https://docs.yourapp.com/problems/org-access-denied",
                "title": "Organization access denied",
                "status": 403,
                "code": "VDJ-ORG-ACCESS-403",
                "i18n_key": "org.access_denied",
                "detail": "You do not have access to this organization.",
                "instance": "/api/v1/organizations/acme/",
                "meta": {
                    "organization_id": "123e4567-e89b-12d3-a456-426614174000"
                }
            },
        ),
    ]
)
class ForbiddenErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for forbidden access errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=403)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Not Found",
            summary="Resource Not Found",
            description="The requested resource was not found",
            value={
                "type": "https://docs.yourapp.com/problems/not-found",
                "title": "Not Found",
                "status": 404,
                "code": "VDJ-GEN-NOTFOUND-404",
                "i18n_key": "errors.not_found",
                "detail": "The requested resource was not found.",
                "instance": "/api/v1/accounts/users/123/"
            },
        ),
        OpenApiExample(
            "Account Not Found",
            summary="User Account Not Found",
            description="The specified user account could not be found",
            value={
                "type": "https://docs.yourapp.com/problems/account-not-found",
                "title": "Account not found",
                "status": 404,
                "code": "VDJ-ACC-NOTFOUND-404",
                "i18n_key": "account.not_found",
                "detail": "The specified user account could not be found.",
                "instance": "/api/v1/accounts/users/nonexistent/"
            },
        ),
    ]
)
class NotFoundErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for not found errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=404)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Conflict",
            summary="Resource Conflict",
            description="The request conflicts with the current state of the resource",
            value={
                "type": "https://docs.yourapp.com/problems/account-already-exists",
                "title": "Account already exists",
                "status": 409,
                "code": "VDJ-ACC-EXISTS-409",
                "i18n_key": "account.already_exists",
                "detail": "An account with this email address already exists.",
                "instance": "/api/v1/accounts/register/"
            },
        ),
        OpenApiExample(
            "Organization Member Exists",
            summary="Member Already in Organization",
            description="User is already a member of the organization",
            value={
                "type": "https://docs.yourapp.com/problems/org-member-exists",
                "title": "Member already exists",
                "status": 409,
                "code": "VDJ-ORG-MEMBER-409",
                "i18n_key": "org.member.already_exists",
                "detail": "This user is already a member of the organization.",
                "instance": "/api/v1/organizations/acme/members/"
            },
        ),
    ]
)
class ConflictErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for conflict errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=409)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Rate Limit Exceeded",
            summary="Too Many Requests",
            description="Rate limit has been exceeded",
            value={
                "type": "https://docs.yourapp.com/problems/rate-limit-exceeded",
                "title": "Rate Limit Exceeded",
                "status": 429,
                "code": "VDJ-GEN-RATE-429",
                "i18n_key": "errors.rate_limit_exceeded",
                "detail": "Too many requests. Please try again later.",
                "instance": "/api/v1/endpoint/",
                "meta": {
                    "retry_after": 300
                }
            },
        ),
    ]
)
class RateLimitErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for rate limit errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=429)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Internal Server Error",
            summary="Server Error",
            description="An unexpected server error occurred",
            value={
                "type": "https://docs.yourapp.com/problems/internal",
                "title": "Internal Server Error",
                "status": 500,
                "code": "VDJ-GEN-ERR-500",
                "i18n_key": "errors.internal",
                "detail": "An unexpected server error occurred.",
                "instance": "/api/v1/endpoint/"
            },
        ),
    ]
)
class InternalServerErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for internal server errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=500)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Service Unavailable",
            summary="Service Temporarily Unavailable",
            description="The service is temporarily unavailable",
            value={
                "type": "https://docs.yourapp.com/problems/service-unavailable",
                "title": "Service Unavailable",
                "status": 503,
                "code": "VDJ-GEN-UNAVAIL-503",
                "i18n_key": "errors.service_unavailable",
                "detail": "Service is temporarily unavailable.",
                "instance": "/api/v1/endpoint/",
                "meta": {
                    "retry_after": 600
                }
            },
        ),
    ]
)
class ServiceUnavailableErrorSerializer(serializers.Serializer):
    """RFC 7807 Problem Details for service unavailable errors."""
    type = serializers.URLField(help_text="Problem type URI")
    title = serializers.CharField(help_text="Problem title")
    status = serializers.IntegerField(help_text="HTTP status code", default=503)
    code = serializers.CharField(help_text="Machine-readable error code")
    i18n_key = serializers.CharField(help_text="Internationalization key")
    detail = serializers.CharField(required=False, help_text="Detailed error description")
    instance = serializers.CharField(required=False, help_text="Problem instance URI")
    meta = serializers.DictField(required=False, help_text="Additional metadata")


# Legacy serializers for backward compatibility
# These are deprecated and will be removed in future versions
BadRequestErrorSerializer = ValidationErrorSerializer  # Deprecated: Use ValidationErrorSerializer