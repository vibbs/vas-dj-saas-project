#!/usr/bin/env bash
# Pre-commit helper script with auto-fix capabilities
# This script provides better error messages and auto-mitigation for common issues

# Don't exit on error immediately - we want to provide helpful messages
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Log file for detailed errors
LOG_FILE="${PROJECT_ROOT}/.git/pre-commit-errors.log"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

# Clear previous log
echo "=== Pre-commit run at $(date) ===" > "$LOG_FILE"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    echo "[INFO] $1" >> "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

print_separator() {
    echo ""
    echo "-----------------------------------"
    echo ""
}

# Function to check if tools are installed
check_dependencies() {
    local missing_tools=()

    # Check for black
    if ! command -v black &> /dev/null && ! python3 -c "import black" &> /dev/null; then
        missing_tools+=("black")
    fi

    # Check for isort
    if ! command -v isort &> /dev/null && ! python3 -c "import isort" &> /dev/null; then
        missing_tools+=("isort")
    fi

    # Check for ruff
    if ! command -v ruff &> /dev/null; then
        missing_tools+=("ruff")
    fi

    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_warning "Some formatting tools are not installed: ${missing_tools[*]}"
        print_info "To install missing tools, run:"
        echo "  pip install black isort ruff"
        echo "  # OR"
        echo "  uv pip install black isort ruff"
        echo "" >> "$LOG_FILE"
        echo "Missing tools: ${missing_tools[*]}" >> "$LOG_FILE"
        return 1
    fi

    return 0
}

# Function to check Django system
check_django_system() {
    print_info "Running Django system checks..."

    local output
    output=$(python manage.py check 2>&1)
    local exit_code=$?

    echo "$output" >> "$LOG_FILE"

    if [ $exit_code -eq 0 ]; then
        print_success "Django system checks passed"
        return 0
    else
        print_error "Django system check failed"
        echo ""
        echo "Error details:"
        echo "$output" | head -20
        echo ""
        print_warning "Common fixes:"
        echo "  1. Ensure Django environment is set up: source .env"
        echo "  2. Check DJANGO_SETTINGS_MODULE: echo \$DJANGO_SETTINGS_MODULE"
        echo "  3. Start backend services: make start"
        echo "  4. Run detailed check: make check-system"
        echo ""
        echo "Full error log saved to: $LOG_FILE"
        return 1
    fi
}

# Function to check and auto-create migrations
check_migrations() {
    print_info "Checking for missing migrations..."

    local output
    output=$(python manage.py makemigrations --check --dry-run 2>&1)
    local exit_code=$?

    echo "$output" >> "$LOG_FILE"

    if [ $exit_code -eq 0 ]; then
        print_success "No missing migrations"
        return 0
    else
        print_warning "Missing migrations detected"

        # Auto-create if enabled
        if [[ -n "$CI" ]] || [[ "$AUTO_FIX" == "true" ]]; then
            print_info "Auto-creating migrations..."

            local migration_output
            migration_output=$(python manage.py makemigrations 2>&1)
            local migration_exit=$?

            echo "$migration_output" >> "$LOG_FILE"
            echo "$migration_output"

            if [ $migration_exit -eq 0 ]; then
                # Stage the new migration files
                git add apps/*/migrations/*.py 2>/dev/null || true

                print_success "Migrations created and staged for commit"
                print_warning "Please review the generated migrations before pushing"
                echo ""
                echo "To review migrations:"
                echo "  git diff --cached apps/*/migrations/"
                return 0
            else
                print_error "Failed to create migrations"
                echo "$migration_output"
                return 1
            fi
        else
            print_info "To auto-create migrations, run:"
            echo "  python manage.py makemigrations"
            echo "  git add apps/*/migrations/*.py"
            echo ""
            print_info "Or run: AUTO_FIX=true $0"
            return 1
        fi
    fi
}

# Function to run code formatting
format_code() {
    print_info "Checking code formatting..."

    # Get list of staged Python files
    local staged_files
    staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$' | grep -v migrations/ || true)

    if [[ -z "$staged_files" ]]; then
        print_info "No Python files to format"
        return 0
    fi

    echo "Files to format: $staged_files" >> "$LOG_FILE"

    local formatted=false

    # Run black if available
    if command -v black &> /dev/null; then
        print_info "Running black formatter..."
        local black_output
        black_output=$(echo "$staged_files" | xargs black --line-length=88 2>&1)
        local black_exit=$?
        echo "$black_output" >> "$LOG_FILE"

        if [ $black_exit -eq 0 ]; then
            formatted=true
        else
            print_warning "Black formatting had issues (non-critical)"
            echo "$black_output" | head -10
        fi
    elif python3 -c "import black" &> /dev/null; then
        print_info "Running black formatter (via python)..."
        echo "$staged_files" | xargs python3 -m black --line-length=88 2>&1 >> "$LOG_FILE" || true
        formatted=true
    fi

    # Run isort if available
    if command -v isort &> /dev/null; then
        print_info "Running isort..."
        echo "$staged_files" | xargs isort --profile=black --line-length=88 2>&1 >> "$LOG_FILE" || true
        formatted=true
    elif python3 -c "import isort" &> /dev/null; then
        print_info "Running isort (via python)..."
        echo "$staged_files" | xargs python3 -m isort --profile=black --line-length=88 2>&1 >> "$LOG_FILE" || true
        formatted=true
    fi

    # Run ruff if available
    if command -v ruff &> /dev/null; then
        print_info "Running ruff linter..."
        echo "$staged_files" | xargs ruff check --fix 2>&1 >> "$LOG_FILE" || true
        formatted=true
    fi

    # Re-stage formatted files
    if [ "$formatted" = true ]; then
        echo "$staged_files" | xargs git add 2>&1 >> "$LOG_FILE" || true
        print_success "Code formatted and re-staged"
    else
        print_warning "No formatters available - skipping code formatting"
        print_info "Install formatters: pip install black isort ruff"
    fi

    return 0
}

# Function to show setup instructions if tools are missing
show_setup_instructions() {
    print_separator
    print_error "Pre-commit checks cannot run - missing dependencies"
    echo ""
    echo "To set up pre-commit hooks properly:"
    echo ""
    echo "1️⃣  Install Python formatting tools:"
    echo "   pip install black isort ruff"
    echo "   # OR with uv (faster):"
    echo "   uv pip install black isort ruff"
    echo ""
    echo "2️⃣  Install pre-commit (optional, for automatic hooks):"
    echo "   pip install pre-commit"
    echo "   make pre-commit-install"
    echo ""
    echo "3️⃣  Alternatively, skip hooks for this commit:"
    echo "   git commit --no-verify -m 'Your message'"
    echo ""
    echo "📖 Full guide: backend/PRE-COMMIT-GUIDE.md"
    echo "🔧 Quick help: cat backend/.git-hooks-error-help.txt"
    print_separator
}

# Function to show error help on failure
show_error_help() {
    local error_type="$1"

    print_separator
    echo ""
    cat "${PROJECT_ROOT}/.git-hooks-error-help.txt" 2>/dev/null || {
        echo "📖 Troubleshooting guide: backend/TROUBLESHOOTING-GIT-HOOKS.md"
        echo "🔧 Quick fix: cd backend && make pre-commit-setup"
    }
    echo ""
    print_separator
}

# Main execution
main() {
    cd "$PROJECT_ROOT" || exit 1

    print_info "Running pre-commit checks..."
    echo ""

    # Check if critical dependencies are available
    local has_python=false
    if command -v python &> /dev/null || command -v python3 &> /dev/null; then
        has_python=true
    fi

    if [ "$has_python" = false ]; then
        print_error "Python is not available"
        show_setup_instructions
        exit 1
    fi

    # Step 1: Check dependencies (non-blocking)
    check_dependencies || print_warning "Some tools missing - will skip formatting"
    echo ""

    # Step 2: Format code (non-blocking)
    format_code
    echo ""

    # Step 3: Check Django system (blocking)
    if ! check_django_system; then
        print_separator
        print_error "❌ Pre-commit checks failed at Django system check"
        echo ""
        echo "Error log saved to: $LOG_FILE"
        echo "View errors: cat $LOG_FILE"
        show_error_help "django"
        exit 1
    fi
    echo ""

    # Step 4: Check migrations (blocking or auto-fix)
    if ! check_migrations; then
        print_separator
        print_error "❌ Pre-commit checks failed at migration check"
        echo ""
        print_info "Quick fixes:"
        echo "  • Auto-fix: AUTO_FIX=true ./scripts/pre-commit-helper.sh"
        echo "  • Manual: python manage.py makemigrations"
        echo "  • Skip: git commit --no-verify"
        echo ""
        echo "Error log saved to: $LOG_FILE"
        show_error_help "migrations"
        exit 1
    fi
    echo ""

    print_separator
    print_success "✅ All pre-commit checks passed! 🎉"
    echo ""
    echo "Log saved to: $LOG_FILE"
    print_separator
    exit 0
}

# Run main function
main "$@"
