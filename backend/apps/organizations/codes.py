"""
Organization-specific response codes following RFC 7807 pattern.

Code pattern: VDJ-ORG-<USECASE>-<HTTP>
"""

from apps.core.codes import BaseAPICodeEnum


class OrganizationResponseCodes(BaseAPICodeEnum):
    """Organization-specific response codes."""

    # Organization not found errors
    ORG_NOTFOUND_404 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-NOTFOUND-404"

    # Access control errors
    ORG_ACCESS_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-ACCESS-403"
    ORG_OWNER_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-OWNER-403"

    # Invitation errors
    ORG_INVITE_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-INVITE-409"
    ORG_INVITE_400 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-INVITE-400"

    # Member management errors
    ORG_MEMBER_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-MEMBER-409"
    ORG_LIMIT_403 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-LIMIT-403"

    # Subdomain errors
    ORG_SUB_409 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-SUB-409"

    # Success codes for organizations
    ORG_LIST_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-LIST-200"
    ORG_DETAIL_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-DETAIL-200"
    ORG_CREATE_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-CREATE-201"
    ORG_UPDATE_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-UPDATE-200"
    ORG_INVITE_201 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-INVITE-201"
    ORG_MEMBER_200 = f"{BaseAPICodeEnum.PROJECT_PREFIX}-ORG-MEMBER-200"
