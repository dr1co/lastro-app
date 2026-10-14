# Lastro

> **Mais controle. Um futuro mais sólido.**

Lastro is a web app that lets a household manage its money together. It started as a spreadsheet ([docs/controle-financas-exemplo.xlsx](docs/controle-financas-exemplo.xlsx)) and is becoming a mobile-first, installable web app: shared households, accounts with live balances, categorized transactions, a monthly dashboard, and later recurring transactions, budgets, credit cards with installments and savings goals.

The UI is in Brazilian Portuguese and amounts are in BRL.

- Product spec and milestones: [docs/features.md](docs/features.md)
- Visual identity (colors, type, tone): [docs/visual-identity.md](docs/visual-identity.md)
- Conventions for contributors and coding agents: [AGENTS.md](AGENTS.md)

## Status

Milestone **M1 — Core** is in progress.

| Step | Scope | State |
|---|---|---|
| 1 | Foundations: tooling, domain logic, database schema, design tokens | Done |
| 2 | Auth (email + password, Google), households, members, invites | Next |
| 3 | Accounts (with balance update) and categories | — |
| 4 | Transactions: quick add, list, filters, search | — |
| 5 | Dashboard, charts, PWA basics | — |

## Tech stack

| Concern | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) (postgres.js driver) |
| Auth | [Better Auth](https://www.better-auth.com) (email + password, Google) |
| Validation | Zod 4 |
| Unit tests | Jest + Testing Library |
| E2E tests | Cypress |

## Architecture

```
app/              Routes, layouts and UI (App Router)
components/ui/    Shared UI kit (added as screens are built)
lib/domain/       Pure business logic: money, dates, transaction rules, balances, summaries
lib/db/           Drizzle schema (schema.ts) and database client (client.ts)
lib/strings.ts    All user-facing pt-BR copy
db/migrations/    Generated SQL migrations (drizzle-kit)
db/init/          SQL run when the docker Postgres starts the first time (creates lastro_test)
tests/unit/       Jest unit tests, mirroring the source tree
cypress/e2e/      Cypress end-to-end specs
docs/             Product spec, visual identity, original spreadsheet
```

Key ideas:

- **Domain first.** Rules from the spec live in `lib/domain` as plain functions with no framework or database code, so they are easy to unit-test. For example: `balanceEffects` says how a transaction moves account balances, `accountBalance` computes a live balance, `balanceAdjustment` turns "the balance is now X" into an investment return or adjustment, and `monthTotals` / `totalsByMember` / `expensesByCategory` / `monthlyTrend` / `netWorth` power the dashboard.
- **Money is integer cents** and **dates are `YYYY-MM-DD` strings** in the America/Sao_Paulo timezone, so there are no floating-point or timezone surprises.
- **Everything belongs to a household.** Every domain table has a `household_id`, and the server resolves the current household from the session.
- **Transaction types:** income, expense, transfer, refund (lowers spending in its category), plus two system types created by balance updates: investment return (reported apart from earned income) and balance adjustment (ignored in totals).

### Data model (M1)

| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth. `user.last_household_id` remembers the household in use. |
| `households` | A shared space; `owner_user_id` is the creator. |
| `members` | People in a household; `user_id` is optional (a member can exist before they sign up). |
| `invites` | Single-use invite links, optionally tied to an existing member. |
| `financial_accounts` | Bank, savings, investment, cash and wallet accounts with opening balance and date. |
| `categories` | Income/expense categories with one level of subcategories. |
| `transactions` | Every money movement, in cents, with type, account(s), category, member and payment method. |

## Getting started

Requirements: Node.js 24+, npm, and PostgreSQL 16+ (Docker is the easy way).

```bash
npm install
cp .env.example .env          # then set BETTER_AUTH_SECRET (e.g. `openssl rand -hex 32`)
npm run db:up                 # Postgres on localhost:5432 (creates `lastro` and `lastro_test`)
npm run db:migrate            # apply migrations to the dev database
npm run dev                   # http://localhost:3000
```

No Docker? Any Postgres on `localhost:5432` with user/password `lastro`/`lastro` and the databases `lastro` and `lastro_test` works.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | Migrate `lastro_test`, build with `.env.test`, start on port 3100 and run Cypress headless |
| `npm run cypress:open` | Cypress UI (start the e2e server first with `npm run e2e:build && npm run e2e:start`) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run db:generate` | Generate a migration after changing `lib/db/schema.ts` |
| `npm run db:migrate` / `npm run db:migrate:test` | Apply migrations to the dev / test database |
| `npm run db:studio` | Browse the database with Drizzle Studio |

### Running the e2e tests on Linux / WSL

Cypress needs a few system libraries. On Ubuntu 24.04:

```bash
sudo apt-get install -y libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb
```

The e2e server uses a production build on port 3100 and the `lastro_test` database, so it can run while your dev server is up on port 3000.

## Contributing

1. Read [docs/features.md](docs/features.md) for the behavior you are building and [AGENTS.md](AGENTS.md) for conventions.
2. Write the tests first (unit in `tests/unit`, e2e in `cypress/e2e`), watch them fail, then implement.
3. Keep it simple: prefer one generic function or component over several near-copies.
4. Put all user-facing text in `lib/strings.ts`; use the design tokens, not raw colors.
5. Before opening a PR: `npm test && npm run typecheck && npm run lint && npm run test:e2e`.
6. Update this README and the docs when behavior or setup changes.
