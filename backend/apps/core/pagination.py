"""
RFC-compliant pagination for standardized paginated responses.

This module provides pagination classes that emit responses matching
the RFC 7807 success envelope format with numeric status codes.
"""

import math

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .codes import APIResponseCodes


class StandardPagination(PageNumberPagination):
    """
    RFC-compliant pagination class that produces standardized responses.

    This pagination class emits responses with:
    - Numeric status code (200)
    - Machine-readable code
    - i18n_key for localization
    - Pagination metadata
    - Data array
    """

    page_size_query_param = "page_size"
    page_query_param = "page"
    max_page_size = 100
    page_size = 20

    def get_paginated_response(self, data):
        """
        Create a paginated response with RFC-compliant envelope.

        Args:
            data: The serialized data for the current page

        Returns:
            Response: Paginated response with standard envelope
        """
        # Calculate pagination metadata
        total = self.page.paginator.count
        page_size = self.get_page_size(self.request) or len(data) or 1
        page = self.page.number
        total_pages = math.ceil(total / page_size) if page_size else 1

        # Get success code and i18n key from request if set by view
        success_code = getattr(
            self.request, "success_code", APIResponseCodes.GEN_LIST_200
        )
        success_i18n_key = getattr(self.request, "success_i18n_key", "list.ok")

        # Handle both enum and string codes
        code_value = (
            success_code.value if hasattr(success_code, "value") else str(success_code)
        )

        return Response(
            {
                "status": 200,
                "code": code_value,
                "i18n_key": success_i18n_key,
                "pagination": {
                    "count": total,
                    "totalPages": total_pages,
                    "currentPage": page,
                    "next": page + 1 if self.page.has_next() else None,
                    "previous": page - 1 if self.page.has_previous() else None,
                    "pageSize": page_size,
                },
                "data": data,
            },
            status=200,
        )

    def get_paginated_response_schema(self, schema):
        """
        Define the OpenAPI schema for paginated responses.

        Args:
            schema: The schema for individual items

        Returns:
            dict: OpenAPI schema for the paginated response
        """
        return {
            "type": "object",
            "properties": {
                "status": {
                    "type": "integer",
                    "description": "HTTP status code",
                    "example": 200,
                },
                "code": {
                    "type": "string",
                    "description": "Machine-readable success code",
                    "example": "VDJ-GEN-LIST-200",
                },
                "i18n_key": {
                    "type": "string",
                    "description": "Internationalization key",
                    "example": "list.ok",
                },
                "pagination": {
                    "type": "object",
                    "properties": {
                        "count": {
                            "type": "integer",
                            "description": "Total number of items",
                            "example": 100,
                        },
                        "totalPages": {
                            "type": "integer",
                            "description": "Total number of pages",
                            "example": 5,
                        },
                        "currentPage": {
                            "type": "integer",
                            "description": "Current page number",
                            "example": 1,
                        },
                        "next": {
                            "type": "integer",
                            "nullable": True,
                            "description": "Next page number",
                            "example": 2,
                        },
                        "previous": {
                            "type": "integer",
                            "nullable": True,
                            "description": "Previous page number",
                            "example": None,
                        },
                        "pageSize": {
                            "type": "integer",
                            "description": "Number of items per page",
                            "example": 20,
                        },
                    },
                    "required": ["count", "totalPages", "currentPage", "pageSize"],
                },
                "data": {"type": "array", "items": schema},
            },
            "required": ["status", "code", "i18n_key", "pagination", "data"],
        }


# Keep the old pagination class for backward compatibility during transition
class CustomPaginationClass(PageNumberPagination):
    """
    Legacy pagination class - will be deprecated in favor of StandardPagination.
    """

    page_size_query_param = "perPage"
    page_query_param = "page"
    page_size = 20

    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size)
        current_page = self.page.number

        return Response(
            {
                "pagination": {
                    "count": self.page.paginator.count,
                    "totalPages": total_pages,
                    "currentPage": current_page,
                    "next": (
                        self.page.next_page_number() if self.page.has_next() else None
                    ),
                    "previous": (
                        self.page.previous_page_number()
                        if self.page.has_previous()
                        else None
                    ),
                    "pageSize": self.page_size,
                },
                "data": data,
            }
        )
