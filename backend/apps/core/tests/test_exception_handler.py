"""
Comprehensive tests for the RFC 7807 exception handler.

Tests the global exception handler that converts all exceptions into
RFC 7807 "Problem Details for HTTP APIs" format.
"""

import pytest
import json
from unittest.mock import Mock, patch
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from rest_framework.exceptions import (
    ValidationError, PermissionDenied as DRFPermissionDenied, 
    AuthenticationFailed, NotAuthenticated, NotFound, MethodNotAllowed,
    ParseError, UnsupportedMediaType, Throttled
)
from rest_framework.response import Response

from apps.core.exceptions.handler import (
    rfc7807_exception_handler, _convert_drf_exception_to_rfc7807
)
from apps.core.exceptions.base import BaseHttpException, flatten_validation_errors
from apps.core.exceptions.client_errors import ValidationException
from apps.core.codes import APIResponseCodes


@pytest.mark.django_db
@pytest.mark.exception_handling
class TestRFC7807ExceptionHandler:
    """Test the main RFC 7807 exception handler."""

    def test_base_http_exception_handling(self, mock_view_context):
        """Test handling of custom BaseHttpException."""
        exc = BaseHttpException(
            type="https://docs.yourapp.com/problems/test-error",
            title="Test Error",
            detail="This is a test error",
            status=400,
            code="VDJ-TEST-ERROR-400",
            i18n_key="test.error"
        )
        
        response = rfc7807_exception_handler(exc, mock_view_context)
        
        assert isinstance(response, Response)
        assert response.status_code == 400
        
        data = response.data
        assert data['type'] == "https://docs.yourapp.com/problems/test-error"
        assert data['title'] == "Test Error"
        assert data['detail'] == "This is a test error"
        assert data['status'] == 400
        assert data['code'] == "VDJ-TEST-ERROR-400"
        assert data['i18n_key'] == "test.error"

    def test_drf_validation_error_handling(self, sample_validation_error, mock_view_context):
        """Test handling of DRF ValidationError with proper issue flattening."""
        response = rfc7807_exception_handler(sample_validation_error, mock_view_context)
        
        assert isinstance(response, Response)
        assert response.status_code == 400
        
        data = response.data
        assert data['type'] == "https://docs.yourapp.com/problems/validation"
        assert data['title'] == "Validation failed"
        assert data['status'] == 400
        assert data['code'] == APIResponseCodes.GEN_VAL_422.value
        assert 'issues' in data
        
        # Check flattened issues
        issues = data['issues']
        assert len(issues) >= 3  # email, password (2 issues), nested_field
        
        email_issues = [i for i in issues if i['path'] == ['email']]
        assert len(email_issues) == 1
        assert email_issues[0]['message'] == 'This field is required.'

    def test_nested_validation_error_flattening(self, sample_nested_validation_error, mock_view_context):
        """Test flattening of deeply nested validation errors."""
        response = rfc7807_exception_handler(sample_nested_validation_error, mock_view_context)
        
        data = response.data
        issues = data['issues']
        
        # Find nested path issues
        nested_issues = [i for i in issues if len(i['path']) > 1]
        assert len(nested_issues) > 0
        
        # Check deeply nested path
        age_issues = [i for i in issues if i['path'] == ['user', 'profile', 'age']]
        assert len(age_issues) == 1
        assert age_issues[0]['message'] == 'Must be at least 18.'

    def test_django_http404_handling(self, mock_view_context):
        """Test handling of Django Http404 exception."""
        exc = Http404("Page not found")
        
        response = rfc7807_exception_handler(exc, mock_view_context)
        
        assert response.status_code == 404
        data = response.data
        assert data['type'] == "https://docs.yourapp.com/problems/not-found"
        assert data['title'] == "Not Found"
        assert data['status'] == 404
        assert data['code'] == APIResponseCodes.GEN_NOTFOUND_404.value

    def test_django_permission_denied_handling(self, mock_view_context):
        """Test handling of Django PermissionDenied exception."""
        exc = PermissionDenied("Access denied")
        
        response = rfc7807_exception_handler(exc, mock_view_context)
        
        assert response.status_code == 403
        data = response.data
        assert data['type'] == "https://docs.yourapp.com/problems/permission-denied"
        assert data['title'] == "Permission Denied"
        assert data['status'] == 403
        assert data['code'] == APIResponseCodes.PERM_DENIED_403.value

    def test_drf_exception_conversion(self, mock_view_context):
        """Test DRF exception conversion through handler."""
        exc = NotFound("Resource not found")
        
        with patch('apps.core.exceptions.handler.drf_exception_handler') as mock_drf_handler:
            mock_response = Mock()
            mock_response.status_code = 404
            mock_response.data = {'detail': 'Not found'}
            mock_drf_handler.return_value = mock_response
            
            response = rfc7807_exception_handler(exc, mock_view_context)
            
            assert response.status_code == 404
            data = response.data
            assert data['type'] == "https://docs.yourapp.com/problems/not-found"
            assert data['title'] == "Not Found"

    def test_unexpected_exception_handling(self, mock_view_context):
        """Test handling of unexpected exceptions."""
        exc = ValueError("Unexpected error")
        
        with patch('apps.core.exceptions.handler.drf_exception_handler') as mock_drf_handler:
            mock_drf_handler.return_value = None  # DRF can't handle it
            
            with patch('apps.core.exceptions.handler.logger') as mock_logger:
                response = rfc7807_exception_handler(exc, mock_view_context)
                
                assert response.status_code == 500
                data = response.data
                assert data['type'] == "https://docs.yourapp.com/problems/internal"
                assert data['title'] == "Internal Server Error"
                assert data['status'] == 500
                assert data['code'] == APIResponseCodes.GEN_ERR_500.value
                
                # Should log the exception
                mock_logger.exception.assert_called_once()

    def test_exception_handler_failure_fallback(self, mock_view_context):
        """Test fallback when exception handler itself fails."""
        exc = RuntimeError("Test error")
        
        with patch('apps.core.exceptions.handler.BaseHttpException') as mock_base_exc:
            mock_base_exc.side_effect = Exception("Handler failure")
            
            with patch('apps.core.exceptions.handler.logger') as mock_logger:
                response = rfc7807_exception_handler(exc, mock_view_context)
                
                assert response.status_code == 500
                data = response.data
                assert data['type'] == "https://docs.yourapp.com/problems/critical"
                assert data['title'] == "Critical Server Error"
                assert data['code'] == "VDJ-GEN-CRITICAL-500"
                
                # Should log critical error
                mock_logger.critical.assert_called_once()

    def test_request_context_in_response(self):
        """Test that request context is properly included in response."""
        exc = BaseHttpException(
            type="https://docs.yourapp.com/problems/test",
            title="Test",
            status=400
        )
        
        context = {
            'request': Mock(path='/api/test/endpoint/')
        }
        
        response = rfc7807_exception_handler(exc, context)
        
        data = response.data
        assert data['instance'] == '/api/test/endpoint/'


@pytest.mark.exception_handling
class TestDRFExceptionConversion:
    """Test conversion of specific DRF exceptions to RFC 7807 format."""

    def test_not_authenticated_conversion(self):
        """Test NotAuthenticated exception conversion."""
        exc = NotAuthenticated("Authentication required")
        response = Mock(status_code=401)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert isinstance(result, BaseHttpException)
        assert result.status_code == 401
        assert result.type == "https://docs.yourapp.com/problems/authentication-required"
        assert result.title == "Authentication Required"
        assert result.code == APIResponseCodes.AUTH_LOGIN_401.value

    def test_authentication_failed_conversion(self):
        """Test AuthenticationFailed exception conversion."""
        exc = AuthenticationFailed("Invalid credentials")
        response = Mock(status_code=401)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 401
        assert result.type == "https://docs.yourapp.com/problems/authentication-required"

    def test_drf_permission_denied_conversion(self):
        """Test DRF PermissionDenied exception conversion."""
        exc = DRFPermissionDenied("Permission denied")
        response = Mock(status_code=403)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 403
        assert result.type == "https://docs.yourapp.com/problems/permission-denied"
        assert result.code == APIResponseCodes.PERM_DENIED_403.value

    def test_not_found_conversion(self):
        """Test NotFound exception conversion."""
        exc = NotFound("Resource not found")
        response = Mock(status_code=404)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 404
        assert result.type == "https://docs.yourapp.com/problems/not-found"
        assert result.code == APIResponseCodes.GEN_NOTFOUND_404.value

    def test_method_not_allowed_conversion(self):
        """Test MethodNotAllowed exception conversion."""
        exc = MethodNotAllowed("POST")
        exc.method = "POST"
        exc.allowed_methods = ["GET", "PUT"]
        response = Mock(status_code=405)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 405
        assert result.type == "https://docs.yourapp.com/problems/method-not-allowed"
        assert "POST method is not allowed" in str(result.detail)
        assert result.meta["allowed_methods"] == ["GET", "PUT"]

    def test_parse_error_conversion(self):
        """Test ParseError exception conversion."""
        exc = ParseError("Invalid JSON")
        response = Mock(status_code=400)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 400
        assert result.type == "https://docs.yourapp.com/problems/parse-error"
        assert result.title == "Parse Error"
        assert result.code == APIResponseCodes.GEN_BAD_400.value

    def test_unsupported_media_type_conversion(self):
        """Test UnsupportedMediaType exception conversion."""
        exc = UnsupportedMediaType("application/xml")
        response = Mock(status_code=415)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 415
        assert result.type == "https://docs.yourapp.com/problems/unsupported-media-type"
        assert result.title == "Unsupported Media Type"

    def test_throttled_conversion(self):
        """Test Throttled exception conversion."""
        exc = Throttled()
        exc.wait = 60  # 60 seconds retry after
        response = Mock(status_code=429)
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 429
        assert result.type == "https://docs.yourapp.com/problems/rate-limit-exceeded"
        assert result.code == APIResponseCodes.GEN_RATE_429.value
        assert result.meta["retry_after"] == 60

    def test_generic_drf_exception_conversion(self):
        """Test generic DRF exception conversion."""
        class CustomDRFException(Exception):
            pass
        
        exc = CustomDRFException("Custom error")
        response = Mock(status_code=422)
        response.data = {'detail': 'Custom error message'}
        
        result = _convert_drf_exception_to_rfc7807(exc, response)
        
        assert result.status_code == 422
        assert result.type == "https://docs.yourapp.com/problems/http-422"
        assert result.title == "Custom error message"
        assert f"{APIResponseCodes.PROJECT_PREFIX}-GEN-ERR-422" in result.code


@pytest.mark.exception_handling
class TestValidationErrorFlattening:
    """Test validation error flattening functionality."""

    def test_flatten_simple_validation_errors(self):
        """Test flattening simple validation errors."""
        detail = {
            'email': ['This field is required.'],
            'password': ['This field must be at least 8 characters long.']
        }
        
        issues = flatten_validation_errors(detail)
        
        assert len(issues) == 2  # email (1) + password (1)
        
        email_issues = [i for i in issues if i['path'] == ['email']]
        assert len(email_issues) == 1
        assert email_issues[0]['message'] == 'This field is required.'
        assert email_issues[0]['i18n_key'] == 'validation.error'
        
        password_issues = [i for i in issues if i['path'] == ['password']]
        assert len(password_issues) == 1
        assert password_issues[0]['message'] == 'This field must be at least 8 characters long.'

    def test_flatten_nested_validation_errors(self):
        """Test flattening nested validation errors."""
        detail = {
            'user': {
                'profile': {
                    'age': ['Must be at least 18.'],
                    'city': ['This field is required.']
                },
                'email': ['Invalid email format.']
            }
        }
        
        issues = flatten_validation_errors(detail)
        
        assert len(issues) == 3
        
        # Check nested paths are preserved
        age_issue = next(i for i in issues if i['path'] == ['user', 'profile', 'age'])
        assert age_issue['message'] == 'Must be at least 18.'
        
        email_issue = next(i for i in issues if i['path'] == ['user', 'email'])
        assert email_issue['message'] == 'Invalid email format.'

    def test_flatten_list_validation_errors(self):
        """Test flattening validation errors in lists."""
        detail = {
            'items': [
                {'name': ['This field is required.']},
                {'price': ['Must be a positive number.']},
            ]
        }
        
        issues = flatten_validation_errors(detail)
        
        assert len(issues) == 2
        
        # Check array indices are preserved in paths
        name_issue = next(i for i in issues if i['path'] == ['items', 0, 'name'])
        assert name_issue['message'] == 'This field is required.'
        
        price_issue = next(i for i in issues if i['path'] == ['items', 1, 'price'])
        assert price_issue['message'] == 'Must be a positive number.'

    def test_flatten_mixed_validation_errors(self):
        """Test flattening mixed validation errors (string and list)."""
        detail = {
            'field1': 'Single error message',
            'field2': ['First error', 'Second error'],
            'nested': {
                'field3': 'Nested error'
            }
        }
        
        issues = flatten_validation_errors(detail)
        
        assert len(issues) == 4  # 1 + 2 + 1
        
        # Single string error
        field1_issue = next(i for i in issues if i['path'] == ['field1'])
        assert field1_issue['message'] == 'Single error message'
        
        # Multiple errors for same field
        field2_issues = [i for i in issues if i['path'][0] == 'field2']
        assert len(field2_issues) == 2

    def test_flatten_with_prefix_path(self):
        """Test flattening with prefix path."""
        detail = {
            'email': ['Invalid email'],
            'nested': {'field': ['Error']}
        }
        
        issues = flatten_validation_errors(detail, path_prefix=['form', 'data'])
        
        assert len(issues) == 2
        
        email_issue = next(i for i in issues if 'email' in i['path'])
        assert email_issue['path'] == ['form', 'data', 'email']
        
        nested_issue = next(i for i in issues if 'field' in i['path'])
        assert nested_issue['path'] == ['form', 'data', 'nested', 'field']

    def test_flatten_empty_validation_errors(self):
        """Test flattening empty validation errors."""
        issues = flatten_validation_errors({})
        assert issues == []
        
        issues = flatten_validation_errors(None)
        assert issues == []

    def test_flatten_complex_real_world_errors(self):
        """Test flattening complex real-world validation errors."""
        detail = {
            'user': {
                'email': ['This field is required.', 'Invalid email format.'],
                'password': ['Password too short.'],
                'profile': {
                    'preferences': [
                        {'notification_type': ['Invalid choice.']},
                        {'frequency': ['This field is required.']}
                    ]
                }
            },
            'organization': ['Organization name already exists.'],
            'non_field_errors': ['User registration temporarily disabled.']
        }
        
        issues = flatten_validation_errors(detail)
        
        # Should have proper count
        assert len(issues) >= 6
        
        # Check email multiple errors
        email_issues = [i for i in issues if i['path'] == ['user', 'email']]
        assert len(email_issues) == 2
        
        # Check deeply nested array errors
        pref_issues = [i for i in issues if len(i['path']) >= 4 and 'preferences' in str(i['path'])]
        assert len(pref_issues) == 2
        
        # Check non-field errors have expected path
        non_field_issues = [i for i in issues if i['path'] == ['non_field_errors']]
        assert len(non_field_issues) == 1