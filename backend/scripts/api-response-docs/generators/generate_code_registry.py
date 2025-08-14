#!/usr/bin/env python
"""
Generate a comprehensive code registry export for API response codes.

This script generates various registry formats (JSON, YAML, Python constants)
that can be used for documentation, client SDKs, or integration purposes.
"""

import os
import sys
import json
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
from apps.core.codes import BaseAPICodeMixin


def organize_codes_by_hierarchy(
    codes: Set[str],
) -> Dict[str, Dict[str, Dict[str, List[str]]]]:
    """Organize codes into a hierarchical structure: module -> type -> status -> codes."""
    hierarchy = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            prefix = parts[0]  # VDJ
            module = parts[1]  # GEN, AUTH, ACC, ORG, etc.
            usecase = parts[2]  # OK, LOGIN, NOTFOUND, etc.
            http_code = int(parts[-1])

            # Determine type (success/error)
            code_type = "success" if 200 <= http_code < 300 else "error"

            hierarchy[module][code_type][http_code].append(
                {
                    "code": code,
                    "usecase": usecase,
                    "description": generate_code_description(code),
                }
            )

    return hierarchy


def generate_code_description(code: str) -> str:
    """Generate a human-readable description for a response code."""
    parts = code.split("-")
    if len(parts) >= 4:
        module = parts[1]
        usecase = parts[2]
        http_code = int(parts[-1])

        # Description mappings
        usecase_map = {
            "OK": "Operation successful",
            "CREATED": "Resource created successfully",
            "LIST": "List retrieved successfully",
            "LOGIN": "Authentication successful",
            "LOGOUT": "Logout successful",
            "REGISTER": "Registration successful",
            "VERIFY": "Verification successful",
            "REFRESH": "Token refresh successful",
            "SENT": "Operation completed",
            "NOTFOUND": "Resource not found",
            "EXISTS": "Resource already exists",
            "CREDS": "Invalid credentials",
            "INACTIVE": "Account inactive",
            "EMAIL": "Email verification required",
            "RESET": "Password reset required",
            "REG": "Registration not allowed",
            "PROFILE": "Profile operation failed",
            "ACCESS": "Access denied",
            "OWNER": "Owner privileges required",
            "INVITE": "Invitation operation failed",
            "MEMBER": "Member operation failed",
            "LIMIT": "Limit exceeded",
            "SUB": "Subdomain operation failed",
            "EXPIRED": "Token or session expired",
            "INVALID": "Invalid token or request",
            "TOKEN": "Token authentication failed",
            "DENIED": "Permission denied",
            "FORBID": "Operation forbidden",
            "CONFLICT": "Resource conflict",
            "VAL": "Validation failed",
            "RATE": "Rate limit exceeded",
            "ERR": "Internal server error",
            "UNAVAIL": "Service unavailable",
            "BAD": "Bad request",
        }

        description = usecase_map.get(
            usecase, f"{usecase.lower().replace('_', ' ')} operation"
        )
        return f"{module.upper()}: {description}"

    return "Unknown response code"


def generate_json_registry(
    output_dir: Path, codes: Set[str], problem_types: Dict
) -> None:
    """Generate JSON format registry."""
    registry_data = {
        "meta": {
            "generated_at": "2024-01-01T00:00:00Z",  # Will be updated by actual timestamp
            "version": "1.0.0",
            "total_codes": len(codes),
            "total_problem_types": len(problem_types),
        },
        "response_codes": {},
        "problem_types": problem_types,
        "hierarchy": organize_codes_by_hierarchy(codes),
    }

    # Flat list of all codes with descriptions
    for code in sorted(codes):
        registry_data["response_codes"][code] = {
            "description": generate_code_description(code),
            "http_status": int(code.split("-")[-1]),
            "module": code.split("-")[1] if len(code.split("-")) >= 2 else "unknown",
            "type": (
                "success"
                if code.endswith(("-200", "-201", "-202", "-204"))
                else "error"
            ),
        }

    # Write JSON file
    json_path = output_dir / "registry.json"
    with json_path.open("w") as f:
        json.dump(registry_data, f, indent=2, sort_keys=True)

    print(f"Generated: {json_path}")


def generate_yaml_registry(
    output_dir: Path, codes: Set[str], problem_types: Dict
) -> None:
    """Generate YAML format registry."""
    registry_data = {
        "meta": {
            "generated_at": "2024-01-01T00:00:00Z",
            "version": "1.0.0",
            "total_codes": len(codes),
            "total_problem_types": len(problem_types),
        },
        "response_codes": [],
        "problem_types": problem_types,
    }

    # Organized code list
    for code in sorted(codes):
        registry_data["response_codes"].append(
            {
                "code": code,
                "description": generate_code_description(code),
                "http_status": int(code.split("-")[-1]),
                "module": (
                    code.split("-")[1] if len(code.split("-")) >= 2 else "unknown"
                ),
                "type": (
                    "success"
                    if code.endswith(("-200", "-201", "-202", "-204"))
                    else "error"
                ),
            }
        )

    # Write YAML file
    yaml_path = output_dir / "registry.yml"
    with yaml_path.open("w") as f:
        yaml.dump(registry_data, f, default_flow_style=False, sort_keys=False)

    print(f"Generated: {yaml_path}")


def generate_python_constants(output_dir: Path, codes: Set[str]) -> None:
    """Generate Python constants file for client SDKs."""

    hierarchy = organize_codes_by_hierarchy(codes)

    content = '''"""
Auto-generated API response codes for VAS-DJ SaaS.

This file contains all response codes organized by module and type.
Generated from the Django backend code registry.
"""

from enum import StrEnum
from typing import Dict, List


class ResponseCodeType(StrEnum):
    """Response code types."""
    SUCCESS = "success"
    ERROR = "error"


class HTTPStatus:
    """Common HTTP status codes."""
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    UNPROCESSABLE_ENTITY = 422
    RATE_LIMITED = 429
    INTERNAL_ERROR = 500
    SERVICE_UNAVAILABLE = 503


'''

    # Generate module-specific enums
    for module, types in sorted(hierarchy.items()):
        content += f"\nclass {module.capitalize()}ResponseCodes(StrEnum):\n"
        content += f'    """{module.upper()} module response codes."""\n\n'

        # Success codes first
        if "success" in types:
            content += "    # Success codes\n"
            for status, status_codes in sorted(types["success"].items()):
                for code_info in status_codes:
                    code = code_info["code"]
                    usecase = code_info["usecase"]
                    description = code_info["description"]
                    const_name = f"{usecase}_{status}"
                    content += f'    {const_name} = "{code}"  # {description}\n'
            content += "\n"

        # Error codes
        if "error" in types:
            content += "    # Error codes\n"
            for status, status_codes in sorted(types["error"].items()):
                for code_info in status_codes:
                    code = code_info["code"]
                    usecase = code_info["usecase"]
                    description = code_info["description"]
                    const_name = f"{usecase}_{status}"
                    content += f'    {const_name} = "{code}"  # {description}\n'

    # Generate helper functions
    content += '''

# Helper functions
def get_code_info(code: str) -> Dict[str, Any]:
    """Get information about a response code."""
    parts = code.split('-')
    if len(parts) >= 4:
        return {
            "code": code,
            "module": parts[1],
            "usecase": parts[2], 
            "http_status": int(parts[-1]),
            "type": ResponseCodeType.SUCCESS if parts[-1].startswith('2') else ResponseCodeType.ERROR
        }
    return {"code": code, "module": "unknown", "usecase": "unknown", "http_status": 500, "type": ResponseCodeType.ERROR}


def is_success_code(code: str) -> bool:
    """Check if a code represents a successful operation."""
    return code.split('-')[-1].startswith('2') if '-' in code else False


def is_error_code(code: str) -> bool:
    """Check if a code represents an error."""
    return not is_success_code(code)


def get_codes_by_module(module: str) -> List[str]:
    """Get all codes for a specific module."""
    all_codes = []
'''

    # Add all codes to the helper function
    for module, types in sorted(hierarchy.items()):
        content += f'    if module.upper() == "{module}":\n'
        content += f"        return [\n"
        for type_name, statuses in types.items():
            for status, status_codes in statuses.items():
                for code_info in status_codes:
                    content += f'            "{code_info["code"]}",\n'
        content += "        ]\n"

    content += "    return []\n"

    # Write Python file
    py_path = output_dir / "response_codes.py"
    py_path.write_text(content)

    print(f"Generated: {py_path}")


def generate_typescript_definitions(output_dir: Path, codes: Set[str]) -> None:
    """Generate TypeScript definitions for client SDKs."""

    hierarchy = organize_codes_by_hierarchy(codes)

    content = """/**
 * Auto-generated API response codes for VAS-DJ SaaS.
 * 
 * This file contains all response codes organized by module and type.
 * Generated from the Django backend code registry.
 */

export enum ResponseCodeType {
  SUCCESS = "success",
  ERROR = "error"
}

export interface CodeInfo {
  code: string;
  module: string;
  usecase: string;
  httpStatus: number;
  type: ResponseCodeType;
  description: string;
}

"""

    # Generate module enums
    for module, types in sorted(hierarchy.items()):
        content += f"\nexport enum {module.capitalize()}ResponseCodes {{\n"

        # Success codes
        if "success" in types:
            content += "  // Success codes\n"
            for status, status_codes in sorted(types["success"].items()):
                for code_info in status_codes:
                    code = code_info["code"]
                    usecase = code_info["usecase"]
                    description = code_info["description"]
                    const_name = f"{usecase}_{status}"
                    content += f'  {const_name} = "{code}", // {description}\n'

        # Error codes
        if "error" in types:
            content += "  // Error codes\n"
            for status, status_codes in sorted(types["error"].items()):
                for code_info in status_codes:
                    code = code_info["code"]
                    usecase = code_info["usecase"]
                    description = code_info["description"]
                    const_name = f"{usecase}_{status}"
                    content += f'  {const_name} = "{code}", // {description}\n'

        content += "}\n"

    # Generate helper functions
    content += """
// Helper functions
export function getCodeInfo(code: string): CodeInfo {
  const parts = code.split('-');
  if (parts.length >= 4) {
    return {
      code,
      module: parts[1],
      usecase: parts[2],
      httpStatus: parseInt(parts[parts.length - 1]),
      type: parts[parts.length - 1].startsWith('2') ? ResponseCodeType.SUCCESS : ResponseCodeType.ERROR,
      description: generateCodeDescription(code)
    };
  }
  return {
    code,
    module: 'unknown',
    usecase: 'unknown', 
    httpStatus: 500,
    type: ResponseCodeType.ERROR,
    description: 'Unknown response code'
  };
}

export function isSuccessCode(code: string): boolean {
  return code.includes('-') && code.split('-').pop()?.startsWith('2') === true;
}

export function isErrorCode(code: string): boolean {
  return !isSuccessCode(code);
}

function generateCodeDescription(code: string): string {
  // Basic description generator - should be enhanced based on actual mappings
  const parts = code.split('-');
  if (parts.length >= 4) {
    return `${parts[1]}: ${parts[2].toLowerCase().replace('_', ' ')} operation`;
  }
  return 'Unknown operation';
}
"""

    # Write TypeScript file
    ts_path = output_dir / "response-codes.ts"
    ts_path.write_text(content)

    print(f"Generated: {ts_path}")


def generate_openapi_schema_fragment(
    output_dir: Path, codes: Set[str], problem_types: Dict
) -> None:
    """Generate OpenAPI schema fragment for response codes."""

    # Create schema components
    schema = {
        "components": {
            "schemas": {
                "ResponseCode": {
                    "type": "string",
                    "enum": sorted(list(codes)),
                    "description": "API response codes following VDJ-MODULE-USECASE-HTTP pattern",
                },
                "SuccessResponse": {
                    "type": "object",
                    "properties": {
                        "success": {"type": "boolean", "example": True},
                        "code": {"$ref": "#/components/schemas/ResponseCode"},
                        "message": {
                            "type": "string",
                            "description": "Human-readable success message",
                        },
                        "data": {"type": "object", "description": "Response payload"},
                    },
                    "required": ["success", "code"],
                },
                "ErrorResponse": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "format": "uri",
                            "description": "RFC 7807 problem type URI",
                        },
                        "title": {
                            "type": "string",
                            "description": "Human-readable error title",
                        },
                        "status": {
                            "type": "integer",
                            "description": "HTTP status code",
                        },
                        "code": {"$ref": "#/components/schemas/ResponseCode"},
                        "i18n_key": {
                            "type": "string",
                            "description": "Internationalization key",
                        },
                        "detail": {
                            "type": "string",
                            "description": "Detailed error explanation",
                        },
                        "instance": {
                            "type": "string",
                            "format": "uri",
                            "description": "Request URI that caused the error",
                        },
                        "issues": {
                            "type": "array",
                            "description": "Validation issues (for validation errors)",
                            "items": {"type": "object"},
                        },
                        "meta": {
                            "type": "object",
                            "description": "Additional metadata",
                        },
                    },
                    "required": ["type", "title", "status", "code"],
                },
            }
        }
    }

    # Add problem type schemas
    if problem_types:
        schema["components"]["schemas"]["ProblemTypes"] = {
            "type": "string",
            "enum": sorted(list(problem_types.keys())),
            "description": "Available problem type slugs",
        }

    # Write OpenAPI fragment
    openapi_path = output_dir / "openapi-fragment.yml"
    with openapi_path.open("w") as f:
        yaml.dump(schema, f, default_flow_style=False, sort_keys=False)

    print(f"Generated: {openapi_path}")


def main():
    """Main registry generation function."""
    print("Generating comprehensive code registry...")
    print("=" * 60)

    try:
        # Load the registry
        REGISTRY.load()

        codes = REGISTRY.codes
        problem_types = REGISTRY.problem_types

        # Create output directory
        output_dir = backend_dir / "_generated" / "exports" / "code-registry"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate all formats
        generate_json_registry(output_dir, codes, problem_types)
        generate_yaml_registry(output_dir, codes, problem_types)
        generate_python_constants(output_dir, codes)
        generate_typescript_definitions(output_dir, codes)
        generate_openapi_schema_fragment(output_dir, codes, problem_types)

        print(f"\n✓ Registry generation successful!")
        print(f"  - Response codes: {len(codes)}")
        print(f"  - Problem types: {len(problem_types)}")
        print(f"  - Export formats: JSON, YAML, Python, TypeScript, OpenAPI")
        print(f"  - Output directory: {output_dir}")

        return 0

    except CodeRegistryError as e:
        print(f"✗ Registry generation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during generation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
