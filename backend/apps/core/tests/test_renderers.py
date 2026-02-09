"""
Comprehensive tests for custom renderers.

Tests the custom camel case renderers and consistent data formatting
for API response rendering.
"""

import json
from unittest.mock import patch

import pytest

from apps.core.renderers import ConsistentDataJSONRenderer, ConsistentDataRenderer


@pytest.mark.django_db
@pytest.mark.renderers
class TestConsistentDataRenderer:
    """Test the ConsistentDataRenderer (CamelCase) functionality."""

    def setup_method(self):
        """Set up renderer instance."""
        self.renderer = ConsistentDataRenderer()

    def test_renderer_initialization(self):
        """Test renderer initialization and inheritance."""
        # Should inherit from CamelCaseJSONRenderer
        assert hasattr(self.renderer, "render")
        assert hasattr(self.renderer, "media_type")

        # Should have proper media type
        assert "application/json" in str(self.renderer.media_type)

    def test_render_simple_data(self, mock_render_context):
        """Test rendering simple data structures."""
        simple_data = {"message": "Hello World", "status_code": 200, "user_id": 123}

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = json.dumps(
                {"message": "Hello World", "statusCode": 200, "userId": 123}
            ).encode()

            result = self.renderer.render(
                simple_data, "application/json", mock_render_context
            )

            # Should call parent renderer
            mock_parent_render.assert_called_once_with(
                simple_data, "application/json", mock_render_context
            )

            # Should return the result from parent
            assert result is not None

    def test_render_nested_data(self, mock_render_context):
        """Test rendering nested data structures."""
        nested_data = {
            "user_profile": {
                "first_name": "John",
                "last_name": "Doe",
                "contact_info": {
                    "email_address": "john@example.com",
                    "phone_number": "+1234567890",
                },
            },
            "created_at": "2023-01-01T00:00:00Z",
        }

        expected_camel_case = {
            "userProfile": {
                "firstName": "John",
                "lastName": "Doe",
                "contactInfo": {
                    "emailAddress": "john@example.com",
                    "phoneNumber": "+1234567890",
                },
            },
            "createdAt": "2023-01-01T00:00:00Z",
        }

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = json.dumps(expected_camel_case).encode()

            result = self.renderer.render(
                nested_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once()
            assert result is not None

    def test_render_list_data(self, mock_render_context):
        """Test rendering list data structures."""
        list_data = [
            {"user_id": 1, "user_name": "John"},
            {"user_id": 2, "user_name": "Jane"},
            {"user_id": 3, "user_name": "Bob"},
        ]

        expected_camel_case = [
            {"userId": 1, "userName": "John"},
            {"userId": 2, "userName": "Jane"},
            {"userId": 3, "userName": "Bob"},
        ]

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = json.dumps(expected_camel_case).encode()

            result = self.renderer.render(
                list_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once_with(
                list_data, "application/json", mock_render_context
            )

    def test_render_paginated_data(self, mock_render_context):
        """Test rendering paginated response data."""
        paginated_data = {
            "pagination": {
                "count": 100,
                "total_pages": 5,
                "current_page": 1,
                "page_size": 20,
            },
            "data": [
                {"item_id": 1, "item_name": "Item 1"},
                {"item_id": 2, "item_name": "Item 2"},
            ],
        }

        expected_camel_case = {
            "pagination": {
                "count": 100,
                "totalPages": 5,
                "currentPage": 1,
                "pageSize": 20,
            },
            "data": [
                {"itemId": 1, "itemName": "Item 1"},
                {"itemId": 2, "itemName": "Item 2"},
            ],
        }

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = json.dumps(expected_camel_case).encode()

            result = self.renderer.render(
                paginated_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once()

    def test_render_error_data(self, mock_render_context):
        """Test rendering error response data."""
        error_data = {
            "detail": "Validation failed",
            "status_code": 400,
            "field_errors": {
                "email_address": ["This field is required."],
                "phone_number": ["Invalid format."],
            },
        }

        expected_camel_case = {
            "detail": "Validation failed",
            "statusCode": 400,
            "fieldErrors": {
                "emailAddress": ["This field is required."],
                "phoneNumber": ["Invalid format."],
            },
        }

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = json.dumps(expected_camel_case).encode()

            result = self.renderer.render(
                error_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once()

    def test_render_none_data(self, mock_render_context):
        """Test rendering None data."""
        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = b"null"

            result = self.renderer.render(None, "application/json", mock_render_context)

            mock_parent_render.assert_called_once_with(
                None, "application/json", mock_render_context
            )

    def test_render_empty_data_structures(self, mock_render_context):
        """Test rendering various empty data structures."""
        empty_data_cases = [
            ({}, b"{}"),
            ([], b"[]"),
            ("", b'""'),
            (False, b"false"),
            (0, b"0"),
        ]

        for data, expected_json in empty_data_cases:
            with patch(
                "apps.core.renderers.CamelCaseJSONRenderer.render"
            ) as mock_parent_render:
                mock_parent_render.return_value = expected_json

                result = self.renderer.render(
                    data, "application/json", mock_render_context
                )

                mock_parent_render.assert_called_once_with(
                    data, "application/json", mock_render_context
                )

    def test_render_different_media_types(self, mock_render_context):
        """Test rendering with different accepted media types."""
        data = {"test_field": "value"}

        media_types = [
            "application/json",
            "application/json; charset=utf-8",
            "application/vnd.api+json",
            None,  # Default case
        ]

        for media_type in media_types:
            with patch(
                "apps.core.renderers.CamelCaseJSONRenderer.render"
            ) as mock_parent_render:
                mock_parent_render.return_value = b'{"testField": "value"}'

                result = self.renderer.render(data, media_type, mock_render_context)

                mock_parent_render.assert_called_once_with(
                    data, media_type, mock_render_context
                )

    def test_render_without_context(self):
        """Test rendering without renderer context."""
        data = {"test_field": "value"}

        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = b'{"testField": "value"}'

            result = self.renderer.render(data, "application/json", None)

            mock_parent_render.assert_called_once_with(data, "application/json", None)

    def test_render_preserves_parent_behavior(self, mock_render_context):
        """Test that renderer preserves parent CamelCaseJSONRenderer behavior."""
        data = {
            "snake_case_field": "value",
            "another_field": {"nested_snake_case": "nested_value"},
        }

        # Test that it calls parent with exact same parameters
        with patch(
            "apps.core.renderers.CamelCaseJSONRenderer.render"
        ) as mock_parent_render:
            mock_parent_render.return_value = b"camelized_json"

            result = self.renderer.render(data, "application/json", mock_render_context)

            # Should pass through all parameters unchanged
            mock_parent_render.assert_called_once_with(
                data, "application/json", mock_render_context
            )

            # Should return parent's result unchanged
            assert result == b"camelized_json"


@pytest.mark.django_db
@pytest.mark.renderers
class TestConsistentDataJSONRenderer:
    """Test the ConsistentDataJSONRenderer (fallback) functionality."""

    def setup_method(self):
        """Set up renderer instance."""
        self.renderer = ConsistentDataJSONRenderer()

    def test_renderer_initialization(self):
        """Test renderer initialization and inheritance."""
        # Should inherit from JSONRenderer
        assert hasattr(self.renderer, "render")
        assert hasattr(self.renderer, "media_type")

        # Should have proper media type
        assert "application/json" in str(self.renderer.media_type)

    def test_render_simple_data(self, mock_render_context):
        """Test rendering simple data structures (no camel case conversion)."""
        simple_data = {"message": "Hello World", "status_code": 200, "user_id": 123}

        with patch(
            "rest_framework.renderers.JSONRenderer.render"
        ) as mock_parent_render:
            expected_json = json.dumps(simple_data).encode()
            mock_parent_render.return_value = expected_json

            result = self.renderer.render(
                simple_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once_with(
                simple_data, "application/json", mock_render_context
            )

            assert result == expected_json

    def test_render_nested_data(self, mock_render_context):
        """Test rendering nested data structures."""
        nested_data = {
            "user_profile": {
                "first_name": "John",
                "contact_info": {"email_address": "john@example.com"},
            }
        }

        with patch(
            "rest_framework.renderers.JSONRenderer.render"
        ) as mock_parent_render:
            expected_json = json.dumps(nested_data).encode()
            mock_parent_render.return_value = expected_json

            result = self.renderer.render(
                nested_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once()
            assert result == expected_json

    def test_render_list_data(self, mock_render_context):
        """Test rendering list data structures."""
        list_data = [
            {"user_id": 1, "user_name": "John"},
            {"user_id": 2, "user_name": "Jane"},
        ]

        with patch(
            "rest_framework.renderers.JSONRenderer.render"
        ) as mock_parent_render:
            expected_json = json.dumps(list_data).encode()
            mock_parent_render.return_value = expected_json

            result = self.renderer.render(
                list_data, "application/json", mock_render_context
            )

            mock_parent_render.assert_called_once()
            assert result == expected_json

    def test_render_preserves_snake_case(self, mock_render_context):
        """Test that fallback renderer preserves snake_case field names."""
        data = {
            "snake_case_field": "value",
            "another_field": {"nested_snake_case": "nested_value"},
        }

        with patch(
            "rest_framework.renderers.JSONRenderer.render"
        ) as mock_parent_render:
            # Parent should preserve snake_case
            expected_json = json.dumps(data).encode()
            mock_parent_render.return_value = expected_json

            result = self.renderer.render(data, "application/json", mock_render_context)

            mock_parent_render.assert_called_once()

            # Verify snake_case is preserved (no camelization)
            result_dict = json.loads(result.decode())
            assert "snake_case_field" in result_dict
            assert "nested_snake_case" in result_dict["another_field"]

    def test_render_none_and_empty_data(self, mock_render_context):
        """Test rendering None and empty data structures."""
        test_cases = [None, {}, [], "", False, 0]

        for data in test_cases:
            with patch(
                "rest_framework.renderers.JSONRenderer.render"
            ) as mock_parent_render:
                expected_json = json.dumps(data).encode()
                mock_parent_render.return_value = expected_json

                result = self.renderer.render(
                    data, "application/json", mock_render_context
                )

                mock_parent_render.assert_called_once_with(
                    data, "application/json", mock_render_context
                )

    def test_render_different_media_types(self, mock_render_context):
        """Test rendering with different accepted media types."""
        data = {"test_field": "value"}

        media_types = [
            "application/json",
            "application/json; charset=utf-8",
            "text/json",
            None,
        ]

        for media_type in media_types:
            with patch(
                "rest_framework.renderers.JSONRenderer.render"
            ) as mock_parent_render:
                expected_json = json.dumps(data).encode()
                mock_parent_render.return_value = expected_json

                result = self.renderer.render(data, media_type, mock_render_context)

                mock_parent_render.assert_called_once_with(
                    data, media_type, mock_render_context
                )

    def test_render_passthrough_behavior(self, mock_render_context):
        """Test that renderer acts as pure passthrough to parent."""
        data = {"complex": {"nested": {"data": "structure"}}}

        with patch(
            "rest_framework.renderers.JSONRenderer.render"
        ) as mock_parent_render:
            expected_result = b'{"complex": {"nested": {"data": "structure"}}}'
            mock_parent_render.return_value = expected_result

            result = self.renderer.render(data, "application/json", mock_render_context)

            # Should call parent with exact parameters
            mock_parent_render.assert_called_once_with(
                data, "application/json", mock_render_context
            )

            # Should return parent's result unchanged
            assert result == expected_result


@pytest.mark.renderers
class TestRendererComparison:
    """Test differences between the two renderer implementations."""

    def test_camel_case_vs_snake_case_rendering(self, mock_render_context):
        """Test difference in field name handling between renderers."""
        data = {
            "user_id": 123,
            "first_name": "John",
            "last_name": "Doe",
            "email_address": "john@example.com",
            "created_at": "2023-01-01T00:00:00Z",
        }

        camel_renderer = ConsistentDataRenderer()
        snake_renderer = ConsistentDataJSONRenderer()

        # Mock CamelCaseJSONRenderer to return camelized data
        with patch("apps.core.renderers.CamelCaseJSONRenderer.render") as mock_camel:
            camelized_data = {
                "userId": 123,
                "firstName": "John",
                "lastName": "Doe",
                "emailAddress": "john@example.com",
                "createdAt": "2023-01-01T00:00:00Z",
            }
            mock_camel.return_value = json.dumps(camelized_data).encode()

            camel_result = camel_renderer.render(
                data, "application/json", mock_render_context
            )
            camel_dict = json.loads(camel_result.decode())

            # Should have camelCase fields
            assert "userId" in camel_dict
            assert "firstName" in camel_dict
            assert "emailAddress" in camel_dict

        # Mock JSONRenderer to return original data
        with patch("rest_framework.renderers.JSONRenderer.render") as mock_json:
            mock_json.return_value = json.dumps(data).encode()

            snake_result = snake_renderer.render(
                data, "application/json", mock_render_context
            )
            snake_dict = json.loads(snake_result.decode())

            # Should preserve snake_case fields
            assert "user_id" in snake_dict
            assert "first_name" in snake_dict
            assert "email_address" in snake_dict

    def test_renderer_inheritance_hierarchy(self):
        """Test that renderers have correct inheritance."""
        camel_renderer = ConsistentDataRenderer()
        snake_renderer = ConsistentDataJSONRenderer()

        # Import actual parent classes for isinstance checks
        from djangorestframework_camel_case.render import CamelCaseJSONRenderer
        from rest_framework.renderers import JSONRenderer

        assert isinstance(camel_renderer, CamelCaseJSONRenderer)
        assert isinstance(snake_renderer, JSONRenderer)

    def test_renderer_media_type_compatibility(self):
        """Test that both renderers handle JSON media types."""
        camel_renderer = ConsistentDataRenderer()
        snake_renderer = ConsistentDataJSONRenderer()

        # Both should handle JSON media types
        assert hasattr(camel_renderer, "media_type")
        assert hasattr(snake_renderer, "media_type")

        # Should be JSON-based media types
        camel_media = str(camel_renderer.media_type)
        snake_media = str(snake_renderer.media_type)

        assert "json" in camel_media.lower()
        assert "json" in snake_media.lower()


@pytest.mark.renderers
class TestRendererEdgeCases:
    """Test edge cases and error handling in renderers."""

    def test_render_with_parent_renderer_exception(self, mock_render_context):
        """Test handling when parent renderer raises exception."""
        camel_renderer = ConsistentDataRenderer()
        data = {"test": "data"}

        with patch("apps.core.renderers.CamelCaseJSONRenderer.render") as mock_parent:
            mock_parent.side_effect = Exception("Parent renderer failed")

            # Should propagate the exception
            with pytest.raises(Exception) as exc_info:
                camel_renderer.render(data, "application/json", mock_render_context)

            assert "Parent renderer failed" in str(exc_info.value)

    def test_render_with_very_large_data(self, mock_render_context):
        """Test rendering with very large data structures."""
        # Create large nested data structure
        large_data = {}
        for i in range(100):
            large_data[f"field_{i}"] = {
                "nested_field": f"value_{i}",
                "list_field": [f"item_{j}" for j in range(10)],
            }

        camel_renderer = ConsistentDataRenderer()

        with patch("apps.core.renderers.CamelCaseJSONRenderer.render") as mock_parent:
            # Simulate successful rendering of large data
            mock_parent.return_value = b'{"large": "data"}'

            result = camel_renderer.render(
                large_data, "application/json", mock_render_context
            )

            mock_parent.assert_called_once()
            assert result is not None

    def test_render_with_circular_references(self, mock_render_context):
        """Test handling of data with potential circular references."""
        # Note: JSON serialization should fail on circular refs,
        # but we test that our renderer passes it to parent correctly

        data = {"self_ref": None}
        data["self_ref"] = data  # Create circular reference

        camel_renderer = ConsistentDataRenderer()

        with patch("apps.core.renderers.CamelCaseJSONRenderer.render") as mock_parent:
            # Parent would typically raise ValueError for circular refs
            mock_parent.side_effect = ValueError("Circular reference detected")

            with pytest.raises(ValueError) as exc_info:
                camel_renderer.render(data, "application/json", mock_render_context)

            assert "Circular reference detected" in str(exc_info.value)
            mock_parent.assert_called_once()

    def test_render_with_special_data_types(self, mock_render_context):
        """Test rendering with special Python data types."""
        import datetime
        import decimal
        from uuid import UUID

        special_data = {
            "datetime_field": datetime.datetime.now(),
            "date_field": datetime.date.today(),
            "decimal_field": decimal.Decimal("123.45"),
            "uuid_field": UUID("12345678-1234-5678-1234-123456789abc"),
            "bytes_field": b"binary_data",
            "set_field": {1, 2, 3},  # Sets are not JSON serializable
        }

        snake_renderer = ConsistentDataJSONRenderer()

        with patch("rest_framework.renderers.JSONRenderer.render") as mock_parent:
            # DRF's JSONRenderer typically handles these via DjangoJSONEncoder
            mock_parent.return_value = b'{"special": "serialized_data"}'

            result = snake_renderer.render(
                special_data, "application/json", mock_render_context
            )

            mock_parent.assert_called_once()
            assert result is not None
