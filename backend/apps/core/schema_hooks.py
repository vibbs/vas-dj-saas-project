"""
RFC 7807 compliant schema postprocessing hooks for drf-spectacular.

These hooks update the OpenAPI schema to reflect the actual RFC 7807 response
formats used by the API, ensuring Swagger documentation is accurate.
"""


def wrap_responses_in_success_envelope(result, generator, request, public):
    """
    Post-process the OpenAPI schema to wrap success responses in SuccessEnvelope format.
    
    This hook converts standard DRF responses to the RFC 7807 compliant success format:
    {
        "status": 200,
        "code": "VDJ-GEN-OK-200",
        "i18n_key": "common.ok", 
        "data": {...}
    }
    """
    if not isinstance(result, dict) or "paths" not in result:
        return result

    def should_wrap_in_success_envelope(schema):
        """Determine if a response schema should be wrapped in SuccessEnvelope."""
        if not isinstance(schema, dict):
            return False

        # Don't wrap if it's already a reference to paginated response
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

                    # Wrap in SuccessEnvelope if needed
                    if should_wrap_in_success_envelope(schema):
                        # Determine if this is a list response
                        is_list_response = (
                            schema.get("type") == "array" or
                            (schema.get("type") == "object" and 
                             "properties" in schema and
                             "results" in schema["properties"])
                        )
                        
                        if is_list_response:
                            # Use PaginatedEnvelope for list responses
                            content["schema"] = {
                                "$ref": "#/components/schemas/PaginatedEnvelope"
                            }
                        else:
                            # Use SuccessEnvelope for single resource responses
                            content["schema"] = {
                                "allOf": [
                                    {"$ref": "#/components/schemas/SuccessEnvelope"},
                                    {
                                        "type": "object",
                                        "properties": {
                                            "data": schema
                                        }
                                    }
                                ]
                            }

    return result


def add_rfc7807_error_responses(result, generator, request, public):
    """
    Post-process the OpenAPI schema to add RFC 7807 compliant error responses.
    
    This replaces the old error format with proper Problem Details schema.
    """
    if not isinstance(result, dict) or "paths" not in result:
        return result

    # Define RFC 7807 Problem Details error responses
    rfc7807_error_responses = {
        "400": {
            "description": "Bad Request",
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "validation_error": {
                            "summary": "Validation Failed",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/validation",
                                "title": "Validation failed",
                                "status": 400,
                                "code": "VDJ-GEN-VAL-422",
                                "i18n_key": "validation.failed",
                                "detail": "The request contains invalid data.",
                                "instance": "/api/v1/accounts/register/",
                                "issues": [
                                    {
                                        "path": ["email"],
                                        "message": "This field is required.",
                                        "i18n_key": "validation.required"
                                    }
                                ]
                            }
                        },
                        "bad_request": {
                            "summary": "Bad Request",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/parse-error",
                                "title": "Parse Error",
                                "status": 400,
                                "code": "VDJ-GEN-BAD-400",
                                "i18n_key": "errors.parse_error",
                                "detail": "Malformed request data.",
                                "instance": "/api/v1/endpoint/"
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
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "authentication_required": {
                            "summary": "Authentication Required",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/authentication-required",
                                "title": "Authentication Required",
                                "status": 401,
                                "code": "VDJ-AUTH-LOGIN-401",
                                "i18n_key": "errors.authentication_required",
                                "detail": "Authentication credentials were not provided or are invalid.",
                                "instance": "/api/v1/organizations/"
                            }
                        },
                        "invalid_credentials": {
                            "summary": "Invalid Credentials",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/invalid-credentials",
                                "title": "Invalid credentials",
                                "status": 401,
                                "code": "VDJ-ACC-CREDS-401",
                                "i18n_key": "account.invalid_credentials",
                                "detail": "The email or password provided is incorrect.",
                                "instance": "/api/v1/auth/login/"
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
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "permission_denied": {
                            "summary": "Permission Denied",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/permission-denied",
                                "title": "Permission Denied",
                                "status": 403,
                                "code": "VDJ-PERM-DENIED-403",
                                "i18n_key": "errors.permission_denied",
                                "detail": "You do not have permission to perform this action.",
                                "instance": "/api/v1/organizations/"
                            }
                        },
                        "organization_access_denied": {
                            "summary": "Organization Access Denied",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/org-access-denied",
                                "title": "Organization access denied",
                                "status": 403,
                                "code": "VDJ-ORG-ACCESS-403",
                                "i18n_key": "org.access_denied",
                                "detail": "You do not have access to this organization.",
                                "instance": "/api/v1/organizations/acme/"
                            }
                        }
                    }
                }
            }
        },
        "404": {
            "description": "Not Found",
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "not_found": {
                            "summary": "Resource Not Found",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/not-found",
                                "title": "Not Found",
                                "status": 404,
                                "code": "VDJ-GEN-NOTFOUND-404",
                                "i18n_key": "errors.not_found",
                                "detail": "The requested resource was not found.",
                                "instance": "/api/v1/accounts/users/123/"
                            }
                        }
                    }
                }
            }
        },
        "409": {
            "description": "Conflict",
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "conflict": {
                            "summary": "Resource Conflict",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/account-already-exists",
                                "title": "Account already exists",
                                "status": 409,
                                "code": "VDJ-ACC-EXISTS-409",
                                "i18n_key": "account.already_exists",
                                "detail": "An account with this email address already exists.",
                                "instance": "/api/v1/accounts/register/"
                            }
                        }
                    }
                }
            }
        },
        "422": {
            "description": "Unprocessable Entity",
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "validation_error": {
                            "summary": "Validation Error",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/validation",
                                "title": "Validation failed",
                                "status": 422,
                                "code": "VDJ-GEN-VAL-422",
                                "i18n_key": "validation.failed",
                                "detail": "The request contains invalid data.",
                                "instance": "/api/v1/accounts/register/",
                                "issues": [
                                    {
                                        "path": ["email"],
                                        "message": "Enter a valid email address.",
                                        "i18n_key": "validation.email"
                                    },
                                    {
                                        "path": ["password"],
                                        "message": "Password must be at least 8 characters long.",
                                        "i18n_key": "validation.min_length"
                                    }
                                ]
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
                    "schema": {"$ref": "#/components/schemas/Problem"},
                    "examples": {
                        "internal_error": {
                            "summary": "Internal Server Error",
                            "value": {
                                "type": "https://docs.yourapp.com/problems/internal",
                                "title": "Internal Server Error",
                                "status": 500,
                                "code": "VDJ-GEN-ERR-500",
                                "i18n_key": "errors.internal",
                                "detail": "An unexpected server error occurred.",
                                "instance": "/api/v1/endpoint/"
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

            # Add RFC 7807 error responses
            responses = operation["responses"]
            
            # Always add common error responses
            for status, error_response in rfc7807_error_responses.items():
                # Skip 401/403 for public endpoints
                if is_public_endpoint and status in ["401", "403"]:
                    continue
                    
                if status not in responses:
                    responses[status] = error_response

    return result


def add_schema_components(result, generator, request, public):
    """
    Add RFC 7807 schema components to the OpenAPI specification.
    
    This ensures the Problem, SuccessEnvelope, and other schemas are available
    for reference throughout the API documentation.
    """
    if not isinstance(result, dict):
        return result

    # Ensure components section exists
    if "components" not in result:
        result["components"] = {}
    if "schemas" not in result["components"]:
        result["components"]["schemas"] = {}

    # Add RFC 7807 schema components
    result["components"]["schemas"].update({
        "Problem": {
            "type": "object",
            "title": "RFC 7807 Problem Details",
            "description": "Standard error response format following RFC 7807",
            "required": ["type", "title", "status", "code", "i18n_key"],
            "properties": {
                "type": {
                    "type": "string",
                    "format": "uri",
                    "description": "A URI reference that identifies the problem type",
                    "example": "https://docs.yourapp.com/problems/validation"
                },
                "title": {
                    "type": "string",
                    "description": "A short, human-readable summary of the problem type",
                    "example": "Validation failed"
                },
                "status": {
                    "type": "integer",
                    "description": "The HTTP status code",
                    "example": 400
                },
                "code": {
                    "type": "string",
                    "description": "Machine-readable error code",
                    "example": "VDJ-GEN-VAL-422"
                },
                "i18n_key": {
                    "type": "string", 
                    "description": "Internationalization key for frontend localization",
                    "example": "validation.failed"
                },
                "detail": {
                    "type": "string",
                    "description": "A human-readable explanation specific to this problem occurrence",
                    "example": "The request contains invalid data."
                },
                "instance": {
                    "type": "string",
                    "format": "uri",
                    "description": "A URI reference that identifies the specific occurrence of the problem",
                    "example": "/api/v1/accounts/register/"
                },
                "issues": {
                    "type": "array",
                    "description": "Array of validation issues (for validation errors)",
                    "items": {"$ref": "#/components/schemas/Issue"}
                },
                "meta": {
                    "type": "object",
                    "description": "Additional metadata about the problem",
                    "additionalProperties": True
                }
            }
        },
        "Issue": {
            "type": "object",
            "title": "Validation Issue",
            "description": "Details about a specific field validation error",
            "required": ["path", "message", "i18n_key"],
            "properties": {
                "path": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Path to the field that caused the issue",
                    "example": ["user", "email"]
                },
                "message": {
                    "type": "string",
                    "description": "Human-readable error message",
                    "example": "This field is required."
                },
                "i18n_key": {
                    "type": "string",
                    "description": "Internationalization key for the error message",
                    "example": "validation.required"
                }
            }
        },
        "SuccessEnvelope": {
            "type": "object",
            "title": "Success Response Envelope",
            "description": "Standard success response format for non-paginated responses",
            "required": ["status", "code", "i18n_key", "data"],
            "properties": {
                "status": {
                    "type": "integer",
                    "description": "HTTP status code (numeric)",
                    "example": 200
                },
                "code": {
                    "type": "string",
                    "description": "Machine-readable success code",
                    "example": "VDJ-GEN-OK-200"
                },
                "i18n_key": {
                    "type": "string",
                    "description": "Internationalization key for frontend localization",
                    "example": "common.ok"
                },
                "data": {
                    "description": "Response data payload",
                    "example": {"id": "123", "name": "Example"}
                }
            }
        },
        "PaginatedEnvelope": {
            "type": "object",
            "title": "Paginated Response Envelope", 
            "description": "Standard paginated response format",
            "required": ["status", "code", "i18n_key", "pagination", "data"],
            "properties": {
                "status": {
                    "type": "integer",
                    "description": "HTTP status code (numeric)",
                    "example": 200
                },
                "code": {
                    "type": "string", 
                    "description": "Machine-readable success code",
                    "example": "VDJ-GEN-LIST-200"
                },
                "i18n_key": {
                    "type": "string",
                    "description": "Internationalization key for frontend localization", 
                    "example": "list.ok"
                },
                "pagination": {"$ref": "#/components/schemas/Pagination"},
                "data": {
                    "type": "array",
                    "description": "Array of response data items",
                    "items": {}
                }
            }
        },
        "Pagination": {
            "type": "object",
            "title": "Pagination Metadata",
            "description": "Standard pagination information",
            "required": ["count", "totalPages", "currentPage", "pageSize"],
            "properties": {
                "count": {
                    "type": "integer",
                    "description": "Total number of items across all pages",
                    "example": 150
                },
                "totalPages": {
                    "type": "integer", 
                    "description": "Total number of pages",
                    "example": 8
                },
                "currentPage": {
                    "type": "integer",
                    "description": "Current page number (1-based)",
                    "example": 1
                },
                "next": {
                    "type": "integer",
                    "nullable": True,
                    "description": "Next page number (null if no next page)",
                    "example": 2
                },
                "previous": {
                    "type": "integer",
                    "nullable": True,
                    "description": "Previous page number (null if no previous page)",
                    "example": None
                },
                "pageSize": {
                    "type": "integer",
                    "description": "Number of items per page",
                    "example": 20
                }
            }
        }
    })

    return result