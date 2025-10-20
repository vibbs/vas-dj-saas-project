# Public Routes

This folder contains public-facing pages that do not require authentication.

## Examples
- `/docs` - Documentation pages
- `/about` - About page
- `/pricing` - Pricing page
- `/terms` - Terms of service
- `/privacy` - Privacy policy

## Structure
```
(public)/
├── docs/
│   └── page.tsx        # Renders at /docs
├── about/
│   └── page.tsx        # Renders at /about
└── pricing/
    └── page.tsx        # Renders at /pricing
```

## Notes
- Route group `(public)` is ignored in URLs
- Pages here are accessible without authentication
- Use the same layout pattern as `(auth)` if needed
