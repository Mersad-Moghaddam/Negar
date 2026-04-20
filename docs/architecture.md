# Negar Architecture

## Monorepo layout
- `backend`: Go 1.24 API (Fiber + GORM + MySQL + Redis + Zap).
- `frontend`: React 19 + TypeScript SPA (Vite + Zustand + TanStack Query + Axios + TailwindCSS).
- Root compose/docker and CI orchestrate local and production-style runs.

## Backend runtime shape
- Layering: `controllers -> services -> repositories`.
- Transport concerns remain in controllers (request parsing, validation, response envelope).
- Services hold domain logic and policies.
- Repositories isolate persistence and query behavior.

## API conventions
- Success envelope: `{ data, meta? }`.
- Error envelope: `{ code, message, details? }`.
- Auth uses bearer access tokens and rotating refresh tokens with Redis-backed token IDs.

## Frontend runtime shape
- App bootstrap lives in `frontend/src/app`:
  - `app-providers.tsx` owns provider composition.
  - `app-router.tsx` owns lazy route wiring and protected-layout composition.
- Route entry points remain in `src/pages`, but large page sections should be extracted into `src/features/*` when the page starts mixing rendering, mutations, and orchestration.
- Feature API hooks live in `src/features/*`.
- Axios client handles auth header injection and refresh retry.
- i18n and theme providers persist current settings while honoring legacy Libro keys for compatibility.

## Frontend placement rules
- Put route-only composition in `src/pages`.
- Put reusable feature sections, feature-scoped forms, API clients, and TanStack Query hooks in the owning `src/features/<feature>`.
- Put cross-cutting helpers such as query invalidation and provider wrappers in `src/shared`.
- Keep shared primitives small and generic; if a component knows about a specific domain flow, it belongs in a feature folder.

## Operational behavior
- Readiness checks MySQL and Redis connectivity with timeout.
- Request IDs and structured request logs are applied globally.
- `/metrics` exposes operational counters/histograms and dependency readiness gauges.
- Startup fails fast on missing/invalid env.

## Product analytics behavior
- Product analytics is frontend-driven and centralized in `src/shared/analytics`.
- Event taxonomy is documented in `docs/analytics-event-model.md`.
- Product analytics payloads exclude sensitive data and are intentionally separate from backend operational logs/metrics.

## Backend runtime shape
- Layering remains `controllers -> services -> repositories`, but controller packages are split by responsibility rather than keeping all handlers in a single file.
- Controller packages should keep:
  - `controller.go` for wiring/types
  - `requests.go` for validation helpers
  - action files such as `books.go`, `status.go`, `notes.go`, `links.go`
  - `audit.go` when the resource has repeated audit logging
- Request parsing stays in controllers, domain policies stay in services, and DB/Redis details stay in repositories.
- Shared transport helpers such as `requestutil.MustUserID` and `apiresponse` are preferred over re-implementing request plumbing in each controller.
