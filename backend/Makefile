.PHONY: build start stop clean test test-verbose test-coverage test-parallel test-build test-clean api-validate api-generate api-docs api-workflow api-list api-help help

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

help: api-help test-help

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