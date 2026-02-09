#!/bin/bash

# =============================================================================
# 🔒 Backend Security Scanning Script
# =============================================================================
# This script runs the same security checks as the CI pipeline
# Usage: ./scripts/security.sh [--format json|text] [--strict]
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
OUTPUT_FORMAT="text"
STRICT_MODE=false
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        --strict)
            STRICT_MODE=true
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
            echo "  --format FORMAT    Output format: text, json (default: text)"
            echo "  --strict           Fail on any security issues"
            echo "  --verbose, -v      Verbose output"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "This script runs:"
            echo "  1. Bandit - Python security linter"
            echo "  2. Safety - Known security vulnerabilities check"
            echo "  3. Pip-audit - Alternative vulnerability scanner"
            echo "  4. Django security check"
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

echo -e "${BLUE}🔒 Backend Security Scanning${NC}"
echo -e "${BLUE}============================${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Output Format: ${OUTPUT_FORMAT}"
echo -e "Strict Mode: ${STRICT_MODE}"
echo ""

# Track overall status
OVERALL_STATUS=0
SECURITY_ISSUES=0

# Function to run security check
run_security_check() {
    local name="$1"
    local cmd="$2"
    local icon="$3"
    local allow_fail="$4"

    echo -e "${BLUE}${icon} Running ${name}...${NC}"

    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${YELLOW}Command: ${cmd}${NC}"
    fi

    local output
    local status

    # Capture both output and exit status
    if output=$(eval "$cmd" 2>&1); then
        status=0
    else
        status=$?
    fi

    if [[ $status -eq 0 ]]; then
        echo -e "${GREEN}✅ ${name} - No issues found${NC}"
        return 0
    else
        if [[ "$allow_fail" == "true" && "$STRICT_MODE" == "false" ]]; then
            echo -e "${YELLOW}⚠️ ${name} - Issues found (non-blocking)${NC}"
            SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
        else
            echo -e "${RED}❌ ${name} - Security issues found${NC}"
            OVERALL_STATUS=1
            SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
        fi

        # Show output if verbose or if issues found
        if [[ "$VERBOSE" == "true" ]] || [[ $status -ne 0 ]]; then
            echo -e "${YELLOW}Output:${NC}"
            echo "$output" | head -50  # Limit output to avoid flooding
            if [[ $(echo "$output" | wc -l) -gt 50 ]]; then
                echo -e "${YELLOW}... (output truncated, run with --verbose for full output)${NC}"
            fi
        fi

        return $status
    fi
}

# Create reports directory
mkdir -p reports

# 1. Bandit Security Linter
echo -e "\n${YELLOW}🔍 Python Security Linting${NC}"

if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    BANDIT_CMD="bandit -r . -f json -o reports/bandit-report.json --exit-zero"
    run_security_check "Bandit (JSON output)" "$BANDIT_CMD" "🔍" "true"

    # Also show summary in text format
    BANDIT_TEXT_CMD="bandit -r . -f txt"
    run_security_check "Bandit (summary)" "$BANDIT_TEXT_CMD" "🔍" "true"
else
    BANDIT_CMD="bandit -r . -f txt"
    run_security_check "Bandit" "$BANDIT_CMD" "🔍" "true"
fi

# 2. Safety - Known Vulnerabilities
echo -e "\n${YELLOW}🛡️ Dependency Vulnerability Check${NC}"

if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    SAFETY_CMD="safety check --json --output reports/safety-report.json --continue-on-error"
    run_security_check "Safety (JSON output)" "$SAFETY_CMD" "🛡️" "true"

    # Also show summary in text format
    SAFETY_TEXT_CMD="safety check --short-report"
    run_security_check "Safety (summary)" "$SAFETY_TEXT_CMD" "🛡️" "true"
else
    SAFETY_CMD="safety check --short-report"
    run_security_check "Safety" "$SAFETY_CMD" "🛡️" "true"
fi

# 3. Pip-audit (alternative vulnerability scanner)
echo -e "\n${YELLOW}🔎 Alternative Vulnerability Check${NC}"

# Check if pip-audit is available
if command -v pip-audit &> /dev/null; then
    if [[ "$OUTPUT_FORMAT" == "json" ]]; then
        PIP_AUDIT_CMD="pip-audit --format=json --output=reports/pip-audit-report.json"
    else
        PIP_AUDIT_CMD="pip-audit --format=columns"
    fi
    run_security_check "pip-audit" "$PIP_AUDIT_CMD" "🔎" "true"
else
    echo -e "${YELLOW}⚠️ pip-audit not available, skipping alternative vulnerability check${NC}"
    echo -e "${BLUE}💡 Install with: pip install pip-audit${NC}"
fi

# 4. Django Security Check
echo -e "\n${YELLOW}🔧 Django Security Check${NC}"

# Set up environment for Django check
export SECRET_KEY="test-secret-key-for-security-check"
export DB_NAME="test_db"
export DB_USER="test_user"
export DB_PASSWORD="test_password"
export DB_HOST="localhost"
export DB_PORT="5432"
export REDIS_URL="redis://localhost:6379/0"

DJANGO_CHECK_CMD="python manage.py check --deploy --settings=config.settings.production"
run_security_check "Django security check" "$DJANGO_CHECK_CMD" "🔧" "true"

# 5. Secret Detection (simple grep-based)
echo -e "\n${YELLOW}🔑 Secret Detection${NC}"

SECRET_PATTERNS=(
    "password\s*=\s*[\"'][^\"']{8,}[\"']"
    "secret\s*=\s*[\"'][^\"']{16,}[\"']"
    "api_key\s*=\s*[\"'][^\"']{16,}[\"']"
    "private_key"
    "BEGIN RSA PRIVATE KEY"
    "BEGIN PRIVATE KEY"
)

SECRET_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" . --exclude-dir=.git --exclude-dir=venv --exclude-dir=htmlcov --exclude="*.pyc" 2>/dev/null; then
        SECRET_FOUND=true
    fi
done

if [[ "$SECRET_FOUND" == "true" ]]; then
    echo -e "${RED}❌ Potential secrets found in code${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    if [[ "$STRICT_MODE" == "true" ]]; then
        OVERALL_STATUS=1
    fi
else
    echo -e "${GREEN}✅ No obvious secrets detected${NC}"
fi

# 6. Docker Security (if Dockerfile exists)
if [[ -f "docker/Dockerfile" ]]; then
    echo -e "\n${YELLOW}🐳 Docker Security Check${NC}"

    # Basic Dockerfile security checks
    DOCKER_ISSUES=()

    # Check for running as root
    if ! grep -q "USER " docker/Dockerfile; then
        DOCKER_ISSUES+=("Dockerfile does not specify a non-root USER")
    fi

    # Check for COPY vs ADD
    if grep -q "ADD " docker/Dockerfile; then
        DOCKER_ISSUES+=("Dockerfile uses ADD instead of COPY (potential security risk)")
    fi

    # Check for latest tag usage
    if grep -q ":latest" docker/Dockerfile; then
        DOCKER_ISSUES+=("Dockerfile uses :latest tag (not reproducible)")
    fi

    if [[ ${#DOCKER_ISSUES[@]} -eq 0 ]]; then
        echo -e "${GREEN}✅ Basic Docker security checks passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Docker security recommendations:${NC}"
        for issue in "${DOCKER_ISSUES[@]}"; do
            echo -e "  - ${issue}"
        done
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
fi

# Generate summary report
echo ""
echo -e "${BLUE}📊 Security Scan Summary${NC}"
echo -e "${BLUE}========================${NC}"

if [[ $SECURITY_ISSUES -eq 0 ]]; then
    echo -e "${GREEN}🎉 No security issues found!${NC}"
    echo -e "${GREEN}✅ Your Django backend appears to be secure${NC}"
elif [[ $OVERALL_STATUS -eq 0 ]]; then
    echo -e "${YELLOW}⚠️ ${SECURITY_ISSUES} security issue(s) found (non-critical)${NC}"
    echo -e "${YELLOW}💡 Review the issues above and consider addressing them${NC}"
else
    echo -e "${RED}❌ ${SECURITY_ISSUES} security issue(s) found${NC}"
    echo -e "${RED}🚨 Critical security issues detected - please address immediately${NC}"
fi

# Show report locations if JSON format
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    echo ""
    echo -e "${BLUE}📋 Detailed Reports:${NC}"
    [[ -f "reports/bandit-report.json" ]] && echo -e "  Bandit: reports/bandit-report.json"
    [[ -f "reports/safety-report.json" ]] && echo -e "  Safety: reports/safety-report.json"
    [[ -f "reports/pip-audit-report.json" ]] && echo -e "  pip-audit: reports/pip-audit-report.json"
fi

echo ""
echo -e "${BLUE}🔗 Related Commands:${NC}"
echo -e "  make security              # Run this script"
echo -e "  make security-json         # Run with JSON output"
echo -e "  make security-strict       # Run in strict mode"
echo -e "  bandit -r . -f txt         # Just run Bandit"
echo -e "  safety check               # Just run Safety"

echo ""
echo -e "${BLUE}💡 Security Recommendations:${NC}"
echo -e "  1. Run security scans regularly"
echo -e "  2. Keep dependencies updated"
echo -e "  3. Use environment variables for secrets"
echo -e "  4. Enable Django security middleware"
echo -e "  5. Use HTTPS in production"
echo -e "  6. Implement proper authentication & authorization"

exit $OVERALL_STATUS
