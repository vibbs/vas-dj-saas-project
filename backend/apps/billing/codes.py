"""
Billing-specific response codes following RFC 7807 pattern.

Code pattern: VDJ-BILL-<USECASE>-<HTTP>
"""

from apps.core.codes import BaseAPICodeEnum


class BillingResponseCodes(BaseAPICodeEnum):
    """Billing-specific response codes."""

    # Subscription errors
    BILL_SUB_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-SUB-404"
    BILL_SUB_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-SUB-409"

    # Payment errors
    BILL_PAY_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-PAY-400"
    BILL_PAY_402 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-PAY-402"

    # Trial errors
    BILL_TRIAL_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-TRIAL-403"

    # Plan errors
    BILL_PLAN_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-PLAN-404"
    BILL_DOWN_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-DOWN-403"

    # Invoice errors
    BILL_INV_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-INV-404"

    # Success codes for billing
    BILL_SUB_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-SUB-200"
    BILL_SUB_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-SUB-201"
    BILL_PAY_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-PAY-200"
    BILL_PLAN_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-PLAN-200"
    BILL_INV_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-BILL-INV-200"
