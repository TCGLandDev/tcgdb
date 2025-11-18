# TCG Database App

React 19 + Vite dashboard for the public‑facing TCG Database (TCGDB) experience.  
It reuses the admin shell patterns (ShadCN UI, TanStack Query, shared providers) but focuses on
Pokémon and Magic product CRUDs that run through `@zengateglobal/persistence-sdk`.

## Prerequisites
- Node.js 24.x
- pnpm 10.20.0 (enforced via `packageManager`)
- Go API running locally or proxied to `/api/v1` for real data

Install workspace dependencies from the repo root:

```bash
pnpm install
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev -C apps/tcgdb` | Start the Vite dev server (watches files, enables React Query Devtools in dev).
| `pnpm build -C apps/tcgdb` | Type-check and produce production assets (must run after every FE change per build gate).
| `pnpm preview -C apps/tcgdb` | Preview the production build locally.
| `pnpm lint -C apps/tcgdb` | Run ESLint with the flat config bundle.

> **Build Gate**: before pushing or opening a PR, run `pnpm build -C apps/tcgdb` and fix any errors. This mirrors the requirement in `AGENTS.md`.

## Environment Variables
Copy `.env.example` to `.env` or set the variables before running the dev server:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | ✅ | `/api/v1` | Base path for the persistence provider; proxied to the Go backend during dev.
| `VITE_ENV` | ☐ | — | Optional label used for environment badges/logging (`development`, `staging`, `production`).
| `VITE_SENTRY_DSN` | ☐ | — | Optional DSN for browser error reporting.

The dev server reads `import.meta.env.*`; no rebuild is needed when variables change—restart `pnpm dev` to pick up new values.

## Project Layout
```
apps/web-admin/
  src/
    App.tsx            # renders route tree + devtools (in dev)
    main.tsx           # provider stack + BrowserRouter
    routes.tsx         # React Router config
    providers/         # theme, auth, i18n, TanStack Query contexts
    components/        # shadcn/ui + navigation + dashboard widgets
    domains/           # domain-specific CRUD hooks + schemas
    app/               # route-aligned pages (dashboard + CRUDs)
  .env.example         # sample env vars
  package.json         # pnpm workspace config for this app
```

## Providers
`main.tsx` wraps the app with:
- `ThemeProvider` (next-themes) → dark/light/system theme handling.
- `BrowserRouter` → React Router entry point.
- `I18nProvider` (react-i18next) → translations.
- `QueryProvider` (TanStack Query) → data fetching cache/devtools.
- `AuthProvider` → JWT & role state exposed via `useAuth()`/`RequireRoles()`.

`src/lib/persistence.ts` wires a `PersistenceClient` backed by the OpenAPI-powered provider.

## Debugging
- React Query Devtools load automatically in development (`import.meta.env.DEV`). Use the bottom-right toggle button.
- ESLint (flat config) includes React 19 compiler checks. Some template components disable specific rules until the custom UI replaces them.

## Additional Docs
- [docs/web-app.md](../../docs/web-app.md) — full frontend guidelines (routing, providers, codegen).
- [docs/project-requirements-document.md](../../docs/project-requirements-document.md) — product requirements & domain context.
- [TCGDB schema snapshots](../../docs/persistence-layer/tcgdb-schemas/README.md) — normalized entity schemas mirrored from the upstream data model for reference.
