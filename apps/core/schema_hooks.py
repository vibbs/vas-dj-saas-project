"""
Schema postprocessing hooks for drf-spectacular to show consistent data wrapping in Swagger.
"""


def wrap_responses_in_data(result, generator, request, public):
    """
    Post-process the OpenAPI schema to wrap non-paginated responses in a data key
    for consistency with the actual API responses.

    This hook runs BEFORE camelCase conversion to ensure proper detection.
    """
    if not isinstance(result, dict) or "paths" not in result:
        return result

    def should_wrap_in_data(schema):
        """
        Determine if a response schema should be wrapped in data key.
        Example Schema:
        {'$ref': '#/components/schemas/Account'}
        OR
        {'$ref': '#/components/schemas/PaginatedAccountList'}
        OR
        {'type': 'object', 'properties': {...}, 'required': ...}}

        Except for paginated responses, all other schemas should be wrapped.
        """
        if not isinstance(schema, dict):
            return False

        # Check if schema is a reference to another schema
        if "$ref" in schema:
            ref = schema["$ref"]
            if ref.startswith("#/components/schemas/Paginated"):
                return False

        return True

    # Process all API endpoints
    for path, path_item in result.get("paths", {}).items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if not isinstance(operation, dict) or "responses" not in operation:
                continue

            # Process each response
            for status_code, response in operation["responses"].items():
                # Only modify successful responses (2xx)
                if not status_code.startswith("2") or "content" not in response:
                    continue

                # Process each content type
                for content_type, content in response["content"].items():
                    if "schema" not in content:
                        continue

                    print("Checking if schema should be wrapped in data...")
                    print(content_type)
                    schema = content["schema"]
                    print(schema)

                    # Wrap schema if needed
                    if should_wrap_in_data(schema):
                        content["schema"] = {
                            "type": "object",
                            "properties": {"data": schema},
                            "required": ["data"],
                        }

    return result
