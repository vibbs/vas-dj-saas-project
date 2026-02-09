# CLAUDE.md - VAS-DJ SaaS Monorepo

## Self-Improving Agent System

This project uses a file-based learning system. On each session:

### Triage Pattern
For every significant discovery, explicitly decide:
1. **Apply** immediately if actionable
2. **Capture** to `.claude/learnings/learnings.md` with context
3. **Dismiss** with reasoning if not valuable

### Session Continuity
- **Start**: Read `.claude/state/current-session.md` for context
- **During**: Update state at major milestones
- **End**: Update state with completed work and next steps

### Evolution Triggers
- Learnings > 30 entries → consolidate and promote to rules
- Pattern appears 3+ times → promote to `.claude/rules/`
- Rules become procedural → extract to `.claude/processes/`
- New files require justification; prefer editing existing content

## Project Essentials

**Type**: Turborepo monorepo (Next.js + React Native + Django)

**Quick Commands**:
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm type-check`
- `make start` / `make stop` / `make migrate` / `make sanity-check`

**Structure**:
- `apps/web` - Next.js 15 SaaS app
- `apps/mobile` - Expo React Native app
- `packages/*` - Shared: ui, auth, api-client, utils, types
- `backend/` - Django REST API

**Adding Features**: types → backend API → api-client → ui → apps

## File Organization

| Purpose | Location |
|---------|----------|
| Temporary/test files | `ai-playground/` |
| Documentation | `_docs/` or `backend/docs/` |
| Learnings | `.claude/learnings/` |
| Rules | `.claude/rules/` |
| Session state | `.claude/state/` |
| Processes | `.claude/processes/` |
| Detailed reference | `.claude/docs/project-reference.md` |

## Context Budgets

| File | Limit |
|------|-------|
| CLAUDE.md | ~100 lines |
| Rules (total) | ~200 lines |
| Learnings | ~30 active entries |

---
*For detailed commands, architecture, and troubleshooting: `.claude/docs/project-reference.md`*
