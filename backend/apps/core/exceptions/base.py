"""
RFC 7807 compliant HTTP exception classes for standardized error handling.

This module implements the RFC 7807 "Problem Details for HTTP APIs" specification
with additional extensions for internationalization and validation issues.
"""

from typing import Optional, Dict, Any, List, Union
from rest_framework.exceptions import APIException
from ..codes import APIResponseCodes


class BaseHttpException(APIException):
    """
    RFC 7807 compliant HTTP exception class.

    This exception class implements the RFC 7807 "Problem Details for HTTP APIs"
    specification with additional extensions for i18n and validation issues.
    """

    status_code = 400
    default_code = APIResponseCodes.GEN_BAD_400

    def __init__(
        self,
        *,
        type: str,
        title: str,
        status: int,
        detail: Optional[str] = None,
        code: Optional[Union[str, APIResponseCodes]] = None,
        i18n_key: Optional[str] = None,
        instance: Optional[str] = None,
        issues: Optional[List[Dict[str, Any]]] = None,
        meta: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize RFC 7807 compliant exception.

        Args:
            type: URI reference identifying the problem type
            title: Short, human-readable summary of the problem type
            status: HTTP status code
            detail: Human-readable explanation specific to this occurrence
            code: Machine-readable code for this specific problem
            i18n_key: Internationalization key for frontend localization
            instance: URI reference identifying the specific occurrence
            issues: Array of validation issues (for form errors)
            meta: Additional metadata about the problem
        """
        self.type = type
        self.title = title
        self.detail = detail
        self.status_code = status

        # Handle both enum and string codes
        if code is not None:
            self.code = code.value if hasattr(code, "value") else str(code)
        else:
            self.code = (
                self.default_code.value
                if hasattr(self.default_code, "value")
                else str(self.default_code)
            )

        self.i18n_key = i18n_key or "errors.generic"
        self.instance = instance
        self.issues = issues or []
        self.meta = meta or {}

        # Call parent with detail for DRF compatibility
        super().__init__(detail=self.detail or title, code=self.code)

    def to_dict(self, request=None) -> Dict[str, Any]:
        """
        Convert exception to RFC 7807 compliant dictionary.

        Args:
            request: Django request object for instance path

        Returns:
            Dictionary with RFC 7807 fields
        """
        result = {
            "type": self.type,
            "title": self.title,
            "status": self.status_code,
            "code": self.code,
            "i18n_key": self.i18n_key,
        }

        # Add optional fields only if they have values
        if self.detail:
            result["detail"] = self.detail

        if self.instance:
            result["instance"] = self.instance
        elif request:
            result["instance"] = request.path

        if self.issues:
            result["issues"] = self.issues

        if self.meta:
            result["meta"] = self.meta

        return result

    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.title} (code: {self.code}, status: {self.status_code})"


def flatten_validation_errors(detail, path_prefix=None) -> List[Dict[str, Any]]:
    """
    Flatten DRF validation errors into RFC 7807 issues format.

    Args:
        detail: DRF validation error detail (can be nested)
        path_prefix: Current path in the nested structure

    Returns:
        List of issue dictionaries with path, message, and i18n_key
    """
    if detail is None:
        return []
        
    path_prefix = path_prefix or []
    issues = []

    if isinstance(detail, dict):
        if not detail:  # Empty dict
            return []
        for key, value in detail.items():
            issues.extend(flatten_validation_errors(value, path_prefix + [key]))
    elif isinstance(detail, list):
        for idx, value in enumerate(detail):
            # If the list contains dicts, use indices (list of objects being validated)
            # If the list contains strings, don't use indices (list of error messages)
            if isinstance(value, dict):
                issues.extend(flatten_validation_errors(value, path_prefix + [idx]))
            else:
                issues.extend(flatten_validation_errors(value, path_prefix))
    else:
        issues.append(
            {
                "path": path_prefix,
                "message": str(detail),
                "i18n_key": "validation.error",
            }
        )

    return issues
