"""
RFC-compliant success response helpers.

This module provides utility functions for creating standardized success responses
that match the RFC 7807 specification for success envelopes.
"""

from typing import Any, Dict, Optional, Union
from rest_framework.response import Response
from .codes import APIResponseCodes


def success_response(
    *,
    data: Any = None,
    code: Union[str, APIResponseCodes],
    i18n_key: str,
    status: int = 200,
    extra: Optional[Dict[str, Any]] = None
) -> Response:
    """
    Create a standardized success response.

    Args:
        data: The response data payload
        code: Machine-readable success code (from APIResponseCodes enum or string)
        i18n_key: Internationalization key for frontend localization
        status: HTTP status code (default: 200)
        extra: Additional fields to include in the response

    Returns:
        Response: DRF Response object with standardized success envelope
    """
    # Handle both enum and string codes
    code_value = code.value if hasattr(code, "value") else str(code)

    # Build the success envelope
    response_body = {
        "status": status,
        "code": code_value,
        "i18n_key": i18n_key,
        "data": data,
    }

    # Add any extra fields
    if extra:
        response_body.update(extra)

    return Response(response_body, status=status)


def ok(
    *,
    data: Any = None,
    code: Union[str, APIResponseCodes] = APIResponseCodes.GEN_OK_200,
    i18n_key: str = "common.ok"
) -> Response:
    """
    Create a standard 200 OK response.

    Args:
        data: The response data payload
        code: Machine-readable success code
        i18n_key: Internationalization key

    Returns:
        Response: 200 OK response with success envelope
    """
    return success_response(data=data, code=code, i18n_key=i18n_key, status=200)


def created(
    *,
    data: Any = None,
    code: Union[str, APIResponseCodes] = APIResponseCodes.GEN_CREATED_201,
    i18n_key: str = "common.created"
) -> Response:
    """
    Create a standard 201 Created response.

    Args:
        data: The response data payload (usually the created resource)
        code: Machine-readable success code
        i18n_key: Internationalization key

    Returns:
        Response: 201 Created response with success envelope
    """
    return success_response(data=data, code=code, i18n_key=i18n_key, status=201)


def accepted(
    *,
    data: Any = None,
    code: Union[str, APIResponseCodes],
    i18n_key: str = "common.accepted"
) -> Response:
    """
    Create a standard 202 Accepted response.

    Args:
        data: The response data payload
        code: Machine-readable success code
        i18n_key: Internationalization key

    Returns:
        Response: 202 Accepted response with success envelope
    """
    return success_response(data=data, code=code, i18n_key=i18n_key, status=202)


def no_content(
    *, code: Union[str, APIResponseCodes], i18n_key: str = "common.no_content"
) -> Response:
    """
    Create a standard 204 No Content response.

    Args:
        code: Machine-readable success code
        i18n_key: Internationalization key

    Returns:
        Response: 204 No Content response with minimal envelope
    """
    return Response(
        {
            "status": 204,
            "code": code.value if hasattr(code, "value") else str(code),
            "i18n_key": i18n_key,
        },
        status=204,
    )
