# Django SaaS Monorepo

A full-stack SaaS application with Django backend and TypeScript frontend applications.

## 🏗️ Monorepo Structure

```
├── apps/                    # Applications
│   ├── web/                # Next.js web application
│   └── mobile/             # React Native mobile app (placeholder)
├── packages/               # Shared packages
│   ├── ui/                 # Shared UI components
│   ├── auth/               # Authentication utilities
│   ├── api-client/         # API client for backend
│   ├── utils/              # Shared utilities
│   └── types/              # Shared TypeScript types
└── backend/                # Django backend API
    ├── apps/               # Django apps (accounts, organizations, billing, etc.)
    ├── config/             # Django settings and configuration
    ├── docker/             # Docker configuration
    └── manage.py           # Django management script
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and pnpm
- Python 3.11+ (optional, for local Django development)

### Setup
```bash
# Install frontend dependencies
pnpm install

# Build and start backend services
make backend-build
make backend-migrate
make backend-start

# Start frontend development (in another terminal)
pnpm dev
```

## 📋 Available Commands

### Monorepo Management
```bash
pnpm install        # Install all dependencies
pnpm dev           # Start all applications in development
pnpm build         # Build all applications
pnpm lint          # Lint all packages
pnpm type-check    # Type check all TypeScript
```

### Backend (Django)
```bash
make backend-build          # Build Docker containers
make backend-start          # Start all services
make backend-stop           # Stop all containers
make backend-migrations     # Create Django migrations
make backend-migrate        # Apply database migrations
make backend-check-system   # Check Django system
```

### Quick Shortcuts
```bash
make start         # Start backend services
make stop          # Stop backend services
make migrations    # Create Django migrations
make migrate       # Apply Django migrations
```

## 🏛️ Architecture

### Backend (Django)
- **Multi-tenant SaaS** with organization-based data isolation
- **REST API** with Django REST Framework
- **JWT Authentication** with refresh token support
- **Celery** for background tasks
- **PostgreSQL** database with Redis for caching/sessions

### Frontend
- **Turborepo** for build orchestration and caching
- **pnpm workspaces** for dependency management
- **Shared packages** for code reuse between web and mobile
- **TypeScript** throughout for type safety

### Key Features
- 🏢 Multi-tenant organizations
- 👥 User management and authentication
- 💳 Billing and subscription management
- 📧 Email notifications
- 🔐 JWT-based API authentication
- 📱 Mobile-ready shared components

## 🔗 API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

## 🛠️ Development Workflow

1. **Backend changes**: Work in `backend/apps/` directory
2. **Shared types**: Update `packages/types/` first
3. **API client**: Update `packages/api-client/` for new endpoints
4. **UI components**: Add to `packages/ui/` for reusability
5. **Applications**: Implement features in `apps/web/` or `apps/mobile/`

## 📦 Package Dependencies

- Applications (`apps/*`) can depend on shared packages (`packages/*`)
- Packages can depend on other packages
- Use workspace protocol: `"@vas-dj-saas/types": "workspace:*"`

## 🔧 Environment Variables

Create `.env` file in the backend directory with:
```env
# Database
DB_NAME=saas_db
DB_USER=saas_user
DB_PASSWORD=saas_password
DB_HOST=db
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Additional backend configuration...
```

## 📚 Documentation

See `CLAUDE.md` for detailed development instructions and architecture overview.