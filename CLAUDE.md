# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Docker Development
- `make build` - Build Docker containers
- `make start` - Start all services (web, db, redis, celery)
- `make stop` - Stop all containers
- `make clean` - Stop containers and clean up volumes/networks
- `make migrations` - Create new Django migrations
- `make migrate` - Apply database migrations
- `make check-status` - Check Django system check status

### Direct Django Commands (inside container)
- `docker compose -f ./docker/docker-compose.yml run --rm web python manage.py <command>`
- `docker compose -f ./docker/docker-compose.yml exec web python manage.py <command>` (if container is running)

### Testing and Development
- Run tests: `docker compose -f ./docker/docker-compose.yml run --rm web python manage.py test`
- Create superuser: `docker compose -f ./docker/docker-compose.yml run --rm web python manage.py createsuperuser`
- Django shell: `docker compose -f ./docker/docker-compose.yml run --rm web python manage.py shell`

## Architecture Overview

### Multi-Tenant SaaS Architecture
This is a Django SaaS project with multi-tenancy support:
- **Organizations**: Top-level tenant entities with subdomain-based routing
- **Accounts**: Custom user model extending AbstractBaseUser with organization-scoped users
- **Multi-tenancy**: Uses django-tenants for schema-based multi-tenancy (though middleware suggests custom implementation)

### Core Apps Structure
- **apps/core/**: Base models, managers, and utilities
  - `BaseFields`: Abstract model with UUID, timestamps, and tenant awareness
  - `TenantAwareModel`: Base for organization-scoped models
- **apps/accounts/**: User management and authentication
  - Custom `Account` model with comprehensive user fields
  - `AccountAuthProvider` for multiple authentication methods
  - Role-based permissions (USER, ADMIN, etc.)
- **apps/organizations/**: Organization/tenant management
  - `Organization` model with subdomain support
  - Trial and billing metadata

### Settings Architecture
- Environment-based configuration using `config/settings/`
- `base.py` contains shared settings
- `development.py` and `production.py` for environment-specific configs
- Environment variables required for database connection

### Background Tasks
- Celery with Redis broker configured
- Separate containers for celery worker and beat scheduler
- Configuration in `config/celery.py`

## Key Implementation Details

### Custom User Model
- `AUTH_USER_MODEL = "accounts.Account"`
- Email-based authentication (USERNAME_FIELD = "email")
- Rich user profile with role-based permissions
- Multi-provider authentication support

### Database Design
- PostgreSQL as primary database
- UUID primary keys for all models
- Tenant-aware base models with automatic organization scoping
- Built-in audit fields (created_by, updated_by, timestamps)

### Multi-Tenancy Pattern
- Organization-based tenancy with subdomain routing
- `TenantMiddleware` for request processing
- All models inherit from `TenantAwareModel` for automatic scoping

## Development Notes

### Environment Setup
- Docker-based development with compose configuration in `./docker/`
- PostgreSQL on port 5433 (not default 5432)
- Redis on default port 6379
- Environment variables must be set in `.env` file

### Code Organization
- Apps follow Django best practices with separate model files
- Custom managers for organization-scoped queries
- Enum-based choices for consistent field values
- Base model classes promote DRY principles

### Dependencies
- Django 5.2+ with DRF for API development
- django-tenants for multi-tenancy
- Celery + Redis for background tasks
- PostgreSQL with psycopg2-binary
- drf-spectacular for OpenAPI/Swagger documentation
- Poetry for dependency management

## API Documentation

### Swagger/OpenAPI Documentation
- **Swagger UI**: http://localhost:8000/api/docs/ - Interactive API documentation
- **ReDoc**: http://localhost:8000/api/redoc/ - Alternative documentation interface
- **Schema JSON**: http://localhost:8000/api/schema/ - Raw OpenAPI schema

### API Endpoints
- **Accounts API**: `/api/v1/accounts/users/` - User management endpoints
  - GET `/api/v1/accounts/users/me/` - Current user profile
  - PATCH `/api/v1/accounts/users/update_profile/` - Update current user
  - GET `/api/v1/accounts/users/{id}/auth_providers/` - User's auth providers
- **Organizations API**: `/api/v1/organizations/` - Organization management
  - GET `/api/v1/organizations/{id}/stats/` - Organization statistics

### Authentication
- Session authentication for web interface
- Token authentication for API clients
- All endpoints require authentication by default