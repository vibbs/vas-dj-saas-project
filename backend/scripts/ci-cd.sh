#!/bin/bash

# =============================================================================
# 🔄 Complete CI/CD Pipeline Validation Script
# =============================================================================
# This script runs the complete CI/CD pipeline locally
# Usage: ./scripts/ci-cd.sh [--stage STAGE] [--skip-build] [--parallel]
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
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
STAGE="all"
SKIP_BUILD=false
PARALLEL=false
VERBOSE=false
FAIL_FAST=true

# Available stages
AVAILABLE_STAGES=("lint" "test" "coverage" "security" "build")

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --stage)
            STAGE="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --no-fail-fast)
            FAIL_FAST=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --stage STAGE      Run specific stage: lint, test, coverage, security, build, all"
            echo "  --skip-build       Skip the build stage"
            echo "  --parallel         Run tests in parallel"
            echo "  --verbose, -v      Verbose output"
            echo "  --no-fail-fast     Continue on failures (don't stop at first failure)"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "Stages:"
            echo "  lint               Code quality & linting"
            echo "  test               Run tests"
            echo "  coverage           Run tests with coverage"
            echo "  security           Security scanning"
            echo "  build              Build Docker image"
            echo "  all                Run all stages (default)"
            echo ""
            echo "Examples:"
            echo "  $0                            # Run complete pipeline"
            echo "  $0 --stage lint               # Run only linting"
            echo "  $0 --stage test --parallel    # Run tests in parallel"
            echo "  $0 --skip-build               # Run everything except build"
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

echo -e "${PURPLE}🔄 Complete CI/CD Pipeline Validation${NC}"
echo -e "${PURPLE}=====================================${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Stage: ${STAGE}"
echo -e "Skip Build: ${SKIP_BUILD}"
echo -e "Parallel: ${PARALLEL}"
echo -e "Fail Fast: ${FAIL_FAST}"
echo ""

# Track pipeline status
PIPELINE_START_TIME=$(date +%s)
STAGE_RESULTS=()
OVERALL_STATUS=0

# Function to run pipeline stage
run_stage() {
    local stage_name="$1"
    local stage_cmd="$2"
    local stage_icon="$3"
    local stage_desc="$4"

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${stage_icon} Stage: ${stage_name} - ${stage_desc}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    local start_time
    start_time=$(date +%s)

    local status
    if eval "$stage_cmd"; then
        status="✅ PASSED"
        local color="$GREEN"
    else
        status="❌ FAILED"
        local color="$RED"
        OVERALL_STATUS=1

        if [[ "$FAIL_FAST" == "true" ]]; then
            echo -e "${RED}🛑 Stopping pipeline due to failure (fail-fast mode)${NC}"
            echo -e "${YELLOW}💡 Use --no-fail-fast to continue on failures${NC}"
            exit 1
        fi
    fi

    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    STAGE_RESULTS+=("${stage_name}:${status}:${duration}")

    echo -e "${color}${status} ${stage_name} (${duration}s)${NC}"
}

# Function to check if stage should run
should_run_stage() {
    local stage="$1"

    if [[ "$STAGE" == "all" ]]; then
        if [[ "$stage" == "build" && "$SKIP_BUILD" == "true" ]]; then
            return 1
        fi
        return 0
    elif [[ "$STAGE" == "$stage" ]]; then
        return 0
    else
        return 1
    fi
}

# Build stage commands
build_stage_command() {
    local stage="$1"
    local cmd=""

    case "$stage" in
        lint)
            cmd="$SCRIPT_DIR/lint.sh"
            if [[ "$VERBOSE" == "true" ]]; then
                cmd="$cmd --verbose"
            fi
            ;;
        test)
            cmd="$SCRIPT_DIR/test.sh"
            if [[ "$PARALLEL" == "true" ]]; then
                cmd="$cmd --parallel"
            fi
            if [[ "$VERBOSE" == "true" ]]; then
                cmd="$cmd --verbose"
            fi
            ;;
        coverage)
            cmd="$SCRIPT_DIR/test.sh --coverage --html"
            if [[ "$PARALLEL" == "true" ]]; then
                cmd="$cmd --parallel"
            fi
            if [[ "$VERBOSE" == "true" ]]; then
                cmd="$cmd --verbose"
            fi
            ;;
        security)
            cmd="$SCRIPT_DIR/security.sh"
            if [[ "$VERBOSE" == "true" ]]; then
                cmd="$cmd --verbose"
            fi
            ;;
        build)
            cmd="$SCRIPT_DIR/build.sh"
            ;;
        *)
            echo "Unknown stage: $stage"
            return 1
            ;;
    esac

    echo "$cmd"
}

# Show pipeline plan
echo -e "${BLUE}📋 Pipeline Plan${NC}"
echo -e "${BLUE}===============${NC}"

STAGES_TO_RUN=()
for stage in "${AVAILABLE_STAGES[@]}"; do
    if should_run_stage "$stage"; then
        STAGES_TO_RUN+=("$stage")
        echo -e "${GREEN}✓${NC} $stage"
    else
        echo -e "${YELLOW}○${NC} $stage (skipped)"
    fi
done

if [[ ${#STAGES_TO_RUN[@]} -eq 0 ]]; then
    echo -e "${RED}❌ No stages to run${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting Pipeline with ${#STAGES_TO_RUN[@]} stage(s)${NC}"

# Run pipeline stages
for stage in "${STAGES_TO_RUN[@]}"; do
    stage_cmd=$(build_stage_command "$stage")

    case "$stage" in
        lint)
            run_stage "Lint" "$stage_cmd" "🎨" "Code quality & formatting"
            ;;
        test)
            run_stage "Test" "$stage_cmd" "🧪" "Unit & integration tests"
            ;;
        coverage)
            run_stage "Coverage" "$stage_cmd" "📊" "Test coverage analysis"
            ;;
        security)
            run_stage "Security" "$stage_cmd" "🔒" "Security vulnerability scanning"
            ;;
        build)
            run_stage "Build" "$stage_cmd" "🏗️" "Docker image build & validation"
            ;;
    esac
done

# Pipeline summary
PIPELINE_END_TIME=$(date +%s)
TOTAL_DURATION=$((PIPELINE_END_TIME - PIPELINE_START_TIME))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📊 Pipeline Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${BLUE}Total Duration: ${TOTAL_DURATION}s${NC}"
echo ""

# Show stage results
for result in "${STAGE_RESULTS[@]}"; do
    IFS=':' read -r stage_name stage_status stage_duration <<< "$result"

    if [[ "$stage_status" == "✅ PASSED" ]]; then
        color="$GREEN"
    else
        color="$RED"
    fi

    printf "${color}%-12s %s (%ss)${NC}\n" "$stage_name" "$stage_status" "$stage_duration"
done

echo ""

# Overall result
if [[ $OVERALL_STATUS -eq 0 ]]; then
    echo -e "${GREEN}🎉 Pipeline completed successfully!${NC}"
    echo -e "${GREEN}✅ All stages passed${NC}"

    # Show next steps
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "  1. Commit your changes"
    echo -e "  2. Push to trigger CI/CD pipeline"
    echo -e "  3. Monitor deployment"

    # Show artifacts
    echo ""
    echo -e "${BLUE}📁 Generated Artifacts:${NC}"
    [[ -f "pytest-report.xml" ]] && echo -e "  - Test report: pytest-report.xml"
    [[ -d "htmlcov" ]] && echo -e "  - Coverage report: htmlcov/index.html"
    [[ -d "reports" ]] && echo -e "  - Security reports: reports/"

else
    echo -e "${RED}❌ Pipeline failed!${NC}"
    echo -e "${RED}🔍 Check the failed stages above${NC}"

    echo ""
    echo -e "${BLUE}🛠️ Troubleshooting:${NC}"
    echo -e "  1. Fix the issues in failed stages"
    echo -e "  2. Run individual stages: ./scripts/[stage].sh"
    echo -e "  3. Use --verbose for more details"
    echo -e "  4. Check logs and error messages"
fi

echo ""
echo -e "${BLUE}🔗 Available Commands:${NC}"
echo -e "  ./scripts/ci-cd.sh              # Run complete pipeline"
echo -e "  ./scripts/ci-cd.sh --stage lint # Run specific stage"
echo -e "  ./scripts/lint.sh --fix         # Fix code quality issues"
echo -e "  ./scripts/test.sh --coverage    # Run tests with coverage"
echo -e "  ./scripts/security.sh --json    # Security scan with JSON output"
echo -e "  ./scripts/build.sh --push       # Build and push Docker image"

exit $OVERALL_STATUS
