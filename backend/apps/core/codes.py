"""
Core code definitions and validation for RFC 7807 error handling.

Code pattern: VDJ-<MODULE>-<USECASE>-<HTTP>
- VDJ: Project prefix (configurable)
- MODULE: App or module name (uppercase)
- USECASE: Specific use case or action (uppercase, can include numbers/underscores)
- HTTP: HTTP status code (3 digits)
"""

import os
import re
from enum import StrEnum

from django.conf import settings


class BaseAPICodeMixin:
    """
    Base mixin for API error/success codes.
    Subclasses automatically get a project prefix and validation helpers.
    """

    PROJECT_PREFIX: str = getattr(
        settings, "PROJECT_CODE_PREFIX", os.getenv("PROJECT_CODE_PREFIX", "VDJ")
    )

    @classmethod
    def _code_regex(cls) -> re.Pattern:
        """Compile and return the regex for validating codes."""
        return re.compile(rf"^{cls.PROJECT_PREFIX}-[A-Z]+-[A-Z0-9_]+-\d{{3}}$")

    @classmethod
    def validate_code(cls, code: str) -> bool:
        """Return True if the code matches the required pattern."""
        return bool(cls._code_regex().match(code))

    @classmethod
    def validate_all(cls) -> None:
        """
        Validate all enum members in the class.
        Raises:
            ValueError: if any code is invalid.
        """
        for member in cls:
            if not cls.validate_code(member.value):
                raise ValueError(f"Invalid code format: {member.value}")


class BaseAPICodeEnum(BaseAPICodeMixin, StrEnum):
    """
    Base class for API error/success codes.
    Subclasses automatically get a project prefix and validation helpers.
    """


class APIResponseCodes(BaseAPICodeEnum):
    """
    Core/Global codes used across the application.

    Each code follows the pattern: VDJ-<MODULE>-<USECASE>-<HTTP>
    """

    # Success codes
    GEN_OK_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-OK-200"
    GEN_CREATED_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-CREATED-201"
    GEN_LIST_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-LIST-200"

    # Authentication success codes
    AUTH_LOGIN_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-LOGIN-200"
    AUTH_REFRESH_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-REFRESH-200"
    AUTH_LOGOUT_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-LOGOUT-200"
    AUTH_VERIFY_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-VERIFY-200"
    AUTH_REGISTER_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-REGISTER-201"
    AUTH_SOCIAL_LOGIN_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-SOCIAL-200"
    AUTH_SOCIAL_REGISTER_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-SOCIAL-201"

    # Email success codes
    EMAIL_VERIFY_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-VERIFY-200"
    EMAIL_ALREADY_VERIFIED_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-VERIFIED-200"
    EMAIL_SENT_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-SENT-200"

    # Token-specific error codes (general tokens, not account-specific)
    TOKEN_EXPIRED_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-TOKEN-EXPIRED-401"
    TOKEN_REFRESH_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-TOKEN-REFRESH-401"

    # Billing/subscription error codes
    BILL_SUBSCRIPTION_402 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-SUB-402"

    # Permission error codes (general permissions)
    PERM_INSUFFICIENT_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-PERM-INSUFF-403"

    # Generic error codes
    GEN_BAD_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-BAD-400"
    GEN_UNAUTH_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-UNAUTH-401"
    GEN_FORBID_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-FORBID-403"
    GEN_NOTFOUND_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-NOTFOUND-404"
    GEN_CONFLICT_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-CONFLICT-409"
    GEN_VAL_422 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-VAL-422"
    GEN_RATE_429 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-RATE-429"
    GEN_ERR_500 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-ERR-500"
    GEN_UNAVAIL_503 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-GEN-UNAVAIL-503"

    # Authentication related
    AUTH_LOGIN_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-LOGIN-401"
    AUTH_TOKEN_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-TOKEN-401"
    AUTH_EXPIRED_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-EXPIRED-401"
    AUTH_INVALID_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-AUTH-INVALID-401"

    # Permission related
    PERM_DENIED_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-PERM-DENIED-403"


# Keep backward compatibility by validating at module import
APIResponseCodes.validate_all()
