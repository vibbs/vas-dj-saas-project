# VAS-DJ - Django SaaS Project

A comprehensive, production-ready SaaS backend built with Django and Django REST Framework. This project provides a solid foundation for building multi-tenant SaaS applications with modern architecture patterns.

## 🚀 Features

### Core Functionality
- **Multi-Tenant Architecture**: Organization-based tenancy with subdomain support
- **Custom User Management**: Extended user model with comprehensive profile fields
- **RESTful API**: Full-featured API built with Django REST Framework
- **Interactive API Documentation**: Swagger/OpenAPI documentation with drf-spectacular
- **Background Task Processing**: Celery integration with Redis broker
- **Role-Based Permissions**: Flexible user roles and organization-level permissions

### Authentication & Security
- **Session & Token Authentication**: Multiple authentication methods supported
- **Multi-Provider Auth Support**: Extensible authentication provider system
- **Email & Phone Verification**: Built-in verification workflows
- **Two-Factor Authentication Ready**: 2FA infrastructure in place

### Development Experience
- **Docker Development Environment**: Complete containerized setup
- **Environment-Based Configuration**: Separate settings for development/production
- **Poetry Dependency Management**: Modern Python package management
- **Comprehensive Test Structure**: Ready-to-use testing framework

## 🛠 Technology Stack

- **Backend**: Python 3.11+, Django 5.2+
- **API**: Django REST Framework 3.16+
- **Database**: PostgreSQL
- **Cache & Message Broker**: Redis
- **Background Tasks**: Celery
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Containerization**: Docker & Docker Compose
- **Dependency Management**: Poetry

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
└── pyproject.toml        # Poetry configuration
```

## 🚦 Quick Start

### Prerequisites

- Docker
- Docker Compose

### Installation

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

## 🖥 Development Commands

The project includes a Makefile with convenient commands:

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

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the documentation at `/api/docs/`
- Review the CLAUDE.md file for development guidance

