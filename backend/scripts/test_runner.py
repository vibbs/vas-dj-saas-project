#!/usr/bin/env python3
"""
Test runner script for the VAS-DJ SaaS project.
Provides convenient shortcuts for running different types of tests.
"""

import sys
import subprocess
import argparse
from pathlib import Path


def run_command(cmd, description=""):
    """Run a shell command and return the result."""
    if description:
        print(f"\n🧪 {description}")
        print("=" * len(description))
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False)
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Test runner for VAS-DJ SaaS project")
    parser.add_argument("--setup", action="store_true", help="Setup test environment")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--app", choices=["accounts", "organizations", "billing", "email", "core"], help="Test specific app")
    parser.add_argument("--marker", "-m", help="Run tests with specific marker")
    parser.add_argument("--pattern", "-k", help="Run tests matching pattern")
    parser.add_argument("--clean", action="store_true", help="Clean test environment")
    
    args = parser.parse_args()
    
    if args.setup:
        return run_command(["make", "test-build"], "Setting up test environment")
    
    if args.clean:
        return run_command(["make", "test-clean"], "Cleaning test environment")
    
    # Build pytest command
    cmd = ["docker", "compose", "-f", "./docker/docker-compose.test.yml", "run", "--rm", "web", "pytest"]
    
    if args.verbose:
        cmd.append("-v")
    
    if args.coverage:
        cmd.extend(["--cov=apps", "--cov-report=term-missing", "--cov-report=html"])
    
    if args.parallel:
        cmd.extend(["-n", "auto"])
    
    if args.marker:
        cmd.extend(["-m", args.marker])
    
    if args.pattern:
        cmd.extend(["-k", args.pattern])
    
    if args.app:
        cmd.append(f"apps/{args.app}/tests/")
    
    # Run the tests
    description = "Running tests"
    if args.app:
        description += f" for {args.app} app"
    if args.marker:
        description += f" with marker '{args.marker}'"
    if args.pattern:
        description += f" matching '{args.pattern}'"
    
    success = run_command(cmd, description)
    
    if args.coverage and success:
        print("\n📊 Coverage report generated in htmlcov/ directory")
        print("Open htmlcov/index.html in your browser to view the report")
    
    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)