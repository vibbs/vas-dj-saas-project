"""
Business logic specific exceptions for domain-specific error handling.
"""

from apps.accounts.codes import AccountResponseCodes
from apps.organizations.codes import OrganizationResponseCodes

from ..codes import APIResponseCodes
from .base import BaseHttpException


class InsufficientPermissionsException(BaseHttpException):
    """User doesn't have sufficient permissions for the requested action."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/insufficient-permissions",
            title="Insufficient permissions",
            status=403,
            detail=detail
            or "You do not have sufficient permissions to perform this action.",
            code=kwargs.get("code", APIResponseCodes.PERM_INSUFFICIENT_403),
            i18n_key=kwargs.get("i18n_key", "permissions.insufficient"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class OrganizationAccessDeniedException(BaseHttpException):
    """User doesn't have access to the requested organization."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/org-access-denied",
            title="Organization access denied",
            status=403,
            detail=detail or "You do not have access to this organization.",
            code=kwargs.get("code", OrganizationResponseCodes.ORG_ACCESS_403),
            i18n_key=kwargs.get("i18n_key", "org.access_denied"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class TokenExpiredException(BaseHttpException):
    """JWT token has expired."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/token-expired",
            title="Token expired",
            status=401,
            detail=detail or "The provided JWT token has expired.",
            code=kwargs.get("code", APIResponseCodes.TOKEN_EXPIRED_401),
            i18n_key=kwargs.get("i18n_key", "auth.token_expired"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class InvalidCredentialsException(BaseHttpException):
    """Invalid login credentials provided."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/invalid-credentials",
            title="Invalid credentials",
            status=401,
            detail=detail or "The email or password provided is incorrect.",
            code=kwargs.get("code", AccountResponseCodes.ACC_CREDS_401),
            i18n_key=kwargs.get("i18n_key", "account.invalid_credentials"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class AccountDisabledException(BaseHttpException):
    """User account is disabled."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/account-disabled",
            title="Account disabled",
            status=403,
            detail=detail or "Your account has been disabled. Please contact support.",
            code=kwargs.get("code", AccountResponseCodes.ACC_INACTIVE_403),
            i18n_key=kwargs.get("i18n_key", "account.disabled"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class OrganizationNotFoundException(BaseHttpException):
    """Organization not found."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/org-not-found",
            title="Organization not found",
            status=404,
            detail=detail or "The specified organization could not be found.",
            code=kwargs.get("code", OrganizationResponseCodes.ORG_NOTFOUND_404),
            i18n_key=kwargs.get("i18n_key", "org.not_found"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class UserNotFoundException(BaseHttpException):
    """User not found."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/user-not-found",
            title="User not found",
            status=404,
            detail=detail or "The specified user account could not be found.",
            code=kwargs.get("code", AccountResponseCodes.ACC_NOTFOUND_404),
            i18n_key=kwargs.get("i18n_key", "account.not_found"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class EmailAlreadyExistsException(BaseHttpException):
    """Email address is already registered."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/email-already-exists",
            title="Email already exists",
            status=409,
            detail=detail or "An account with this email address already exists.",
            code=kwargs.get("code", AccountResponseCodes.ACC_EXISTS_409),
            i18n_key=kwargs.get("i18n_key", "account.email_exists"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class InvalidRefreshTokenException(BaseHttpException):
    """Invalid or expired refresh token."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/invalid-refresh-token",
            title="Invalid refresh token",
            status=401,
            detail=detail or "The provided refresh token is invalid or has expired.",
            code=kwargs.get("code", APIResponseCodes.TOKEN_REFRESH_401),
            i18n_key=kwargs.get("i18n_key", "auth.invalid_refresh_token"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class MissingRequiredFieldException(BaseHttpException):
    """Required field is missing from the request."""

    def __init__(self, detail: str | None = None, **kwargs):
        # Handle extra_data by putting it in meta
        meta = kwargs.get("meta", {})
        if "extra_data" in kwargs:
            meta.update(kwargs["extra_data"])

        # Filter kwargs to only valid BaseHttpException parameters
        valid_kwargs = {
            k: v
            for k, v in kwargs.items()
            if k in ["instance", "issues"]
            and k not in ["code", "i18n_key", "extra_data", "meta"]
        }

        super().__init__(
            type="https://docs.yourapp.com/problems/missing-required-field",
            title="Missing required field",
            status=400,
            detail=detail
            or "One or more required fields are missing from the request.",
            code=kwargs.get("code", AccountResponseCodes.ACC_MISSING_400),
            i18n_key=kwargs.get("i18n_key", "validation.required_field_missing"),
            meta=meta,
            **valid_kwargs,
        )


class OrganizationLimitExceededException(BaseHttpException):
    """Organization limits exceeded."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/org-limit-exceeded",
            title="Organization limit exceeded",
            status=403,
            detail=detail or "Your organization has exceeded its usage limits.",
            code=kwargs.get("code", OrganizationResponseCodes.ORG_LIMIT_403),
            i18n_key=kwargs.get("i18n_key", "org.limit_exceeded"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class SubscriptionRequiredException(BaseHttpException):
    """Active subscription required for this action."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/subscription-required",
            title="Subscription required",
            status=402,
            detail=detail
            or "An active subscription is required to perform this action.",
            code=kwargs.get("code", APIResponseCodes.BILL_SUBSCRIPTION_402),
            i18n_key=kwargs.get("i18n_key", "billing.subscription_required"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )
