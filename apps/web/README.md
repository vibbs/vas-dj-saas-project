# VAS-DJ Web Application

The main SaaS web application built with Next.js, providing the core user interface for the VAS-DJ multi-tenant platform.

## 🚀 Quick Start

```bash
# From monorepo root
pnpm install
pnpm dev

# Or run just the web app
pnpm --filter @vas-dj-saas/web dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router (App Directory)
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── verify-email/  # Email verification
│   ├── dashboard/         # Main SaaS dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing/home page
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── styles/               # Global styles
```

## 🏗️ Architecture

### App Router (Next.js 15.4)
- **File-based routing** with the `app/` directory
- **Server-side rendering** with React Server Components
- **Client components** where interactivity is needed
- **Nested layouts** for consistent page structure

### Authentication Flow
- **JWT-based authentication** using `@vas-dj-saas/auth` package
- **Protected routes** with middleware
- **Multi-step registration** with email verification
- **Password reset** workflow

### State Management
- **React Context** for global state (auth, user, organization)
- **Server State** managed by API client with proper caching
- **Form state** with React Hook Form integration

## 🎨 UI Components

### Shared Components
Uses `@vas-dj-saas/ui` package for consistent design:
- **Cross-platform components** that work on web and mobile
- **Theme system** with dark/light mode support
- **Responsive design** with Tailwind CSS 4
- **Accessibility** built into all components

### Custom Components
- **Dashboard layouts** for SaaS interface
- **Data tables** with sorting and filtering
- **Charts and analytics** components
- **Organization switcher** for multi-tenancy

## 🔐 Authentication & Authorization

### JWT Token Management
```typescript
import { useAuth } from '@vas-dj-saas/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // Use authentication state
}
```

### Protected Routes
```typescript
// middleware.ts
import { withAuth } from '@vas-dj-saas/auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});
```

### Organization Context
```typescript
import { useOrganization } from '@vas-dj-saas/auth';

function Dashboard() {
  const { currentOrg, switchOrganization } = useOrganization();
  // Multi-tenant functionality
}
```

## 📡 API Integration

### Type-Safe API Client
```typescript
import { apiClient } from '@vas-dj-saas/api-client';
import type { User, Organization } from '@vas-dj-saas/types';

// Fully typed API calls
const user = await apiClient.users.getCurrentUser();
const orgs = await apiClient.organizations.list();
```

### Error Handling
- **Global error boundaries** for React errors
- **API error handling** with user-friendly messages
- **Form validation** with real-time feedback
- **Toast notifications** for user feedback

## 🎯 Key Features

### Dashboard
- **Organization overview** with key metrics
- **User management** for team members
- **Billing and subscriptions** interface
- **Settings and preferences**

### Multi-Tenancy
- **Organization switching** in navigation
- **Subdomain routing** support
- **Organization-scoped data** display
- **Role-based permissions** UI

### Responsive Design
- **Mobile-first** approach with Tailwind CSS
- **Progressive web app** capabilities
- **Touch-friendly** interface elements
- **Responsive navigation** with mobile menu

## ⚙️ Configuration

### Environment Variables
Create `.env.local` for local development:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics, etc.
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Next.js Configuration
Key configurations in `next.config.ts`:
- **Turborepo** integration for monorepo builds
- **Image optimization** settings
- **API route** configurations
- **Environment variable** validation

## 🧪 Development

### Development Commands
```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Building for production
pnpm build

# Start production build
pnpm start
```

### Code Organization
- **Feature-based** folder structure where applicable
- **Shared utilities** in `lib/` directory
- **Custom hooks** for reusable logic
- **Type definitions** imported from `@vas-dj-saas/types`

### Styling Guidelines
- **Tailwind CSS 4** for utility-first styling
- **CSS Modules** for component-specific styles when needed
- **Design tokens** from UI package for consistency
- **Responsive utilities** for all screen sizes

## 🚀 Deployment

### Build Process
```bash
# Production build
pnpm build

# Analyze bundle size
pnpm analyze
```

### Vercel Deployment
Optimized for Vercel deployment:
- **Zero-config** deployment from monorepo
- **Edge functions** for authentication
- **Image optimization** built-in
- **Analytics** integration

### Environment Setup
- **Production environment variables** in hosting platform
- **Database connection** through backend API
- **CDN configuration** for static assets
- **SSL certificates** and domain setup

## 🔗 Integration Points

### Shared Packages
- **@vas-dj-saas/ui**: UI components and theming
- **@vas-dj-saas/auth**: Authentication logic and components
- **@vas-dj-saas/api-client**: Backend API communication
- **@vas-dj-saas/types**: Shared TypeScript types
- **@vas-dj-saas/utils**: Shared utility functions

### External Services
- **Django REST API**: Backend data and business logic
- **Email service**: Transactional emails via backend
- **File uploads**: Handled through backend with cloud storage
- **Analytics**: Optional integration for user tracking

## 📚 Related Documentation

- **[Backend API Documentation](../../backend/README.md)** - Django REST API
- **[UI Components](../../packages/ui/README.md)** - Shared component library
- **[Authentication](../../packages/auth/README.md)** - Auth system documentation
- **[API Client](../../packages/api-client/README.md)** - Type-safe API client
- **[Mobile App](../mobile/README.md)** - React Native companion app

## 🤝 Contributing

1. Follow the established patterns for new features
2. Use shared components from `@vas-dj-saas/ui` where possible
3. Maintain type safety with TypeScript
4. Test responsive design across different screen sizes
5. Ensure accessibility standards are met