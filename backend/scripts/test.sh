#!/bin/bash

# =============================================================================
# 🧪 Backend Test Execution Script
# =============================================================================
# This script runs the same tests as the CI pipeline with coverage
# Usage: ./scripts/test.sh [--coverage] [--parallel] [--verbose] [MODULE]
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

# Default configuration
COVERAGE=false
PARALLEL=false
VERBOSE=false
MODULE=""
FAIL_UNDER=75
OUTPUT_FORMAT="term"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --parallel|-p)
            PARALLEL=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --fail-under)
            FAIL_UNDER="$2"
            shift 2
            ;;
        --html)
            OUTPUT_FORMAT="html"
            COVERAGE=true
            shift
            ;;
        --xml)
            OUTPUT_FORMAT="xml"
            COVERAGE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [MODULE]"
            echo ""
            echo "Options:"
            echo "  --coverage, -c     Run with coverage analysis"
            echo "  --parallel, -p     Run tests in parallel"
            echo "  --verbose, -v      Verbose test output"
            echo "  --fail-under N     Coverage threshold (default: 75)"
            echo "  --html             Generate HTML coverage report"
            echo "  --xml              Generate XML coverage report"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                          # Run all tests"
            echo "  $0 --coverage               # Run with coverage"
            echo "  $0 --parallel --coverage    # Parallel tests with coverage"
            echo "  $0 apps.accounts             # Run specific module tests"
            echo "  $0 --html                   # Generate HTML coverage report"
            exit 0
            ;;
        *)
            if [[ -z "$MODULE" ]]; then
                MODULE="$1"
            else
                echo "Unknown option: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Change to project directory
cd "$PROJECT_ROOT"

echo -e "${BLUE}🧪 Backend Test Execution${NC}"
echo -e "${BLUE}=========================${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Coverage: ${COVERAGE}"
echo -e "Parallel: ${PARALLEL}"
echo -e "Verbose: ${VERBOSE}"
if [[ -n "$MODULE" ]]; then
    echo -e "Module: ${MODULE}"
fi
echo ""

# Function to check service availability
check_service() {
    local service_name="$1"
    local check_cmd="$2"
    local icon="$3"

    echo -e "${BLUE}${icon} Checking ${service_name}...${NC}"

    if eval "$check_cmd" &>/dev/null; then
        echo -e "${GREEN}✅ ${service_name} is available${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name} is not available${NC}"
        return 1
    fi
}

# Function to start services if needed
start_services() {
    echo -e "\n${YELLOW}🔧 Service Dependencies${NC}"

    # Check if Docker Compose services are running
    if ! check_service "PostgreSQL" "docker compose -f docker/docker-compose.yml exec -T db pg_isready" "🐘"; then
        echo -e "${YELLOW}🚀 Starting Docker services...${NC}"
        docker compose -f docker/docker-compose.yml up -d db redis

        # Wait for services to be ready
        echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
        sleep 10

        # Check again
        check_service "PostgreSQL" "docker compose -f docker/docker-compose.yml exec -T db pg_isready" "🐘"
    fi

    check_service "Redis" "docker compose -f docker/docker-compose.yml exec -T redis redis-cli ping" "🔴"
}

# Set up environment variables
setup_environment() {
    echo -e "\n${YELLOW}🔧 Environment Setup${NC}"

    export SECRET_KEY="test-secret-key-for-testing"
    export DB_NAME="test_db"
    export DB_USER="test_user"
    export DB_PASSWORD="test_password"
    export DB_HOST="localhost"
    export DB_PORT="5432"
    export REDIS_URL="redis://localhost:6379/0"

    echo -e "${GREEN}✅ Environment variables configured${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "\n${YELLOW}🗃️ Database Migrations${NC}"

    if python manage.py migrate --settings=config.settings.test; then
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${RED}❌ Database migrations failed${NC}"
        return 1
    fi
}

# Build pytest command
build_pytest_command() {
    local cmd="pytest"

    # Add target (module or all tests)
    if [[ -n "$MODULE" ]]; then
        cmd="$cmd $MODULE"
    fi

    # Add basic options
    cmd="$cmd --strict-markers --strict-config --tb=short"

    # Add verbosity
    if [[ "$VERBOSE" == "true" ]]; then
        cmd="$cmd --verbose --durations=10"
    fi

    # Add parallel execution
    if [[ "$PARALLEL" == "true" ]]; then
        cmd="$cmd -n auto"
    fi

    # Add coverage options
    if [[ "$COVERAGE" == "true" ]]; then
        cmd="$cmd --cov=. --cov-report=term-missing --cov-fail-under=$FAIL_UNDER"

        case "$OUTPUT_FORMAT" in
            html)
                cmd="$cmd --cov-report=html"
                ;;
            xml)
                cmd="$cmd --cov-report=xml"
                ;;
        esac
    fi

    # Add JUnit XML for CI compatibility
    cmd="$cmd --junitxml=pytest-report.xml"

    echo "$cmd"
}

# Main execution
main() {
    # Check and start services
    start_services

    # Setup environment
    setup_environment

    # Run migrations
    run_migrations

    # Build and run tests
    echo -e "\n${YELLOW}🧪 Running Tests${NC}"

    local pytest_cmd
    pytest_cmd=$(build_pytest_command)

    echo -e "${BLUE}Command: ${pytest_cmd}${NC}"
    echo ""

    local start_time
    start_time=$(date +%s)

    if eval "$pytest_cmd"; then
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo ""
        echo -e "${GREEN}🎉 Tests completed successfully!${NC}"
        echo -e "${GREEN}⏱️ Duration: ${duration}s${NC}"

        # Show coverage report location if generated
        if [[ "$COVERAGE" == "true" ]]; then
            echo ""
            echo -e "${BLUE}📊 Coverage Reports:${NC}"

            if [[ "$OUTPUT_FORMAT" == "html" ]] && [[ -d "htmlcov" ]]; then
                echo -e "  HTML: file://$(pwd)/htmlcov/index.html"
            fi

            if [[ "$OUTPUT_FORMAT" == "xml" ]] && [[ -f "coverage.xml" ]]; then
                echo -e "  XML: $(pwd)/coverage.xml"
            fi
        fi

        return 0
    else
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo ""
        echo -e "${RED}❌ Tests failed!${NC}"
        echo -e "${RED}⏱️ Duration: ${duration}s${NC}"
        return 1
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo -e "${BLUE}🧹 Cleanup${NC}"

    # Optionally stop services
    if [[ "${STOP_SERVICES:-false}" == "true" ]]; then
        echo -e "${YELLOW}🛑 Stopping Docker services...${NC}"
        docker compose -f docker/docker-compose.yml down
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Run main function
main

echo ""
echo -e "${BLUE}🔗 Related Commands:${NC}"
echo -e "  make test                    # Run this script"
echo -e "  make test-coverage           # Run with coverage"
echo -e "  make test-parallel           # Run in parallel"
echo -e "  make test-verbose            # Run with verbose output"
echo -e "  make test-module MODULE=...  # Test specific module"
