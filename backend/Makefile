.PHONY: build start stop clean test test-verbose test-coverage test-parallel test-build test-clean test-feature-flags test-feature-flags-coverage test-feature-flags-models test-feature-flags-services test-feature-flags-api test-feature-flags-utils test-feature-flags-integration api-validate api-generate api-docs api-workflow api-list api-help help uv-install uv-install-dev uv-venv uv-venv-activate uv-add uv-add-package uv-remove uv-remove-package uv-lock uv-clean dev-setup dev-setup-system

# CI/CD Pipeline Commands
lint:
	@echo "🎨 Running code quality checks..."
	./scripts/lint.sh

lint-fix:
	@echo "🎨 Running code quality checks with auto-fix..."
	./scripts/lint.sh --fix

format:
	@echo "📝 Formatting code..."
	black .
	isort .

test-ci:
	@echo "🧪 Running tests (CI mode)..."
	./scripts/test.sh

test-coverage-ci:
	@echo "📊 Running tests with coverage (CI mode)..."
	./scripts/test.sh --coverage --html

security:
	@echo "🔒 Running security scans..."
	./scripts/security.sh

security-json:
	@echo "🔒 Running security scans with JSON output..."
	./scripts/security.sh --format json

security-strict:
	@echo "🔒 Running security scans in strict mode..."
	./scripts/security.sh --strict

build-docker:
	@echo "🏗️ Building Docker image..."
	./scripts/build.sh

build-push:
	@echo "🏗️ Building and pushing Docker image..."
	./scripts/build.sh --push

ci-pipeline:
	@echo "🔄 Running complete CI pipeline..."
	./scripts/ci-cd.sh

ci-lint:
	@echo "🎨 Running lint stage..."
	./scripts/ci-cd.sh --stage lint

ci-test:
	@echo "🧪 Running test stage..."
	./scripts/ci-cd.sh --stage test

ci-coverage:
	@echo "📊 Running coverage stage..."
	./scripts/ci-cd.sh --stage coverage

ci-security:
	@echo "🔒 Running security stage..."
	./scripts/ci-cd.sh --stage security

ci-build:
	@echo "🏗️ Running build stage..."
	./scripts/ci-cd.sh --stage build

# Pre-commit hooks
pre-commit-setup:
	@echo "🔧 Setting up pre-commit hooks (installs dependencies)..."
	@./scripts/setup-pre-commit.sh

pre-commit-install:
	@echo "🔧 Installing pre-commit hooks..."
	@if command -v pre-commit &> /dev/null; then \
		pre-commit install; \
		pre-commit install --hook-type pre-push; \
	else \
		echo "⚠️  pre-commit not found. Run: make pre-commit-setup"; \
	fi

pre-commit-run:
	@echo "🔧 Running pre-commit hooks..."
	@if command -v pre-commit &> /dev/null; then \
		pre-commit run --all-files; \
	else \
		echo "⚠️  pre-commit not found. Running smart check instead..."; \
		./scripts/pre-commit-helper.sh; \
	fi

pre-commit-check:
	@echo "🔍 Running smart pre-commit checks with auto-fix..."
	@./scripts/pre-commit-helper.sh

pre-commit-check-manual:
	@echo "🔍 Running smart pre-commit checks (manual mode)..."
	@AUTO_FIX=false ./scripts/pre-commit-helper.sh

# UV Package Management
uv-install:
	@echo "📦 Installing dependencies with uv..."
	uv pip install -r pyproject.toml

uv-install-dev:
	@echo "📦 Installing dependencies with uv (in virtual environment)..."
	uv pip install --python .venv/bin/python -r pyproject.toml

uv-venv:
	@echo "🐍 Creating virtual environment with uv..."
	uv venv .venv

uv-venv-activate:
	@echo "🐍 Virtual environment created at .venv"
	@echo "💡 Activate with: source .venv/bin/activate"

uv-add:
	@echo "📦 Add a package with uv..."
	@echo "Usage: make uv-add-package PACKAGE=package_name"

uv-add-package:
	@echo "📦 Adding $(PACKAGE) with uv..."
	uv add $(PACKAGE)

uv-remove:
	@echo "📦 Remove a package with uv..."
	@echo "Usage: make uv-remove-package PACKAGE=package_name"

uv-remove-package:
	@echo "📦 Removing $(PACKAGE) with uv..."
	uv remove $(PACKAGE)

uv-lock:
	@echo "🔒 Creating lockfile with uv..."
	uv lock

uv-clean:
	@echo "🧹 Cleaning uv cache..."
	uv cache clean

# Development setup
dev-setup:
	@echo "🔧 Setting up development environment with uv..."
	uv venv .venv
	@echo "🐍 Virtual environment created at .venv"
	@echo "📦 Installing dependencies..."
	uv pip install --python .venv/bin/python -r pyproject.toml
	@echo "🔧 Setting up pre-commit hooks..."
	.venv/bin/pre-commit install
	.venv/bin/pre-commit install --hook-type pre-push
	@echo "✅ Development environment ready!"
	@echo "💡 Activate virtual environment with: source .venv/bin/activate"

# Legacy dev setup (without virtual environment)
dev-setup-system:
	@echo "🔧 Setting up development environment (system Python)..."
	uv pip install --system -r pyproject.toml
	pre-commit install
	pre-commit install --hook-type pre-push
	@echo "✅ Development environment ready!"

# Environment validation
validate-env:
	@echo "🔍 Validating environment..."
	python --version
	django-admin --version
	docker --version
	@echo "✅ Environment validation complete!"

# Clean up
clean-ci:
	@echo "🧹 Cleaning CI artifacts..."
	rm -f pytest-report.xml
	rm -f coverage.xml
	rm -rf htmlcov/
	rm -rf reports/
	rm -rf .coverage
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	@echo "✅ CI artifacts cleaned!"

# Original build commands

build:
	docker compose -f ./docker/docker-compose.yml  build

start:
	docker compose -f ./docker/docker-compose.yml up

stop:
	docker compose -f ./docker/docker-compose.yml down

clean:
	docker compose -f ./docker/docker-compose.yml down --volumes --rmi all
	docker volume prune -f
	docker network prune -f
	docker system prune -f

migrations:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py makemigrations

migrate:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py migrate

createsuperuser:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py createsuperuser

check-system:
	docker compose -f ./docker/docker-compose.yml run --rm web python manage.py check

# Testing Commands

test-build:
	docker compose -f ./docker/docker-compose.test.yml build

test:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest

test-verbose:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -v

test-coverage:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest --cov=apps --cov-report=term-missing --cov-report=html

test-parallel:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -n auto

test-unit:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m unit

test-integration:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m integration

test-api:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m api

test-models:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m models

test-views:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m views

test-auth:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m auth

test-fast:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m "not slow"

test-slow:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest -m slow

test-accounts:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/accounts/tests/

test-organizations:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/organizations/tests/

test-billing:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/billing/tests/

test-email:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/email_service/tests/

test-core:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/core/tests/

test-feature-flags:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/

test-feature-flags-coverage:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ --cov=apps.feature_flags --cov-report=term-missing --cov-report=html:htmlcov/feature_flags

test-feature-flags-models:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ -k "test_model or TestModel"

test-feature-flags-services:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ -k "test_service or TestService"

test-feature-flags-api:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ -k "test_api or TestAPI or test_view"

test-feature-flags-utils:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ -k "test_util or TestUtil or test_decorator or test_mixin"

test-feature-flags-integration:
	docker compose -f ./docker/docker-compose.test.yml run --rm web pytest apps/feature_flags/tests/ -k "test_integration or TestIntegration"

test-clean:
	docker compose -f ./docker/docker-compose.test.yml down --volumes
	docker volume prune -f

# API Response Code Documentation Commands

api-validate:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py validate --all

api-validate-verbose:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py validate --all --verbose

api-validate-codes:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py validate --codes --verbose

api-validate-uniqueness:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py validate --uniqueness --suggestions

api-validate-problems:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py validate --problems --verbose

api-generate:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py generate --all

api-generate-docs:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py generate --docs

api-generate-registry:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py generate --registry

api-generate-openapi:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py generate --openapi

api-workflow:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py workflow

api-workflow-verbose:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py workflow --verbose

api-docs: api-workflow

api-list:
	docker compose -f ./docker/docker-compose.yml run --rm web python scripts/run_api_docs.py list

# Help command for API response code system
api-help:
	@echo "API Response Code Documentation System"
	@echo "======================================"
	@echo ""
	@echo "Quick Commands:"
	@echo "  api-validate          - Validate all response codes and problem types"
	@echo "  api-generate           - Generate all documentation and exports"
	@echo "  api-docs               - Full workflow: validate then generate (alias for api-workflow)"
	@echo "  api-workflow           - Full workflow: validate then generate"
	@echo "  api-list               - List all available scripts"
	@echo ""
	@echo "Validation Commands:"
	@echo "  api-validate-verbose   - Validate with detailed output"
	@echo "  api-validate-codes     - Validate response code patterns only"
	@echo "  api-validate-uniqueness - Check code uniqueness with suggestions"
	@echo "  api-validate-problems  - Validate problem types (RFC 7807)"
	@echo ""
	@echo "Generation Commands:"
	@echo "  api-generate-docs      - Generate API response documentation"
	@echo "  api-generate-registry  - Generate code registry exports (JSON/YAML/Python/TS)"
	@echo "  api-generate-openapi   - Generate OpenAPI schema components"
	@echo ""
	@echo "Workflow Commands:"
	@echo "  api-workflow-verbose   - Full workflow with detailed output"
	@echo ""
	@echo "Output Locations (all in _generated/):"
	@echo "  _generated/docs/       - API response documentation"
	@echo "  _generated/exports/    - Multi-format registry exports"
	@echo "  _generated/reports/    - Validation reports"
	@echo ""
	@echo "Examples:"
	@echo "  make api-validate      # Quick validation"
	@echo "  make api-docs          # Full workflow"
	@echo "  make api-help          # Show this help"

help: api-help test-help observability-help

# Help command for testing system
test-help:
	@echo "Testing System Commands"
	@echo "======================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  test-build             - Build test Docker containers"
	@echo "  test-clean             - Clean up test containers and volumes"
	@echo ""
	@echo "Basic Test Commands:"
	@echo "  test                   - Run all tests"
	@echo "  test-verbose           - Run tests with verbose output"
	@echo "  test-coverage          - Run tests with coverage report"
	@echo "  test-parallel          - Run tests in parallel (faster)"
	@echo ""
	@echo "Test by Category:"
	@echo "  test-unit              - Run unit tests only"
	@echo "  test-integration       - Run integration tests only"
	@echo "  test-api               - Run API tests only"
	@echo "  test-models            - Run model tests only"
	@echo "  test-views             - Run view tests only"
	@echo "  test-auth              - Run authentication tests only"
	@echo ""
	@echo "Test by Speed:"
	@echo "  test-fast              - Run fast tests (exclude slow tests)"
	@echo "  test-slow              - Run slow tests only"
	@echo ""
	@echo "Test by App:"
	@echo "  test-accounts          - Run accounts app tests"
	@echo "  test-organizations     - Run organizations app tests"
	@echo "  test-billing           - Run billing app tests"
	@echo "  test-email             - Run email service tests"
	@echo "  test-core              - Run core app tests"
	@echo ""
	@echo "Examples:"
	@echo "  make test-build        # Build test environment"
	@echo "  make test              # Run all tests"
	@echo "  make test-coverage     # Run with coverage"
	@echo "  make test-accounts     # Test accounts only"
	@echo "  make test-fast         # Run fast tests only"
	@echo ""
	@echo "Coverage reports are saved to htmlcov/ directory"
	@echo ""
	@echo "============================================="
	@echo "🔄 CI/CD Pipeline Commands"
	@echo "============================================="
	@echo ""
	@echo "Code Quality:"
	@echo "  lint                   - Run code quality checks"
	@echo "  lint-fix               - Run code quality checks with auto-fix"
	@echo "  format                 - Format code (black + isort)"
	@echo ""
	@echo "Testing (CI Mode):"
	@echo "  test-ci                - Run tests in CI mode"
	@echo "  test-coverage-ci       - Run tests with coverage in CI mode"
	@echo ""
	@echo "Security:"
	@echo "  security               - Run security scans"
	@echo "  security-json          - Run security scans with JSON output"
	@echo "  security-strict        - Run security scans in strict mode"
	@echo ""
	@echo "Build & Docker:"
	@echo "  build-docker           - Build Docker image"
	@echo "  build-push             - Build and push Docker image"
	@echo ""
	@echo "Complete Pipeline:"
	@echo "  ci-pipeline            - Run complete CI pipeline"
	@echo "  ci-lint                - Run lint stage only"
	@echo "  ci-test                - Run test stage only"
	@echo "  ci-coverage            - Run coverage stage only"
	@echo "  ci-security            - Run security stage only"
	@echo "  ci-build               - Run build stage only"
	@echo ""
	@echo "Development Setup:"
	@echo "  dev-setup              - Setup development environment with uv (recommended)"
	@echo "  dev-setup-system       - Setup development environment (system Python)"
	@echo "  pre-commit-install     - Install pre-commit hooks"
	@echo "  pre-commit-run         - Run pre-commit hooks"
	@echo "  validate-env           - Validate environment setup"
	@echo ""
	@echo "UV Package Management:"
	@echo "  uv-venv                - Create virtual environment with uv"
	@echo "  uv-install             - Install dependencies with uv (system Python)"
	@echo "  uv-install-dev         - Install dependencies with uv (in virtual environment)"
	@echo "  uv-add-package         - Add a package (Usage: make uv-add-package PACKAGE=name)"
	@echo "  uv-remove-package      - Remove a package (Usage: make uv-remove-package PACKAGE=name)"
	@echo "  uv-lock                - Update lockfile"
	@echo "  uv-clean               - Clean uv cache"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean-ci               - Clean CI artifacts"
	@echo ""
	@echo "Examples:"
	@echo "  make dev-setup         # Setup development environment with uv"
	@echo "  make uv-add-package PACKAGE=requests  # Add a new package"
	@echo "  make ci-pipeline       # Run complete CI pipeline"
	@echo "  make lint-fix          # Auto-fix code quality issues"
	@echo "  make security-strict   # Run strict security checks"
	@echo ""

# Observability Commands (Prometheus + Grafana)

observability-start:
	@echo "Starting observability stack (Prometheus + Grafana)..."
	@echo "Note: Requires OBSERVABILITY_ENABLED=true and METRICS_ENABLED=true in .env"
	docker compose -f ./docker/docker-compose.yml -f ./docker/docker-compose.observability.yml up -d
	@echo ""
	@echo "✅ Observability stack started!"
	@echo "📊 Grafana: http://localhost:3001 (default: admin/admin)"
	@echo "📈 Prometheus: http://localhost:9090"
	@echo "📡 Metrics endpoint: http://localhost:8000/metrics"

observability-stop:
	docker compose -f ./docker/docker-compose.observability.yml down

observability-logs:
	docker compose -f ./docker/docker-compose.observability.yml logs -f

observability-dashboard:
	@echo "Opening Grafana dashboard..."
	@open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Open http://localhost:3001 in your browser"

observability-prometheus:
	@echo "Opening Prometheus UI..."
	@open http://localhost:9090 || xdg-open http://localhost:9090 || echo "Open http://localhost:9090 in your browser"

observability-clean:
	docker compose -f ./docker/docker-compose.observability.yml down --volumes
	docker volume rm vas-dj-saas-project_prometheus_data vas-dj-saas-project_grafana_data 2>/dev/null || true

# Start application with observability enabled
start-with-observability:
	@echo "Starting application with observability stack..."
	@echo "Setting OBSERVABILITY_ENABLED=true METRICS_ENABLED=true"
	OBSERVABILITY_ENABLED=true METRICS_ENABLED=true docker compose -f ./docker/docker-compose.yml -f ./docker/docker-compose.observability.yml up

# Help command for observability
observability-help:
	@echo ""
	@echo "============================================="
	@echo "📊 Observability Stack Commands"
	@echo "============================================="
	@echo ""
	@echo "Quick Start:"
	@echo "  1. Set environment variables:"
	@echo "     export OBSERVABILITY_ENABLED=true"
	@echo "     export METRICS_ENABLED=true"
	@echo ""
	@echo "  2. Start the stack:"
	@echo "     make observability-start"
	@echo ""
	@echo "  3. Open Grafana dashboard:"
	@echo "     make observability-dashboard"
	@echo ""
	@echo "Commands:"
	@echo "  observability-start        - Start Prometheus + Grafana"
	@echo "  observability-stop         - Stop observability stack"
	@echo "  observability-logs         - View observability logs"
	@echo "  observability-dashboard    - Open Grafana (http://localhost:3001)"
	@echo "  observability-prometheus   - Open Prometheus (http://localhost:9090)"
	@echo "  observability-clean        - Remove all observability data"
	@echo "  start-with-observability   - Start app + observability together"
	@echo ""
	@echo "Endpoints:"
	@echo "  Grafana:    http://localhost:3001 (admin/admin)"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Metrics:    http://localhost:8000/metrics"
	@echo ""
	@echo "Configuration:"
	@echo "  OBSERVABILITY_ENABLED=true     - Enable observability"
	@echo "  METRICS_ENABLED=true           - Enable metrics collection"
	@echo "  TRACING_ENABLED=false          - Enable distributed tracing (expensive)"
	@echo "  DETAILED_METRICS_ENABLED=false - Enable high-cardinality metrics"
	@echo "  METRICS_SAMPLE_RATE=1.0        - Sample rate (0.0-1.0)"
	@echo ""
	@echo "Cost Optimization:"
	@echo "  - Disable tracing in production (most expensive)"
	@echo "  - Reduce sample rate (e.g., 0.1 for 10% sampling)"
	@echo "  - Disable detailed metrics to reduce cardinality"
	@echo "  - Adjust retention period (default: 7 days)"
	@echo ""
	@echo "Documentation: docs/OBSERVABILITY.md"
	@echo ""
