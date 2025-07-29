"""
5xx Server Error exceptions for standardized error handling.
"""

from rest_framework import status
from .base import BaseHttpException


class InternalServerErrorException(BaseHttpException):
    """500 Internal Server Error - A generic error message for unexpected server errors."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "An internal server error occurred"
    default_code = "internal_server_error"


class NotImplementedException(BaseHttpException):
    """501 Not Implemented - The server does not support the functionality required."""
    status_code = status.HTTP_501_NOT_IMPLEMENTED
    default_detail = "This functionality is not implemented"
    default_code = "not_implemented"


class BadGatewayException(BaseHttpException):
    """502 Bad Gateway - The server received an invalid response from an upstream server."""
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "Bad gateway error occurred"
    default_code = "bad_gateway"


class ServiceUnavailableException(BaseHttpException):
    """503 Service Unavailable - The server is currently unavailable."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service is temporarily unavailable"
    default_code = "service_unavailable"


class GatewayTimeoutException(BaseHttpException):
    """504 Gateway Timeout - The server did not receive a timely response from upstream."""
    status_code = status.HTTP_504_GATEWAY_TIMEOUT
    default_detail = "Gateway timeout occurred"
    default_code = "gateway_timeout"