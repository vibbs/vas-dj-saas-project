"""
5xx Server Error exceptions for standardized error handling.
"""

from ..codes import APIResponseCodes
from .base import BaseHttpException


class InternalServerErrorException(BaseHttpException):
    """500 Internal Server Error - A generic error message for unexpected server errors."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/internal-server-error",
            title="Internal server error",
            status=500,
            detail=detail or "An unexpected server error occurred.",
            code=kwargs.get("code", APIResponseCodes.GEN_ERR_500),
            i18n_key=kwargs.get("i18n_key", "errors.internal_server_error"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class NotImplementedException(BaseHttpException):
    """501 Not Implemented - The server does not support the functionality required."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/not-implemented",
            title="Not implemented",
            status=501,
            detail=detail or "This functionality is not implemented.",
            code=kwargs.get("code", "VDJ-GEN-NOTIMPL-501"),
            i18n_key=kwargs.get("i18n_key", "errors.not_implemented"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class BadGatewayException(BaseHttpException):
    """502 Bad Gateway - The server received an invalid response from an upstream server."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/bad-gateway",
            title="Bad gateway",
            status=502,
            detail=detail
            or "The server received an invalid response from an upstream server.",
            code=kwargs.get("code", "VDJ-GEN-GATEWAY-502"),
            i18n_key=kwargs.get("i18n_key", "errors.bad_gateway"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class ServiceUnavailableException(BaseHttpException):
    """503 Service Unavailable - The server is currently unavailable."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/service-unavailable",
            title="Service unavailable",
            status=503,
            detail=detail or "Service is temporarily unavailable.",
            code=kwargs.get("code", APIResponseCodes.GEN_UNAVAIL_503),
            i18n_key=kwargs.get("i18n_key", "errors.service_unavailable"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class GatewayTimeoutException(BaseHttpException):
    """504 Gateway Timeout - The server did not receive a timely response from upstream."""

    def __init__(self, detail: str | None = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/gateway-timeout",
            title="Gateway timeout",
            status=504,
            detail=detail
            or "The server did not receive a timely response from upstream.",
            code=kwargs.get("code", "VDJ-GEN-TIMEOUT-504"),
            i18n_key=kwargs.get("i18n_key", "errors.gateway_timeout"),
            **{k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )
