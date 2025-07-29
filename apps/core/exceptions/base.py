"""
Base HTTP exception class for standardized error handling.
"""

from rest_framework import status
from rest_framework.exceptions import APIException
from typing import Optional, Dict, Any


class BaseHttpException(APIException):
    """
    Base HTTP exception class that provides consistent error structure
    across the application.
    """
    
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "An error occurred"
    default_code = "error"
    
    def __init__(
        self,
        detail: Optional[str] = None,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize the exception.
        
        Args:
            detail: Human-readable error message
            code: Machine-readable error code
            status_code: HTTP status code
            extra_data: Additional context data
        """
        if detail is not None:
            self.detail = detail
        else:
            self.detail = self.default_detail
            
        if code is not None:
            self.default_code = code
            
        if status_code is not None:
            self.status_code = status_code
            
        self.extra_data = extra_data or {}
        
        super().__init__(detail=self.detail, code=self.default_code)
    
    def get_error_response_data(self) -> Dict[str, Any]:
        """
        Get structured error response data.
        
        Returns:
            Dictionary containing error information
        """
        error_data = {
            "error": str(self.detail),
            "code": self.default_code,
            "status_code": self.status_code,
        }
        
        # Add extra data if provided
        if self.extra_data:
            error_data.update(self.extra_data)
            
        return error_data
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.detail} (code: {self.default_code}, status: {self.status_code})"