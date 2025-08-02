.PHONY: build start stop clean install dev be-dev

# Frontend commands
install:
	pnpm install

dev:
	pnpm dev

build-frontend:
	pnpm build

lint:
	pnpm lint

type-check:
	pnpm type-check

# Backend commands  
be-build:
	cd backend && make build

be-start:
	cd backend && make start

be-stop:
	cd backend && make stop

be-clean:
	cd backend && make clean

be-migrations:
	cd backend && make migrations

be-migrate:
	cd backend && make migrate

be-createsuperuser:
	cd backend && make createsuperuser

be-check-system:
	cd backend && make check-system

be-dev:
	cd backend && docker compose -f ./docker/docker-compose.yml up

# Combined commands
start: be-start

stop: be-stop

clean: be-clean

# Django specific helpers for common workflows
migrations: be-migrations

migrate: be-migrate

check-system: be-check-system

# Sanity check commands
sanity-check:
	@echo "🔍 Running comprehensive monorepo sanity checks..."
	@echo "📦 Checking workspace structure..."
	@pnpm list --depth=0 --recursive || echo "❌ Workspace structure check failed"
	@echo "🏗️  Checking if all packages can build..."
	@pnpm -w run build || echo "❌ Build check failed"
	@echo "🔍 Checking for type errors..."
	@pnpm -w run type-check || echo "❌ Type check failed"
	@echo "📱 Checking mobile app configuration..."
	@cd apps/mobile && npx expo install --check || echo "❌ Mobile dependencies check failed"
	@echo "🐳 Checking backend services..."
	@cd backend && make check-system || echo "❌ Backend system check failed"
	@echo "✅ Sanity checks completed!"

sanity-check-quick:
	@echo "⚡ Running quick sanity checks..."
	@echo "📦 Workspace structure..."
	@pnpm list --depth=0 --recursive > /dev/null && echo "✅ Workspace OK" || echo "❌ Workspace issues"
	@echo "🔍 Type checking..."
	@pnpm -w run type-check > /dev/null && echo "✅ Types OK" || echo "❌ Type issues"
	@echo "📱 Mobile dependencies..."
	@cd apps/mobile && npx expo install --check > /dev/null && echo "✅ Mobile OK" || echo "❌ Mobile issues"
	@echo "⚡ Quick checks completed!"

sanity-fix:
	@echo "🔧 Attempting to fix common issues..."
	@echo "📦 Installing/updating dependencies..."
	@pnpm install
	@echo "📱 Fixing mobile dependencies..."
	@cd apps/mobile && npx expo install --fix
	@echo "🏗️  Rebuilding packages..."
	@pnpm -w run build || echo "❌ Some packages failed to build - check logs above"
	@echo "🔧 Auto-fix completed!"

mobile-sanity:
	@echo "📱 Running mobile-specific sanity checks..."
	@echo "📦 Checking mobile dependencies..."
	@cd apps/mobile && npx expo install --check
	@echo "🎯 Checking workspace dependencies..."
	@cd apps/mobile && pnpm list | grep "@vas-dj-saas" || echo "❌ Missing workspace dependencies"
	@echo "🔍 Checking Expo configuration..."
	@cd apps/mobile && npx expo config --type=public > /dev/null && echo "✅ Expo config OK" || echo "❌ Expo config issues"
	@echo "📱 Mobile sanity check completed!"

backend-sanity:
	@echo "🐳 Running backend-specific sanity checks..."
	@cd backend && make check-system
	@echo "🐳 Backend sanity check completed!"

storybook:
	@echo "📖 Starting Storybook..."
	pnpm --filter @vas-dj-saas/ui storybook