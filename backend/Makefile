.PHONY: build start stop clean api-validate api-generate api-docs api-workflow api-list api-help help

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

help: api-help