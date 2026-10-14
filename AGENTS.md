<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Lastro — agent guide

Lastro is a household finance web app (pt-BR, BRL). Product spec: [docs/features.md](docs/features.md). Visual rules: [docs/visual-identity.md](docs/visual-identity.md). Human-facing overview: [README.md](README.md).

**Keep this file current.** When you learn a gotcha, change a convention or add a tool, update this file in the same change. An outdated AGENTS.md is worse than none.

## Workflow

- **Never commit.** The user reviews and commits. Work in steps; at the end of each step, stop and report what changed (files + summary) so the user can review and commit, then wait to be told to continue.
- **TDD.** Write the failing tests first, run them red, then implement until green.
  - Unit tests (Jest): `tests/unit/**`, mirroring the source path (`lib/domain/money.ts` → `tests/unit/domain/money.test.ts`). Default environment is `node`; add `/** @jest-environment jsdom */` at the top of component tests.
  - E2E tests (Cypress): `cypress/e2e/**/*.cy.ts`, run against a production build on port 3100 using the `lastro_test` database.
- Before reporting a step as done: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run test:e2e` when the environment allows it. Say plainly if something could not be run.
- After each step, update README.md and any affected doc (including this file).

## Conventions

- **KISS, generic over specific.** If a function, component or handler can serve several cases without bending its core, make it generic (e.g. one `Field` component, one form-action helper) instead of copies.
- **Comments:** minimal. Document the main behavior in a short docstring on exported functions/components. Avoid standalone inline comments unless something is genuinely non-obvious.
- **Layers:**
  - `lib/domain/` — pure, framework-free business logic (money, dates, transaction rules, balances, summaries). No DB, no Next imports. Everything here is unit-tested.
  - `lib/db/` — Drizzle schema and client (`server-only`).
  - `lib/strings.ts` — every user-facing pt-BR string. Do not hardcode copy in components.
  - `app/` — routes and UI; `components/ui/` for the shared UI kit (added as needed).
- **Money:** integer cents everywhere (`bigint` columns in `mode: "number"`). Format with `formatMoney`, parse user input with `parseMoney`. User transaction amounts are positive; the type gives the direction. Only system types (`investment_return`, `adjustment`) are signed.
- **Dates:** ISO strings `YYYY-MM-DD` (Postgres `date` in `mode: "string"`); months are `YYYY-MM` keys. "Today" comes from `todayISO()` (America/Sao_Paulo). Never use `new Date("YYYY-MM-DD")` for calendar math.
- **Validation:** zod schemas in `lib/domain`, exposed as `parseX(raw): ParseResult<T>` (see `lib/domain/validation.ts`) so forms get one message per field.
- **Household scoping:** every domain table has `household_id`; every query must filter by the current household, resolved on the server from the session — never trust a household id from the client.
- **Archive, don't delete** records that have history (`archived_at`).
- **Styling:** Tailwind v4 with semantic tokens from `app/globals.css` (`bg-surface`, `text-text-muted`, `text-positive`, `text-negative`, `rounded-card`, `font-display`…). Do not use raw palette hex values in components. Light/dark follow `prefers-color-scheme`.
- **Domain naming:** the money account table is `financial_accounts` (`financialAccounts`) because Better Auth owns the `account` table.

## Next.js 16 specifics used here

- `cacheComponents` and `partialPrefetching` are on. Anything that reads `cookies()`/`headers()` (the session) must render inside a `<Suspense>` boundary, and must not be awaited at the top level of a layout. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- Re-check the session inside every Server Action / Route Handler; UI checks are not authorization.
- `next dev` writes to `.next/dev`, so a dev server and `next build`/`next start` can coexist — that is how e2e runs while a dev server is up on port 3000.

## Environment gotchas

- The repo lives in WSL (`~/adriano/projetos/lastro`). Run npm/node/docker commands inside WSL (`wsl.exe -e bash -lic "cd ~/adriano/projetos/lastro && …"` from Windows); `node_modules` holds Linux binaries.
- Cypress on Ubuntu 24.04 needs system libraries: `sudo apt-get install -y libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb`.
- Docker image pulls may fail behind a TLS-intercepting proxy (`x509: certificate signed by unknown authority`). Any Postgres 16+ on `localhost:5432` with user/password `lastro`/`lastro` and databases `lastro` + `lastro_test` works instead of docker-compose.
- In Git Bash, long multi-file heredocs can fail to parse; prefer the editor's write tool for source files.
- Zod is v4: use `z.enum(values, message)`, `z.ZodSafeParseResult`, `ctx.addIssue({ code: "custom", … })`.
