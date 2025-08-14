#!/usr/bin/env python
"""
Comprehensive validation runner for API response code system.

This script runs all validation checks for the enhanced API response code system,
including response codes, problem types, uniqueness checks, and generates reports.
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from typing import List, Dict, Tuple, Any


def get_script_path(script_name: str, category: str = None) -> Path:
    """Get the full path to a script file."""
    base_dir = Path(__file__).parent
    
    if category:
        return base_dir / category / script_name
    else:
        # Try to find the script in any subdirectory
        for subdir in ["validators", "generators"]:
            script_path = base_dir / subdir / script_name
            if script_path.exists():
                return script_path
        
        # Fallback to base directory
        return base_dir / script_name


def run_script(script_path: Path, description: str, args: List[str] = None) -> Tuple[bool, str, float]:
    """Run a validation script and return success status, output, and duration."""
    if not script_path.exists():
        return False, f"Script not found: {script_path}", 0.0
    
    print(f"\n{'='*70}")
    print(f"Running: {description}")
    print(f"Script: {script_path}")
    print(f"{'='*70}")

    start_time = time.time()
    
    try:
        cmd = [sys.executable, str(script_path)]
        if args:
            cmd.extend(args)
            
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        duration = time.time() - start_time
        
        # Print output in real time
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)

        success = result.returncode == 0
        if success:
            print(f"✓ {description} - PASSED ({duration:.2f}s)")
        else:
            print(f"✗ {description} - FAILED ({duration:.2f}s)")
            
        return success, result.stdout + result.stderr, duration

    except subprocess.TimeoutExpired:
        duration = time.time() - start_time
        error_msg = f"Script timed out after 5 minutes"
        print(f"✗ {description} - TIMEOUT ({duration:.2f}s)")
        return False, error_msg, duration
        
    except Exception as e:
        duration = time.time() - start_time
        error_msg = f"Execution error: {e}"
        print(f"✗ {description} - ERROR: {e} ({duration:.2f}s)")
        return False, error_msg, duration


def generate_summary_report(results: List[Dict[str, Any]]) -> str:
    """Generate a summary report of all validation results."""
    total_validations = len(results)
    passed_validations = sum(1 for r in results if r["success"])
    failed_validations = total_validations - passed_validations
    total_duration = sum(r["duration"] for r in results)
    
    report = f"""
# API Response Code Validation Report

**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}
**Total Duration**: {total_duration:.2f} seconds

## Summary

- **Total Validations**: {total_validations}
- **Passed**: {passed_validations} ✓
- **Failed**: {failed_validations} ✗
- **Success Rate**: {(passed_validations/total_validations*100):.1f}%

## Detailed Results

"""

    for result in results:
        status_icon = "✓" if result["success"] else "✗"
        status_text = "PASSED" if result["success"] else "FAILED"
        
        report += f"""
### {status_icon} {result["description"]} - {status_text}

- **Script**: `{result["script_name"]}`
- **Duration**: {result["duration"]:.2f} seconds
- **Category**: {result["category"]}

"""
        
        if not result["success"] and result["output"]:
            # Include error details for failed validations
            report += f"""
**Error Details**:
```
{result["output"][-1000:]}  # Last 1000 characters
```
"""

    # Add recommendations
    if failed_validations > 0:
        report += f"""
## Recommendations

{failed_validations} validation(s) failed. Please review the detailed results above and:

1. Fix any code format violations or duplicates
2. Ensure all problem types follow RFC 7807 specifications  
3. Verify response code uniqueness across the application
4. Check that all error catalogs are properly structured

Re-run this validation after making corrections.
"""
    else:
        report += """
## Status

🎉 **All validations passed!** 

Your API response code system is properly configured and follows all established patterns and standards.

You can now safely:
- Generate documentation with the generator scripts
- Export code registries for client SDKs
- Integrate OpenAPI schema enhancements
"""

    return report


def main():
    """Main validation runner."""
    print("API Response Code System - Comprehensive Validation")
    print("=" * 70)
    print(f"Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Define validation scripts in order of execution
    validations = [
        {
            "script": "validate_response_codes.py",
            "description": "Response Code Validation", 
            "category": "validators",
            "args": ["--verbose"] if "--verbose" in sys.argv else None
        },
        {
            "script": "validate_code_uniqueness.py", 
            "description": "Code Uniqueness Validation",
            "category": "validators",
            "args": ["--suggestions"] if "--verbose" in sys.argv else None
        },
        {
            "script": "validate_problem_types.py",
            "description": "Problem Type Validation",
            "category": "validators", 
            "args": ["--verbose"] if "--verbose" in sys.argv else None
        }
    ]
    
    # Add generation steps if --generate flag is provided
    if "--generate" in sys.argv or "--full" in sys.argv:
        validations.extend([
            {
                "script": "generate_response_docs.py",
                "description": "Response Documentation Generation",
                "category": "generators",
                "args": None
            },
            {
                "script": "generate_code_registry.py", 
                "description": "Code Registry Export Generation",
                "category": "generators",
                "args": None
            },
            {
                "script": "generate_openapi_integration.py",
                "description": "OpenAPI Integration Generation", 
                "category": "generators",
                "args": None
            }
        ])

    all_passed = True
    results = []
    total_start_time = time.time()

    # Run each validation
    for validation in validations:
        script_path = get_script_path(validation["script"], validation["category"])
        
        success, output, duration = run_script(
            script_path, 
            validation["description"],
            validation.get("args")
        )
        
        results.append({
            "script_name": validation["script"],
            "description": validation["description"],
            "category": validation["category"], 
            "success": success,
            "output": output,
            "duration": duration
        })
        
        if not success:
            all_passed = False
            
        # Small delay between scripts
        time.sleep(0.5)

    total_duration = time.time() - total_start_time

    # Generate summary
    print(f"\n{'='*70}")
    print("VALIDATION SUMMARY")
    print(f"{'='*70}")

    for result in results:
        status = "PASSED" if result["success"] else "FAILED"
        icon = "✓" if result["success"] else "✗"
        print(f"{icon} {result['description']}: {status} ({result['duration']:.2f}s)")

    print(f"\nTotal execution time: {total_duration:.2f} seconds")

    # Generate and save detailed report
    if "--report" in sys.argv or not all_passed:
        print(f"\nGenerating detailed report...")
        report = generate_summary_report(results)
        
        report_dir = Path(__file__).parent.parent.parent / "_generated" / "reports"
        report_dir.mkdir(exist_ok=True)
        
        report_path = report_dir / f"api_response_validation_{int(time.time())}.md"
        report_path.write_text(report)
        print(f"Report saved: {report_path}")

    # Final status
    if all_passed:
        print(f"\n🎉 All validations passed! API response code system is valid.")
        
        if "--generate" not in sys.argv and "--full" not in sys.argv:
            print(f"\n💡 Tip: Use --generate flag to also run documentation generators")
            print(f"   Use --full flag to run all validations and generators")
        
        return 0
    else:
        failed_count = len([r for r in results if not r["success"]])
        print(f"\n❌ {failed_count} validation(s) failed. Please fix the issues above.")
        print(f"\n💡 Tips:")
        print(f"   - Use --verbose flag for detailed output")
        print(f"   - Check the generated report for specific issues")
        print(f"   - Run individual validators to focus on specific problems")
        
        return 1


def print_usage():
    """Print usage information."""
    print("""
Usage: python run_all_validations.py [OPTIONS]

Options:
  --verbose     Show verbose output from validation scripts
  --generate    Also run documentation generators after validation
  --full        Run all validations and generators (equivalent to --generate)
  --report      Always generate a detailed report (automatic on failures)
  
Examples:
  python run_all_validations.py                    # Basic validation
  python run_all_validations.py --verbose          # Verbose validation
  python run_all_validations.py --generate         # Validation + generation
  python run_all_validations.py --full --verbose   # Everything with details
""")


if __name__ == "__main__":
    if "--help" in sys.argv or "-h" in sys.argv:
        print_usage()
        sys.exit(0)
        
    sys.exit(main())