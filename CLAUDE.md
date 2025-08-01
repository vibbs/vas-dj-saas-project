# CLAUDE.md - Django SaaS Monorepo

This file provides guidance to Claude Code (claude.ai/code) when working with this monorepo.

## Monorepo Structure

This is a turborepo-powered monorepo containing:

```
├── apps/                    # Applications
│   ├── web/                # Next.js web application
│   └── mobile/             # React Native mobile app
├── packages/               # Shared packages
│   ├── ui/                 # Shared UI components
│   ├── auth/               # Authentication utilities
│   ├── api-client/         # API client for backend
│   ├── utils/              # Shared utilities
│   └── types/              # Shared TypeScript types
└── backend/                # Django backend API
    ├── apps/               # Django apps
    ├── config/             # Django settings
    ├── docker/             # Docker configuration
    └── manage.py           # Django management
```

## Development Commands

### Monorepo Management
- `pnpm install` - Install all dependencies
- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all TypeScript

### Sanity Checks
- `make sanity-check` - Comprehensive monorepo health check
- `make sanity-check-quick` - Quick health check (faster)
- `make sanity-fix` - Auto-fix common dependency issues
- `make mobile-sanity` - Mobile app specific checks
- `make backend-sanity` - Backend specific checks

### Backend (Django)
- `make backend-build` - Build Django Docker containers
- `make backend-start` - Start backend services (web, db, redis, celery)
- `make backend-stop` - Stop all backend containers
- `make backend-clean` - Clean up volumes and networks
- `make backend-migrations` - Create Django migrations
- `make backend-migrate` - Apply database migrations
- `make backend-check-system` - Check Django system status

### Quick Commands (shortcuts)
- `make start` - Start backend services
- `make stop` - Stop backend services
- `make migrations` - Create Django migrations
- `make migrate` - Apply Django migrations
- `make check-system` - Check Django system

### Direct Django Commands (inside container)
- `docker compose -f ./backend/docker/docker-compose.yml run --rm web python manage.py <command>`
- `docker compose -f ./backend/docker/docker-compose.yml exec web python manage.py <command>` (if container is running)

## Backend Architecture

### Multi-Tenant SaaS Architecture
The Django backend provides:
- **Organizations**: Top-level tenant entities with subdomain-based routing
- **Accounts**: Custom user model extending AbstractBaseUser with organization-scoped users
- **Multi-tenancy**: Custom implementation with organization-scoped data

### Core Apps Structure
- **backend/apps/core/**: Base models, managers, and utilities
- **backend/apps/accounts/**: User management and authentication
- **backend/apps/organizations/**: Organization/tenant management
- **backend/apps/billing/**: Subscription and payment handling
- **backend/apps/email_service/**: Email notifications

## Frontend Architecture

### Shared Packages
- **@vas-dj-saas/ui**: Reusable UI components for web and mobile
- **@vas-dj-saas/auth**: Authentication logic and state management
- **@vas-dj-saas/api-client**: Type-safe API client for Django backend
- **@vas-dj-saas/utils**: Shared utility functions
- **@vas-dj-saas/types**: TypeScript type definitions

### Applications
- **@vas-dj-saas/web**: Next.js web application
- **@vas-dj-saas/mobile**: React Native mobile application (Expo-based)

## API Documentation

### Backend API
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema JSON**: http://localhost:8000/api/schema/

### Key Endpoints
- **Accounts API**: `/api/v1/accounts/users/`
- **Organizations API**: `/api/v1/organizations/`
- **Authentication**: JWT-based with refresh tokens

## Development Workflow

### Adding New Features
1. Update shared types in `packages/types/`
2. Implement backend API in `backend/apps/`
3. Update API client in `packages/api-client/`
4. Add UI components in `packages/ui/`
5. Implement in applications (`apps/web/`, `apps/mobile/`)

### Package Dependencies
- Apps can depend on packages
- Packages can depend on other packages
- Use workspace protocol: `"@vas-dj-saas/types": "workspace:*"`

## Environment Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and pnpm
- Python 3.11+ (for local Django development)

### Getting Started
1. `pnpm install` - Install all dependencies
2. `make backend-build` - Build backend containers
3. `make backend-migrate` - Set up database
4. `make start` - Start all services
5. `pnpm dev` - Start frontend development servers

## Important Notes

### Backend Development
- All Django files are in `backend/` directory
- Docker configuration uses relative paths
- PostgreSQL runs on port 5433 (not default 5432)
- Redis runs on default port 6379

### Frontend Development
- Uses pnpm workspaces for dependency management
- Turborepo for build orchestration and caching
- Shared packages are published internally within the monorepo

### Mobile Development
- Expo-based React Native application
- iOS folder is generated and **should be committed** for consistent native builds
- Use `npx expo start` for development
- For iOS simulator issues, run `make mobile-sanity` to diagnose

### File Paths
- Backend commands should be run from `backend/` directory or use make targets
- Frontend commands should be run from root directory
- Docker compose files are in `backend/docker/`

### Git Practices
- The `.gitignore` is configured for the full monorepo including:
  - Build artifacts (.turbo/, .next/, *.tsbuildinfo)
  - Package manager files (node_modules/, pnpm-lock.yaml is tracked)
  - Environment files (.env.*, except examples)
  - Editor and system files (.DS_Store, etc.)
  - Claude Code local settings (.claude/settings.local.json)
- Run `git status` before commits to verify only intended files are staged
- Use `make sanity-check` before major commits to ensure code quality

## Troubleshooting

### Common Issues
1. **Build failures**: Run `make sanity-fix` to auto-resolve dependency issues
2. **iOS Simulator crashes**: Delete corrupted devices with `xcrun simctl delete <device-id>`
3. **Type errors**: Ensure all packages have proper TypeScript configuration
4. **Workspace dependency issues**: Run `pnpm install` and `make sanity-check`

### Health Checks
Run `make sanity-check` regularly to ensure monorepo health. This validates:
- Workspace structure and dependencies
- Build process for all packages
- TypeScript configuration
- Mobile app configuration
- Backend system status