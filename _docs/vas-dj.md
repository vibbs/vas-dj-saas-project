
![vas-dj-logo](./images/vas-dj-logo-banner.png)

### 🔍 Why VAS-DJ?

> **Take the long road — with a map.**

* 💡 **Build intentionally**: We skip the hype, and focus on extensible architecture
* 🧱 **Modular by default**: Shared UI, config, utils — built once, used everywhere
* 🛠️ **Tinker-friendly**: Change the frontend, the auth system, or the DB — without burning it down
* 🧑‍🔬 **AI-Ready**: RAG-ready backend, vector-friendly database support, agent interfaces coming soon

---

### 🔩 Core Features

#### ✅ Backend

* Django + DRF, modular apps, 2FA-ready auth system, tenancy support
* Plug-and-play: Celery, API Key management, Role-based access

#### ✅ Frontend

* Expo (React Native) + Next.js support
* Shared UI with theme tokens, icon system, and platform fallbacks

#### ✅ Shared Packages

* Monorepo setup (Turborepo): `ui`, `auth`, `config`, `utils`, `api`, etc.
* Config-driven DX (readable & overrideable)

#### ✅ Dev Experience

* GitHub Actions + Vercel/Expo CI setup
* Unified error handling, toast system, logging

---

### 🎨 Architecture Diagram

Embed this minimal diagram you requested earlier:

> Center: Django/DRF Backend
> Left: Next.js Web App
> Right: Expo Mobile App
> Bottom: Shared UI/Packages
> With overlays: API, Auth, Database, etc.

*(Will also give you an SVG version of this with consistent color tokens)*

---

### 🧑‍🚀 Who is VAS-DJ For?

1. Dreamers — Indie hackers, builders, creators with vision.
  - You don’t want to waste time configuring ten tools just to see if your idea has legs.
  - You want a clean setup that lets you focus on product, not plumbing.

2. Jackers — The hackers, tinkerers, engineers who love getting under the hood.
  - You don’t just want a black-box SaaS starter — you want control.
  - You want to inject workflows, override defaults, build real systems.
  - You want the joy of engineering, not just assembling.


---

### 🧱 Tech Stack (Visual Cards)

* Django • DRF • Next.js • Expo • Supabase (optional)
* PostgreSQL • Tailwind • React Native • Turborepo • Framer Motion
* GitHub Actions • Vercel • (optional) LocalStack

---

### 🛣️ Roadmap

| Feature                         | Status         |
| ------------------------------- | -------------- |
| Django+DRF modular backend      | ✅ Complete     |
| Custom Auth (JWT, 2FA ready)    | ✅ Complete     |
| Frontend setup (Expo + Next.js) | ✅ Complete     |
| Shared packages (UI, config)    | ✅ Initial      |
| CI/CD templates                 | 🔄 In Progress  |
| Admin Dashboard (optional)      | 🧩 Planned      |
| AI-ready module                 | 🧪 Experimental |
| Open-source docs site           | 🔜 Coming Soon  |

There are others that are soon to come

---

### ❓ FAQ

**Q: Can I swap Django for FastAPI?**

> You could — but you'd lose the "DJ" part 😉
> The backend is abstracted enough to adapt in future.

**Q: Can I only use the frontend?**

> Yes — it’s modular. Just use the `packages/ui`, `auth`, and plug in your API.

**Q: Is this production-ready?**

> Yes — if you’re experienced. It gives you a head start, not guard rails.

**Q: What license?**

> MIT — use it, break it, fork it. Give a shout if you build something great.

---

### 🦴 Footer

* Built by [Vaibhav Doddihal](https://www.linkedin.com/in/vaibhavdoddihal/)
* Maintained under the [BlockSimplified](https://www.blocksimplified.com/) banner

