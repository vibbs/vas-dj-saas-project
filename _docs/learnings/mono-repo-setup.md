# WIP


Should we have a separate marketting nextjs web app ?



Suggested Folder Layout

apps/
├── marketing/       # Static, SEO-friendly, no auth, no JS needed for content
├── web/             # Logged-in app (Next.js App Router with auth, dashboard UX)
└── mobile/          # Expo
Domains:

Domain	Purpose
yourdomain.com → apps/marketing	SEO site, blog, landing, pricing, legal
app.yourdomain.com → apps/web	Authenticated product UI

🚀 Benefits of This Setup
Feature	Benefit
🔐 Auth isolation	No leaking of tokens into public marketing site
💡 SEO optimized	Static rendering, meta tags, OG images, sitemap, etc.
🎯 Focused UX	Each app does one job well (marketing vs dashboard)
🧱 Clean modularity	Separate deployments, CI, CD pipelines
📈 Analytics ready	Integrate Segment, GA, Plausible only where needed

🧠 Bonus Considerations
You can share components and styles via packages/ui, packages/utils, packages/types

If you ever use a CMS for marketing (e.g., Sanity, TinaCMS), this architecture is ready to plug in

Use robots.txt, meta tags, and canonical URLs in apps/marketing for strong SEO posture

🛠 Vercel / Hosting Suggestion
App	Domain	Branch	Hosting
Marketing	yourdomain.com	main	Vercel
Web app	app.yourdomain.com	main	Vercel

Both apps can live in same Git repo, with separate Vercel project config.

✅ TL;DR
Create two separate Next.js apps in your monorepo:

apps/marketing → for public SEO content (yourdomain.com)

apps/web → for your actual SaaS app (app.yourdomain.com)

This is what Stripe, Vercel, and most production SaaS apps do — for good reason.