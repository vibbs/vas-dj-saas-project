"""
Schema postprocessing hooks for drf-spectacular to show consistent data wrapping 
and common error responses in Swagger.
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
                    schema = content["schema"]

                    # Wrap schema if needed
                    if should_wrap_in_data(schema):
                        content["schema"] = {
                            "type": "object",
                            "properties": {"data": schema},
                            "required": ["data"],
                        }

    return result


def add_common_error_responses(result, generator, request, public):
    """
    Post-process the OpenAPI schema to add common error responses (400, 401, 403, 500)
    to all API endpoints automatically.
    """
    if not isinstance(result, dict) or "paths" not in result:
        return result

    # Define common error response schemas
    common_error_responses = {
        "400": {
            "description": "Bad Request",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "string",
                                "description": "Human-readable error message"
                            },
                            "code": {
                                "type": "string",
                                "description": "Machine-readable error code"
                            },
                            "statusCode": {
                                "type": "integer",
                                "description": "HTTP status code",
                                "example": 400
                            }
                        },
                        "required": ["error", "code", "statusCode"]
                    },
                    "examples": {
                        "bad_request": {
                            "summary": "Bad Request",
                            "value": {
                                "error": "Invalid request data",
                                "code": "bad_request",
                                "statusCode": 400
                            }
                        },
                        "missing_field": {
                            "summary": "Missing Required Field",
                            "value": {
                                "error": "Required field is missing",
                                "code": "missing_required_field",
                                "statusCode": 400,
                                "missingFields": ["email"]
                            }
                        },
                        "validation_error": {
                            "summary": "Validation Error",
                            "value": {
                                "error": "The request contains invalid data",
                                "code": "validation_error",
                                "statusCode": 422,
                                "fieldErrors": {
                                    "email": ["This field is required."]
                                }
                            }
                        }
                    }
                }
            }
        },
        "401": {
            "description": "Unauthorized",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "string",
                                "description": "Human-readable error message"
                            },
                            "code": {
                                "type": "string",
                                "description": "Machine-readable error code"
                            },
                            "statusCode": {
                                "type": "integer",
                                "description": "HTTP status code",
                                "example": 401
                            }
                        },
                        "required": ["error", "code", "statusCode"]
                    },
                    "examples": {
                        "unauthorized": {
                            "summary": "Authentication Required",
                            "value": {
                                "error": "Authentication credentials were not provided or are invalid",
                                "code": "unauthorized",
                                "statusCode": 401
                            }
                        },
                        "invalid_credentials": {
                            "summary": "Invalid Credentials",
                            "value": {
                                "error": "Invalid email or password",
                                "code": "invalid_credentials",
                                "statusCode": 401
                            }
                        },
                        "token_expired": {
                            "summary": "Token Expired",
                            "value": {
                                "error": "Token has expired",
                                "code": "token_expired",
                                "statusCode": 401
                            }
                        }
                    }
                }
            }
        },
        "403": {
            "description": "Forbidden",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "string",
                                "description": "Human-readable error message"
                            },
                            "code": {
                                "type": "string",
                                "description": "Machine-readable error code"
                            },
                            "statusCode": {
                                "type": "integer",
                                "description": "HTTP status code",
                                "example": 403
                            }
                        },
                        "required": ["error", "code", "statusCode"]
                    },
                    "examples": {
                        "forbidden": {
                            "summary": "Insufficient Permissions",
                            "value": {
                                "error": "You do not have permission to perform this action",
                                "code": "forbidden",
                                "statusCode": 403
                            }
                        },
                        "organization_access_denied": {
                            "summary": "Organization Access Denied",
                            "value": {
                                "error": "You do not have access to this organization",
                                "code": "organization_access_denied",
                                "statusCode": 403
                            }
                        }
                    }
                }
            }
        },
        "500": {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "string",
                                "description": "Human-readable error message"
                            },
                            "code": {
                                "type": "string",
                                "description": "Machine-readable error code"
                            },
                            "statusCode": {
                                "type": "integer",
                                "description": "HTTP status code",
                                "example": 500
                            }
                        },
                        "required": ["error", "code", "statusCode"]
                    },
                    "examples": {
                        "internal_error": {
                            "summary": "Internal Server Error",
                            "value": {
                                "error": "An internal server error occurred",
                                "code": "internal_server_error",
                                "statusCode": 500
                            }
                        }
                    }
                }
            }
        }
    }

    # Endpoints that should be excluded from automatic error responses
    excluded_paths = [
        "/api/docs/",
        "/api/redoc/",
        "/api/schema/",
    ]

    # Process all API endpoints
    for path, path_item in result.get("paths", {}).items():
        # Skip excluded paths
        if any(path.startswith(excluded_path) for excluded_path in excluded_paths):
            continue
        
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if not isinstance(operation, dict) or "responses" not in operation:
                continue

            # Skip public endpoints (no auth required) for 401/403 errors
            is_public_endpoint = (
                path.startswith("/api/v1/auth/") and 
                method.lower() in ["post"] and
                any(keyword in path for keyword in ["login", "register", "refresh"])
            )

            # Add common error responses
            responses = operation["responses"]
            
            # Always add 400 and 500
            if "400" not in responses:
                responses["400"] = common_error_responses["400"]
            if "500" not in responses:
                responses["500"] = common_error_responses["500"]
            
            # Add 401 and 403 for non-public endpoints
            if not is_public_endpoint:
                if "401" not in responses:
                    responses["401"] = common_error_responses["401"]
                if "403" not in responses:
                    responses["403"] = common_error_responses["403"]

    return result
