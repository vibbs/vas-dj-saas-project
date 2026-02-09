# VAS-DJ SaaS Project Reference

> Detailed project documentation. CLAUDE.md references this for specifics.

## Monorepo Structure

```
├── apps/
│   ├── web/        # Next.js 15.4.5 (React 19, Tailwind CSS 4)
│   ├── mobile/     # React Native 0.79.5 (Expo 53, React 19)
│   └── marketing/  # Next.js 15.4.5 marketing site
├── packages/
│   ├── ui/         # Cross-platform components (Storybook)
│   ├── auth/       # JWT authentication
│   ├── api-client/ # Type-safe Django API client
│   ├── utils/      # Shared utilities
│   └── types/      # TypeScript definitions
├── backend/        # Django REST API
│   ├── apps/       # accounts, organizations, billing, etc.
│   ├── config/     # Django settings
│   └── docker/     # Docker configuration
└── ai-playground/  # AI-generated artifacts
```

## Commands Reference

### Monorepo
| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start all apps |
| `pnpm build` | Build all apps |
| `pnpm lint` | ESLint 9 check |
| `pnpm type-check` | TypeScript 5.8.3 check |

### Backend (Make Targets)
| Command | Purpose |
|---------|---------|
| `make start` | Start backend services |
| `make stop` | Stop backend |
| `make migrate` | Apply migrations |
| `make migrations` | Create migrations |
| `make sanity-check` | Health check |
| `make sanity-fix` | Auto-fix issues |

### Direct Docker Commands
```bash
# Run command (creates container)
docker compose -f ./backend/docker/docker-compose.yml run --rm web python manage.py <cmd>

# Exec in running container
docker compose -f ./backend/docker/docker-compose.yml exec web python manage.py <cmd>
```

## Architecture Details

### Multi-Tenant SaaS
- **Organizations**: Top-level tenants with subdomain routing
- **Accounts**: Custom user model, organization-scoped
- **Billing**: Subscription and payment handling

### API
- **Swagger**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Key endpoints**: `/api/v1/accounts/users/`, `/api/v1/organizations/`

### Tech Stack
- React 19.0.0 (all packages)
- TypeScript 5.8.3 (standardized)
- ESLint 9.25.0
- Turborepo 2.3.0
- PostgreSQL (port 5433)
- Redis (port 6379)

## Development Workflow

### Adding Features
1. Update types in `packages/types/`
2. Implement backend API in `backend/apps/`
3. Update `packages/api-client/`
4. Add UI in `packages/ui/`
5. Implement in apps

### Package Structure
```
├── src/           # Source code
├── dist/          # Built output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

### Dependencies
- Use workspace protocol: `"@vas-dj-saas/types": "workspace:*"`
- Apps depend on packages
- Packages can depend on other packages

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build failures | `make sanity-fix` |
| iOS Simulator | `make mobile-sanity` |
| Type errors | TS 5.8.3 standardized |
| Workspace deps | `pnpm install` + `make sanity-check` |

## Environment

### Prerequisites
- Docker + Docker Compose
- Node.js 18+ / pnpm 9.0.0
- Python 3.11+
- Expo CLI

### Getting Started
```bash
pnpm install
make backend-build
make backend-migrate
make start
pnpm dev
```
