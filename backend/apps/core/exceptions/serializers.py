"""
Serializers for exception documentation in OpenAPI/Swagger.
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Bad Request",
            summary="Bad Request Error",
            description="The request could not be understood by the server",
            value={
                "error": "Invalid request data",
                "code": "bad_request",
                "status_code": 400
            },
        ),
    ]
)
class BadRequestErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=400)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Unauthorized",
            summary="Authentication Required",
            description="Authentication credentials were not provided or are invalid",
            value={
                "error": "Authentication credentials were not provided or are invalid",
                "code": "unauthorized",
                "status_code": 401
            },
        ),
        OpenApiExample(
            "Invalid Credentials",
            summary="Invalid Login Credentials",
            description="Email or password is incorrect",
            value={
                "error": "Invalid email or password",
                "code": "invalid_credentials",
                "status_code": 401
            },
        ),
        OpenApiExample(
            "Token Expired",
            summary="JWT Token Expired",
            description="The provided JWT token has expired",
            value={
                "error": "Token has expired",
                "code": "token_expired",
                "status_code": 401
            },
        ),
    ]
)
class UnauthorizedErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=401)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Forbidden",
            summary="Insufficient Permissions",
            description="User does not have permission to perform this action",
            value={
                "error": "You do not have permission to perform this action",
                "code": "forbidden",
                "status_code": 403
            },
        ),
        OpenApiExample(
            "Organization Access Denied",
            summary="Organization Access Denied",
            description="User does not have access to this organization",
            value={
                "error": "You do not have access to this organization",
                "code": "organization_access_denied",
                "status_code": 403
            },
        ),
    ]
)
class ForbiddenErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=403)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Not Found",
            summary="Resource Not Found",
            description="The requested resource was not found",
            value={
                "error": "The requested resource was not found",
                "code": "not_found",
                "status_code": 404
            },
        ),
        OpenApiExample(
            "User Not Found",
            summary="User Not Found",
            description="The specified user could not be found",
            value={
                "error": "User not found",
                "code": "user_not_found",
                "status_code": 404
            },
        ),
    ]
)
class NotFoundErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=404)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Conflict",
            summary="Resource Conflict",
            description="The request conflicts with the current state of the resource",
            value={
                "error": "The request conflicts with the current state of the resource",
                "code": "conflict",
                "status_code": 409
            },
        ),
        OpenApiExample(
            "Email Already Exists",
            summary="Email Already Registered",
            description="An account with this email already exists",
            value={
                "error": "An account with this email already exists",
                "code": "email_already_exists",
                "status_code": 409
            },
        ),
    ]
)
class ConflictErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=409)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Validation Error",
            summary="Validation Failed",
            description="The request contains invalid data",
            value={
                "error": "The request contains invalid data",
                "code": "validation_error",
                "status_code": 422,
                "field_errors": {
                    "email": ["This field is required."],
                    "password": ["Password must be at least 8 characters long."]
                }
            },
        ),
    ]
)
class ValidationErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=422)
    field_errors = serializers.DictField(
        help_text="Field-specific validation errors",
        required=False
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Rate Limit Exceeded",
            summary="Too Many Requests",
            description="Rate limit has been exceeded",
            value={
                "error": "Rate limit exceeded. Please try again later",
                "code": "rate_limit_exceeded",
                "status_code": 429,
                "retry_after": 300
            },
        ),
    ]
)
class RateLimitErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=429)
    retry_after = serializers.IntegerField(
        help_text="Seconds to wait before retrying",
        required=False
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Internal Server Error",
            summary="Server Error",
            description="An unexpected server error occurred",
            value={
                "error": "An internal server error occurred",
                "code": "internal_server_error",
                "status_code": 500
            },
        ),
    ]
)
class InternalServerErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=500)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Service Unavailable",
            summary="Service Temporarily Unavailable",
            description="The service is temporarily unavailable",
            value={
                "error": "Service is temporarily unavailable",
                "code": "service_unavailable",
                "status_code": 503,
                "retry_after": 600
            },
        ),
    ]
)
class ServiceUnavailableErrorSerializer(serializers.Serializer):
    error = serializers.CharField(help_text="Human-readable error message")
    code = serializers.CharField(help_text="Machine-readable error code")
    status_code = serializers.IntegerField(help_text="HTTP status code", default=503)
    retry_after = serializers.IntegerField(
        help_text="Seconds to wait before retrying",
        required=False
    )