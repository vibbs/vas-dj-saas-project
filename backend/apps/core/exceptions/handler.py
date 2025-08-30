"""
RFC 7807 compliant global exception handler for consistent error responses.

This module provides a centralized exception handler that converts all exceptions
into RFC 7807 "Problem Details for HTTP APIs" format.
"""

import logging
from typing import Optional
from django.http import Http404
from django.core.exceptions import (
    PermissionDenied,
    ValidationError as DjangoValidationError,
)
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

from .base import BaseHttpException, flatten_validation_errors
from ..codes import APIResponseCodes

logger = logging.getLogger(__name__)


def rfc7807_exception_handler(exc, context):
    """
    RFC 7807 compliant exception handler that provides consistent error responses.

    Args:
        exc: The exception that was raised
        context: Context information about where the exception occurred

    Returns:
        Response: RFC 7807 formatted error response
    """
    try:
        request = context.get("request")

        # Handle our custom RFC 7807 exceptions first
        if isinstance(exc, BaseHttpException):
            return Response(exc.to_dict(request), status=exc.status_code)

        # Handle DRF ValidationError specially to preserve field-level details
        if isinstance(exc, ValidationError):
            error = BaseHttpException(
                type="https://docs.yourapp.com/problems/validation",
                title="Validation failed",
                detail="The request contains invalid data.",
                status=400,
                code=APIResponseCodes.GEN_VAL_422,
                i18n_key="validation.failed",
                issues=flatten_validation_errors(exc.detail),
            )
            return Response(error.to_dict(request), status=error.status_code)

        # Handle Django core exceptions
        if isinstance(exc, Http404):
            error = BaseHttpException(
                type="https://docs.yourapp.com/problems/not-found",
                title="Not Found",
                detail="The requested resource was not found.",
                status=404,
                code=APIResponseCodes.GEN_NOTFOUND_404,
                i18n_key="errors.not_found",
            )
            return Response(error.to_dict(request), status=error.status_code)

        if isinstance(exc, PermissionDenied):
            error = BaseHttpException(
                type="https://docs.yourapp.com/problems/permission-denied",
                title="Permission Denied",
                detail="You do not have permission to perform this action.",
                status=403,
                code=APIResponseCodes.PERM_DENIED_403,
                i18n_key="errors.permission_denied",
            )
            return Response(error.to_dict(request), status=error.status_code)

        # Handle DRF exceptions
        response = drf_exception_handler(exc, context)
        if response is not None:
            error = _convert_drf_exception_to_rfc7807(exc, response)
            return Response(error.to_dict(request), status=error.status_code)

        # Handle unexpected exceptions
        logger.exception(
            "Unhandled exception occurred", exc_info=exc, extra={"context": context}
        )

        error = BaseHttpException(
            type="https://docs.yourapp.com/problems/internal",
            title="Internal Server Error",
            detail="An unexpected server error occurred.",
            status=500,
            code=APIResponseCodes.GEN_ERR_500,
            i18n_key="errors.internal",
        )

        return Response(error.to_dict(request), status=error.status_code)

    except Exception as handler_exc:
        # Last resort fallback: if even our exception handler fails
        logger.critical(
            "Exception handler itself failed",
            exc_info=handler_exc,
            extra={"original_exception": str(exc), "context": context},
        )

        # Return a minimal but valid RFC 7807 response
        return Response(
            {
                "type": "https://docs.yourapp.com/problems/critical",
                "title": "Critical Server Error",
                "status": 500,
                "code": "VDJ-GEN-CRITICAL-500",
                "i18n_key": "errors.critical",
                "detail": "A critical server error occurred. Please try again later.",
            },
            status=500,
        )


def _convert_drf_exception_to_rfc7807(exc, response) -> BaseHttpException:
    """
    Convert DRF exceptions to RFC 7807 format.

    Args:
        exc: The DRF exception
        response: The DRF response

    Returns:
        BaseHttpException: RFC 7807 compliant exception
    """
    status_code = response.status_code

    # Map specific DRF exceptions to RFC 7807 format
    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/authentication-required",
            title="Authentication Required",
            detail="Authentication credentials were not provided or are invalid.",
            status=401,
            code=APIResponseCodes.AUTH_LOGIN_401,
            i18n_key="errors.authentication_required",
        )

    elif isinstance(exc, DRFPermissionDenied):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/permission-denied",
            title="Permission Denied",
            detail="You do not have permission to perform this action.",
            status=403,
            code=APIResponseCodes.PERM_DENIED_403,
            i18n_key="errors.permission_denied",
        )

    elif isinstance(exc, NotFound):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/not-found",
            title="Not Found",
            detail="The requested resource was not found.",
            status=404,
            code=APIResponseCodes.GEN_NOTFOUND_404,
            i18n_key="errors.not_found",
        )

    elif isinstance(exc, MethodNotAllowed):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/method-not-allowed",
            title="Method Not Allowed",
            detail=f"{exc.method} method is not allowed for this endpoint.",
            status=405,
            code=f"{APIResponseCodes.GEN_BAD_400.value.replace('400', '405')}",
            i18n_key="errors.method_not_allowed",
            meta={"allowed_methods": getattr(exc, "allowed_methods", [])},
        )

    elif isinstance(exc, ParseError):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/parse-error",
            title="Parse Error",
            detail="Malformed request data.",
            status=400,
            code=APIResponseCodes.GEN_BAD_400,
            i18n_key="errors.parse_error",
        )

    elif isinstance(exc, UnsupportedMediaType):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/unsupported-media-type",
            title="Unsupported Media Type",
            detail="The media type of the request data is not supported.",
            status=415,
            code=f"{APIResponseCodes.GEN_BAD_400.value.replace('400', '415')}",
            i18n_key="errors.unsupported_media_type",
        )

    elif isinstance(exc, Throttled):
        return BaseHttpException(
            type="https://docs.yourapp.com/problems/rate-limit-exceeded",
            title="Rate Limit Exceeded",
            detail="Too many requests. Please try again later.",
            status=429,
            code=APIResponseCodes.GEN_RATE_429,
            i18n_key="errors.rate_limit_exceeded",
            meta={"retry_after": getattr(exc, "wait", None)},
        )

    else:
        # Generic error for other DRF exceptions
        error_message = str(response.data.get("detail", "An error occurred"))
        return BaseHttpException(
            type=f"https://docs.yourapp.com/problems/http-{status_code}",
            title=error_message,
            detail=None,
            status=status_code,
            code=f"{APIResponseCodes.PROJECT_PREFIX}-GEN-ERR-{status_code}",
            i18n_key="errors.generic",
        )
