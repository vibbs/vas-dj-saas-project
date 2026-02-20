# VAS-DJ SaaS Boilerplate — Implementation Plan

> Goal: Make this the best open-source SaaS boilerplate in the world.
> Created: 2026-02-20
> Status: In Progress

---

## Current State

The boilerplate already has:
- Turborepo monorepo (Next.js 15 + Expo React Native + Django REST)
- JWT auth with email verification, password reset
- Multi-tenant organization system with RBAC
- Billing (Stripe integration with provider abstraction)
- Feature flags with rollout percentages
- Onboarding system
- Notifications app (backend)
- API Keys app (backend)
- Dashboard aggregation endpoints
- 45+ cross-platform UI components with Storybook
- Docker dev environment with Celery, Redis, MailHog
- Backend CI/CD with security scanning (Bandit, CodeQL, Trivy)
- OpenAPI/Swagger docs via drf-spectacular
- Audit logging, rate limiting, tenant isolation

---

## Tier 1 — Critical (Blocks Core Functionality)

### 1.1 Run Migrations for New Apps
- **What**: `notifications` and `api_keys` apps have models but no migration files
- **Files**: `backend/apps/notifications/migrations/`, `backend/apps/api_keys/migrations/`
- **Action**: Generate and commit initial migrations
- **Validation**: `make migrate` succeeds, tables exist in DB

### 1.2 Next.js Middleware Auth Guard
- **What**: `middleware.ts` is a no-op stub. Protected routes are only guarded client-side.
- **File**: `apps/web/src/middleware.ts`
- **Action**: Check for auth tokens in cookies; redirect unauthenticated users away from `/home`, `/settings/*`; redirect authenticated users away from `/login`, `/register-organization`
- **Pattern**: Read `access_token` cookie → verify not expired → allow/redirect
- **Validation**: Unauthenticated access to `/home` redirects to `/login` at the server level

### 1.3 Error Boundaries
- **What**: No `error.tsx`, `global-error.tsx`, or `not-found.tsx` in the web app
- **Files to create**:
  - `apps/web/src/app/error.tsx` — catches errors in nested routes
  - `apps/web/src/app/global-error.tsx` — catches errors in root layout
  - `apps/web/src/app/not-found.tsx` — custom 404 page
- **Validation**: Throwing an error in a page shows the error boundary, not a blank screen

### 1.4 Fix Production Docker
- **What**: `docker-compose.prod.yml` has hardcoded credentials, no nginx, no TLS
- **Files**:
  - `backend/docker/docker-compose.prod.yml` — add nginx service, health checks, remove hardcoded creds
  - `backend/docker/nginx/nginx.conf` — reverse proxy config with TLS termination
  - `backend/docker/nginx/ssl/` — placeholder for certs with instructions
- **Validation**: `docker compose -f docker-compose.prod.yml config` passes

---

## Tier 2 — Security & Production Readiness

### 2.1 MFA/TOTP Support
- **What**: No two-factor authentication anywhere
- **Backend**:
  - Install `django-otp` + `qrcode` dependencies
  - Create `backend/apps/accounts/mfa/` module with TOTP device model
  - Add views: `mfa/setup/`, `mfa/verify/`, `mfa/disable/`, `mfa/backup-codes/`
  - Integrate with JWT login flow (require TOTP after password)
- **Frontend**:
  - QR code display component for setup
  - TOTP input form during login
  - MFA settings in Security tab
- **Validation**: Can enable TOTP, scan QR, verify code, and login with 2FA

### 2.2 Real OAuth Social Login
- **What**: Social auth views exist but don't verify tokens server-side
- **Backend**:
  - Install `python-social-auth` or use direct token verification
  - Implement Google OAuth token verification endpoint
  - Implement GitHub OAuth token verification endpoint
- **Frontend**:
  - OAuth buttons on login/register pages (already have placeholders)
- **Validation**: Can sign in with Google/GitHub OAuth

### 2.3 S3 File Storage (django-storages)
- **What**: `boto3` is installed but no `django-storages` config for production
- **Backend**:
  - Add `django-storages[s3]` to dependencies
  - Configure `DEFAULT_FILE_STORAGE` in production settings
  - Add `AWS_*` env vars to `.env.example`
- **Validation**: File uploads work with S3 in production settings

### 2.4 E2E Tests (Playwright)
- **What**: Zero end-to-end test coverage
- **Files**:
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/auth.spec.ts` — login, register, logout flows
  - `apps/web/e2e/dashboard.spec.ts` — dashboard loads, navigation works
  - `apps/web/e2e/settings.spec.ts` — settings pages accessible
- **CI**: Add Playwright to frontend CI workflow
- **Validation**: `pnpm exec playwright test` passes

### 2.5 Frontend Pre-commit Hooks (husky + lint-staged)
- **What**: Backend has pre-commit but frontend has none
- **Files**:
  - `.husky/pre-commit` — run lint-staged
  - Root `package.json` — add lint-staged config
- **Validation**: Committing a file with lint errors is blocked

---

## Tier 3 — Boilerplate Completeness

### 3.1 Mobile Push Notifications
- **What**: `expo-notifications` not installed, no FCM/APNs
- **Action**:
  - Install `expo-notifications`
  - Add push token registration service
  - Store push tokens in backend (extend NotificationPreference model)
  - Add notification permission request flow
- **Validation**: Can receive push notifications on device

### 3.2 EAS Build Config
- **What**: Bundle ID is `com.anonymous.mobile`, no `eas.json`
- **Files**:
  - `apps/mobile/eas.json` — development, preview, production profiles
  - Update `app.json` — proper bundle ID pattern `com.vasdjsaas.app`
- **Validation**: `eas build --platform ios --profile preview` config validates

### 3.3 i18n / Localization
- **What**: No multi-language support anywhere
- **Action**:
  - Install `next-intl` for web app
  - Create `apps/web/messages/en.json`, `es.json` as examples
  - Add locale middleware and provider
  - Add language switcher component
- **Backend**: Already has `apps/lib/locales.py` — ensure API errors are translatable
- **Validation**: Switching language changes UI text

### 3.4 Analytics Integration
- **What**: No analytics package
- **Action**:
  - Create `packages/analytics/` shared package with provider pattern
  - Implement PostHog provider (open-source, self-hostable — fits boilerplate philosophy)
  - Add `NEXT_PUBLIC_POSTHOG_KEY` env var
  - Track page views, auth events, key user actions
- **Validation**: Events appear in PostHog dashboard (or logged when no key configured)

### 3.5 SEO (OpenGraph, Sitemap, Robots)
- **What**: Minimal meta tags, no sitemap or robots.txt
- **Files**:
  - `apps/web/src/app/sitemap.ts` — dynamic sitemap generator
  - `apps/web/src/app/robots.ts` — robots.txt generator
  - Update `apps/web/src/app/layout.tsx` — comprehensive metadata with OpenGraph
  - Add `apps/web/src/lib/metadata.ts` — shared metadata helpers
- **Validation**: Social sharing previews show proper cards

### 3.6 WebSocket / Real-time (Django Channels)
- **What**: No real-time support for notifications
- **Backend**:
  - Install `channels` + `channels-redis`
  - Add `config/asgi.py` with channel routing
  - Create `NotificationConsumer` for live notifications
  - Update Docker to use Daphne/Uvicorn for ASGI
- **Frontend**:
  - WebSocket client hook `useWebSocket.ts`
  - Real-time notification updates without polling
- **Validation**: Notification appears instantly without page refresh

### 3.7 Shared packages/types
- **What**: Types are scattered across packages
- **Action**:
  - Create `packages/types/` with shared interfaces
  - Export: User, Organization, Notification, ApiKey, Subscription, etc.
  - Update other packages to import from `@vas-dj-saas/types`
- **Validation**: `pnpm type-check` passes with shared types

### 3.8 Frontend Deployment Pipeline
- **What**: No Vercel config or frontend CD
- **Files**:
  - `apps/web/vercel.json` — Vercel deployment config
  - `.github/workflows/frontend-cd.yml` — deploy on merge to main
  - Add preview deployments for PRs
- **Validation**: Merge to main triggers deployment

---

## Tier 4 — Polish & Developer Experience

### 4.1 Code Scaffolding (plop.js)
- **What**: No generators for new apps/components
- **Files**:
  - `plopfile.js` — generator definitions
  - `plop-templates/` — templates for Django app, React component, API service
- **Commands**: `pnpm generate django-app`, `pnpm generate component`, `pnpm generate service`
- **Validation**: Running generator creates properly structured files

### 4.2 CONTRIBUTING.md + CHANGELOG.md
- **What**: No contribution or changelog docs
- **Files**: `CONTRIBUTING.md`, `CHANGELOG.md`
- **Content**: Setup guide, PR process, code style, architecture overview, versioning policy

### 4.3 API Client Codegen Script
- **What**: Generated files exist but the process to regenerate is undocumented
- **Action**:
  - Add `orval.config.ts` to `packages/api-client/`
  - Add `"generate": "orval"` script to `packages/api-client/package.json`
  - Document in README
- **Validation**: `pnpm --filter api-client generate` produces fresh client code

### 4.4 Database Backup/Restore Scripts
- **What**: No pg_dump automation
- **Files**:
  - `backend/scripts/backup.sh` — pg_dump with timestamped filenames
  - `backend/scripts/restore.sh` — pg_restore from backup file
  - Add `make backup` and `make restore` targets
- **Validation**: Can backup and restore database

### 4.5 Health Check Endpoint
- **What**: Rate limiter excludes `/health/` but endpoint doesn't exist
- **Backend**:
  - Add `/api/health/` endpoint checking DB, Redis, Celery connectivity
  - Add to Docker health checks
- **Validation**: `curl /api/health/` returns status of all services

### 4.6 More Shared Auth Forms
- **What**: `packages/auth` only has Login + Register forms
- **Action**:
  - Add `ForgotPasswordForm` (web + native)
  - Add `ResetPasswordForm` (web + native)
  - Add `OAuthButtons` component (web + native)
  - Add `VerifyEmailForm` (web + native)
- **Validation**: All forms render and submit correctly on both platforms

---

## Execution Order

Each tier is implemented sequentially. Within a tier, independent items are done in parallel where possible. After each tier:
1. Run `pnpm lint && pnpm type-check && pnpm build`
2. Run backend tests: `make test`
3. Commit and push
4. Move to next tier

---

## Success Criteria

When complete, this boilerplate will have:
- Full auth flow (JWT + MFA + OAuth + email verification)
- Multi-tenant organizations with RBAC
- Billing with Stripe
- Real-time notifications (WebSocket + push)
- Feature flags with gradual rollout
- Dashboard with analytics
- API key management
- i18n / localization ready
- SEO optimized
- E2E tested
- Production-ready Docker with nginx + TLS
- CI/CD for both backend and frontend
- Cross-platform (web + mobile) with shared packages
- Excellent developer experience (generators, docs, pre-commit hooks)
