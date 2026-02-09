# VAS-DJ SaaS Monorepo

**Validated App Stack for Dreamers & Jackers** - A production-ready monorepo for building multi-tenant SaaS applications.

![vas-dj-logo](./_docs/images/vas-dj-logo-banner.png)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start backend services
make backend-build && make backend-migrate && make start

# Start frontend development (new terminal)
pnpm dev
```

## 📁 Project Structure

```
├── apps/                    # Applications
│   ├── web/                # Next.js web app → [Documentation](./apps/web/README.md)
│   ├── mobile/             # React Native mobile app → [Documentation](./apps/mobile/README.md)
│   └── marketing/          # Marketing site → [Documentation](./apps/marketing/README.md)
├── packages/               # Shared packages
│   ├── ui/                 # Cross-platform components → [Documentation](./packages/ui/README.md)
│   ├── auth/               # Authentication system → [Documentation](./packages/auth/README.md)
│   ├── api-client/         # API client → [Documentation](./packages/api-client/README.md)
│   ├── types/              # Shared TypeScript types → [Documentation](./packages/types/README.md)
│   └── utils/              # Shared utilities → [Documentation](./packages/utils/README.md)
└── backend/                # Django API → [Documentation](./backend/README.md)
```

## ⚡ Tech Stack

- **Backend**: Django 5.2+, DRF, PostgreSQL, Redis, Celery
- **Frontend**: React 19, Next.js 15.4, React Native 0.79, Expo 53
- **Tooling**: TypeScript 5.8, Turborepo 2.3, pnpm, Docker
- **UI**: Cross-platform components, Tailwind CSS 4, Storybook
- **Auth**: JWT tokens, multi-provider support, 2FA ready

## 📋 Development Commands

### Monorepo
```bash
pnpm dev           # Start all applications
pnpm build         # Build all packages
pnpm lint          # Lint all code
pnpm type-check    # TypeScript checking
```

### Backend
```bash
make start         # Start Django services
make migrate       # Run database migrations
make check-system  # Django system check
```

## 🏗️ Key Features

- 🏢 **Multi-tenant architecture** with organization-based isolation
- 🔐 **JWT authentication** with refresh tokens and 2FA support
- 📱 **Cross-platform UI** components for web and mobile
- 🎨 **Design system** with consistent theming across platforms
- 📊 **Admin dashboard** and billing management
- 🔧 **Developer experience** with hot reload, type safety, and tooling

## 🌐 API & Documentation

When running locally:
- **API Documentation**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Storybook**: `pnpm --filter @vas-dj-saas/ui storybook`

## 📚 Documentation

- **📖 [Complete Documentation Hub](./_docs/README.md)** - Central documentation index
- **⚙️ [Development Guide](./CLAUDE.md)** - Development setup and workflows
- **🎯 [Project Vision](./_docs/vas-dj.md)** - Project goals and roadmap

## 🤝 Contributing

1. Review the [development guide](./CLAUDE.md)
2. Check package-specific documentation for implementation details
3. Follow the established patterns in shared packages
4. Run health checks: `make sanity-check`

---

Built with ❤️ by [Vaibhav Doddihal](https://www.linkedin.com/in/vaibhavdoddihal/) | [BlockSimplified](https://www.blocksimplified.com/)