"""
Comprehensive tests for the pagination system.

Tests the RFC-compliant pagination classes that produce standardized
paginated responses with proper metadata and envelope format.
"""

from unittest.mock import Mock, patch

import pytest
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory

from apps.core.codes import APIResponseCodes
from apps.core.pagination import CustomPaginationClass, StandardPagination


@pytest.mark.django_db
@pytest.mark.pagination
class TestStandardPagination:
    """Test the StandardPagination class functionality."""

    def setup_method(self):
        """Set up test data and pagination instance."""
        self.factory = APIRequestFactory()
        self.pagination = StandardPagination()

        # Create sample data
        self.sample_data = [
            {"id": i, "name": f"Item {i}", "value": i * 10}
            for i in range(1, 101)  # 100 items
        ]

    def create_paginated_request(self, page=1, page_size=20, **params):
        """Create a mock paginated request."""
        query_params = {"page": page, "page_size": page_size, **params}

        request = self.factory.get("/api/test/", query_params)
        drf_request = Request(request)

        # Mock paginator and page
        paginator = Mock()
        paginator.count = 100

        page_obj = Mock()
        page_obj.number = page
        page_obj.paginator = paginator
        page_obj.has_next.return_value = page < 5  # 5 total pages
        page_obj.has_previous.return_value = page > 1

        self.pagination.page = page_obj
        self.pagination.request = drf_request

        return drf_request

    def test_pagination_basic_response_structure(self):
        """Test basic paginated response structure."""
        request = self.create_paginated_request(page=1, page_size=20)
        data = [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]

        response = self.pagination.get_paginated_response(data)

        assert isinstance(response, Response)
        assert response.status_code == 200

        response_data = response.data
        assert "status" in response_data
        assert "code" in response_data
        assert "i18n_key" in response_data
        assert "pagination" in response_data
        assert "data" in response_data

        assert response_data["status"] == 200
        assert response_data["code"] == APIResponseCodes.GEN_LIST_200.value
        assert response_data["i18n_key"] == "list.ok"
        assert response_data["data"] == data

    def test_pagination_metadata_calculation(self):
        """Test pagination metadata calculations."""
        request = self.create_paginated_request(page=2, page_size=25)
        data = [{"id": i} for i in range(26, 51)]  # Items 26-50

        response = self.pagination.get_paginated_response(data)
        pagination_meta = response.data["pagination"]

        assert pagination_meta["count"] == 100
        assert pagination_meta["totalPages"] == 4  # ceil(100/25)
        assert pagination_meta["currentPage"] == 2
        assert pagination_meta["next"] == 3
        assert pagination_meta["previous"] == 1
        assert pagination_meta["pageSize"] == 25

    def test_pagination_first_page(self):
        """Test pagination metadata for first page."""
        request = self.create_paginated_request(page=1, page_size=20)

        # Mock first page behavior
        self.pagination.page.has_previous.return_value = False

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["currentPage"] == 1
        assert pagination_meta["previous"] is None
        assert pagination_meta["next"] == 2

    def test_pagination_last_page(self):
        """Test pagination metadata for last page."""
        request = self.create_paginated_request(page=5, page_size=20)

        # Mock last page behavior
        self.pagination.page.number = 5
        self.pagination.page.has_next.return_value = False

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["currentPage"] == 5
        assert pagination_meta["next"] is None
        assert pagination_meta["previous"] == 4

    def test_pagination_single_page(self):
        """Test pagination with single page of results."""
        request = self.create_paginated_request(page=1, page_size=20)

        # Mock single page
        self.pagination.page.paginator.count = 15  # Less than page size
        self.pagination.page.has_next.return_value = False
        self.pagination.page.has_previous.return_value = False

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["count"] == 15
        assert pagination_meta["totalPages"] == 1
        assert pagination_meta["next"] is None
        assert pagination_meta["previous"] is None

    def test_pagination_empty_results(self):
        """Test pagination with empty results."""
        request = self.create_paginated_request(page=1, page_size=20)

        # Mock empty results
        self.pagination.page.paginator.count = 0
        self.pagination.page.has_next.return_value = False
        self.pagination.page.has_previous.return_value = False

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["count"] == 0
        assert pagination_meta["totalPages"] == 0
        assert response.data["data"] == []

    def test_pagination_custom_page_size(self):
        """Test pagination with custom page size."""
        request = self.create_paginated_request(page=1, page_size=50)

        with patch.object(self.pagination, "get_page_size") as mock_get_page_size:
            mock_get_page_size.return_value = 50

            response = self.pagination.get_paginated_response([])
            pagination_meta = response.data["pagination"]

            assert pagination_meta["pageSize"] == 50
            assert pagination_meta["totalPages"] == 2  # ceil(100/50)

    def test_pagination_max_page_size_limit(self):
        """Test pagination respects max page size limit."""
        request = self.create_paginated_request(page=1, page_size=150)  # Above max

        with patch.object(self.pagination, "get_page_size") as mock_get_page_size:
            # Simulate DRF's page size limiting
            mock_get_page_size.return_value = 100  # Limited to max

            response = self.pagination.get_paginated_response([])
            pagination_meta = response.data["pagination"]

            assert pagination_meta["pageSize"] == 100

    def test_pagination_custom_success_code(self):
        """Test pagination with custom success code from request."""
        request = self.create_paginated_request(page=1, page_size=20)

        # Set custom success code on request
        request.success_code = "VDJ-CUSTOM-SUCCESS-200"
        request.success_i18n_key = "custom.success"

        response = self.pagination.get_paginated_response([])

        assert response.data["code"] == "VDJ-CUSTOM-SUCCESS-200"
        assert response.data["i18n_key"] == "custom.success"

    def test_pagination_enum_success_code(self):
        """Test pagination with enum success code."""
        request = self.create_paginated_request(page=1, page_size=20)

        # Set enum success code
        request.success_code = APIResponseCodes.GEN_OK_200
        request.success_i18n_key = "general.ok"

        response = self.pagination.get_paginated_response([])

        assert response.data["code"] == APIResponseCodes.GEN_OK_200.value
        assert response.data["i18n_key"] == "general.ok"

    def test_get_page_size_fallback(self):
        """Test page size calculation fallback logic."""
        request = self.create_paginated_request(page=1)

        with patch.object(self.pagination, "get_page_size") as mock_get_page_size:
            mock_get_page_size.return_value = None  # No page size specified

            # Test with data length
            data = [{"id": i} for i in range(15)]
            response = self.pagination.get_paginated_response(data)
            pagination_meta = response.data["pagination"]

            assert pagination_meta["pageSize"] == 15  # Falls back to data length

            # Test with empty data
            response = self.pagination.get_paginated_response([])
            pagination_meta = response.data["pagination"]

            assert pagination_meta["pageSize"] == 1  # Falls back to 1

    def test_pagination_large_numbers(self):
        """Test pagination calculations with large numbers."""
        request = self.create_paginated_request(page=1000, page_size=50)

        # Mock large dataset
        self.pagination.page.paginator.count = 100000
        self.pagination.page.number = 1000

        with patch.object(self.pagination, "get_page_size") as mock_get_page_size:
            mock_get_page_size.return_value = 50

            response = self.pagination.get_paginated_response([])
            pagination_meta = response.data["pagination"]

            assert pagination_meta["count"] == 100000
            assert pagination_meta["totalPages"] == 2000  # ceil(100000/50)
            assert pagination_meta["currentPage"] == 1000

    def test_get_paginated_response_schema(self):
        """Test OpenAPI schema generation for paginated responses."""
        item_schema = {
            "type": "object",
            "properties": {"id": {"type": "integer"}, "name": {"type": "string"}},
        }

        schema = self.pagination.get_paginated_response_schema(item_schema)

        assert schema["type"] == "object"
        assert "properties" in schema

        properties = schema["properties"]
        assert "status" in properties
        assert "code" in properties
        assert "i18n_key" in properties
        assert "pagination" in properties
        assert "data" in properties

        # Check pagination schema
        pagination_schema = properties["pagination"]
        assert pagination_schema["type"] == "object"
        pagination_props = pagination_schema["properties"]

        required_pagination_fields = ["count", "totalPages", "currentPage", "pageSize"]
        for field in required_pagination_fields:
            assert field in pagination_props
            assert pagination_props[field]["type"] == "integer"

        # Check nullable fields
        assert pagination_props["next"]["nullable"] is True
        assert pagination_props["previous"]["nullable"] is True

        # Check data schema
        assert properties["data"]["type"] == "array"
        assert properties["data"]["items"] == item_schema


@pytest.mark.django_db
@pytest.mark.pagination
class TestCustomPaginationClass:
    """Test the legacy CustomPaginationClass for backward compatibility."""

    def setup_method(self):
        """Set up test data and pagination instance."""
        self.factory = APIRequestFactory()
        self.pagination = CustomPaginationClass()

    def create_legacy_paginated_request(self, page=1, per_page=20):
        """Create a mock request with legacy parameters."""
        query_params = {"page": page, "perPage": per_page}

        request = self.factory.get("/api/test/", query_params)
        drf_request = Request(request)

        # Mock paginator and page
        paginator = Mock()
        paginator.count = 100

        page_obj = Mock()
        page_obj.number = page
        page_obj.paginator = paginator
        page_obj.has_next.return_value = page < 5
        page_obj.has_previous.return_value = page > 1
        page_obj.next_page_number.return_value = page + 1 if page < 5 else None
        page_obj.previous_page_number.return_value = page - 1 if page > 1 else None

        self.pagination.page = page_obj
        self.pagination.request = drf_request

        return drf_request

    def test_legacy_pagination_structure(self):
        """Test legacy pagination response structure."""
        request = self.create_legacy_paginated_request(page=2, per_page=20)
        data = [{"id": 1, "name": "Item 1"}]

        response = self.pagination.get_paginated_response(data)

        assert isinstance(response, Response)
        response_data = response.data

        # Legacy structure has only pagination and data
        assert "pagination" in response_data
        assert "data" in response_data
        assert "status" not in response_data  # No RFC envelope
        assert "code" not in response_data

        assert response_data["data"] == data

    def test_legacy_pagination_metadata(self):
        """Test legacy pagination metadata structure."""
        request = self.create_legacy_paginated_request(page=3, per_page=20)

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["count"] == 100
        assert pagination_meta["totalPages"] == 5  # ceil(100/20)
        assert pagination_meta["currentPage"] == 3
        assert pagination_meta["next"] == 4
        assert pagination_meta["previous"] == 2
        assert pagination_meta["pageSize"] == 20

    def test_legacy_pagination_edge_cases(self):
        """Test legacy pagination edge cases."""
        # First page
        request = self.create_legacy_paginated_request(page=1, per_page=20)
        self.pagination.page.has_previous.return_value = False
        self.pagination.page.previous_page_number.return_value = None

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["previous"] is None

        # Last page
        request = self.create_legacy_paginated_request(page=5, per_page=20)
        self.pagination.page.number = 5
        self.pagination.page.has_next.return_value = False
        self.pagination.page.next_page_number.return_value = None

        response = self.pagination.get_paginated_response([])
        pagination_meta = response.data["pagination"]

        assert pagination_meta["next"] is None


@pytest.mark.pagination
class TestPaginationIntegration:
    """Test pagination integration with various data types and edge cases."""

    def test_pagination_with_complex_data(self):
        """Test pagination with complex nested data structures."""
        pagination = StandardPagination()
        factory = APIRequestFactory()

        # Complex data with nested objects
        complex_data = [
            {
                "id": 1,
                "user": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "profile": {"age": 25, "preferences": ["email", "sms"]},
                },
                "metadata": {
                    "created_at": "2023-01-01T00:00:00Z",
                    "tags": ["important", "urgent"],
                },
            }
        ]

        request = Request(factory.get("/api/test/", {"page": 1}))

        # Mock pagination page
        paginator = Mock()
        paginator.count = 50

        page_obj = Mock()
        page_obj.number = 1
        page_obj.paginator = paginator
        page_obj.has_next.return_value = True
        page_obj.has_previous.return_value = False

        pagination.page = page_obj
        pagination.request = request

        response = pagination.get_paginated_response(complex_data)

        assert response.data["data"] == complex_data
        assert isinstance(response.data["pagination"], dict)

    def test_pagination_with_empty_and_none_data(self):
        """Test pagination with various empty data scenarios."""
        pagination = StandardPagination()
        factory = APIRequestFactory()
        request = Request(factory.get("/api/test/", {"page": 1}))

        # Mock pagination page for empty results
        paginator = Mock()
        paginator.count = 0

        page_obj = Mock()
        page_obj.number = 1
        page_obj.paginator = paginator
        page_obj.has_next.return_value = False
        page_obj.has_previous.return_value = False

        pagination.page = page_obj
        pagination.request = request

        # Test with empty list
        response = pagination.get_paginated_response([])
        assert response.data["data"] == []
        assert response.data["pagination"]["count"] == 0

        # Test with None (should work)
        response = pagination.get_paginated_response(None)
        assert response.data["data"] is None

        # Test with other falsy values
        for falsy_data in [False, 0, ""]:
            response = pagination.get_paginated_response(falsy_data)
            assert response.data["data"] == falsy_data

    def test_pagination_math_edge_cases(self):
        """Test pagination math calculations with edge cases."""
        pagination = StandardPagination()
        factory = APIRequestFactory()
        request = Request(factory.get("/api/test/", {"page": 1}))

        test_cases = [
            (1, 1, 1),  # 1 item, 1 per page = 1 page
            (0, 10, 0),  # 0 items = 0 pages
            (7, 3, 3),  # 7 items, 3 per page = 3 pages (ceil(7/3))
            (10, 3, 4),  # 10 items, 3 per page = 4 pages (ceil(10/3))
            (100, 33, 4),  # 100 items, 33 per page = 4 pages (ceil(100/33))
        ]

        for count, page_size, expected_pages in test_cases:
            paginator = Mock()
            paginator.count = count

            page_obj = Mock()
            page_obj.number = 1
            page_obj.paginator = paginator
            page_obj.has_next.return_value = False
            page_obj.has_previous.return_value = False

            pagination.page = page_obj
            pagination.request = request

            with patch.object(pagination, "get_page_size") as mock_get_page_size:
                mock_get_page_size.return_value = page_size

                response = pagination.get_paginated_response([])
                actual_pages = response.data["pagination"]["totalPages"]

                assert (
                    actual_pages == expected_pages
                ), f"Count: {count}, Page size: {page_size}, Expected: {expected_pages}, Got: {actual_pages}"

    def test_pagination_configuration_attributes(self):
        """Test pagination class configuration attributes."""
        pagination = StandardPagination()

        # Test default configuration
        assert pagination.page_size_query_param == "page_size"
        assert pagination.page_query_param == "page"
        assert pagination.max_page_size == 100
        assert pagination.page_size == 20

        # Test legacy pagination configuration
        legacy_pagination = CustomPaginationClass()
        assert legacy_pagination.page_size_query_param == "perPage"
        assert legacy_pagination.page_query_param == "page"
        assert legacy_pagination.page_size == 20
        assert hasattr(
            legacy_pagination, "max_page_size"
        )  # Inherits from DRF base class
