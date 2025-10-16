#!/usr/bin/env python
"""
Focused validation for response code uniqueness and conflict detection.

This script performs deep analysis of code uniqueness, potential conflicts,
and provides suggestions for maintaining a clean code registry.
"""

import os
import sys
from collections import defaultdict
from importlib import import_module
from pathlib import Path
from typing import Any

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

from django.conf import settings

from apps.core.code_registry import REGISTRY, CodeRegistryError
from apps.core.codes import BaseAPICodeMixin


def scan_code_definitions() -> dict[str, list[dict[str, Any]]]:
    """Scan all apps for code definitions and track their sources."""
    code_definitions = defaultdict(list)

    for app_name in settings.INSTALLED_APPS:
        try:
            codes_module = import_module(f"{app_name}.codes")
        except ModuleNotFoundError:
            continue
        except Exception as e:
            print(f"Warning: Error importing codes from {app_name}: {e}")
            continue

        module_path = Path(codes_module.__file__)

        for attr_name in dir(codes_module):
            if attr_name.startswith("_"):
                continue

            attr_value = getattr(codes_module, attr_name)

            # Case 1: Enum subclass of BaseAPICodeMixin (but not BaseAPICodeMixin itself)
            if (
                isinstance(attr_value, type)
                and issubclass(attr_value, BaseAPICodeMixin)
                and attr_value is not BaseAPICodeMixin
                and hasattr(attr_value, "__members__")
            ):  # Ensure it's an actual enum
                for member in attr_value:
                    code_definitions[member.value].append(
                        {
                            "source": f"{app_name}.codes.{attr_name}.{member.name}",
                            "app": app_name,
                            "enum_class": attr_name,
                            "enum_member": member.name,
                            "file_path": str(module_path),
                            "definition_type": "enum",
                        }
                    )

            # Case 2: Plain string constant that looks like a code
            elif isinstance(attr_value, str) and BaseAPICodeMixin.validate_code(
                attr_value
            ):
                code_definitions[attr_value].append(
                    {
                        "source": f"{app_name}.codes.{attr_name}",
                        "app": app_name,
                        "constant_name": attr_name,
                        "file_path": str(module_path),
                        "definition_type": "constant",
                    }
                )

    return code_definitions


def detect_exact_duplicates(code_definitions: dict[str, list[dict]]) -> list[dict]:
    """Detect codes that are defined multiple times."""
    duplicates = []

    for code, definitions in code_definitions.items():
        if len(definitions) > 1:
            duplicates.append(
                {"code": code, "count": len(definitions), "definitions": definitions}
            )

    return duplicates


def detect_similar_codes(codes: set[str]) -> list[dict]:
    """Detect codes that are very similar and might indicate confusion."""
    similar_groups = []
    codes_list = sorted(list(codes))

    for i, code1 in enumerate(codes_list):
        similar_codes = []

        for code2 in codes_list[i + 1 :]:
            # Same module and similar usecase
            parts1 = code1.split("-")
            parts2 = code2.split("-")

            if len(parts1) >= 3 and len(parts2) >= 3:
                if (
                    parts1[1] == parts2[1]  # Same module
                    and parts1[-1] != parts2[-1]  # Different HTTP code
                    and parts1[2] == parts2[2]
                ):  # Same usecase
                    similar_codes.append(code2)

        if similar_codes:
            similar_groups.append(
                {
                    "base_code": code1,
                    "similar_codes": similar_codes,
                    "potential_issue": "Same usecase with different HTTP codes",
                }
            )

    return similar_groups


def detect_pattern_violations(codes: set[str]) -> list[dict]:
    """Detect codes that violate expected patterns."""
    violations = []

    # Pattern analysis
    module_usecases = defaultdict(set)
    usecase_statuses = defaultdict(set)

    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1]
            usecase = parts[2]
            status = int(parts[-1])

            module_usecases[module].add(usecase)
            usecase_statuses[usecase].add(status)

    # Detect unusual status codes for common use cases
    expected_statuses = {
        "OK": {200},
        "CREATED": {201},
        "LIST": {200},
        "LOGIN": {200},
        "LOGOUT": {200},
        "REGISTER": {201},
        "NOTFOUND": {404},
        "EXISTS": {409},
        "CREDS": {401},
        "INACTIVE": {403},
        "EXPIRED": {401},
        "DENIED": {403},
        "VAL": {400, 422},
        "RATE": {429},
        "ERR": {500},
        "UNAVAIL": {503},
    }

    for usecase, statuses in usecase_statuses.items():
        if usecase in expected_statuses:
            expected = expected_statuses[usecase]
            unexpected = statuses - expected
            if unexpected:
                violations.append(
                    {
                        "type": "unusual_status",
                        "usecase": usecase,
                        "unexpected_statuses": list(unexpected),
                        "expected_statuses": list(expected),
                        "message": f"Use case '{usecase}' has unusual status codes: {unexpected}",
                    }
                )

    return violations


def analyze_module_distribution(codes: set[str]) -> dict[str, Any]:
    """Analyze how codes are distributed across modules."""
    module_stats = defaultdict(
        lambda: {
            "total": 0,
            "success": 0,
            "error": 0,
            "usecases": set(),
            "statuses": set(),
        }
    )

    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1]
            usecase = parts[2]
            status = int(parts[-1])

            module_stats[module]["total"] += 1
            module_stats[module]["usecases"].add(usecase)
            module_stats[module]["statuses"].add(status)

            if 200 <= status < 300:
                module_stats[module]["success"] += 1
            else:
                module_stats[module]["error"] += 1

    # Convert sets to lists for JSON serialization
    for module in module_stats:
        module_stats[module]["usecases"] = sorted(
            list(module_stats[module]["usecases"])
        )
        module_stats[module]["statuses"] = sorted(
            list(module_stats[module]["statuses"])
        )

    return dict(module_stats)


def suggest_code_improvements(codes: set[str], code_definitions: dict) -> list[dict]:
    """Suggest improvements to the code organization."""
    suggestions = []

    # Analyze missing patterns
    module_patterns = defaultdict(set)
    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1]
            usecase = parts[2]
            status = int(parts[-1])
            module_patterns[module].add((usecase, status))

    # Suggest missing standard patterns
    standard_patterns = [
        ("OK", 200),
        ("CREATED", 201),
        ("LIST", 200),
        ("NOTFOUND", 404),
        ("VAL", 400),
        ("ERR", 500),
    ]

    for module in module_patterns:
        if module in ["GEN", "CORE"]:  # Skip generic modules
            continue

        existing_patterns = module_patterns[module]
        for usecase, status in standard_patterns:
            if (usecase, status) not in existing_patterns:
                # Check if there's a similar pattern
                has_similar = any(
                    existing_usecase == usecase
                    for existing_usecase, _ in existing_patterns
                )
                if (
                    not has_similar and len(existing_patterns) > 2
                ):  # Only for modules with some codes
                    suggestions.append(
                        {
                            "type": "missing_standard_pattern",
                            "module": module,
                            "suggested_code": f"VDJ-{module}-{usecase}-{status}",
                            "message": f"Consider adding standard {usecase} pattern for {module} module",
                        }
                    )

    return suggestions


def check_cross_module_consistency(codes: set[str]) -> list[dict]:
    """Check consistency of patterns across modules."""
    issues = []

    # Group by usecase across modules
    usecase_modules = defaultdict(set)
    for code in codes:
        parts = code.split("-")
        if len(parts) >= 4:
            module = parts[1]
            usecase = parts[2]
            usecase_modules[usecase].add(module)

    # Find usecases that appear in many modules but not all
    total_modules = len(
        set(code.split("-")[1] for code in codes if len(code.split("-")) >= 2)
    )

    for usecase, modules in usecase_modules.items():
        if len(modules) > 1 and len(modules) < total_modules:
            # This usecase is used by some but not all modules
            missing_modules = set()
            for code in codes:
                parts = code.split("-")
                if len(parts) >= 2:
                    module = parts[1]
                    if module not in modules and module not in ["GEN", "CORE"]:
                        missing_modules.add(module)

            if missing_modules:
                issues.append(
                    {
                        "type": "inconsistent_usecase",
                        "usecase": usecase,
                        "has_modules": sorted(list(modules)),
                        "missing_modules": sorted(list(missing_modules)),
                        "message": f"Use case '{usecase}' is inconsistent across modules",
                    }
                )

    return issues


def main():
    """Main uniqueness validation function."""
    print("Validating response code uniqueness and consistency...")
    print("=" * 70)

    try:
        # Load the registry
        REGISTRY.load()
        codes = REGISTRY.codes

        # Scan code definitions with source tracking
        print("Scanning code definitions...")
        code_definitions = scan_code_definitions()

        # Run all uniqueness checks
        all_issues = []

        # 1. Exact duplicates
        duplicates = detect_exact_duplicates(code_definitions)
        if duplicates:
            all_issues.extend(duplicates)
            print(f"✗ Found {len(duplicates)} duplicate codes")
            for dup in duplicates:
                print(f"  Code '{dup['code']}' defined {dup['count']} times:")
                for defn in dup["definitions"]:
                    print(f"    - {defn['source']} ({defn['file_path']})")
        else:
            print("✓ No exact duplicate codes found")

        # 2. Similar codes
        similar_codes = detect_similar_codes(codes)
        if similar_codes:
            print(f"\n⚠️  Found {len(similar_codes)} groups of similar codes:")
            for similar in similar_codes[:5]:  # Show first 5
                print(
                    f"  {similar['base_code']} similar to: {', '.join(similar['similar_codes'])}"
                )
            if len(similar_codes) > 5:
                print(f"  ... and {len(similar_codes) - 5} more groups")

        # 3. Pattern violations
        violations = detect_pattern_violations(codes)
        if violations:
            print(f"\n⚠️  Found {len(violations)} pattern violations:")
            for violation in violations:
                print(f"  - {violation['message']}")

        # 4. Module distribution analysis
        module_dist = analyze_module_distribution(codes)
        print("\nModule Distribution:")
        for module, stats in sorted(module_dist.items()):
            print(
                f"  {module}: {stats['total']} codes ({stats['success']} success, {stats['error']} error)"
            )

        # 5. Cross-module consistency
        consistency_issues = check_cross_module_consistency(codes)
        if consistency_issues:
            print(f"\n⚠️  Found {len(consistency_issues)} consistency issues:")
            for issue in consistency_issues[:3]:  # Show first 3
                print(f"  - {issue['message']}")

        # 6. Improvement suggestions
        suggestions = suggest_code_improvements(codes, code_definitions)
        if suggestions and ("--suggestions" in sys.argv or "--verbose" in sys.argv):
            print(f"\nSuggested Improvements ({len(suggestions)}):")
            for suggestion in suggestions[:5]:  # Show first 5
                print(f"  💡 {suggestion['message']}")

        # Summary
        total_issues = len(all_issues)
        if total_issues > 0:
            print(
                f"\n✗ Uniqueness validation failed with {total_issues} critical issues"
            )
            return 1

        print("\n✓ Code uniqueness validation successful!")
        print(f"  - Total codes analyzed: {len(codes)}")
        print(f"  - Code sources tracked: {len(code_definitions)}")
        print(f"  - Modules covered: {len(module_dist)}")

        if similar_codes or violations or consistency_issues:
            print(
                f"  - Warnings: {len(similar_codes + violations + consistency_issues)} (non-critical)"
            )

        return 0

    except CodeRegistryError as e:
        print(f"✗ Uniqueness validation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during validation: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
