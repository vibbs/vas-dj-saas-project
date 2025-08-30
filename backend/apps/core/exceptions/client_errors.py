"""
4xx Client Error exceptions for standardized error handling.
"""

from typing import Optional
from .base import BaseHttpException
from ..codes import APIResponseCodes


class BadRequestException(BaseHttpException):
    """400 Bad Request - The request could not be understood by the server."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/bad-request",
            title="Bad request",
            status=400,
            detail=detail or "The request could not be understood by the server.",
            code=kwargs.get("code", APIResponseCodes.GEN_BAD_400),
            i18n_key=kwargs.get("i18n_key", "errors.bad_request"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class UnauthorizedException(BaseHttpException):
    """401 Unauthorized - Authentication is required and has failed or not been provided."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/unauthorized",
            title="Authentication required",
            status=401,
            detail=detail
            or "Authentication credentials were not provided or are invalid.",
            code=kwargs.get("code", APIResponseCodes.GEN_UNAUTH_401),
            i18n_key=kwargs.get("i18n_key", "errors.unauthorized"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class ForbiddenException(BaseHttpException):
    """403 Forbidden - The server understood the request but refuses to authorize it."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/forbidden",
            title="Forbidden",
            status=403,
            detail=detail or "You do not have permission to perform this action.",
            code=kwargs.get("code", APIResponseCodes.GEN_FORBID_403),
            i18n_key=kwargs.get("i18n_key", "errors.forbidden"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class NotFoundException(BaseHttpException):
    """404 Not Found - The requested resource could not be found."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/not-found",
            title="Not found",
            status=404,
            detail=detail or "The requested resource was not found.",
            code=kwargs.get("code", APIResponseCodes.GEN_NOTFOUND_404),
            i18n_key=kwargs.get("i18n_key", "errors.not_found"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class MethodNotAllowedException(BaseHttpException):
    """405 Method Not Allowed - The request method is not supported for the requested resource."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/method-not-allowed",
            title="Method not allowed",
            status=405,
            detail=detail or "The request method is not supported for this resource.",
            code=kwargs.get("code", "VDJ-GEN-METHOD-405"),
            i18n_key=kwargs.get("i18n_key", "errors.method_not_allowed"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class ConflictException(BaseHttpException):
    """409 Conflict - The request could not be completed due to a conflict with the current state."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/conflict",
            title="Conflict",
            status=409,
            detail=detail
            or "The request conflicts with the current state of the resource.",
            code=kwargs.get("code", APIResponseCodes.GEN_CONFLICT_409),
            i18n_key=kwargs.get("i18n_key", "errors.conflict"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class ValidationException(BaseHttpException):
    """400 Bad Request - The request contains invalid data (used for field validation errors)."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        # Extract issues from kwargs and ensure they're at root level
        issues = kwargs.pop("issues", [])
        
        # Extract meta separately, excluding handled keys
        meta = {k: v for k, v in kwargs.items() if k not in ["code", "i18n_key", "instance"]}
        
        super().__init__(
            type="https://docs.yourapp.com/problems/validation-error",
            title="Validation error",
            status=400,
            detail=detail or "The request contains invalid data.",
            code=kwargs.get("code", APIResponseCodes.GEN_VAL_422),
            i18n_key=kwargs.get("i18n_key", "errors.validation"),
            instance=kwargs.get("instance"),
            issues=issues,
            meta=meta,
        )


class UnprocessableEntityException(BaseHttpException):
    """422 Unprocessable Entity - The request was well-formed but was unable to be followed."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        super().__init__(
            type="https://docs.yourapp.com/problems/unprocessable-entity",
            title="Unprocessable entity",
            status=422,
            detail=detail
            or "The request was well-formed but contains semantic errors.",
            code=kwargs.get("code", APIResponseCodes.GEN_VAL_422),
            i18n_key=kwargs.get("i18n_key", "errors.unprocessable_entity"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key"]},
        )


class RateLimitException(BaseHttpException):
    """429 Too Many Requests - The user has sent too many requests in a given amount of time."""

    def __init__(self, detail: Optional[str] = None, **kwargs):
        self.reset_time = kwargs.get("reset_time")
        self.limit = kwargs.get("limit")
        super().__init__(
            type="https://docs.yourapp.com/problems/rate-limit-exceeded",
            title="Rate limit exceeded",
            status=429,
            detail=detail or "Rate limit exceeded. Please try again later.",
            code=kwargs.get("code", APIResponseCodes.GEN_RATE_429),
            i18n_key=kwargs.get("i18n_key", "errors.rate_limit_exceeded"),
            meta={k: v for k, v in kwargs.items() if k not in ["code", "i18n_key", "reset_time", "limit"]},
        )
