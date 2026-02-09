#!/usr/bin/env python
"""
Validate problem types for RFC 7807 compliance and enhanced structure.

This script validates all problem type definitions to ensure they
follow RFC 7807 specifications, have valid type URIs, and maintain
consistency with the enhanced API response code system.
"""

import os
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import django

# Add the backend directory to Python path
# Script is in: backend/scripts/api-response-docs/validators/
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
from apps.core.codes import BaseAPICodeMixin


def validate_problem_type_structure(problem: dict[str, Any], slug: str) -> list[str]:
    """Validate the structure and content of a problem type definition."""
    errors = []

    # Required fields validation
    required_fields = ["slug", "type", "title", "default_status", "i18n_key"]
    for field in required_fields:
        if field not in problem:
            errors.append(f"Problem type '{slug}' missing required field: {field}")

    # Optional but recommended fields
    recommended_fields = ["description"]
    missing_recommended = [
        field for field in recommended_fields if field not in problem
    ]
    if missing_recommended:
        errors.append(
            f"Problem type '{slug}' missing recommended fields: {', '.join(missing_recommended)}"
        )

    return errors


def validate_problem_type_urls(problem_types: dict[str, dict[str, Any]]) -> list[str]:
    """Validate that all problem type URLs follow the expected format."""
    errors = []

    for slug, problem in problem_types.items():
        if "type" not in problem:
            continue

        type_uri = problem["type"]
        expected_suffix = f"/problems/{slug}"

        # Check that URI ends with /problems/{slug}
        if not type_uri.endswith(expected_suffix):
            errors.append(
                f"Problem type '{slug}' URI '{type_uri}' should end with '{expected_suffix}'"
            )

        # Check that URI starts with https://
        if not type_uri.startswith("https://"):
            errors.append(
                f"Problem type '{slug}' URI '{type_uri}' should start with 'https://'"
            )

        # Validate URL structure
        try:
            parsed = urlparse(type_uri)
            if not parsed.netloc:
                errors.append(
                    f"Problem type '{slug}' URI '{type_uri}' has invalid domain"
                )
            if not parsed.path:
                errors.append(
                    f"Problem type '{slug}' URI '{type_uri}' has invalid path"
                )
        except Exception as e:
            errors.append(f"Problem type '{slug}' URI '{type_uri}' is malformed: {e}")

    return errors


def validate_status_codes(problem_types: dict[str, dict[str, Any]]) -> list[str]:
    """Validate HTTP status codes in problem type definitions."""
    errors = []

    for slug, problem in problem_types.items():
        if "default_status" not in problem:
            continue

        status = problem["default_status"]

        # Check type
        if not isinstance(status, int):
            errors.append(
                f"Problem type '{slug}' default_status must be an integer, got {type(status).__name__}"
            )
            continue

        # Check range
        if not (100 <= status <= 599):
            errors.append(
                f"Problem type '{slug}' has invalid default_status: {status} (must be 100-599)"
            )

        # Check that error problem types have error status codes
        if status < 400:
            # This might be a success problem type (less common but valid)
            pass  # We'll just note this for now

        # Check common status code usage
        common_statuses = {400, 401, 403, 404, 409, 422, 429, 500, 502, 503}
        if status not in common_statuses:
            errors.append(
                f"Problem type '{slug}' uses uncommon status code {status} - verify this is intentional"
            )

    return errors


def validate_i18n_keys(problem_types: dict[str, dict[str, Any]]) -> list[str]:
    """Validate i18n key format and consistency."""
    errors = []
    used_keys = set()

    for slug, problem in problem_types.items():
        if "i18n_key" not in problem:
            continue

        i18n_key = problem["i18n_key"]

        # Check format (should be dot-separated)
        if not isinstance(i18n_key, str) or not i18n_key:
            errors.append(f"Problem type '{slug}' i18n_key must be a non-empty string")
            continue

        # Check for duplicates
        if i18n_key in used_keys:
            errors.append(f"Problem type '{slug}' has duplicate i18n_key: {i18n_key}")
        used_keys.add(i18n_key)

        # Check format conventions
        if not i18n_key.replace("_", "").replace(".", "").isalnum():
            errors.append(
                f"Problem type '{slug}' i18n_key '{i18n_key}' contains invalid characters"
            )

        # Recommend format
        if not (
            "." in i18n_key and i18n_key.startswith(("error", "errors", "problem"))
        ):
            errors.append(
                f"Problem type '{slug}' i18n_key '{i18n_key}' should follow pattern 'errors.category.type'"
            )

    return errors


def validate_associated_codes(
    problem_types: dict[str, dict[str, Any]], all_codes: set[str]
) -> list[str]:
    """Validate that associated codes exist and are properly formatted."""
    errors = []

    for slug, problem in problem_types.items():
        if "codes" not in problem:
            continue

        codes = problem["codes"]

        # Check type
        if not isinstance(codes, list):
            errors.append(f"Problem type '{slug}' codes must be a list")
            continue

        # Check each code
        for code in codes:
            if not isinstance(code, str):
                errors.append(f"Problem type '{slug}' contains non-string code: {code}")
                continue

            # Validate code format
            if not BaseAPICodeMixin.validate_code(code):
                errors.append(
                    f"Problem type '{slug}' contains invalid code format: {code}"
                )
                continue

            # Check that code exists in registry
            if code not in all_codes:
                errors.append(f"Problem type '{slug}' references unknown code: {code}")

            # Check status code consistency
            parts = code.split("-")
            if len(parts) >= 4:
                try:
                    code_status = int(parts[-1])
                    problem_status = problem.get("default_status")
                    if problem_status and abs(code_status - problem_status) > 50:
                        errors.append(
                            f"Problem type '{slug}' status {problem_status} inconsistent with code {code} status {code_status}"
                        )
                except ValueError:
                    pass  # Already caught by format validation

    return errors


def check_problem_type_coverage(
    problem_types: dict[str, dict[str, Any]], all_codes: set[str]
) -> list[str]:
    """Check coverage of error codes by problem types."""
    warnings = []

    # Get all codes referenced by problem types
    referenced_codes = set()
    for problem in problem_types.values():
        if "codes" in problem:
            referenced_codes.update(problem["codes"])

    # Find error codes not referenced by any problem type
    error_codes = {
        code
        for code in all_codes
        if not code.endswith(("-200", "-201", "-202", "-204"))
    }
    unreferenced_errors = error_codes - referenced_codes

    if unreferenced_errors:
        warnings.append(
            f"Found {len(unreferenced_errors)} error codes not associated with problem types:"
        )
        for code in sorted(unreferenced_errors):
            warnings.append(f"  - {code}")

    return warnings


def analyze_problem_type_distribution(problem_types: dict[str, dict[str, Any]]) -> dict:
    """Analyze the distribution and patterns of problem types."""
    analysis = {
        "total_problem_types": len(problem_types),
        "status_distribution": {},
        "apps_covered": set(),
        "common_patterns": {},
        "type_domains": set(),
    }

    for slug, problem in problem_types.items():
        # Status distribution
        status = problem.get("default_status", 0)
        analysis["status_distribution"][status] = (
            analysis["status_distribution"].get(status, 0) + 1
        )

        # Extract domain from type URI
        if "type" in problem:
            try:
                from urllib.parse import urlparse

                domain = urlparse(problem["type"]).netloc
                analysis["type_domains"].add(domain)
            except:
                pass

        # Extract app patterns from associated codes
        if "codes" in problem:
            for code in problem["codes"]:
                parts = code.split("-")
                if len(parts) >= 2:
                    analysis["apps_covered"].add(parts[1])

    return analysis


def main():
    """Main validation function."""
    print("Validating problem types...")
    print("=" * 60)

    try:
        # Load the registry
        REGISTRY.load()

        problem_types = REGISTRY.problem_types
        all_codes = REGISTRY.codes

        # Run all validations
        all_errors = []

        # Structure validation
        for slug, problem in problem_types.items():
            all_errors.extend(validate_problem_type_structure(problem, slug))

        # URL validation
        all_errors.extend(validate_problem_type_urls(problem_types))

        # Status code validation
        all_errors.extend(validate_status_codes(problem_types))

        # I18n key validation
        all_errors.extend(validate_i18n_keys(problem_types))

        # Associated codes validation
        all_errors.extend(validate_associated_codes(problem_types, all_codes))

        # Coverage analysis
        coverage_warnings = check_problem_type_coverage(problem_types, all_codes)

        # Distribution analysis
        analysis = analyze_problem_type_distribution(problem_types)

        # Report results
        if all_errors:
            print("✗ Problem type validation failed:")
            for error in all_errors:
                print(f"  - {error}")
            return 1

        print("✓ Problem type validation successful!")
        print("\nAnalysis Results:")
        print(f"  - Total problem types: {analysis['total_problem_types']}")
        print(
            f"  - Status codes used: {sorted(analysis['status_distribution'].keys())}"
        )
        print(f"  - Apps covered: {sorted(analysis['apps_covered'])}")
        print(f"  - Type domains: {sorted(analysis['type_domains'])}")

        # Show status distribution
        print("\nStatus Code Distribution:")
        for status, count in sorted(analysis["status_distribution"].items()):
            print(f"  - {status}: {count} problem types")

        # Show coverage warnings
        if coverage_warnings:
            print("\nCoverage Analysis:")
            for warning in coverage_warnings[:5]:  # Limit to first 5 warnings
                print(f"  ⚠️  {warning}")
            if len(coverage_warnings) > 5:
                print(f"  ... and {len(coverage_warnings) - 5} more warnings")

        # Show details if verbose
        if "--verbose" in sys.argv or "-v" in sys.argv:
            print("\nDetailed Problem Types:")
            for slug, problem in sorted(problem_types.items()):
                print(f"\n  {slug}:")
                print(f"    Type: {problem['type']}")
                print(f"    Title: {problem['title']}")
                print(f"    Status: {problem['default_status']}")
                print(f"    I18n: {problem['i18n_key']}")
                if "codes" in problem:
                    print(f"    Codes: {', '.join(problem['codes'])}")

        print("\n🎉 Problem type validation completed successfully!")
        return 0

    except CodeRegistryError as e:
        print(f"✗ Problem type validation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during validation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
