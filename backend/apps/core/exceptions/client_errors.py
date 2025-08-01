"""
4xx Client Error exceptions for standardized error handling.
"""

from rest_framework import status
from .base import BaseHttpException


class BadRequestException(BaseHttpException):
    """400 Bad Request - The request could not be understood by the server."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Bad request"
    default_code = "bad_request"


class UnauthorizedException(BaseHttpException):
    """401 Unauthorized - Authentication is required and has failed or not been provided."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Authentication credentials were not provided or are invalid"
    default_code = "unauthorized"


class ForbiddenException(BaseHttpException):
    """403 Forbidden - The server understood the request but refuses to authorize it."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action"
    default_code = "forbidden"


class NotFoundException(BaseHttpException):
    """404 Not Found - The requested resource could not be found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The requested resource was not found"
    default_code = "not_found"


class MethodNotAllowedException(BaseHttpException):
    """405 Method Not Allowed - The request method is not supported for the requested resource."""
    status_code = status.HTTP_405_METHOD_NOT_ALLOWED
    default_detail = "Method not allowed"
    default_code = "method_not_allowed"


class ConflictException(BaseHttpException):
    """409 Conflict - The request could not be completed due to a conflict with the current state."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = "The request conflicts with the current state of the resource"
    default_code = "conflict"


class ValidationException(BaseHttpException):
    """422 Unprocessable Entity - The request was well-formed but contains semantic errors."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "The request contains invalid data"
    default_code = "validation_error"


class UnprocessableEntityException(BaseHttpException):
    """422 Unprocessable Entity - The request was well-formed but was unable to be followed."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "The request was well-formed but contains semantic errors"
    default_code = "unprocessable_entity"


class RateLimitException(BaseHttpException):
    """429 Too Many Requests - The user has sent too many requests in a given amount of time."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = "Rate limit exceeded. Please try again later"
    default_code = "rate_limit_exceeded"