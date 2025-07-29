"""
Core exceptions package for standardized error handling across the application.
"""

from .base import BaseHttpException
from .client_errors import (
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    MethodNotAllowedException,
    ConflictException,
    ValidationException,
    RateLimitException,
    UnprocessableEntityException,
)
from .server_errors import (
    InternalServerErrorException,
    NotImplementedException,
    BadGatewayException,
    ServiceUnavailableException,
    GatewayTimeoutException,
)
from .business_errors import (
    InsufficientPermissionsException,
    OrganizationAccessDeniedException,
    TokenExpiredException,
    InvalidCredentialsException,
    AccountDisabledException,
    OrganizationNotFoundException,
    UserNotFoundException,
    EmailAlreadyExistsException,
    InvalidRefreshTokenException,
    MissingRequiredFieldException,
    OrganizationLimitExceededException,
    SubscriptionRequiredException,
)

__all__ = [
    # Base
    'BaseHttpException',
    # 4xx Client Errors
    'BadRequestException',
    'UnauthorizedException',
    'ForbiddenException',
    'NotFoundException',
    'MethodNotAllowedException',
    'ConflictException',
    'ValidationException',
    'RateLimitException',
    'UnprocessableEntityException',
    # 5xx Server Errors
    'InternalServerErrorException',
    'NotImplementedException',
    'BadGatewayException',
    'ServiceUnavailableException',
    'GatewayTimeoutException',
    # Business Logic Errors
    'InsufficientPermissionsException',
    'OrganizationAccessDeniedException',
    'TokenExpiredException',
    'InvalidCredentialsException',
    'AccountDisabledException',
    'OrganizationNotFoundException',
    'UserNotFoundException',
    'EmailAlreadyExistsException',
    'InvalidRefreshTokenException',
    'MissingRequiredFieldException',
    'OrganizationLimitExceededException',
    'SubscriptionRequiredException',
]