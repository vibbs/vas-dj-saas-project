# VAS-DJ Marketing Site

Next.js marketing website optimized for SEO and lead generation, built with modern web technologies and designed to convert visitors into VAS-DJ SaaS customers.

## 🚀 Quick Start

```bash
# From monorepo root
pnpm install
pnpm dev

# Or run just the marketing site
pnpm --filter @vas-dj-saas/marketing dev
```

The marketing site will be available at [http://localhost:3001](http://localhost:3001).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── about/             # About page
│   ├── blog/              # Blog system with dynamic routes
│   │   ├── [slug]/        # Individual blog posts
│   │   └── page.tsx       # Blog index
│   ├── contact/           # Contact page with form
│   ├── pricing/           # Pricing plans and comparison
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Homepage
│   ├── robots.ts          # SEO robots.txt
│   └── sitemap.ts         # Dynamic sitemap generation
├── components/
│   ├── sections/          # Homepage sections
│   │   ├── hero.tsx       # Hero section with CTA
│   │   ├── features.tsx   # Features showcase
│   │   ├── pricing-plans.tsx # Pricing tables
│   │   ├── testimonials.tsx # Customer testimonials
│   │   ├── faq.tsx        # FAQ section
│   │   └── cta.tsx        # Call-to-action sections
│   ├── ui/               # UI components
│   │   ├── navigation.tsx # Main navigation
│   │   ├── footer.tsx     # Site footer
│   │   ├── button.tsx     # Custom button component
│   │   └── theme-toggle.tsx # Dark mode toggle
│   └── theme-provider.tsx # Theme context provider
├── config/               # Configuration files
│   ├── site.ts           # Site metadata and configuration
│   ├── content.ts        # Content management configuration
│   ├── pricing.ts        # Pricing plans data
│   └── blog.ts           # Blog configuration
└── lib/
    └── utils.ts          # Utility functions
```

## 🎯 Key Features

### SEO Optimization
- **Next.js 15.4** with App Router for optimal performance
- **Dynamic sitemap** generation for search engines
- **Structured data** markup for rich snippets
- **Meta tags** optimization for social sharing
- **Core Web Vitals** optimization for search ranking
- **Image optimization** with Next.js Image component

### Content Management
- **MDX support** for rich blog content
- **Dynamic routing** for blog posts and pages
- **Static generation** for fast loading times
- **Content validation** with TypeScript
- **Image optimization** for blog assets

### Performance Features
- **Static Site Generation (SSG)** for marketing pages
- **Incremental Static Regeneration (ISR)** for blog
- **Image optimization** with WebP/AVIF support
- **Font optimization** with Next.js Font
- **Bundle optimization** with tree shaking

### Conversion Optimization
- **Landing page** optimization for conversions
- **A/B testing** ready with configuration
- **Analytics integration** (Google Analytics, etc.)
- **Contact forms** with validation and submission
- **Newsletter signup** with email capture

## 🎨 Design System

### Tailwind CSS 4
Modern utility-first styling:
```css
/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
  }
}

/* Custom components */
.hero-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
}
```

### Component Architecture
- **Reusable sections** for marketing pages
- **Responsive design** with mobile-first approach
- **Dark mode support** with system preference detection
- **Accessible components** with proper ARIA labels
- **Animation support** with CSS transitions

### Brand Consistency
- **Design tokens** aligned with main SaaS app
- **Typography scale** for consistent hierarchy
- **Color palette** optimized for conversions
- **Icon system** using Lucide React icons

## 📊 Analytics & Tracking

### Conversion Tracking
```typescript
// Track signup conversions
import { trackEvent } from '@/lib/analytics';

const handleSignup = () => {
  trackEvent('signup_click', {
    source: 'hero_cta',
    plan: 'starter'
  });
};
```

### Performance Monitoring
- **Core Web Vitals** tracking
- **Page speed** monitoring
- **User journey** analysis
- **Conversion funnel** tracking

## 📝 Content Management

### Blog System
```typescript
// Dynamic blog routes
// app/blog/[slug]/page.tsx
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
}
```

### Content Configuration
```typescript
// config/content.ts
export const blogConfig = {
  postsPerPage: 10,
  categories: ['Product', 'Engineering', 'Company'],
  authors: {
    'vaibhav': {
      name: 'Vaibhav Doddihal',
      bio: 'Founder & CEO',
      avatar: '/avatars/vaibhav.jpg'
    }
  }
};
```

### SEO Features
- **Dynamic meta tags** for each page
- **Open Graph** images for social sharing
- **Twitter Cards** optimization
- **JSON-LD** structured data
- **Canonical URLs** for duplicate content prevention

## 🏗️ Architecture

### Static Site Generation
```typescript
// Optimized for SEO and performance
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

### Performance Optimization
- **Static generation** for marketing pages
- **Edge functions** for dynamic content
- **Image optimization** with responsive loading
- **Font optimization** with subset loading
- **Bundle splitting** for optimal loading

## ⚙️ Configuration

### Environment Variables
Create `.env.local`:
```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://vas-dj.com
NEXT_PUBLIC_APP_URL=https://app.vas-dj.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Contact Form
CONTACT_EMAIL=hello@vas-dj.com
EMAIL_API_KEY=your-email-service-key
```

### Site Configuration
```typescript
// config/site.ts
export const siteConfig = {
  name: "VAS-DJ",
  description: "Validated App Stack for Dreamers & Jackers",
  url: "https://vas-dj.com",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/vasdj",
    github: "https://github.com/vas-dj/vas-dj-saas",
  },
  creator: "Vaibhav Doddihal",
};
```

## 🧪 Development

### Development Commands
```bash
# Development server (port 3001)
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build

# Start production build
pnpm start
```

### Content Development
- **MDX files** for blog posts and content
- **Hot reload** for content changes
- **Image optimization** during development
- **Typography preview** with development tools

### Testing
- **Component testing** with Testing Library
- **E2E testing** for critical user flows
- **Performance testing** with Lighthouse
- **SEO testing** with structured data validation

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Production deployment
vercel deploy --prod

# Preview deployments for branches
vercel deploy
```

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Build with bundle analysis
ANALYZE=true npm run build
```

### Performance Monitoring
- **Vercel Analytics** for performance insights
- **Core Web Vitals** monitoring
- **Real User Monitoring** for actual performance
- **Lighthouse CI** for automated performance testing

## 🎯 Conversion Features

### Lead Generation
- **Newsletter signup** with email validation
- **Contact forms** with spam protection
- **Demo request** forms with qualification
- **Free trial signup** with conversion tracking

### Social Proof
- **Customer testimonials** with real photos
- **Company logos** of current customers
- **Usage statistics** and social proof metrics
- **Case studies** and success stories

### Call-to-Action Optimization
- **A/B testing** for CTA buttons and copy
- **Urgency indicators** for limited offers
- **Trust signals** with security badges
- **Money-back guarantees** and risk reduction

## 🔗 Integration Points

### Main SaaS Application
- **Seamless handoff** to app.vas-dj.com
- **Single sign-on** integration planning
- **Shared design tokens** and branding
- **User journey** optimization between sites

### Backend Integration
- **Contact form** submissions to Django backend
- **Newsletter signups** through API
- **Demo requests** and lead qualification
- **Analytics data** sharing where appropriate

### External Services
- **Email marketing** integration (Mailchimp, ConvertKit)
- **CRM integration** for lead management
- **Analytics platforms** (Google Analytics, Mixpanel)
- **A/B testing** platforms (Optimizely, VWO)

## 📊 SEO Strategy

### Technical SEO
- **Sitemap generation** for all pages
- **Robots.txt** optimization
- **Meta tags** optimization
- **Structured data** for rich snippets
- **Page speed** optimization
- **Mobile responsiveness** validation

### Content SEO
- **Keyword optimization** for target terms
- **Content calendar** for regular publishing
- **Internal linking** strategy
- **External link** building opportunities

### Local SEO (if applicable)
- **Business listings** optimization
- **Local schema** markup
- **Google My Business** integration

## 📚 Related Documentation

- **[Main Web App](../web/README.md)** - SaaS application documentation
- **[Backend API](../../backend/README.md)** - Django REST API
- **[UI Components](../../packages/ui/README.md)** - Shared component library
- **[Project Overview](../../README.md)** - Monorepo documentation

## 🤝 Contributing

### Content Guidelines
1. Follow the established content structure and style
2. Optimize all content for SEO and conversion
3. Test responsive design across devices
4. Validate structured data markup
5. Monitor performance impact of changes

### Development Guidelines
1. Use semantic HTML for accessibility and SEO
2. Optimize images before adding to the site
3. Test page speed after making changes
4. Follow the established design system
5. Ensure mobile-first responsive design

## 🔍 SEO Checklist

### Pre-Launch
- [ ] All pages have unique, optimized title tags
- [ ] Meta descriptions are compelling and under 160 characters
- [ ] Images have descriptive alt text
- [ ] Site loads in under 3 seconds
- [ ] Mobile responsive design is validated
- [ ] Sitemap is generated and submitted
- [ ] Analytics tracking is implemented

### Post-Launch
- [ ] Monitor Core Web Vitals scores
- [ ] Track conversion rates and optimize CTAs
- [ ] Regular content updates and blog publishing
- [ ] Monitor search rankings and adjust strategy
- [ ] A/B test key conversion elements