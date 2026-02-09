"""
Email service-specific response codes following RFC 7807 pattern.

Code pattern: VDJ-EMAIL-<USECASE>-<HTTP>
"""

from apps.core.codes import BaseAPICodeEnum


class EmailServiceResponseCodes(BaseAPICodeEnum):
    """Email service-specific response codes."""

    # Email sending errors
    EMAIL_SEND_500 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-SEND-500"
    EMAIL_SRV_503 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-SRV-503"

    # Template errors
    EMAIL_TPL_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-TPL-404"

    # Recipient errors
    EMAIL_REC_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-REC-400"

    # Rate limiting errors
    EMAIL_RATE_429 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-RATE-429"

    # Success codes for email service
    EMAIL_SEND_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-SEND-200"
    EMAIL_QUEUE_202 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-QUEUE-202"
    EMAIL_TPL_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-EMAIL-TPL-200"
