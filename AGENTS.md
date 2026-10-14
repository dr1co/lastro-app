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
  - `lib/server/` — `server-only` data access and integrations: Better Auth config (`auth.ts`), session helpers (`session.ts`: `getSession`, `requireUser`, `requireHousehold`), mailer, and one module per aggregate (`households.ts`, `members.ts`, `invites.ts`…). Every function takes the `householdId` it is scoped to.
  - `lib/actions/` — `"use server"` Server Actions. Thin: authorize via `requireUser`/`requireHousehold`, parse with a domain `parseX`, call `lib/server`, then `refresh()` or `redirect()`.
  - `lib/strings.ts` — every user-facing pt-BR string (including email copy). Do not hardcode copy in components.
  - `lib/forms.ts` — `FormState` (what form actions return) and small form/param helpers.
  - `app/` — routes. `(centered)` = auth, onboarding and invite pages (narrow centered layout); `(app)` = the signed-in shell (header with household switcher + main nav). Route slugs are pt-BR (`/entrar`, `/membros`…).
  - `components/ui/` — the generic UI kit; `components/app/` — app-specific pieces.
- **Forms:** use `formAction(parseX, handler)` (`lib/server/form-action.ts`) for every form action and render the form with `<ActionForm action={…}>` + `<Field name=…>` + `<SubmitButton>`. Fields pick up their error and restored value from the action state by `name`; return `success(msg)` / `failure(msg, values)` or redirect. For one-click actions use `<ActionButton action={fn.bind(null, id)} />`.
- **Buttons as links:** style links with `buttonClass()` from `components/ui/button-styles.ts` (a plain module, callable from Server Components). `button.tsx` is a client module.
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
- Pages that read `params`/`searchParams` or the session rely on the `loading.tsx` of their route group as the Suspense boundary. Client components using `usePathname()` must also sit inside `<Suspense>` (see `MainNav`/`NavList`), or dynamic routes fail to prerender.
- Middleware is called **Proxy** (`proxy.ts`). It only does the optimistic "no session cookie → `/entrar?next=…`" redirect; real checks happen in `requireUser`/`requireHousehold`. Do not redirect signed-in users away from `/entrar` in the proxy (a stale cookie would loop) — pages use `<RedirectIfSignedIn />`.
- A Server Action that `redirect()`s does not re-render shared layouts. When an action changes what the layout shows (current household, household list), call `revalidatePath("/", "layout")` before redirecting. Actions that stay on the page call `refresh()`.
- With Cache Components, client navigation keeps the previous route mounted but hidden (React `<Activity>`), so the DOM can contain two copies of a form.

## Environment gotchas

- The repo lives in WSL (`~/adriano/projetos/lastro`). Run npm/node/docker commands inside WSL (`wsl.exe -e bash -lic "cd ~/adriano/projetos/lastro && …"` from Windows); `node_modules` holds Linux binaries.
- Cypress on Ubuntu 24.04 needs system libraries: `sudo apt-get install -y libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb`.
- Docker image pulls may fail behind a TLS-intercepting proxy (`x509: certificate signed by unknown authority`). Any Postgres 16+ on `localhost:5432` with user/password `lastro`/`lastro` and databases `lastro` + `lastro_test` works instead of docker-compose.
- In Git Bash, long multi-file heredocs can fail to parse; prefer the editor's write tool for source files.
- Zod is v4: use `z.enum(values, message)`, `z.email()`, `z.ZodSafeParseResult`, `ctx.addIssue({ code: "custom", … })`.
- Better Auth: tables are hand-written in `lib/db/schema.ts` (core schema + `user.last_household_id`, declared in `user.additionalFields`). Errors from `auth.api.*` are `APIError`s whose `body.code` maps to pt-BR via `authErrorMessage`. Email+password sign-in requires a verified email. `AUTH_RATE_LIMIT=off` disables rate limiting (used by e2e, since `next start` runs in production mode).
- Emails: without `SMTP_URL`, `sendEmail` appends to `<MAIL_OUTBOX_DIR>/outbox.jsonl` (default `.mail-outbox/`) and logs to the console — open verification/reset links from there in dev.

## Cypress gotchas

- Use `cy.findField(label)` (matches visible labels only, because of hidden `<Activity>` routes) instead of raw selectors.
- After clicking a link, assert `cy.location("pathname")` before typing: a prefetched page can render before navigation commits and then be replaced, wiping typed text.
- `cy.task` results are not retried by assertions; poll instead (see `pollEmail` in `cypress/support/commands.ts`).
- After an action that persists something, wait for server-rendered proof (text in `main`) before `cy.reload()` or `cy.visit()`, or the request is aborted.
- Every spec starts with `cy.resetDb()` (truncates all tables in `lastro_test` and clears the e2e outbox). `cy.login(user)` creates a verified user through the auth API and signs in.
