#!/usr/bin/env python
"""
Validate API response codes for RFC 7807 compliance and uniqueness.

This script validates all response codes (both success and error) defined across 
the application to ensure they follow the required format and are unique.
"""

import os
import sys
import django
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

# Add the backend directory to Python path if needed
# Script is in: backend/scripts/api-response-docs/validators/
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

# Debug: Print current working directory and Python path
if "--debug" in sys.argv:
    print(f"Working directory: {os.getcwd()}")
    print(f"Backend directory: {backend_dir}")
    print(f"Django settings: {django_settings}")
    print(f"Python path: {sys.path[:3]}...")

django.setup()

from apps.core.code_registry import REGISTRY, CodeRegistryError
from apps.core.codes import BaseAPICodeMixin


def categorize_codes(codes: Set[str]) -> Dict[str, Dict[str, List[str]]]:
    """Categorize codes by app and type (success/error)."""
    categorized = defaultdict(lambda: {"success": [], "error": []})
    
    for code in codes:
        # Extract parts: VDJ-MODULE-USECASE-HTTP
        parts = code.split('-')
        if len(parts) >= 4:
            module = parts[1]
            http_code = int(parts[-1])
            
            if 200 <= http_code < 300:
                categorized[module]["success"].append(code)
            else:
                categorized[module]["error"].append(code)
        else:
            categorized["unknown"]["error"].append(code)
    
    return categorized


def validate_code_patterns(codes: Set[str]) -> List[str]:
    """Validate that all codes follow the expected patterns."""
    errors = []
    
    for code in codes:
        if not BaseAPICodeMixin.validate_code(code):
            errors.append(f"Invalid code format: {code}")
            continue
            
        # Additional pattern validation
        parts = code.split('-')
        if len(parts) < 4:
            errors.append(f"Code has insufficient parts: {code}")
            continue
            
        # Validate HTTP status code
        try:
            http_code = int(parts[-1])
            if not (100 <= http_code <= 599):
                errors.append(f"Invalid HTTP status code in: {code}")
        except ValueError:
            errors.append(f"Non-numeric HTTP status code in: {code}")
    
    return errors


def analyze_code_distribution(categorized_codes: Dict[str, Dict[str, List[str]]]) -> Dict:
    """Analyze the distribution of codes across apps and types."""
    stats = {
        "total_codes": 0,
        "total_success": 0,
        "total_error": 0,
        "apps_with_codes": 0,
        "apps_with_success": 0,
        "apps_with_errors": 0,
        "app_breakdown": {}
    }
    
    for app, codes in categorized_codes.items():
        success_count = len(codes["success"])
        error_count = len(codes["error"])
        total_app_codes = success_count + error_count
        
        if total_app_codes > 0:
            stats["apps_with_codes"] += 1
            stats["total_codes"] += total_app_codes
            stats["total_success"] += success_count
            stats["total_error"] += error_count
            
            if success_count > 0:
                stats["apps_with_success"] += 1
            if error_count > 0:
                stats["apps_with_errors"] += 1
                
            stats["app_breakdown"][app] = {
                "success": success_count,
                "error": error_count,
                "total": total_app_codes
            }
    
    return stats


def detect_potential_conflicts(codes: Set[str]) -> List[str]:
    """Detect potential conflicts or issues in code assignments."""
    conflicts = []
    code_groups = defaultdict(list)
    
    # Group codes by MODULE-USECASE pattern
    for code in codes:
        parts = code.split('-')
        if len(parts) >= 4:
            key = f"{parts[1]}-{parts[2]}"  # MODULE-USECASE
            code_groups[key].append(code)
    
    # Check for multiple HTTP codes for same use case
    for usecase, usecase_codes in code_groups.items():
        if len(usecase_codes) > 3:  # More than 3 might indicate over-specification
            conflicts.append(
                f"Use case '{usecase}' has many codes ({len(usecase_codes)}): {', '.join(sorted(usecase_codes))}"
            )
    
    return conflicts


def main():
    """Main validation function."""
    print("Validating API response codes...")
    print("=" * 60)

    try:
        # Load the registry (this will validate all codes)
        REGISTRY.load()

        # Get all codes
        all_codes = REGISTRY.codes

        # Validate code patterns
        pattern_errors = validate_code_patterns(all_codes)

        # Categorize codes
        categorized = categorize_codes(all_codes)

        # Analyze distribution
        stats = analyze_code_distribution(categorized)

        # Detect potential conflicts
        conflicts = detect_potential_conflicts(all_codes)

        # Report results
        if pattern_errors:
            print("✗ Pattern validation failed:")
            for error in pattern_errors:
                print(f"  - {error}")
            return 1

        print("✓ Pattern validation successful!")
        print("\nCode Distribution Analysis:")
        print(f"  - Total codes: {stats['total_codes']}")
        print(f"  - Success codes (2xx): {stats['total_success']}")
        print(f"  - Error codes (4xx/5xx): {stats['total_error']}")
        print(f"  - Apps with codes: {stats['apps_with_codes']}")

        print("\nPer-App Breakdown:")
        for app, breakdown in sorted(stats["app_breakdown"].items()):
            print(f"  - {app.upper()}: {breakdown['total']} total ({breakdown['success']} success, {breakdown['error']} error)")

        # Show detailed breakdown if verbose
        if "--verbose" in sys.argv or "-v" in sys.argv:
            print("\nDetailed Code Listing:")
            for app, codes in sorted(categorized.items()):
                if codes["success"] or codes["error"]:
                    print(f"\n{app.upper()} App:")
                    if codes["success"]:
                        print(f"  Success codes ({len(codes['success'])}):")
                        for code in sorted(codes["success"]):
                            print(f"    - {code}")
                    if codes["error"]:
                        print(f"  Error codes ({len(codes['error'])}):")
                        for code in sorted(codes["error"]):
                            print(f"    - {code}")

        # Show conflicts if any
        if conflicts:
            print("\nPotential Issues:")
            for conflict in conflicts:
                print(f"  ⚠️  {conflict}")

        # Show problem types summary
        problem_stats = REGISTRY.get_stats()
        print(f"\nProblem Types: {problem_stats['problem_types']} defined")

        print(f"\n🎉 Response code validation completed successfully!")
        return 0

    except CodeRegistryError as e:
        print(f"✗ Response code validation failed: {e}")
        return 1
    except Exception as e:
        print(f"✗ Unexpected error during validation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())