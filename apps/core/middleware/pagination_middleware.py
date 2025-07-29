import math
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import serializers

# Custom pagination class for API responses
# This class extends PageNumberPagination to provide a custom paginated response format


class CustomPaginationSerializer(serializers.Serializer):
    """Serializer for custom pagination response structure"""

    pagination = serializers.DictField(child=serializers.JSONField())
    data = serializers.ListField()


class DPaginationClass(PageNumberPagination):
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

    def get_paginated_response_schema(self, schema):
        """Define the schema for the paginated response"""
        return {
            "type": "object",
            "properties": {
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
                },
                "data": schema,
            },
        }
