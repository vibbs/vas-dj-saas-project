# Gemini Project Guide: Multi-Tenant SaaS Platform

This document guides the AI-driven development of a multi-tenant SaaS platform using Django and Django Rest Framework (DRF).

## 1. Core Principles

*   **Convention over Configuration:** Adhere to Django's and this project's established conventions.
*   **Modularity:** Keep applications self-contained and reusable.
*   **Scalability:** Design for horizontal scaling from the outset.
*   **Security:** Implement best practices for security at all levels.
*   **Test-Driven Development (TDD):** Write tests for all new features and bug fixes.

## 2. Project Structure

The project follows a standard Django layout with a few additions for multi-tenancy and background tasks.

```
.
├── apps/
│   ├── core/                 # Core functionality, models, utilities
│   ├── tenants/              # Multi-tenancy management
│   ├── users/                # User management and authentication
│   ├── feature_flags/        # Feature flag system
│   └── [custom_apps]/        # Domain-specific applications
├── config/
│   ├── settings/             # Environment-specific settings
│   ├── celery.py            # Celery configuration
│   ├── urls.py              # Main URL configuration
│   └── wsgi.py              # WSGI configuration
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── scripts/             # Docker setup scripts
├── middleware/
│   ├── tenant_middleware.py
│   ├── security_middleware.py
│   └── api_middleware.py
├── static/
├── media/
├── logs/
├── tests/
├── scripts/                  # Management and deployment scripts
├── .env.example
├── manage.py
├── CLAUDE.md               # This file
└── README.md
```

## 3. Multi-Tenancy

We use the `django-tenants` library for multi-tenancy.

*   **Tenant Model:** `tenants.models.Tenant`
*   **Tenant-specific data:** All models that should be tenant-specific must be in an application that is part of `TENANT_APPS` in `settings/base.py`.
*   **Public data:** All models that should be public (shared across all tenants) must be in an application that is part of `SHARED_APPS` in `settings/base.py`.

## 4. Background Tasks

We use Celery for background tasks.

*   **Celery App:** `config.celery.app`
*   **Task Definitions:** Each application can have its own `tasks.py` file for defining Celery tasks.
*   **Task Naming:** Use the format `app_name.task_name` for task names.

## 5. Dockerized Setup

The project is fully dockerized.

*   **`docker-compose.yml`:** Defines the services (web, db, redis, celery_worker, celery_beat).
*   **`Dockerfile`:** Defines the environment for the Django application.

## 6. Environment Configuration

We use a multi-environment setup for settings.

*   **`settings/base.py`:** Base settings common to all environments.
*   **`settings/development.py`:** Settings for the development environment.
*   **`settings/production.py`:** Settings for the production environment.
*   **`DJANGO_SETTINGS_MODULE`:** This environment variable is used to select the settings file.

## 7. Django Admin

The Django admin is protected and has a custom URL.

*   **Custom URL:** The admin URL is defined in `config/urls.py` and should not be the default `/admin/`.
*   **Feature Flags:** We will implement a feature flag management system in the admin.

## 8. Security

*   **Custom Middleware:** We will use custom middleware for modifying API inputs and outputs.
*   **Input Validation:** All API inputs must be validated using DRF serializers.
*   **Output Serialization:** All API outputs must be serialized using DRF serializers.

## 9. AI Development Guidelines

*   **Understand the context:** Before making any changes, understand the relevant code and the project's conventions.
*   **Write tests:** All new features and bug fixes must be accompanied by tests.
*   **Keep it simple:** Write clean, readable, and maintainable code.Ensure things are properly documented with inline comments and docstrings.
*   **Follow DRY principles:** Avoid code duplication by using reusable components and utilities.
*   **Use descriptive names:** Use clear and descriptive names for variables, functions, and classes.
*   **Adhere to PEP 8:** Follow Python's PEP 8 style guide for code formatting.
*   **Use version control:** Commit changes frequently with clear commit messages.
*   **Review code:** All changes should be reviewed by at least one other developer before merging.
*   **Document changes:** Update documentation and comments to reflect any changes made.
*   **Handle errors gracefully:** Implement proper error handling and logging.
*   **Ask for clarification:** If a request is ambiguous, ask for clarification before proceeding.