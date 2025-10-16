#!/usr/bin/env python
"""
Main entry point for API Response Code Documentation System.

This script provides a unified interface for all API response code operations:
validation, documentation generation, registry exports, and OpenAPI integration.
"""

import argparse
import subprocess
import sys
from pathlib import Path


def get_script_path(script_name: str, category: str = None) -> Path:
    """Get the full path to a script file."""
    base_dir = Path(__file__).parent / "api-response-docs"

    if category:
        return base_dir / category / script_name
    else:
        # Try to find the script in any subdirectory
        for subdir in ["validators", "generators"]:
            script_path = base_dir / subdir / script_name
            if script_path.exists():
                return script_path

        # Check the api-response-docs root
        return base_dir / script_name


def run_script(script_path: Path, args: list[str] = None) -> int:
    """Run a script and return its exit code."""
    if not script_path.exists():
        print(f"Error: Script not found: {script_path}")
        return 1

    cmd = [sys.executable, str(script_path)]
    if args:
        cmd.extend(args)

    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode
    except Exception as e:
        print(f"Error running script: {e}")
        return 1


def validate_command(args) -> int:
    """Handle validation commands."""
    if args.all:
        # Run comprehensive validation
        script_path = get_script_path("run_all_validations.py")
        script_args = []
        if args.verbose:
            script_args.append("--verbose")
        if args.report:
            script_args.append("--report")
        return run_script(script_path, script_args)

    elif args.codes:
        # Validate response codes
        script_path = get_script_path("validate_response_codes.py", "validators")
        script_args = ["--verbose"] if args.verbose else []
        return run_script(script_path, script_args)

    elif args.uniqueness:
        # Validate code uniqueness
        script_path = get_script_path("validate_code_uniqueness.py", "validators")
        script_args = []
        if args.verbose:
            script_args.append("--verbose")
        if args.suggestions:
            script_args.append("--suggestions")
        return run_script(script_path, script_args)

    elif args.problems:
        # Validate problem types
        script_path = get_script_path("validate_problem_types.py", "validators")
        script_args = ["--verbose"] if args.verbose else []
        return run_script(script_path, script_args)

    else:
        print("Error: No validation type specified. Use --help for options.")
        return 1


def generate_command(args) -> int:
    """Handle generation commands."""
    if args.docs:
        # Generate documentation
        script_path = get_script_path("generate_response_docs.py", "generators")
        return run_script(script_path)

    elif args.registry:
        # Generate code registry exports
        script_path = get_script_path("generate_code_registry.py", "generators")
        return run_script(script_path)

    elif args.openapi:
        # Generate OpenAPI integration
        script_path = get_script_path("generate_openapi_integration.py", "generators")
        return run_script(script_path)

    elif args.all:
        # Generate all documentation
        exit_codes = []

        print("Generating API response documentation...")
        script_path = get_script_path("generate_response_docs.py", "generators")
        exit_codes.append(run_script(script_path))

        print("\nGenerating code registry exports...")
        script_path = get_script_path("generate_code_registry.py", "generators")
        exit_codes.append(run_script(script_path))

        print("\nGenerating OpenAPI integration...")
        script_path = get_script_path("generate_openapi_integration.py", "generators")
        exit_codes.append(run_script(script_path))

        # Return 1 if any generation failed
        return 1 if any(code != 0 for code in exit_codes) else 0

    else:
        print("Error: No generation type specified. Use --help for options.")
        return 1


def workflow_command(args) -> int:
    """Handle workflow commands (validate then generate)."""
    print("Running validation and generation workflow...")

    # First, run validation
    validation_script = get_script_path("run_all_validations.py")
    validation_args = []
    if args.verbose:
        validation_args.append("--verbose")

    print("Step 1: Running validations...")
    validation_result = run_script(validation_script, validation_args)

    if validation_result != 0:
        print("\n❌ Validation failed. Skipping generation.")
        return validation_result

    print("\n✓ Validation successful! Proceeding with generation...")

    # Then, run generation
    generation_results = []

    print("\nStep 2: Generating documentation...")
    docs_script = get_script_path("generate_response_docs.py", "generators")
    generation_results.append(run_script(docs_script))

    print("\nStep 3: Generating registry exports...")
    registry_script = get_script_path("generate_code_registry.py", "generators")
    generation_results.append(run_script(registry_script))

    print("\nStep 4: Generating OpenAPI integration...")
    openapi_script = get_script_path("generate_openapi_integration.py", "generators")
    generation_results.append(run_script(openapi_script))

    # Check if all generations succeeded
    failed_generations = sum(1 for result in generation_results if result != 0)

    if failed_generations == 0:
        print("\n🎉 Workflow completed successfully!")
        print("All validations passed and documentation generated.")
        return 0
    else:
        print(f"\n⚠️ Workflow completed with {failed_generations} generation failures.")
        return 1


def list_command(args) -> int:
    """Handle list command to show available scripts."""
    base_dir = Path(__file__).parent / "api-response-docs"

    print("Available API Response Code Scripts:")
    print("=" * 50)

    # List validators
    validators_dir = base_dir / "validators"
    if validators_dir.exists():
        print("\n📋 Validators:")
        for script in sorted(validators_dir.glob("*.py")):
            print(f"  - {script.name}")

    # List generators
    generators_dir = base_dir / "generators"
    if generators_dir.exists():
        print("\n📄 Generators:")
        for script in sorted(generators_dir.glob("*.py")):
            print(f"  - {script.name}")

    # List utilities
    utils_dir = base_dir / "utils"
    if utils_dir.exists():
        print("\n🔧 Utilities:")
        for script in sorted(utils_dir.glob("*.py")):
            print(f"  - {script.name}")

    # List main scripts
    print("\n🏃 Main Scripts:")
    for script in sorted(base_dir.glob("*.py")):
        print(f"  - {script.name}")

    return 0


def create_argument_parser() -> argparse.ArgumentParser:
    """Create and configure the argument parser."""
    parser = argparse.ArgumentParser(
        description="API Response Code Documentation System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s validate --all                    # Run all validations
  %(prog)s validate --codes --verbose        # Validate response codes with details
  %(prog)s generate --docs                   # Generate documentation
  %(prog)s generate --all                    # Generate all exports
  %(prog)s workflow --verbose                # Full validation and generation
  %(prog)s list                             # Show available scripts

For more information, see: ./scripts/api-response-docs/README.md
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Run validation scripts")
    validate_group = validate_parser.add_mutually_exclusive_group(required=True)
    validate_group.add_argument(
        "--all", action="store_true", help="Run all validations"
    )
    validate_group.add_argument(
        "--codes", action="store_true", help="Validate response codes"
    )
    validate_group.add_argument(
        "--uniqueness", action="store_true", help="Validate code uniqueness"
    )
    validate_group.add_argument(
        "--problems", action="store_true", help="Validate problem types"
    )

    validate_parser.add_argument(
        "--verbose", "-v", action="store_true", help="Verbose output"
    )
    validate_parser.add_argument(
        "--report", action="store_true", help="Generate detailed report"
    )
    validate_parser.add_argument(
        "--suggestions", action="store_true", help="Show improvement suggestions"
    )

    # Generate command
    generate_parser = subparsers.add_parser("generate", help="Run generation scripts")
    generate_group = generate_parser.add_mutually_exclusive_group(required=True)
    generate_group.add_argument(
        "--all", action="store_true", help="Generate all documentation"
    )
    generate_group.add_argument(
        "--docs", action="store_true", help="Generate API documentation"
    )
    generate_group.add_argument(
        "--registry", action="store_true", help="Generate code registry exports"
    )
    generate_group.add_argument(
        "--openapi", action="store_true", help="Generate OpenAPI integration"
    )

    # Workflow command
    workflow_parser = subparsers.add_parser(
        "workflow", help="Run validation then generation"
    )
    workflow_parser.add_argument(
        "--verbose", "-v", action="store_true", help="Verbose output"
    )

    # List command
    subparsers.add_parser("list", help="List available scripts")

    return parser


def main():
    """Main entry point."""
    parser = create_argument_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Route to appropriate command handler
    if args.command == "validate":
        return validate_command(args)
    elif args.command == "generate":
        return generate_command(args)
    elif args.command == "workflow":
        return workflow_command(args)
    elif args.command == "list":
        return list_command(args)
    else:
        print(f"Unknown command: {args.command}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
