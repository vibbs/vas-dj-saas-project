# Contributing to VAS-DJ SaaS

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker & Docker Compose
- uv (Python package manager, recommended)

### Quick Start

```bash
# Clone the repository
git clone <repo-url> && cd vas-dj-saas-project

# Install frontend dependencies
pnpm install

# Start backend services
cd backend && make start

# Run frontend
pnpm dev
```

### Backend Setup

```bash
cd backend
make dev-setup        # Create venv + install deps + pre-commit hooks
make migrate          # Run database migrations
make setup-seed-data  # Seed development data
make start            # Start Docker services
```

### Frontend Setup

```bash
pnpm install          # Install all workspace dependencies
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages
pnpm type-check       # Type check all packages
```

## Project Structure

```
├── apps/
│   ├── web/          # Next.js 15 SaaS app
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── ui/           # Cross-platform UI components
│   ├── auth/         # Authentication logic
│   ├── api-client/   # API client (generated + manual services)
│   ├── core/         # Navigation config, permissions
│   ├── utils/        # Shared utilities
│   └── adapters/     # Platform adapters (router, etc.)
├── backend/          # Django REST API
└── _docs/            # Project documentation
```

## Adding Features

Follow this order: **types → backend API → api-client → ui → apps**

1. Define types/interfaces
2. Build the Django API (models, serializers, views, URLs)
3. Add the service to `packages/api-client`
4. Create UI components in `packages/ui` if needed
5. Wire it up in `apps/web` and/or `apps/mobile`

## Code Style

### Backend (Python)
- Formatter: `black` (88 char line length)
- Import sorting: `isort` (black-compatible profile)
- Linter: `ruff`
- Type checking: `mypy`
- All enforced by pre-commit hooks

### Frontend (TypeScript)
- Linter: ESLint (per-app configs)
- Formatter: Prettier
- All enforced by husky + lint-staged

## Testing

### Backend
```bash
cd backend
make test              # Run all tests
make test-coverage     # With coverage report
make test-accounts     # Test specific app
```

### Frontend
```bash
pnpm --filter @vas-dj-saas/web test:run    # Unit tests
pnpm e2e                                    # E2E tests (Playwright)
```

## Pull Requests

1. Create a feature branch from `main`: `git checkout -b feat/my-feature`
2. Make your changes following the code style guidelines
3. Write tests for new functionality
4. Run `pnpm lint && pnpm type-check && pnpm build`
5. Run backend tests: `cd backend && make test`
6. Open a PR against `main` with a clear description

### PR Title Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Architecture Decisions

Key decisions are documented in `_docs/` and `CLAUDE.md`. When making architectural decisions, document them in the appropriate location.

## Questions?

Open an issue or start a discussion in the repository.
