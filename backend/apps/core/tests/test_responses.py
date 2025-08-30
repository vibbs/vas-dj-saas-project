"""
Comprehensive tests for RFC-compliant success response helpers.

Tests the utility functions for creating standardized success responses
that match the RFC 7807 specification for success envelopes.
"""

import pytest
from rest_framework.response import Response

from apps.core.responses import (
    success_response, ok, created, accepted, no_content
)
from apps.core.codes import APIResponseCodes


@pytest.mark.django_db
@pytest.mark.responses
class TestSuccessResponseHelper:
    """Test the core success_response helper function."""

    def test_success_response_basic_structure(self):
        """Test basic success response structure."""
        response = success_response(
            data={'message': 'Hello World'},
            code='VDJ-TEST-SUCCESS-200',
            i18n_key='test.success'
        )
        
        assert isinstance(response, Response)
        assert response.status_code == 200
        
        data = response.data
        assert data['status'] == 200
        assert data['code'] == 'VDJ-TEST-SUCCESS-200'
        assert data['i18n_key'] == 'test.success'
        assert data['data'] == {'message': 'Hello World'}

    def test_success_response_with_enum_code(self):
        """Test success response with APIResponseCodes enum."""
        response = success_response(
            data={'result': 'success'},
            code=APIResponseCodes.GEN_OK_200,
            i18n_key='general.ok'
        )
        
        assert response.data['code'] == APIResponseCodes.GEN_OK_200.value
        assert response.data['i18n_key'] == 'general.ok'

    def test_success_response_with_string_code(self):
        """Test success response with string code."""
        response = success_response(
            data={'result': 'success'},
            code='VDJ-CUSTOM-SUCCESS-200',
            i18n_key='custom.success'
        )
        
        assert response.data['code'] == 'VDJ-CUSTOM-SUCCESS-200'
        assert response.data['i18n_key'] == 'custom.success'

    def test_success_response_custom_status(self):
        """Test success response with custom status code."""
        response = success_response(
            data={'created': True},
            code='VDJ-CREATED-201',
            i18n_key='resource.created',
            status=201
        )
        
        assert response.status_code == 201
        assert response.data['status'] == 201

    def test_success_response_with_extra_fields(self):
        """Test success response with additional fields."""
        extra_fields = {
            'timestamp': '2023-01-01T00:00:00Z',
            'request_id': 'req_12345',
            'metadata': {
                'version': '1.0',
                'environment': 'test'
            }
        }
        
        response = success_response(
            data={'message': 'Success'},
            code='VDJ-SUCCESS-200',
            i18n_key='test.success',
            extra=extra_fields
        )
        
        data = response.data
        assert data['timestamp'] == '2023-01-01T00:00:00Z'
        assert data['request_id'] == 'req_12345'
        assert data['metadata']['version'] == '1.0'
        assert data['metadata']['environment'] == 'test'
        
        # Standard fields should still be present
        assert data['status'] == 200
        assert data['code'] == 'VDJ-SUCCESS-200'
        assert data['data'] == {'message': 'Success'}

    def test_success_response_with_none_data(self):
        """Test success response with None data."""
        response = success_response(
            data=None,
            code='VDJ-EMPTY-200',
            i18n_key='empty.response'
        )
        
        assert response.data['data'] is None
        assert response.data['status'] == 200

    def test_success_response_with_empty_data_structures(self):
        """Test success response with various empty data structures."""
        empty_data_cases = [
            {},
            [],
            '',
            False,
            0
        ]
        
        for empty_data in empty_data_cases:
            response = success_response(
                data=empty_data,
                code='VDJ-EMPTY-200',
                i18n_key='empty.response'
            )
            
            assert response.data['data'] == empty_data
            assert response.data['status'] == 200

    def test_success_response_with_complex_data(self):
        """Test success response with complex nested data."""
        complex_data = {
            'users': [
                {
                    'id': 1,
                    'name': 'John Doe',
                    'profile': {
                        'email': 'john@example.com',
                        'preferences': {
                            'notifications': True,
                            'theme': 'dark'
                        }
                    }
                },
                {
                    'id': 2,
                    'name': 'Jane Smith',
                    'profile': {
                        'email': 'jane@example.com',
                        'preferences': {
                            'notifications': False,
                            'theme': 'light'
                        }
                    }
                }
            ],
            'pagination': {
                'total': 2,
                'page': 1,
                'per_page': 10
            }
        }
        
        response = success_response(
            data=complex_data,
            code='VDJ-USERS-LIST-200',
            i18n_key='users.list'
        )
        
        assert response.data['data'] == complex_data
        assert len(response.data['data']['users']) == 2

    def test_success_response_extra_fields_override_standard(self):
        """Test that extra fields can override standard fields."""
        response = success_response(
            data={'message': 'test'},
            code='VDJ-TEST-200',
            i18n_key='test.success',
            extra={
                'status': 299,  # Try to override
                'code': 'VDJ-OVERRIDE-299',  # Try to override
                'custom_field': 'custom_value'
            }
        )
        
        data = response.data
        # Extra fields should override standard fields
        assert data['status'] == 299
        assert data['code'] == 'VDJ-OVERRIDE-299'
        assert data['custom_field'] == 'custom_value'
        
        # i18n_key should remain from parameters (not overridden)
        assert data['i18n_key'] == 'test.success'

    def test_success_response_extra_none(self):
        """Test success response with None extra fields."""
        response = success_response(
            data={'message': 'test'},
            code='VDJ-TEST-200',
            i18n_key='test.success',
            extra=None
        )
        
        data = response.data
        assert 'status' in data
        assert 'code' in data
        assert 'i18n_key' in data
        assert 'data' in data
        assert len(data) == 4  # Only standard fields


@pytest.mark.django_db
@pytest.mark.responses
class TestOkResponseHelper:
    """Test the ok() response helper function."""

    def test_ok_default_parameters(self):
        """Test ok response with default parameters."""
        response = ok()
        
        assert isinstance(response, Response)
        assert response.status_code == 200
        
        data = response.data
        assert data['status'] == 200
        assert data['code'] == APIResponseCodes.GEN_OK_200.value
        assert data['i18n_key'] == 'common.ok'
        assert data['data'] is None

    def test_ok_with_data(self):
        """Test ok response with data."""
        test_data = {'message': 'Operation successful'}
        response = ok(data=test_data)
        
        assert response.data['data'] == test_data
        assert response.data['status'] == 200

    def test_ok_with_custom_code(self):
        """Test ok response with custom code."""
        response = ok(
            data={'result': 'success'},
            code='VDJ-CUSTOM-OK-200'
        )
        
        assert response.data['code'] == 'VDJ-CUSTOM-OK-200'
        assert response.data['i18n_key'] == 'common.ok'  # Default i18n_key

    def test_ok_with_custom_i18n_key(self):
        """Test ok response with custom i18n key."""
        response = ok(
            data={'result': 'success'},
            i18n_key='custom.success'
        )
        
        assert response.data['code'] == APIResponseCodes.GEN_OK_200.value
        assert response.data['i18n_key'] == 'custom.success'

    def test_ok_with_enum_code(self):
        """Test ok response with enum code."""
        response = ok(
            data={'result': 'listed'},
            code=APIResponseCodes.GEN_LIST_200,
            i18n_key='list.success'
        )
        
        assert response.data['code'] == APIResponseCodes.GEN_LIST_200.value
        assert response.data['i18n_key'] == 'list.success'

    def test_ok_with_all_parameters(self):
        """Test ok response with all parameters specified."""
        test_data = {'items': [1, 2, 3], 'count': 3}
        response = ok(
            data=test_data,
            code='VDJ-ITEMS-LIST-200',
            i18n_key='items.listed'
        )
        
        data = response.data
        assert data['status'] == 200
        assert data['code'] == 'VDJ-ITEMS-LIST-200'
        assert data['i18n_key'] == 'items.listed'
        assert data['data'] == test_data


@pytest.mark.django_db
@pytest.mark.responses
class TestCreatedResponseHelper:
    """Test the created() response helper function."""

    def test_created_default_parameters(self):
        """Test created response with default parameters."""
        response = created()
        
        assert isinstance(response, Response)
        assert response.status_code == 201
        
        data = response.data
        assert data['status'] == 201
        assert data['code'] == APIResponseCodes.GEN_CREATED_201.value
        assert data['i18n_key'] == 'common.created'
        assert data['data'] is None

    def test_created_with_data(self):
        """Test created response with created resource data."""
        created_resource = {
            'id': 123,
            'name': 'New Resource',
            'created_at': '2023-01-01T00:00:00Z'
        }
        
        response = created(data=created_resource)
        
        assert response.status_code == 201
        assert response.data['data'] == created_resource
        assert response.data['status'] == 201

    def test_created_with_custom_code(self):
        """Test created response with custom code."""
        response = created(
            data={'id': 456},
            code='VDJ-USER-CREATED-201'
        )
        
        assert response.data['code'] == 'VDJ-USER-CREATED-201'
        assert response.data['i18n_key'] == 'common.created'

    def test_created_with_custom_i18n_key(self):
        """Test created response with custom i18n key."""
        response = created(
            data={'id': 789},
            i18n_key='user.created'
        )
        
        assert response.data['i18n_key'] == 'user.created'
        assert response.data['code'] == APIResponseCodes.GEN_CREATED_201.value

    def test_created_with_enum_code(self):
        """Test created response with enum code."""
        response = created(
            data={'user': {'id': 1, 'name': 'John'}},
            code=APIResponseCodes.AUTH_REGISTER_201,
            i18n_key='auth.registered'
        )
        
        assert response.data['code'] == APIResponseCodes.AUTH_REGISTER_201.value
        assert response.data['i18n_key'] == 'auth.registered'


@pytest.mark.django_db
@pytest.mark.responses
class TestAcceptedResponseHelper:
    """Test the accepted() response helper function."""

    def test_accepted_basic_structure(self):
        """Test accepted response basic structure."""
        response = accepted(
            code='VDJ-TASK-ACCEPTED-202',
            data={'task_id': 'task_12345'}
        )
        
        assert isinstance(response, Response)
        assert response.status_code == 202
        
        data = response.data
        assert data['status'] == 202
        assert data['code'] == 'VDJ-TASK-ACCEPTED-202'
        assert data['i18n_key'] == 'common.accepted'
        assert data['data'] == {'task_id': 'task_12345'}

    def test_accepted_with_custom_i18n_key(self):
        """Test accepted response with custom i18n key."""
        response = accepted(
            code='VDJ-ASYNC-ACCEPTED-202',
            data={'job_id': 'job_67890'},
            i18n_key='async.job.accepted'
        )
        
        assert response.data['i18n_key'] == 'async.job.accepted'
        assert response.data['status'] == 202

    def test_accepted_enum_code(self):
        """Test accepted response with enum code."""
        # Using a generic code since there's no specific ACCEPTED code in enum
        response = accepted(
            code=APIResponseCodes.GEN_OK_200,  # Using available enum
            data={'message': 'Request accepted'},
            i18n_key='request.accepted'
        )
        
        assert response.data['code'] == APIResponseCodes.GEN_OK_200.value
        assert response.data['status'] == 202  # Should still be 202 status

    def test_accepted_with_processing_info(self):
        """Test accepted response with processing information."""
        processing_data = {
            'task_id': 'task_abc123',
            'estimated_completion': '2023-01-01T01:00:00Z',
            'status_url': '/api/tasks/task_abc123/status'
        }
        
        response = accepted(
            code='VDJ-BATCH-ACCEPTED-202',
            data=processing_data,
            i18n_key='batch.processing.started'
        )
        
        assert response.data['data'] == processing_data
        assert response.status_code == 202


@pytest.mark.django_db
@pytest.mark.responses
class TestNoContentResponseHelper:
    """Test the no_content() response helper function."""

    def test_no_content_basic_structure(self):
        """Test no content response basic structure."""
        response = no_content(
            code='VDJ-DELETED-204',
            i18n_key='resource.deleted'
        )
        
        assert isinstance(response, Response)
        assert response.status_code == 204
        
        data = response.data
        assert data['status'] == 204
        assert data['code'] == 'VDJ-DELETED-204'
        assert data['i18n_key'] == 'resource.deleted'
        assert 'data' not in data  # No data field for 204

    def test_no_content_default_i18n_key(self):
        """Test no content response with default i18n key."""
        response = no_content(code='VDJ-UPDATED-204')
        
        assert response.data['i18n_key'] == 'common.no_content'
        assert response.data['status'] == 204

    def test_no_content_with_enum_code(self):
        """Test no content response with enum code."""
        # Using available enum code
        response = no_content(
            code=APIResponseCodes.GEN_OK_200,  # Using available enum
            i18n_key='operation.completed'
        )
        
        assert response.data['code'] == APIResponseCodes.GEN_OK_200.value
        assert response.data['status'] == 204  # Should still be 204 status

    def test_no_content_minimal_response(self):
        """Test no content response has minimal fields."""
        response = no_content(code='VDJ-MINIMAL-204')
        
        data = response.data
        expected_fields = {'status', 'code', 'i18n_key'}
        actual_fields = set(data.keys())
        
        assert actual_fields == expected_fields
        assert len(data) == 3  # Only 3 fields


@pytest.mark.responses
class TestResponseHelpersEdgeCases:
    """Test edge cases and error handling in response helpers."""

    def test_response_helpers_with_none_values(self):
        """Test response helpers handle None values gracefully."""
        # Test with None data
        response = ok(data=None)
        assert response.data['data'] is None
        
        response = created(data=None)
        assert response.data['data'] is None
        
        response = accepted(code='VDJ-TEST-202', data=None)
        assert response.data['data'] is None

    def test_response_helpers_with_empty_strings(self):
        """Test response helpers with empty string values."""
        response = ok(
            data={'message': ''},
            code='',  # Empty code
            i18n_key=''  # Empty i18n key
        )
        
        assert response.data['data']['message'] == ''
        assert response.data['code'] == ''
        assert response.data['i18n_key'] == ''

    def test_response_helpers_parameter_validation(self):
        """Test response helpers with various parameter types."""
        # Test with different data types for data
        test_data_types = [
            {'dict': 'value'},
            ['list', 'values'],
            'string_value',
            123,
            True,
            False,
            None
        ]
        
        for test_data in test_data_types:
            response = ok(
                data=test_data,
                code='VDJ-TEST-200',
                i18n_key='test.response'
            )
            
            assert response.data['data'] == test_data
            assert response.status_code == 200

    def test_success_response_code_type_handling(self):
        """Test success_response handles different code types correctly."""
        # Test with string
        response = success_response(
            data={},
            code='VDJ-STRING-200',
            i18n_key='test'
        )
        assert response.data['code'] == 'VDJ-STRING-200'
        
        # Test with enum that has .value attribute
        mock_enum = type('MockEnum', (), {'value': 'VDJ-ENUM-200'})()
        response = success_response(
            data={},
            code=mock_enum,
            i18n_key='test'
        )
        assert response.data['code'] == 'VDJ-ENUM-200'
        
        # Test with object that doesn't have .value (should use str())
        class CustomCode:
            def __str__(self):
                return 'VDJ-CUSTOM-200'
        
        response = success_response(
            data={},
            code=CustomCode(),
            i18n_key='test'
        )
        assert response.data['code'] == 'VDJ-CUSTOM-200'

    def test_response_helpers_inheritance_and_structure(self):
        """Test that response helpers return proper Response objects."""
        # Test helpers that accept data
        helpers_with_data = [
            (ok, 200),
            (created, 201),
            (lambda **kwargs: accepted(code='VDJ-TEST-202', **kwargs), 202),
        ]
        
        for helper_func, expected_status in helpers_with_data:
            response = helper_func(data={'test': 'data'})
            
            assert isinstance(response, Response)
            assert response.status_code == expected_status
            assert isinstance(response.data, dict)
            assert 'status' in response.data
            assert 'code' in response.data
            assert 'i18n_key' in response.data
        
        # Test no_content separately since it doesn't accept data
        response = no_content(code='VDJ-TEST-204')
        assert isinstance(response, Response)
        assert response.status_code == 204
        assert isinstance(response.data, dict)

    def test_large_data_handling(self):
        """Test response helpers with large data structures."""
        # Create large data structure
        large_data = {
            'items': [{'id': i, 'data': f'item_{i}' * 100} for i in range(1000)],
            'metadata': {
                'total': 1000,
                'processing_info': {
                    'stage': 'complete',
                    'details': 'x' * 10000  # Large string
                }
            }
        }
        
        response = ok(
            data=large_data,
            code='VDJ-LARGE-DATA-200',
            i18n_key='large.data.success'
        )
        
        assert response.data['data'] == large_data
        assert len(response.data['data']['items']) == 1000
        assert response.status_code == 200