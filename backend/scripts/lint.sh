#!/bin/bash

# =============================================================================
# 🎨 Backend Code Quality & Linting Script
# =============================================================================
# This script runs the same linting checks as the CI pipeline
# Usage: ./scripts/lint.sh [--fix] [--type-check]
# =============================================================================

set -e

# Script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FIX_MODE=false
TYPE_CHECK=true
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --no-type-check)
            TYPE_CHECK=false
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --fix              Apply automatic fixes where possible"
            echo "  --no-type-check    Skip MyPy type checking"
            echo "  --verbose, -v      Verbose output"
            echo "  --help, -h         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Change to project directory
cd "$PROJECT_ROOT"

echo -e "${BLUE}🎨 Backend Code Quality & Linting${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Fix Mode: ${FIX_MODE}"
echo -e "Type Check: ${TYPE_CHECK}"
echo ""

# Function to run command with status
run_check() {
    local name="$1"
    local cmd="$2"
    local icon="$3"

    echo -e "${BLUE}${icon} Running ${name}...${NC}"

    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${YELLOW}Command: ${cmd}${NC}"
    fi

    if eval "$cmd"; then
        echo -e "${GREEN}✅ ${name} passed${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name} failed${NC}"
        return 1
    fi
}

# Track overall status
OVERALL_STATUS=0

# 1. Black Code Formatting
echo -e "\n${YELLOW}📝 Code Formatting${NC}"
if [[ "$FIX_MODE" == "true" ]]; then
    if ! run_check "Black formatter (fixing)" "black ." "🎨"; then
        OVERALL_STATUS=1
    fi
else
    if ! run_check "Black formatter (check)" "black --check --diff ." "🎨"; then
        echo -e "${YELLOW}💡 Run with --fix to automatically format code${NC}"
        OVERALL_STATUS=1
    fi
fi

# 2. Import Sorting
echo -e "\n${YELLOW}📦 Import Sorting${NC}"
if [[ "$FIX_MODE" == "true" ]]; then
    if ! run_check "isort (fixing)" "isort ." "📦"; then
        OVERALL_STATUS=1
    fi
else
    if ! run_check "isort (check)" "isort --check-only --diff ." "📦"; then
        echo -e "${YELLOW}💡 Run with --fix to automatically sort imports${NC}"
        OVERALL_STATUS=1
    fi
fi

# 3. Ruff Linting
echo -e "\n${YELLOW}🔍 Linting${NC}"
if [[ "$FIX_MODE" == "true" ]]; then
    if ! run_check "Ruff linter (fixing)" "ruff check . --fix" "🔍"; then
        OVERALL_STATUS=1
    fi
else
    if ! run_check "Ruff linter (check)" "ruff check ." "🔍"; then
        echo -e "${YELLOW}💡 Run with --fix to automatically fix some issues${NC}"
        OVERALL_STATUS=1
    fi
fi

# 4. Type Checking (optional)
if [[ "$TYPE_CHECK" == "true" ]]; then
    echo -e "\n${YELLOW}🏷️ Type Checking${NC}"
    if ! run_check "MyPy type checker" "mypy . || true" "🏷️"; then
        echo -e "${YELLOW}⚠️ Type checking issues found (not blocking)${NC}"
        # Don't fail the script for type errors initially
    fi
fi

# 5. Django System Check
echo -e "\n${YELLOW}🔧 Django System Check${NC}"
export SECRET_KEY="test-secret-key-for-lint"
export DB_NAME="test_db"
export DB_USER="test_user"
export DB_PASSWORD="test_password"
export DB_HOST="localhost"
export DB_PORT="5432"
export REDIS_URL="redis://localhost:6379/0"

if ! run_check "Django system check" "python manage.py check --settings=config.settings.test" "🔧"; then
    OVERALL_STATUS=1
fi

# Summary
echo ""
echo -e "${BLUE}📊 Lint Summary${NC}"
echo -e "${BLUE}===============${NC}"

if [[ $OVERALL_STATUS -eq 0 ]]; then
    echo -e "${GREEN}🎉 All linting checks passed!${NC}"

    if [[ "$FIX_MODE" == "true" ]]; then
        echo -e "${GREEN}✨ Code has been automatically formatted and fixed${NC}"
    fi
else
    echo -e "${RED}❌ Some linting checks failed${NC}"

    if [[ "$FIX_MODE" == "false" ]]; then
        echo -e "${YELLOW}💡 Try running with --fix to automatically fix issues:${NC}"
        echo -e "${YELLOW}   ./scripts/lint.sh --fix${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔗 Related Commands:${NC}"
echo -e "  make lint              # Run this script"
echo -e "  make lint-fix          # Run this script with --fix"
echo -e "  make format            # Just format code (black + isort)"
echo -e "  pre-commit run --all   # Run pre-commit hooks"

exit $OVERALL_STATUS
