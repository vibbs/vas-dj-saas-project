"""
RFC 7807 compliant OpenAPI schema serializers for consistent API documentation.

These serializers define the standardized response formats used across the API
and ensure Swagger documentation matches actual response structures.
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample
from typing import Any, Dict, List


# RFC 7807 Problem Details Schema
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
        OpenApiExample(
            "Authentication Required",
            summary="Authentication credentials required",
            description="Request requires valid authentication",
            value={
                "type": "https://docs.yourapp.com/problems/authentication-required",
                "title": "Authentication Required",
                "status": 401,
                "code": "VDJ-AUTH-LOGIN-401",
                "i18n_key": "errors.authentication_required",
                "detail": "Authentication credentials were not provided or are invalid.",
                "instance": "/api/v1/organizations/"
            }
        ),
        OpenApiExample(
            "Not Found",
            summary="Resource not found",
            description="The requested resource could not be found",
            value={
                "type": "https://docs.yourapp.com/problems/not-found",
                "title": "Not Found",
                "status": 404,
                "code": "VDJ-GEN-NOTFOUND-404",
                "i18n_key": "errors.not_found",
                "detail": "The requested resource was not found.",
                "instance": "/api/v1/accounts/users/123/"
            }
        ),
        OpenApiExample(
            "Organization Access Denied",
            summary="Organization access denied",
            description="User does not have access to the organization",
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
            }
        )
    ]
)
class ProblemSerializer(serializers.Serializer):
    """RFC 7807 Problem Details schema for error responses."""
    
    type = serializers.URLField(
        help_text="A URI reference that identifies the problem type"
    )
    title = serializers.CharField(
        help_text="A short, human-readable summary of the problem type"
    )
    status = serializers.IntegerField(
        help_text="The HTTP status code"
    )
    code = serializers.CharField(
        help_text="Machine-readable error code (VDJ-*)"
    )
    i18n_key = serializers.CharField(
        help_text="Internationalization key for frontend localization"
    )
    detail = serializers.CharField(
        required=False,
        help_text="A human-readable explanation specific to this problem occurrence"
    )
    instance = serializers.CharField(
        required=False,
        help_text="A URI reference that identifies the specific occurrence of the problem"
    )
    issues = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text="Array of validation issues (for validation errors)"
    )
    meta = serializers.DictField(
        required=False,
        help_text="Additional metadata about the problem"
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Validation Issue",
            summary="Single validation error",
            description="Details about a specific field validation error",
            value={
                "path": ["user", "email"],
                "message": "Enter a valid email address.",
                "i18n_key": "validation.email"
            }
        )
    ]
)
class IssueSerializer(serializers.Serializer):
    """Schema for individual validation issues within Problem responses."""
    
    path = serializers.ListField(
        child=serializers.CharField(),
        help_text="Path to the field that caused the issue (e.g., ['user', 'email'])"
    )
    message = serializers.CharField(
        help_text="Human-readable error message"
    )
    i18n_key = serializers.CharField(
        help_text="Internationalization key for the error message"
    )


# Success Response Schemas
@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "User Profile",
            summary="Single resource response",
            description="Standard success response with user data",
            value={
                "status": 200,
                "code": "VDJ-ACC-PROFILE-200",
                "i18n_key": "account.profile.retrieved",
                "data": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "user@example.com",
                    "firstName": "John",
                    "lastName": "Doe"
                }
            }
        ),
        OpenApiExample(
            "User Created",
            summary="Resource creation response",
            description="Standard 201 success response",
            value={
                "status": 201,
                "code": "VDJ-ACC-REGISTER-201",
                "i18n_key": "account.created",
                "data": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "newuser@example.com",
                    "firstName": "Jane",
                    "lastName": "Smith"
                }
            }
        )
    ]
)
class SuccessEnvelopeSerializer(serializers.Serializer):
    """Standard success response envelope for non-paginated responses."""
    
    status = serializers.IntegerField(
        help_text="HTTP status code (numeric)"
    )
    code = serializers.CharField(
        help_text="Machine-readable success code (VDJ-*)"
    )
    i18n_key = serializers.CharField(
        help_text="Internationalization key for frontend localization"
    )
    data = serializers.JSONField(
        help_text="Response data payload"
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Users List",
            summary="Paginated list response",
            description="Standard paginated response with metadata",
            value={
                "status": 200,
                "code": "VDJ-ACC-LIST-200",
                "i18n_key": "account.list.ok",
                "pagination": {
                    "count": 150,
                    "totalPages": 8,
                    "currentPage": 1,
                    "next": 2,
                    "previous": None,
                    "pageSize": 20
                },
                "data": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "email": "user1@example.com",
                        "firstName": "John",
                        "lastName": "Doe"
                    },
                    {
                        "id": "456e7890-e89b-12d3-a456-426614174000",
                        "email": "user2@example.com",
                        "firstName": "Jane",
                        "lastName": "Smith"
                    }
                ]
            }
        )
    ]
)
class PaginatedEnvelopeSerializer(serializers.Serializer):
    """Standard paginated response envelope."""
    
    status = serializers.IntegerField(
        help_text="HTTP status code (numeric)"
    )
    code = serializers.CharField(
        help_text="Machine-readable success code (VDJ-*)"
    )
    i18n_key = serializers.CharField(
        help_text="Internationalization key for frontend localization"
    )
    pagination = serializers.DictField(
        help_text="Pagination metadata"
    )
    data = serializers.ListField(
        child=serializers.JSONField(),
        help_text="Array of response data items"
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Pagination Metadata",
            summary="Pagination information",
            description="Standard pagination metadata structure",
            value={
                "count": 150,
                "totalPages": 8,
                "currentPage": 1,
                "next": 2,
                "previous": None,
                "pageSize": 20
            }
        )
    ]
)
class PaginationSerializer(serializers.Serializer):
    """Pagination metadata schema."""
    
    count = serializers.IntegerField(
        help_text="Total number of items across all pages"
    )
    totalPages = serializers.IntegerField(
        help_text="Total number of pages"
    )
    currentPage = serializers.IntegerField(
        help_text="Current page number (1-based)"
    )
    next = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Next page number (null if no next page)"
    )
    previous = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Previous page number (null if no previous page)"
    )
    pageSize = serializers.IntegerField(
        help_text="Number of items per page"
    )