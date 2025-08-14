"""
Account-specific response codes following RFC 7807 pattern.

Code pattern: VDJ-ACC-<USECASE>-<HTTP>
"""

from apps.core.codes import BaseAPICodeEnum


class AccountResponseCodes(BaseAPICodeEnum):
    """Account-specific response codes."""

    # Account not found errors
    ACC_NOTFOUND_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-NOTFOUND-404"

    # Account existence conflicts
    ACC_EXISTS_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-EXISTS-409"

    # Authentication errors
    ACC_CREDS_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-CREDS-401"
    ACC_INACTIVE_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-INACTIVE-403"
    ACC_EMAIL_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-EMAIL-403"
    ACC_DISABLED_401 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-DISABLED-401"

    # Password reset errors
    ACC_RESET_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-RESET-400"

    # Validation errors
    ACC_MISSING_FIELD_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-MISSING-400"

    # Registration errors
    ACC_REG_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-REG-403"

    # Profile update errors
    ACC_PROFILE_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-PROFILE-400"

    # Success codes for accounts
    ACC_LOGIN_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-LOGIN-200"
    ACC_REGISTER_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-REGISTER-201"
    ACC_PROFILE_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-PROFILE-200"
    ACC_LOGOUT_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-LOGOUT-200"
    ACC_VERIFY_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ACC-VERIFY-200"
