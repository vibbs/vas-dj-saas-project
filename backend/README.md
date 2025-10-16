# VAS-DJ Django Backend

Production-ready Django REST API backend for the VAS-DJ SaaS platform, featuring multi-tenant architecture, JWT authentication, and comprehensive business logic for SaaS applications.

## 🚀 Quick Start

```bash
# Build and start all services
make backend-build
make backend-migrate
make start

# Check system status
make check-system

# View API documentation
open http://localhost:8000/api/docs/
```

## 🏗️ Architecture Overview

### Multi-Tenant SaaS Design
- **Organization-based tenancy** with automatic data isolation
- **Subdomain routing** for seamless tenant access
- **Custom user model** with organization-scoped permissions
- **Tenant-aware models** with automatic filtering

### API-First Architecture
- **Django REST Framework** for robust API development
- **JWT authentication** with automatic token refresh
- **OpenAPI/Swagger** documentation with drf-spectacular
- **Versioned APIs** for backward compatibility

### Key Features
- **Custom user management** with email/phone verification
- **Role-based permissions** with organization-level access control
- **Background task processing** with Celery and Redis
- **Email service** with transactional email templates
- **Billing integration** ready for subscription management

## 🛠 Technology Stack

- **Backend**: Python 3.11+, Django 5.2+
- **API**: Django REST Framework 3.16+
- **Database**: PostgreSQL
- **Cache & Message Broker**: Redis
- **Background Tasks**: Celery
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Containerization**: Docker & Docker Compose
- **Dependency Management**: UV (10-100x faster than pip/poetry)

## 📁 Project Structure

```
vas-dj-saas-project/
├── apps/
│   ├── accounts/          # User management and authentication
│   │   ├── models/
│   │   │   ├── account.py # Custom user model
│   │   │   └── team.py    # Team and membership models
│   │   ├── serializers.py # API serializers
│   │   ├── views.py       # API views
│   │   └── enums.py       # User-related enums
│   ├── core/              # Shared utilities and base models
│   │   ├── models.py      # Base model classes
│   │   ├── managers.py    # Custom model managers
│   │   └── utils/
│   │       └── enums.py   # Custom enum base class
│   └── organizations/     # Multi-tenancy and organization management
│       ├── models.py      # Organization model
│       ├── middleware.py  # Tenant middleware
│       └── managers.py    # Organization managers
├── config/
│   ├── settings/
│   │   ├── base.py        # Base settings
│   │   ├── development.py # Development settings
│   │   └── production.py  # Production settings
│   ├── urls.py            # Main URL configuration
│   └── celery.py          # Celery configuration
├── docker/
│   ├── Dockerfile         # Application container
│   └── docker-compose.yml # Service orchestration
├── Makefile              # Development commands
├── pyproject.toml        # UV/Python project configuration
└── uv.lock               # Dependency lockfile
```

## 🚦 Quick Start

### Prerequisites

- Docker
- Docker Compose
- Python 3.11+ (for local development)
- UV (for local development): `pip install uv`

### Installation

#### Docker Setup (Recommended for Quick Start)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vas-dj-saas-project
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services:**
   ```bash
   make build
   make start
   ```

4. **Run database migrations:**
   ```bash
   make migrate
   ```

5. **Create a superuser:**
   ```bash
   docker compose -f ./docker/docker-compose.yml run --rm web python manage.py createsuperuser
   ```

#### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vas-dj-saas-project
   ```

2. **Set up development environment with UV:**
   ```bash
   make dev-setup
   source .venv/bin/activate
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start external services (PostgreSQL, Redis):**
   ```bash
   # Using Docker for services only
   docker compose -f ./docker/docker-compose.yml up postgres redis -d
   ```

5. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

## 🖥 Development Commands

The project includes a Makefile with convenient commands:

### Docker Commands

```bash
# Build containers
make build

# Start all services
make start

# Stop all services
make stop

# Create migrations
make migrations

# Apply migrations
make migrate

# Clean up containers and volumes
make clean

# Check System Status
make check-status
```

### Local Development with UV

```bash
# Setup development environment
make dev-setup

# Create virtual environment
make uv-venv

# Install dependencies (system Python)
make uv-install

# Install dependencies (in virtual environment)
make uv-install-dev

# Add a new package
make uv-add-package PACKAGE=requests

# Remove a package
make uv-remove-package PACKAGE=requests

# Update lockfile
make uv-lock

# Clean UV cache
make uv-clean
```

## 🌐 API Documentation

The project provides comprehensive, interactive API documentation that automatically stays up-to-date with your codebase:

- **Swagger UI**: http://localhost:8000/api/docs/ - Interactive API testing interface
- **ReDoc**: http://localhost:8000/api/redoc/ - Clean, comprehensive documentation
- **Schema JSON**: http://localhost:8000/api/schema/ - Raw OpenAPI schema for integration

### API Features
- **Full CRUD Operations**: Complete resource management for users and organizations
- **Authentication Required**: Secure endpoints with session/token authentication
- **Pagination Support**: Efficient handling of large datasets
- **Comprehensive Filtering**: Query parameters for data filtering and searching
- **Real-time Documentation**: Auto-generated from code annotations and serializers

## 🏗 Architecture Overview

### Multi-Tenant Design
- **Organization-Based Tenancy**: Each organization acts as a tenant
- **Subdomain Routing**: Organizations accessible via subdomains
- **Tenant-Aware Models**: All models automatically scoped to organizations
- **Custom Middleware**: Request processing for tenant context

### User Management
- **Custom User Model**: Extended Django user with comprehensive fields
- **Multiple Authentication**: Support for various auth providers
- **Role-Based Access**: Flexible permission system
- **Team Management**: Users can belong to teams within organizations

### API Architecture
- **RESTful Design**: Consistent REST API patterns
- **Comprehensive Documentation**: Auto-generated OpenAPI documentation
- **Pagination**: Built-in pagination for list endpoints
- **Authentication Required**: Secure by default

## 🧪 Testing

Run the test suite:
```bash
docker compose -f ./docker/docker-compose.yml run --rm web python manage.py test
```

## 🚀 Production Deployment

The project includes production-ready configurations:

1. **Environment Variables**: Configure production settings in `.env`
2. **Database**: Use PostgreSQL in production
3. **Static Files**: Configure static file serving
4. **Security**: Review and update security settings
5. **Monitoring**: Add monitoring and logging as needed

## 📚 Related Documentation

- **[Monorepo Overview](../README.md)** - Complete project documentation
- **[Frontend Applications](../apps/)** - Web and mobile app integration
- **[Shared Packages](../packages/)** - Reusable components and utilities
- **[Development Guide](../CLAUDE.md)** - Development setup and workflows

## 🔗 Integration Points

### Frontend Integration
- **Web Application**: [apps/web/](../apps/web/README.md) - Next.js SaaS interface
- **Mobile Application**: [apps/mobile/](../apps/mobile/README.md) - React Native app
- **Marketing Site**: [apps/marketing/](../apps/marketing/README.md) - Landing pages

### Shared Packages
- **API Client**: [packages/api-client/](../packages/api-client/README.md) - Type-safe API client
- **Authentication**: [packages/auth/](../packages/auth/README.md) - Auth logic and components
- **Type Definitions**: [packages/types/](../packages/types/README.md) - Shared TypeScript types

## 🤝 Contributing

1. Review the [development guide](../CLAUDE.md) for setup instructions
2. Follow Django and DRF best practices
3. Maintain API documentation with schema annotations
4. Write comprehensive tests for new features
5. Ensure multi-tenant data isolation in all models
