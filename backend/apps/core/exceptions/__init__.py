"""
Core exceptions package for standardized error handling across the application.
"""

from .base import BaseHttpException
from .business_errors import (
    AccountDisabledException,
    EmailAlreadyExistsException,
    InsufficientPermissionsException,
    InvalidCredentialsException,
    InvalidRefreshTokenException,
    MissingRequiredFieldException,
    OrganizationAccessDeniedException,
    OrganizationLimitExceededException,
    OrganizationNotFoundException,
    SubscriptionRequiredException,
    TokenExpiredException,
    UserNotFoundException,
)
from .client_errors import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    MethodNotAllowedException,
    NotFoundException,
    RateLimitException,
    UnauthorizedException,
    UnprocessableEntityException,
    ValidationException,
)
from .server_errors import (
    BadGatewayException,
    GatewayTimeoutException,
    InternalServerErrorException,
    NotImplementedException,
    ServiceUnavailableException,
)

__all__ = [
    # Base
    "BaseHttpException",
    # 4xx Client Errors
    "BadRequestException",
    "UnauthorizedException",
    "ForbiddenException",
    "NotFoundException",
    "MethodNotAllowedException",
    "ConflictException",
    "ValidationException",
    "RateLimitException",
    "UnprocessableEntityException",
    # 5xx Server Errors
    "InternalServerErrorException",
    "NotImplementedException",
    "BadGatewayException",
    "ServiceUnavailableException",
    "GatewayTimeoutException",
    # Business Logic Errors
    "InsufficientPermissionsException",
    "OrganizationAccessDeniedException",
    "TokenExpiredException",
    "InvalidCredentialsException",
    "AccountDisabledException",
    "OrganizationNotFoundException",
    "UserNotFoundException",
    "EmailAlreadyExistsException",
    "InvalidRefreshTokenException",
    "MissingRequiredFieldException",
    "OrganizationLimitExceededException",
    "SubscriptionRequiredException",
]
