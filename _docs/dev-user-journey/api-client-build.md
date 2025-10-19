# Phase 0 — Scaffolding (schema in, code out)

### 0.1 Create package skeleton (1 SP)

**Goal:** `packages/api-client` exists, builds, and publishes locally.
**DoD:**

* Folder: `packages/api-client/`
* Files: `src/index.ts`, `.npmrc`, `.gitignore`, `package.json`, `tsconfig.json`
* `pnpm build` (or npm) produces `dist/` (ESM + CJS)
* `"sideEffects": false`

---

### 0.2 Configure dual-module outputs (ESM+CJS) (1 SP)

**Goal:** Max compatibility (Node/Next/RN).
**DoD (package.json):**

```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./axios": {
      "types": "./dist/axios.d.ts",
      "import": "./dist/axios.mjs",
      "require": "./dist/axios.cjs"
    }
  },
  "sideEffects": false
}
```

* `tsup`/`rollup`/`tsc` produces both `.mjs` and `.cjs`.

---

### 0.3 Add TypeScript config + strictness (1 SP)

**Goal:** Catch drift early.
**DoD (`tsconfig.json`):**

* `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`
* Path aliases: `@/core/*`, `@/generated/*`, `@/services/*`
* Declaration + source maps enabled

---

### 0.4 Choose and pin codegen tool (1 SP)

**Goal:** Deterministic output.
**DoD:**

* Pick **Orval**  and pin version in `devDependencies`.
* Just the standard typescript output (no axios instance) should suffice for both web and mobile. 
  * If required later, we can add react hooks generation as an additional output target.
* Add `codegen` script:

  * Input: `${BACKEND_URL}/api/v1/schema` (for v1 major)
  * Output: `src/generated/` (single version only)
* Check in generated code.


### 0.4.1 Codegen run verification (1 SP)
**Goal:** No accidental churn.
**DoD:**

* Running `pnpm codegen` multiple times with unchanged schema produces no diffs.
* CI job to verify this in Phase 3.
* Manual verification process documented.

---

### 0.5 Codegen config file (1 SP)

**Goal:** Thin, readable functions using your client.
**DoD (example Orval):**

* `orval.config.ts` targets:

  * `output.client`: functions only (no internal axios instance)
  * `useUnionTypes: true`, stable naming
  * Tag-based folders -> `src/generated/{tag}.ts`
* `pnpm codegen` regenerates with no diffs when schema unchanged.

---

# Phase 1 — Core HTTP client (fetch-first)

### 1.1 Minimal Fetch ApiClient (1 SP)

**Goal:** One place for auth, headers, retries.
**DoD:**

* `src/core/ApiClient.ts` exports `request<T>(config)`
* Adds headers: `Authorization`, `X-Org-Id`, `X-Request-Id`
* Handles JSON encode/decode and HTTP errors → throws `ApiError`

---

### 1.2 Retry + backoff (1 SP)

**Goal:** Resilience.
**DoD:**

* Exponential backoff for `5xx` + network errors (cap retries; jitter)
* **No retry** on idempotency-unsafe methods unless explicitly flagged
* Pluggable via options: `retry: { attempts, baseMs, methods }`

---

### 1.3 Auth refresh hook (1 SP)

**Goal:** Seamless token refresh.
**DoD:**

* Inject a `getAccessToken()` + `refreshToken()` interface from consumer
* Automatic refresh once per 401 (single-flight), then replay original request
* Clear state on refresh failure and surface `AuthError`

---

### 1.4 Tenancy & tracing headers (1 SP)

**Goal:** Multi-tenant observability.
**DoD:**

* Add `withOrg(orgId)` helper that sets per-request/org scope
* Generate `X-Request-Id` UUID if missing
* Optional `X-Client-Version` (package version)

---

### 1.5 Standard error shape (1 SP)

**Goal:** Consistent error handling.
**DoD:**

* `ApiError` carries `{ status, code, message, details, requestId }`
* Maps backend envelope → typed error
* Ensures unknown shapes still produce meaningful `message`

---

### 1.6 Optional Axios subpath (1 SP)

**Goal:** Escape hatch for teams.
**DoD:**

* `src/axios.ts` exports axios-bound client implementing the same `request<T>`
* Mark axios as `peerDependency` and provide subpath export `./axios`

---

# Phase 2 — Services surface (current API only)

### 2.1 Service wrapper pattern (1 SP)

**Goal:** Clean, stable entry points.
**DoD:**

* `src/services/users.ts` with thin wrappers over `src/generated/*`
* Example:

```ts
import { request } from "@/core/ApiClient";
import { getUserById } from "@/generated/users";
export const UserService = {
  getById: (id: string) => getUserById({ request, params: { id } }),
};
```

---

### 2.2 Pagination & list helpers (1 SP)

**Goal:** Uniform lists.
**DoD:**

* `src/core/pagination.ts`: `Paginated<T>`, `iterateAll(fetchPage)` helper
* Services return `{ items, nextCursor }` consistently

---

### 2.3 Domain types barrel (1 SP)

**Goal:** Public types you commit to for **this major**.
**DoD:**

* `src/types.ts` exports domain-friendly types (not raw generator internals)
* Re-export in `src/index.ts`

---

### 2.4 Tree-shakeable index (1 SP)

**Goal:** Keep bundles lean.
**DoD:**

* `src/index.ts` exports **only** current major services + client + types
* No accidental re-export of internal generated code
* Verified using `size-limit`

---

# Phase 3 — Quality gates & CI

### 3.1 Spectral lint for schema (1 SP)

**Goal:** Style & completeness.
**DoD:**

* CI job runs `spectral lint openapi.yaml` with ruleset (examples, enums, descriptions)
* Fails on violations

---

### 3.2 oasdiff breaking-change check (1 SP)

**Goal:** Prevent silent breaks.
**DoD:**

* CI compares current schema to last published tag
* Fails PR if breaking changes detected without major bump label

---

### 3.3 Codegen determinism check (1 SP)

**Goal:** No accidental churn.
**DoD:**

* CI runs `pnpm codegen && git diff --exit-code`
* Fails if generated files changed but not committed

---

### 3.4 Consumer smoke tests (1 SP)

**Goal:** Real-world integration.
**DoD:**

* Tiny Node script and Next.js page using `UserService.getById`
* CI builds & runs both (Node + Next SSR) against mock or dev backend

---

### 3.5 React Native build check (1 SP)

**Goal:** Ensure Metro compatibility.
**DoD:**

* Test app compiles importing `UserService`
* No polyfill errors; fetch client works

---

### 3.6 Bundle size guard (1 SP)

**Goal:** Avoid bloat.
**DoD:**

* `size-limit` configured with budget (e.g., < 15 KB min+gzip for core)
* CI fails on regression

---

# Phase 4 — Release & versioning discipline

### 4.1 Conventional commits + changelog (1 SP)

**Goal:** Clear releases.
**DoD:**

* `changesets` or `semantic-release` configured
* Auto `CHANGELOG.md` with “Breaking changes” section

---

### 4.2 Dist-tags policy (1 SP)

**Goal:** Easy pinning for teams.
**DoD:**

* Publish rule: `latest` → current major; `v1-lts` for last v1
* Document install: `npm i @vas-dj-saas/api-client@v1-lts`

---

### 4.3 Renovate rules (1 SP)

**Goal:** Safe upgrades.
**DoD:**

* Renovate configured to **not** auto-merge majors for this package
* Minor/patch auto; majors manual

---

### 4.4 Upgrade guide template (1 SP)

**Goal:** Smooth major flips.
**DoD:**

* `docs/UPGRADING-v1-to-v2.md` template with:

  * “What changed” bullets
  * Code grep table (old → new)
  * DTO shape diffs
  * Deprecations list

---

# Phase 5 — Developer experience polish

### 5.1 Source maps & declaration maps (1 SP)

**Goal:** Debuggable stacks.
**DoD:**

* `declarationMap: true`, `sourceMap: true` for wrappers
* Verified in a sample app stack trace

---

### 5.2 Error formatting helpers (1 SP)

**Goal:** Consistent UX.
**DoD:**

* `formatApiError(err): string` to show `code`, `message`, `requestId`
* Re-export from root

---

### 5.3 Request logging toggle (1 SP)

**Goal:** On-demand diagnostics.
**DoD:**

* `enableLogging({ requests: boolean, responses: boolean })`
* No logs by default; logs omit secrets

---

### 5.4 Examples & cookbook (1 SP)

**Goal:** Reduce support load.
**DoD:**

* `examples/` with:

  * Basic Node usage
  * Next.js SSR + RSC fetch
  * RN fetch usage
  * Pagination and error handling

---

# Phase 6 — Future-proofing hooks (optional now)

### 6.1 Hook factory (1 SP)

**Goal:** TanStack Query ready.
**DoD:**

* `createQueryHooks(fetcher)` producing `useGetUser(id)` style hooks
* Lives in a separate `@vas-dj-saas/api-react` package later (keep core lean)

---

# Phase 7 — Guardrails for “1 major = 1 API version”

### 7.1 Enforce single version in build (1 SP)

**Goal:** No accidental multi-version bundling.
**DoD:**

* CI assertion that `src/generated/` contains **no** `v2/` when building v1 major, etc.
* Lint rule banning imports from non-current version folders

---

### 7.2 Pre-publish check (1 SP)

**Goal:** Publishing hygiene.
**DoD:**

* Script validates:

  * schema URL matches targeted version (`/v1` for 1.x)
  * `CHANGELOG` includes migration notes if major
  * dist has only expected files (whitelist in `files` field)

---

# What you’ll have at the end

* `@vas-dj-saas/api-client@1.x` that **only** talks to `/v1`
* Minimal, fetch-first core with optional `…/axios`
* Thin, stable `UserService`/`OrgService` wrappers
* Strong CI guardrails (Spectral, oasdiff, determinism, size)
* Crystal-clear release & upgrade flow

---

## Quick workboard snapshot

* [ ] 0.1 Package skeleton
* [ ] 0.2 Dual-module exports
* [ ] 0.3 TS strict config
* [ ] 0.4 Pick and pin codegen
* [ ] 0.5 Codegen config
* [ ] 1.1 Fetch ApiClient
* [ ] 1.2 Retry/backoff
* [ ] 1.3 Auth refresh
* [ ] 1.4 Tenancy/tracing headers
* [ ] 1.5 Error normalization
* [ ] 1.6 Axios subpath (optional)
* [ ] 2.1 Service wrappers
* [ ] 2.2 Pagination helpers
* [ ] 2.3 Domain types barrel
* [ ] 2.4 Index exports (tree-shakeable)
* [ ] 3.1 Spectral
* [ ] 3.2 oasdiff
* [ ] 3.3 Determinism check
* [ ] 3.4 Node/Next smoke
* [ ] 3.5 RN build check
* [ ] 3.6 Size guard
* [ ] 4.1 Changelog automation
* [ ] 4.2 Dist-tags policy
* [ ] 4.3 Renovate rules
* [ ] 4.4 Upgrade guide template
* [ ] 5.1 Source maps
* [ ] 5.2 Error formatter
* [ ] 5.3 Logging toggle
* [ ] 5.4 Examples
* [ ] 6.1 Hook factory (later)
* [ ] 7.1 Enforce single-version imports
* [ ] 7.2 Pre-publish check

