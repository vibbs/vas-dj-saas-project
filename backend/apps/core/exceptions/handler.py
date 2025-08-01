"""
Global exception handler for consistent error responses.
"""

import logging
from typing import Optional, Dict, Any
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied as DRFPermissionDenied,
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    MethodNotAllowed,
    ParseError,
    UnsupportedMediaType,
    Throttled,
)

from .base import BaseHttpException

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    
    Args:
        exc: The exception that was raised
        context: Context information about where the exception occurred
        
    Returns:
        Response: Formatted error response
    """
    # Get the standard DRF response first
    response = drf_exception_handler(exc, context)
    
    # Handle our custom exceptions
    if isinstance(exc, BaseHttpException):
        return Response(
            data=exc.get_error_response_data(),
            status=exc.status_code
        )
    
    # Handle Django built-in exceptions
    if isinstance(exc, Http404):
        error_data = {
            "error": "The requested resource was not found",
            "code": "not_found",
            "status_code": status.HTTP_404_NOT_FOUND,
        }
        return Response(data=error_data, status=status.HTTP_404_NOT_FOUND)
    
    if isinstance(exc, PermissionDenied):
        error_data = {
            "error": "You do not have permission to perform this action",
            "code": "permission_denied",
            "status_code": status.HTTP_403_FORBIDDEN,
        }
        return Response(data=error_data, status=status.HTTP_403_FORBIDDEN)
    
    # Handle DRF exceptions with custom formatting
    if response is not None:
        error_data = format_drf_error_response(exc, response)
        return Response(data=error_data, status=response.status_code)
    
    # Handle unexpected exceptions
    logger.exception("Unhandled exception occurred", exc_info=exc, extra={"context": context})
    
    error_data = {
        "error": "An internal server error occurred",
        "code": "internal_server_error",
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }
    
    return Response(data=error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def format_drf_error_response(exc, response) -> Dict[str, Any]:
    """
    Format DRF exception responses to match our standard format.
    
    Args:
        exc: The DRF exception
        response: The DRF response
        
    Returns:
        Dict containing formatted error data
    """
    error_data = {
        "status_code": response.status_code,
    }
    
    # Handle specific DRF exceptions
    if isinstance(exc, ValidationError):
        error_data.update({
            "error": "The request contains invalid data",
            "code": "validation_error",
            "field_errors": response.data,
        })
    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        error_data.update({
            "error": "Authentication credentials were not provided or are invalid",
            "code": "unauthorized",
        })
    elif isinstance(exc, DRFPermissionDenied):
        error_data.update({
            "error": "You do not have permission to perform this action",
            "code": "permission_denied",
        })
    elif isinstance(exc, NotFound):
        error_data.update({
            "error": "The requested resource was not found",
            "code": "not_found",
        })
    elif isinstance(exc, MethodNotAllowed):
        error_data.update({
            "error": "Method not allowed",
            "code": "method_not_allowed",
            "allowed_methods": getattr(exc, 'allowed_methods', []),
        })
    elif isinstance(exc, ParseError):
        error_data.update({
            "error": "Malformed request data",
            "code": "parse_error",
        })
    elif isinstance(exc, UnsupportedMediaType):
        error_data.update({
            "error": "Unsupported media type",
            "code": "unsupported_media_type",
        })
    elif isinstance(exc, Throttled):
        error_data.update({
            "error": "Rate limit exceeded. Please try again later",
            "code": "rate_limit_exceeded",
            "retry_after": getattr(exc, 'wait', None),
        })
    else:
        # Generic error message for other DRF exceptions
        error_message = str(response.data.get('detail', 'An error occurred'))
        error_data.update({
            "error": error_message,
            "code": "api_error",
        })
    
    return error_data