"""
Business logic specific exceptions for domain-specific error handling.
"""

from rest_framework import status
from .base import BaseHttpException


class InsufficientPermissionsException(BaseHttpException):
    """User doesn't have sufficient permissions for the requested action."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have sufficient permissions to perform this action"
    default_code = "insufficient_permissions"


class OrganizationAccessDeniedException(BaseHttpException):
    """User doesn't have access to the requested organization."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have access to this organization"
    default_code = "organization_access_denied"


class TokenExpiredException(BaseHttpException):
    """JWT token has expired."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Token has expired"
    default_code = "token_expired"


class InvalidCredentialsException(BaseHttpException):
    """Invalid login credentials provided."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Invalid email or password"
    default_code = "invalid_credentials"


class AccountDisabledException(BaseHttpException):
    """User account is disabled."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Your account has been disabled"
    default_code = "account_disabled"


class OrganizationNotFoundException(BaseHttpException):
    """Organization not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Organization not found"
    default_code = "organization_not_found"


class UserNotFoundException(BaseHttpException):
    """User not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "User not found"
    default_code = "user_not_found"


class EmailAlreadyExistsException(BaseHttpException):
    """Email address is already registered."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = "An account with this email already exists"
    default_code = "email_already_exists"


class InvalidRefreshTokenException(BaseHttpException):
    """Invalid or expired refresh token."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Invalid or expired refresh token"
    default_code = "invalid_refresh_token"


class MissingRequiredFieldException(BaseHttpException):
    """Required field is missing from the request."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Required field is missing"
    default_code = "missing_required_field"


class OrganizationLimitExceededException(BaseHttpException):
    """Organization limits exceeded."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Organization limits have been exceeded"
    default_code = "organization_limit_exceeded"


class SubscriptionRequiredException(BaseHttpException):
    """Active subscription required for this action."""
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = "An active subscription is required for this action"
    default_code = "subscription_required"