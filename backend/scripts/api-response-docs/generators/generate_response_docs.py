#!/usr/bin/env python
"""
Generate comprehensive API response documentation from response codes and problem types.

This script generates markdown documentation for all response codes (success and error)
and problem types defined in the application's code registry.
"""

import os
import sys
from collections import defaultdict
from pathlib import Path

import django
import yaml

# Add the backend directory to Python path
# Script is in: backend/scripts/api-response-docs/generators/
# Backend is: backend/ (4 levels up)
backend_dir = Path(__file__).parent.parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure Django settings
# Use environment variable or fallback to development settings
django_settings = os.environ.get(
    "DJANGO_SETTINGS_MODULE", "config.settings.development"
)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", django_settings)

django.setup()

from apps.core.code_registry import REGISTRY, CodeRegistryError


def categorize_codes_by_app_and_type(
    codes: set[str],
) -> dict[str, dict[str, list[str]]]:
    """Categorize codes by app and response type (success/error)."""
    categorized = defaultdict(lambda: {"success": [], "error": []})

    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1].upper()
            http_code = int(parts[-1])

            if 200 <= http_code < 300:
                categorized[module]["success"].append(code)
            else:
                categorized[module]["error"].append(code)
        else:
            categorized["UNKNOWN"]["error"].append(code)

    return categorized


def get_code_description(code: str) -> str:
    """Generate a description for a response code based on its pattern."""
    parts = code.split("-")
    if len(parts) >= 4:
        module = parts[1]
        usecase = parts[2]
        http_code = int(parts[-1])

        # Create human-readable descriptions
        usecase_descriptions = {
            "OK": "successful operation",
            "CREATED": "resource created successfully",
            "LIST": "list retrieved successfully",
            "LOGIN": "authentication successful",
            "LOGOUT": "logout successful",
            "REGISTER": "registration successful",
            "VERIFY": "verification successful",
            "REFRESH": "token refresh successful",
            "SENT": "operation completed successfully",
            "NOTFOUND": "resource not found",
            "EXISTS": "resource already exists",
            "CREDS": "invalid credentials provided",
            "INACTIVE": "account is inactive",
            "EMAIL": "email verification required",
            "RESET": "password reset issue",
            "REG": "registration not allowed",
            "PROFILE": "profile operation issue",
            "ACCESS": "access denied",
            "OWNER": "owner privileges required",
            "INVITE": "invitation issue",
            "MEMBER": "member management issue",
            "LIMIT": "limit exceeded",
            "SUB": "subdomain issue",
            "EXPIRED": "token or session expired",
            "INVALID": "invalid token or data",
            "TOKEN": "token authentication failed",
            "DENIED": "permission denied",
            "FORBID": "operation forbidden",
            "CONFLICT": "resource conflict",
            "VAL": "validation failed",
            "RATE": "rate limit exceeded",
            "ERR": "internal server error",
            "UNAVAIL": "service unavailable",
            "BAD": "bad request",
        }

        description = usecase_descriptions.get(usecase, f"{usecase.lower()} operation")
        return f"{module} {description}"

    return "Unknown response code"


def generate_index_file(output_dir: Path, categorized_codes: dict, stats: dict):
    """Generate the main index file for API response documentation."""
    index_content = f"""# API Response Documentation

This documentation provides details about all API response codes and error types in the VAS-DJ SaaS API.
All responses follow consistent patterns and RFC 7807 "Problem Details for HTTP APIs" specification for errors.

## Response Code System

All response codes follow the pattern: `VDJ-<MODULE>-<USECASE>-<HTTP>`

- **VDJ**: Project prefix
- **MODULE**: App or module name (uppercase)
- **USECASE**: Specific use case or action (uppercase)
- **HTTP**: HTTP status code (3 digits)

## Statistics

- **Total Response Codes**: {stats.get('total_codes', 0)}
- **Success Codes (2xx)**: {stats.get('total_success', 0)}
- **Error Codes (4xx/5xx)**: {stats.get('total_error', 0)}
- **Apps with Codes**: {stats.get('apps_with_codes', 0)}
- **Problem Types**: {len(REGISTRY.problem_types)}

## Response Structure

### Success Response Structure
```json
{{
  "success": true,
  "code": "VDJ-GEN-OK-200",
  "message": "Operation completed successfully",
  "data": {{...}}
}}
```

### Error Response Structure (RFC 7807)
```json
{{
  "type": "https://docs.yourapp.com/problems/example",
  "title": "Example Error",
  "status": 400,
  "code": "VDJ-GEN-BAD-400",
  "i18n_key": "errors.example",
  "detail": "Detailed explanation of the specific error instance",
  "instance": "/api/v1/endpoint",
  "issues": [...],
  "meta": {{...}}
}}
```

## Available Response Codes by Module

"""

    # Add links to individual module pages
    for app in sorted(categorized_codes.keys()):
        codes = categorized_codes[app]
        total = len(codes["success"]) + len(codes["error"])
        if total > 0:
            index_content += f"- [{app} Module](./{app.lower()}_codes.md) - {total} codes ({len(codes['success'])} success, {len(codes['error'])} error)\n"

    # Add problem types section
    index_content += "\n## Problem Types\n\n"
    for slug in sorted(REGISTRY.problem_types.keys()):
        problem = REGISTRY.problem_types[slug]
        index_content += f"- [{problem['title']}](./problems/{slug}.md) - {problem.get('description', 'No description')}\n"

    # Write the index file
    index_path = output_dir / "index.md"
    index_path.write_text(index_content)
    print(f"Generated: {index_path}")


def generate_module_pages(output_dir: Path, categorized_codes: dict):
    """Generate individual pages for each module's response codes."""
    for app, codes in categorized_codes.items():
        if not codes["success"] and not codes["error"]:
            continue

        content = f"""# {app} Module Response Codes

This page documents all response codes for the {app} module.

"""

        # Success codes section
        if codes["success"]:
            content += f"""## Success Codes ({len(codes["success"])} codes)

| Code | HTTP Status | Description |
|------|-------------|-------------|
"""
            for code in sorted(codes["success"]):
                parts = code.split("-")
                http_code = parts[-1] if parts else "200"
                description = get_code_description(code)
                content += f"| `{code}` | {http_code} | {description} |\n"

            content += "\n"

        # Error codes section
        if codes["error"]:
            content += f"""## Error Codes ({len(codes["error"])} codes)

| Code | HTTP Status | Description |
|------|-------------|-------------|
"""
            for code in sorted(codes["error"]):
                parts = code.split("-")
                http_code = parts[-1] if parts else "400"
                description = get_code_description(code)
                content += f"| `{code}` | {http_code} | {description} |\n"

        # Add usage examples
        content += f"""
## Integration Examples

### Success Response Example
```python
from apps.core.codes import APIResponseCodes
# or from apps.{app.lower()}.codes import {app}ResponseCodes

# In your view or serializer
return Response({{
    "success": True,
    "code": "{codes['success'][0] if codes['success'] else 'VDJ-GEN-OK-200'}",
    "message": "Operation completed successfully",
    "data": {{...}}
}}, status=200)
```

### Error Response Example
```python
# In your exception handler
return Response({{
    "type": "https://docs.yourapp.com/problems/validation",
    "title": "Validation Error",
    "status": 400,
    "code": "{codes['error'][0] if codes['error'] else 'VDJ-GEN-BAD-400'}",
    "detail": "The request contains invalid data",
    "instance": request.build_absolute_uri()
}}, status=400)
```
"""

        # Write the module page
        page_path = output_dir / f"{app.lower()}_codes.md"
        page_path.write_text(content)
        print(f"Generated: {page_path}")


def generate_problem_pages(output_dir: Path):
    """Generate individual pages for each problem type."""
    problems_dir = output_dir / "problems"
    problems_dir.mkdir(exist_ok=True)

    for slug, problem in REGISTRY.problem_types.items():
        content = f"""# {problem['title']}

**Type URI:** `{problem['type']}`
**Default Status:** {problem['default_status']}
**I18n Key:** `{problem['i18n_key']}`

## Description

{problem.get('description', 'No description available.')}

## Associated Response Codes

"""

        # List associated codes
        if "codes" in problem and problem["codes"]:
            for code in problem["codes"]:
                description = get_code_description(code)
                content += f"- `{code}` - {description}\n"
        else:
            content += "No specific codes associated with this problem type.\n"

        content += f"""
## Example Response

```json
{{
  "type": "{problem['type']}",
  "title": "{problem['title']}",
  "status": {problem['default_status']},
  "code": "{problem.get('codes', ['VDJ-GEN-ERR-500'])[0]}",
  "i18n_key": "{problem['i18n_key']}",
  "detail": "Specific details about this error occurrence",
  "instance": "/api/v1/endpoint"
}}
```

## Integration

```python
from apps.core.problem_details import ProblemDetailResponse

# In your view
return ProblemDetailResponse(
    problem_type="{slug}",
    detail="Specific error details",
    instance=request.build_absolute_uri(),
    code="{problem.get('codes', ['VDJ-GEN-ERR-500'])[0]}"
)
```
"""

        # Write the problem page
        page_path = problems_dir / f"{slug}.md"
        page_path.write_text(content)
        print(f"Generated: {page_path}")


def generate_consolidated_registry(output_dir: Path, categorized_codes: dict):
    """Generate a consolidated registry of all codes and problem types."""
    registry_data = {"response_codes": {}, "problem_types": {}, "statistics": {}}

    # Add response codes
    for app, codes in categorized_codes.items():
        if codes["success"] or codes["error"]:
            registry_data["response_codes"][app] = {
                "success_codes": sorted(codes["success"]),
                "error_codes": sorted(codes["error"]),
                "total": len(codes["success"]) + len(codes["error"]),
            }

    # Add problem types
    for slug, problem in REGISTRY.problem_types.items():
        registry_data["problem_types"][slug] = problem

    # Add statistics
    total_success = sum(len(codes["success"]) for codes in categorized_codes.values())
    total_error = sum(len(codes["error"]) for codes in categorized_codes.values())

    registry_data["statistics"] = {
        "total_response_codes": total_success + total_error,
        "success_codes": total_success,
        "error_codes": total_error,
        "problem_types": len(REGISTRY.problem_types),
        "apps_with_codes": len(
            [
                app
                for app, codes in categorized_codes.items()
                if codes["success"] or codes["error"]
            ]
        ),
    }

    # Write registry file
    registry_path = output_dir / "registry.yml"
    with registry_path.open("w") as f:
        yaml.dump(registry_data, f, default_flow_style=False, sort_keys=False)

    print(f"Generated: {registry_path}")


def main():
    """Main documentation generation function."""
    print("Generating API response documentation...")
    print("=" * 60)

    try:
        # Load the registry
        REGISTRY.load()

        # Get and categorize codes
        all_codes = REGISTRY.codes
        categorized_codes = categorize_codes_by_app_and_type(all_codes)

        # Calculate statistics
        stats = {
            "total_codes": len(all_codes),
            "total_success": sum(
                len(codes["success"]) for codes in categorized_codes.values()
            ),
            "total_error": sum(
                len(codes["error"]) for codes in categorized_codes.values()
            ),
            "apps_with_codes": len(
                [
                    app
                    for app, codes in categorized_codes.items()
                    if codes["success"] or codes["error"]
                ]
            ),
        }

        # Create output directory
        output_dir = backend_dir / "_generated" / "docs" / "api-responses"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate documentation files
        generate_index_file(output_dir, categorized_codes, stats)
        generate_module_pages(output_dir, categorized_codes)
        generate_problem_pages(output_dir)
        generate_consolidated_registry(output_dir, categorized_codes)

        print("\n✓ Documentation generation successful!")
        print(f"  - Response codes documented: {stats['total_codes']}")
        print(f"    - Success codes (2xx): {stats['total_success']}")
        print(f"    - Error codes (4xx/5xx): {stats['total_error']}")
        print(f"  - Problem types documented: {len(REGISTRY.problem_types)}")
        print(f"  - Apps covered: {stats['apps_with_codes']}")
        print(f"  - Output directory: {output_dir}")

        return 0

    except CodeRegistryError as e:
        print(f"✗ Documentation generation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during generation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
