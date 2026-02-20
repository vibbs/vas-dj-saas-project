# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MFA/TOTP support with backup codes
- Health check endpoint (`/api/health/`)
- Notifications Django app (models, views, serializers, admin)
- API Keys Django app with SHA-256 hashed tokens
- Dashboard aggregation endpoints (stats, activity, team, usage)
- Next.js middleware auth guard (server-side route protection)
- Error boundaries (`error.tsx`, `global-error.tsx`, `not-found.tsx`)
- Production Docker setup with nginx reverse proxy and health checks
- S3 file storage configuration (django-storages)
- Playwright E2E test infrastructure
- Husky + lint-staged pre-commit hooks for frontend
- SEO support (sitemap, robots.txt, OpenGraph meta tags)
- EAS build configuration for Expo mobile app
- Vercel deployment configuration
- Analytics provider abstraction (PostHog integration)
- Database backup/restore scripts
- Frontend CI/CD with E2E test step
- CONTRIBUTING.md guidelines

### Changed
- Updated production Docker to use env_file instead of hardcoded credentials
- Upgraded Node.js requirement to 20 in CI workflows
- Updated mobile app bundle ID from `com.anonymous.mobile` to `com.vasdjsaas.app`

### Fixed
- Billing views/services: filter by organization instead of user account
- Auth cookie sync for server-side middleware protection

## [0.1.0] - 2026-02-18

### Added
- Initial monorepo setup (Turborepo)
- Next.js 15 web application with auth pages
- Expo React Native mobile app
- Django REST backend with JWT authentication
- Multi-tenant organization system with RBAC
- Billing system with Stripe provider abstraction
- Feature flags with gradual rollout
- Onboarding system
- 45+ cross-platform UI components with Storybook
- Email service with templates
- Audit logging system
- Rate limiting middleware
- OpenAPI/Swagger documentation
- Docker development environment
- Backend CI/CD pipeline (lint, test, security scan, build)
- Prometheus + Grafana observability stack
