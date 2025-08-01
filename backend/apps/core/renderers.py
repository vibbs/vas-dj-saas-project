"""
Custom renderers for consistent API response formatting.
"""

from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from rest_framework.renderers import JSONRenderer


class ConsistentDataRenderer(CamelCaseJSONRenderer):
    """
    Custom renderer that wraps non-paginated responses in a 'data' key
    while preserving camel case conversion.
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Render the response data with consistent formatting.
        """
        if data is not None:
            # Check if this is already a paginated response (has 'pagination' key)
            if isinstance(data, dict) and "pagination" in data:
                # Already paginated, don't wrap again
                response_data = data
            elif isinstance(data, dict) and ("detail" in data or "error" in data):
                # Error responses, don't wrap
                response_data = data
            else:
                # Wrap in data key for consistency
                response_data = {"data": data}
        else:
            response_data = {"data": None}

        return super().render(response_data, accepted_media_type, renderer_context)


class ConsistentDataJSONRenderer(JSONRenderer):
    """
    Fallback JSON renderer with consistent data wrapping (without camel case).
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Render the response data with consistent formatting.
        """
        if data is not None:
            # Check if this is already a paginated response (has 'pagination' key)
            if isinstance(data, dict) and "pagination" in data:
                # Already paginated, don't wrap again
                response_data = data
            elif isinstance(data, dict) and ("detail" in data or "error" in data):
                # Error responses, don't wrap
                response_data = data
            else:
                # Wrap in data key for consistency
                response_data = {"data": data}
        else:
            response_data = {"data": None}

        return super().render(response_data, accepted_media_type, renderer_context)
