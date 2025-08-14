#!/usr/bin/env python
"""
Generate OpenAPI schema enhancements for API response codes and problem types.

This script generates comprehensive OpenAPI documentation components that can be
integrated into the main API schema to provide rich response code documentation.
"""

import os
import sys
import yaml
import django
from pathlib import Path
from collections import defaultdict, OrderedDict
from typing import Dict, List, Set, Any, Optional
# Add the backend directory to Python path
# Script is in: backend/scripts/api-response-docs/generators/
# Backend is: backend/ (4 levels up)
backend_dir = Path(__file__).parent.parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure Django settings
# Use environment variable or fallback to development settings
django_settings = os.environ.get(
    "DJANGO_SETTINGS_MODULE", 
    "config.settings.development"
)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", django_settings)

django.setup()

from apps.core.code_registry import REGISTRY, CodeRegistryError


def categorize_codes_for_openapi(codes: Set[str]) -> Dict[str, Dict[str, List[str]]]:
    """Categorize codes for OpenAPI schema generation."""
    categorized = defaultdict(lambda: {"success": [], "error": []})

    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1]
            http_code = int(parts[-1])

            if 200 <= http_code < 300:
                categorized[module]["success"].append(code)
            else:
                categorized[module]["error"].append(code)

    return categorized


def generate_response_code_schemas(codes: Set[str]) -> Dict[str, Any]:
    """Generate OpenAPI schemas for response codes."""
    schemas = {}

    # Base response code enum
    schemas["ResponseCode"] = {
        "type": "string",
        "enum": sorted(list(codes)),
        "description": "API response codes following VDJ-MODULE-USECASE-HTTP pattern",
        "example": "VDJ-GEN-OK-200",
    }

    # Success response schema
    schemas["SuccessResponse"] = {
        "type": "object",
        "description": "Standard success response structure",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Indicates successful operation",
                "example": True,
            },
            "code": {
                "$ref": "#/components/schemas/ResponseCode",
                "description": "Response code identifying the operation result",
            },
            "message": {
                "type": "string",
                "description": "Human-readable success message",
                "example": "Operation completed successfully",
            },
            "data": {
                "oneOf": [
                    {"type": "object"},
                    {"type": "array"},
                    {"type": "string"},
                    {"type": "number"},
                    {"type": "boolean"},
                    {"type": "null"},
                ],
                "description": "Response payload containing the requested data",
            },
            "meta": {
                "type": "object",
                "description": "Additional metadata about the response",
                "properties": {
                    "timestamp": {
                        "type": "string",
                        "format": "date-time",
                        "description": "Response generation timestamp",
                    },
                    "request_id": {
                        "type": "string",
                        "description": "Unique identifier for this request",
                    },
                    "version": {"type": "string", "description": "API version used"},
                },
            },
        },
        "required": ["success", "code"],
        "example": {
            "success": True,
            "code": "VDJ-GEN-OK-200",
            "message": "Data retrieved successfully",
            "data": {"id": 1, "name": "Example"},
            "meta": {"timestamp": "2024-01-01T12:00:00Z"},
        },
    }

    # Error response schema (RFC 7807)
    schemas["ErrorResponse"] = {
        "type": "object",
        "description": "RFC 7807 Problem Details error response",
        "properties": {
            "type": {
                "type": "string",
                "format": "uri",
                "description": "URI identifying the problem type",
                "example": "https://docs.yourapp.com/problems/validation",
            },
            "title": {
                "type": "string",
                "description": "Short, human-readable summary of the problem",
                "example": "Validation Error",
            },
            "status": {
                "type": "integer",
                "minimum": 400,
                "maximum": 599,
                "description": "HTTP status code",
                "example": 400,
            },
            "code": {
                "$ref": "#/components/schemas/ResponseCode",
                "description": "Application-specific error code",
            },
            "i18n_key": {
                "type": "string",
                "description": "Internationalization key for client-side translation",
                "example": "errors.validation.failed",
            },
            "detail": {
                "type": "string",
                "description": "Human-readable explanation specific to this occurrence",
                "example": "The 'email' field is required and must be a valid email address",
            },
            "instance": {
                "type": "string",
                "format": "uri",
                "description": "URI reference identifying the specific occurrence",
                "example": "/api/v1/accounts/register",
            },
            "issues": {
                "type": "array",
                "description": "Detailed validation issues (for validation errors)",
                "items": {
                    "type": "object",
                    "properties": {
                        "field": {
                            "type": "string",
                            "description": "Field name that failed validation",
                        },
                        "message": {
                            "type": "string",
                            "description": "Validation error message",
                        },
                        "code": {
                            "type": "string",
                            "description": "Validation error code",
                        },
                    },
                },
            },
            "meta": {
                "type": "object",
                "description": "Additional error context",
                "properties": {
                    "timestamp": {"type": "string", "format": "date-time"},
                    "request_id": {"type": "string"},
                    "correlation_id": {
                        "type": "string",
                        "description": "Correlation ID for tracing",
                    },
                },
            },
        },
        "required": ["type", "title", "status", "code"],
        "example": {
            "type": "https://docs.yourapp.com/problems/validation",
            "title": "Validation Error",
            "status": 400,
            "code": "VDJ-GEN-VAL-400",
            "i18n_key": "errors.validation.failed",
            "detail": "Request validation failed",
            "instance": "/api/v1/accounts/register",
            "issues": [
                {
                    "field": "email",
                    "message": "This field is required",
                    "code": "required",
                }
            ],
        },
    }

    return schemas


def generate_status_specific_responses(
    codes: Set[str], problem_types: Dict
) -> Dict[str, Any]:
    """Generate OpenAPI response objects for specific status codes."""
    responses = {}

    # Group codes by status
    status_codes = defaultdict(list)
    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            status = int(parts[-1])
            status_codes[status].append(code)

    # Generate response objects for each status
    for status, codes_for_status in status_codes.items():
        if 200 <= status < 300:
            # Success response
            responses[str(status)] = {
                "description": f"Success response (HTTP {status})",
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/SuccessResponse"},
                        "examples": {},
                    }
                },
            }

            # Add examples for each code
            for code in codes_for_status[:3]:  # Limit examples
                parts = code.split("-")
                module = parts[1] if len(parts) >= 2 else "unknown"
                usecase = parts[2] if len(parts) >= 3 else "operation"

                example_name = f"{module.lower()}_{usecase.lower()}"
                responses[str(status)]["content"]["application/json"]["examples"][
                    example_name
                ] = {
                    "summary": f"{module} {usecase} success",
                    "value": {
                        "success": True,
                        "code": code,
                        "message": f"{usecase.lower().replace('_', ' ')} completed successfully",
                        "data": {},
                    },
                }

        else:
            # Error response
            responses[str(status)] = {
                "description": f"Error response (HTTP {status})",
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/ErrorResponse"},
                        "examples": {},
                    }
                },
            }

            # Add examples for each code
            for code in codes_for_status[:3]:  # Limit examples
                parts = code.split("-")
                module = parts[1] if len(parts) >= 2 else "unknown"
                usecase = parts[2] if len(parts) >= 3 else "error"

                # Find matching problem type
                matching_problem = None
                for problem in problem_types.values():
                    if "codes" in problem and code in problem["codes"]:
                        matching_problem = problem
                        break

                example_name = f"{module.lower()}_{usecase.lower()}"
                example_value = {
                    "type": (
                        matching_problem["type"]
                        if matching_problem
                        else f"https://docs.yourapp.com/problems/{usecase.lower()}"
                    ),
                    "title": (
                        matching_problem["title"]
                        if matching_problem
                        else f"{usecase.replace('_', ' ').title()} Error"
                    ),
                    "status": status,
                    "code": code,
                    "i18n_key": (
                        matching_problem["i18n_key"]
                        if matching_problem
                        else f"errors.{usecase.lower()}"
                    ),
                    "detail": f"Error in {module.lower()} module: {usecase.lower().replace('_', ' ')}",
                    "instance": "/api/v1/example",
                }

                responses[str(status)]["content"]["application/json"]["examples"][
                    example_name
                ] = {"summary": f"{module} {usecase} error", "value": example_value}

    return responses


def generate_parameter_schemas() -> Dict[str, Any]:
    """Generate parameter schemas for response code filtering."""
    parameters = {}

    parameters["ResponseCodeFilter"] = {
        "name": "response_code",
        "in": "query",
        "description": "Filter by specific response code",
        "required": False,
        "schema": {"$ref": "#/components/schemas/ResponseCode"},
        "example": "VDJ-GEN-OK-200",
    }

    parameters["ModuleFilter"] = {
        "name": "module",
        "in": "query",
        "description": "Filter by module (GEN, AUTH, ACC, ORG, etc.)",
        "required": False,
        "schema": {
            "type": "string",
            "enum": ["GEN", "AUTH", "ACC", "ORG", "BILL", "EMAIL"],  # Common modules
            "example": "AUTH",
        },
    }

    parameters["ResponseTypeFilter"] = {
        "name": "response_type",
        "in": "query",
        "description": "Filter by response type",
        "required": False,
        "schema": {
            "type": "string",
            "enum": ["success", "error"],
            "example": "success",
        },
    }

    return parameters


def generate_security_schemes() -> Dict[str, Any]:
    """Generate security schemes related to response codes."""
    security_schemes = {}

    # API Key security with response code context
    security_schemes["ApiKeyAuth"] = {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key",
        "description": "API key authentication. Failed authentication returns VDJ-AUTH-TOKEN-401",
    }

    # Bearer token with response codes
    security_schemes["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT bearer token. Invalid tokens return VDJ-AUTH-INVALID-401, expired tokens return VDJ-AUTH-EXPIRED-401",
    }

    return security_schemes


def generate_complete_openapi_components(
    codes: Set[str], problem_types: Dict
) -> Dict[str, Any]:
    """Generate complete OpenAPI components section."""
    components = {
        "schemas": generate_response_code_schemas(codes),
        "responses": generate_status_specific_responses(codes, problem_types),
        "parameters": generate_parameter_schemas(),
        "securitySchemes": generate_security_schemes(),
    }

    # Add problem type schemas
    if problem_types:
        components["schemas"]["ProblemType"] = {
            "type": "string",
            "enum": sorted(list(problem_types.keys())),
            "description": "Available problem type slugs",
            "example": "validation",
        }

        # Individual problem type schemas
        for slug, problem in problem_types.items():
            schema_name = f"ProblemType_{slug.replace('-', '_').title()}"
            components["schemas"][schema_name] = {
                "allOf": [
                    {"$ref": "#/components/schemas/ErrorResponse"},
                    {
                        "properties": {
                            "type": {
                                "enum": [problem["type"]],
                                "example": problem["type"],
                            },
                            "title": {
                                "enum": [problem["title"]],
                                "example": problem["title"],
                            },
                            "status": {
                                "enum": [problem["default_status"]],
                                "example": problem["default_status"],
                            },
                        }
                    },
                ],
                "description": problem.get(
                    "description", f"Problem type for {problem['title']}"
                ),
            }

    return components


def generate_example_integration() -> Dict[str, Any]:
    """Generate example of how to integrate these components."""
    integration_example = {
        "paths": {
            "/api/v1/accounts/login": {
                "post": {
                    "summary": "User login",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string", "format": "email"},
                                        "password": {"type": "string"},
                                    },
                                    "required": ["email", "password"],
                                }
                            }
                        },
                    },
                    "responses": {
                        "200": {
                            "description": "Login successful",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/SuccessResponse"
                                    },
                                    "example": {
                                        "success": True,
                                        "code": "VDJ-AUTH-LOGIN-200",
                                        "message": "Login successful",
                                        "data": {
                                            "access_token": "jwt_token_here",
                                            "refresh_token": "refresh_token_here",
                                        },
                                    },
                                }
                            },
                        },
                        "401": {"$ref": "#/components/responses/401"},
                        "400": {"$ref": "#/components/responses/400"},
                        "429": {"$ref": "#/components/responses/429"},
                        "500": {"$ref": "#/components/responses/500"},
                    },
                }
            }
        }
    }

    return integration_example


def main():
    """Main OpenAPI integration generation function."""
    print("Generating OpenAPI schema integrations...")
    print("=" * 60)

    try:
        # Load the registry
        REGISTRY.load()

        codes = REGISTRY.codes
        problem_types = REGISTRY.problem_types

        # Create output directory
        output_dir = backend_dir / "_generated" / "exports" / "openapi-integration"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate complete components
        print("Generating OpenAPI components...")
        components = generate_complete_openapi_components(codes, problem_types)

        # Write full components file
        components_path = output_dir / "components.yml"
        with components_path.open("w") as f:
            yaml.dump(
                {"components": components}, f, default_flow_style=False, sort_keys=False
            )

        print(f"Generated: {components_path}")

        # Generate individual component files
        schemas_path = output_dir / "schemas.yml"
        with schemas_path.open("w") as f:
            yaml.dump(
                components["schemas"], f, default_flow_style=False, sort_keys=False
            )
        print(f"Generated: {schemas_path}")

        responses_path = output_dir / "responses.yml"
        with responses_path.open("w") as f:
            yaml.dump(
                components["responses"], f, default_flow_style=False, sort_keys=False
            )
        print(f"Generated: {responses_path}")

        # Generate integration example
        example = generate_example_integration()
        example_path = output_dir / "integration_example.yml"
        with example_path.open("w") as f:
            yaml.dump(example, f, default_flow_style=False, sort_keys=False)
        print(f"Generated: {example_path}")

        # Generate usage instructions
        instructions = f"""# OpenAPI Integration Instructions

## Generated Files

1. **components.yml** - Complete components section with all schemas, responses, parameters
2. **schemas.yml** - Just the schemas (can be imported separately)  
3. **responses.yml** - Just the responses (can be imported separately)
4. **integration_example.yml** - Example of how to use these components

## Integration Steps

### Option 1: Full Components Integration
Add the entire components section to your main OpenAPI spec:

```yaml
# In your main openapi.yml
components:
  # ... your existing components
  # Import all from components.yml
```

### Option 2: Selective Integration  
Import specific parts:

```yaml
components:
  schemas:
    # Your existing schemas
    ResponseCode: !include ./openapi-integration/schemas.yml#/ResponseCode
    SuccessResponse: !include ./openapi-integration/schemas.yml#/SuccessResponse
    ErrorResponse: !include ./openapi-integration/schemas.yml#/ErrorResponse
  
  responses:
    # Your existing responses  
    "400": !include ./openapi-integration/responses.yml#/400
    "401": !include ./openapi-integration/responses.yml#/401
    # ... etc
```

### Option 3: Reference Integration
Reference components in your paths:

```yaml
paths:
  /api/v1/example:
    get:
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/SuccessResponse"
        "400":
          $ref: "#/components/responses/400"
```

## Available Components

- **{len(components['schemas'])} Schemas**: Response codes, success/error structures, problem types
- **{len(components['responses'])} Response Objects**: Status-specific response templates  
- **{len(components['parameters'])} Parameters**: Response code filtering parameters
- **{len(components['securitySchemes'])} Security Schemes**: Authentication with response code context

## Statistics

- **Response Codes**: {len(codes)} total
- **Problem Types**: {len(problem_types)} defined
- **Status Codes Covered**: {len(set(int(code.split('-')[-1]) for code in codes if len(code.split('-')) >= 4))}
"""

        instructions_path = output_dir / "README.md"
        instructions_path.write_text(instructions)
        print(f"Generated: {instructions_path}")

        print(f"\n✓ OpenAPI integration generation successful!")
        print(f"  - Components generated: {len(components)} sections")
        print(f"  - Schemas: {len(components['schemas'])}")
        print(f"  - Responses: {len(components['responses'])}")
        print(f"  - Parameters: {len(components['parameters'])}")
        print(f"  - Security schemes: {len(components['securitySchemes'])}")
        print(f"  - Output directory: {output_dir}")

        return 0

    except CodeRegistryError as e:
        print(f"✗ OpenAPI integration generation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during generation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
