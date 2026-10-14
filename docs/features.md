# Lastro — Feature Specification

> Source: [`controle-financas-exemplo.xlsx`](./controle-financas-exemplo.xlsx), plus product decisions made during the feature-mapping session (2026-10-14).
> Visual and tone guidelines live in [`visual-identity.md`](./visual-identity.md).

Lastro is a web app for a **household** to manage its money together. It replaces the spreadsheet and keeps everything it did: people, transactions, categories, accounts with live balances, monthly summary and charts. It also fixes the spreadsheet's quirks and adds recurring transactions, budgets, credit cards with installments and savings goals.

---

## 1. Global decisions

| Topic | Decision |
|---|---|
| Users | Shared **households**. A user can belong to several households and switch between them. |
| Visibility | Everyone in a household sees everything. No private accounts. |
| Language / currency | UI in **pt-BR** only, **BRL** only. Format `R$ 1.234,56`, dates `DD/MM/YYYY`, timezone `America/Sao_Paulo`. UI strings are kept in one place so i18n can be added later, but no i18n is built now. |
| Data entry | **Manual only**. No spreadsheet import, no OFX/CSV, no bank sync. |
| Platform | **Mobile-first** responsive web app, installable as a **PWA**. |
| Deleting | **Archive, don't delete** for anything that has history (accounts, categories, members, cards, goals). A hard delete is only allowed when nothing references the item. |
| Money | Stored as integer cents. Users always enter amounts as positive numbers; the transaction type decides the direction. |
| Reports | The dashboard is the only reporting surface in the MVP. There is no separate reports page. |
| Export | Not in the MVP. |
| Attachments | Not in the MVP. |

---

## 2. Spreadsheet → app mapping

| Spreadsheet | App feature | What changes |
|---|---|---|
| `Pessoas` (ID, Nome, Status) | **Household members** (§4) | Members can be linked to a login. `Status: Ativo` becomes archiving. |
| `Lançamentos` | **Transactions** (§7) | New types (Refund, Investment return, Adjustment). Transfers have no category. Payment method becomes a fixed list. Origin/destination accounts become a single account (plus a destination account for transfers). |
| `Categorias` (Categoria, Tipo) | **Categories** (§6) | Editable, with one level of subcategories, an icon and a color. |
| `Contas` (Saldo_Inicial, Data_Inicial, Saldo_Atual) | **Accounts** (§5) | Real account names (no longer "Giovane"). Each account has an owner member or is shared. Balance is still `opening + inflows − outflows`. |
| Daily `Rendimento CDB` income rows | **Balance update → investment return** (§5.3) | No more typing yields every day. Returns are kept separate from earned income. |
| `PIX Vinicius`, `PIX Rosangela` (uncategorized income) | **Refunds** (§7.4) | They reduce spending in a category instead of inflating income. |
| `Resumo` per-person table (selected month) | Dashboard **per-member summary** (§13) | — |
| `Resumo` monthly table + line chart | Dashboard **12-month trend** (§13) | — |
| `Resumo` expenses by category + bar chart | Dashboard **expenses by category** (§13) | **Bug fix:** the spreadsheet summed all time; the app filters by the selected month. |
| `Patrimônio total` | Dashboard **net worth** (§13) | Includes credit card debt as negative. |
| Conditional formatting (green/red by type and sign) | Visual rule: income/positive = green, expense/negative = red, transfer = neutral | Follows the `visual-identity.md` palette. |

---

## 3. Authentication & households

### 3.1 Sign-up / sign-in
- Sign-in with **email + password** or **Google**.
- Email + password includes email verification and a "forgot password" reset by email.
- After the first sign-in with no household, the user either **creates a household** (name only) or **accepts a pending invite**.

### 3.2 Households
- A user can belong to **several households**. The current household is shown in the header, with a **switcher**.
- The last household used is remembered per user.
- All data (members, accounts, categories, transactions, budgets, goals) belongs to exactly one household and never crosses households.
- Roles: the creator is the household **owner**. Only the owner can rename or delete the household and remove members. Every other permission is the same for all members. *(Assumption: everyone sees everything, so no other roles were needed.)*

### 3.3 Invites
- Any member can create an **invite link**, or send one by email.
- An invite can be tied to an **existing member profile** (§4), so the person who accepts takes over that profile and its history. It can also create a new member.
- Invites expire after 7 days and are single-use. Pending invites can be revoked.

---

## 4. Household members (`Pessoas`)

- A **member** is a profile inside a household: name, optional avatar or color.
- A member **does not need a login**. The profile can be linked to a user later through an invite (§3.3).
- Members are referenced by accounts (owner) and by transactions (who the transaction is for).
- Archiving a member hides them from pickers. Their history stays and still counts in totals. Archived members can be restored.
- Seed on household creation: one member linked to the creator.

---

## 5. Accounts (`Contas`)

### 5.1 Fields
| Field | Notes |
|---|---|
| Name | e.g. "Nubank", "Itaú", "CDB Inter". Unique within the household. |
| Type | `Conta corrente` (checking), `Poupança` (savings), `Investimento` (investment), `Dinheiro` (cash), `Carteira digital` (digital wallet). Credit cards are a separate kind (§9). |
| Owner | A member **or** `Compartilhada` (shared/joint). |
| Opening balance + opening date | Same as `Saldo_Inicial` / `Data_Inicial`. Only transactions on or after the opening date affect the balance. |
| Color / icon | Optional, used for display. |
| Include in net worth | Defaults to yes. |

### 5.2 Balance
- `current balance = opening balance + inflows − outflows`, counting transactions dated **on or after the opening date and up to today**.
- Future-dated transactions do not change the current balance. Pending recurring items (§8) never change it.
- The account detail page also shows a **projected balance** at the end of the month (current balance + future-dated transactions + pending recurring items this month).
- Negative balances are allowed and shown in red.

### 5.3 Balance update (investment return)
Replaces the daily `Rendimento CDB` rows.
- Action **"Atualizar saldo"** on an account: enter the **new balance** and a **date** (defaults to today).
- The app computes `difference = new balance − balance on that date` and creates a system transaction:
  - On `Investimento` accounts: type **Investment return** (`Rendimento`). It can be negative.
  - On other account types: type **Balance adjustment** (`Ajuste de saldo`).
- Investment returns increase net worth. They show up as a **separate line** from earned income on the dashboard and are **never counted in income totals**.
- Balance adjustments are left out of income, expense and budget calculations.

### 5.4 Archiving
- Archived accounts disappear from pickers and from the dashboard's account list. Their history stays.
- An archived account still counts in net worth while its balance is non-zero. *(A warning suggests zeroing it before archiving.)*

---

## 6. Categories (`Categorias`)

- Each category has a **name**, a **kind** (`Despesa` or `Receita`), an **icon**, a **color** and an optional **parent** (only one level of subcategories, e.g. `Transporte › Uber`).
- A subcategory inherits the parent's kind. Totals roll up to the parent.
- Categories are editable: add, rename, change icon or color, move under a parent, archive.
- **Transfers have no category.** The spreadsheet's `Investimento` (Transferência) category is not seeded.
- **Seed list** (from the spreadsheet):
  - Expense: Alimentação, Contas e serviços, Educação, Lazer, Moradia, Pets, Saúde, Transporte, Outros.
  - Income: Salário, Outras receitas.
  - `Rendimento CDB` is not seeded as a category. Investment returns are a transaction type (§5.3).
- Archiving a category hides it from pickers. Its history keeps it, and it still appears in charts for past periods.

---

## 7. Transactions (`Lançamentos`)

### 7.1 Types
| Type | Effect on balance | Counted as | Category |
|---|---|---|---|
| **Receita** (Income) | + account | Income | Income category (required) |
| **Despesa** (Expense) | − account | Expense | Expense category (required) |
| **Transferência** (Transfer) | − origin, + destination | Nothing (neutral) | None |
| **Reembolso** (Refund) | + account | Reduces expense in its category | Expense category (required) |
| **Rendimento** (Investment return) | ± investment account | Investment return (separate line) | None. System-generated (§5.3) |
| **Ajuste de saldo** (Adjustment) | ± account | Nothing | None. System-generated (§5.3) |

### 7.2 Fields
| Field | Notes |
|---|---|
| Date | Required. Defaults to today. Can be in the past or the future. |
| Type | Required. |
| Amount | Required, > 0. |
| Description | Required for income and expenses (e.g. "Uber", "Spotify"). Optional for transfers. |
| Category | See table above. |
| Account | Required. For transfers: origin **and** destination, which must be different accounts. |
| Member ("for whom") | Required. **Prefilled from the account owner**, or from the logged-in member when the account is shared. Editable. Drives the per-member summary. |
| Payment method | Optional, fixed list: `PIX`, `Débito`, `Crédito`, `Boleto`, `Débito automático`, `Transferência`, `Dinheiro`. Set to `Crédito` automatically and locked when the account is a credit card. |
| Notes | Optional free text (`Observações`). |
| Created by | Automatic: the user who entered it, plus timestamps. Shown in the details view. |

### 7.3 Quick add (mobile-first)
- A big **"+"** button that is always visible opens a short form: amount first (numeric keypad), then type, category, account and description. Everything else is under "more details".
- It remembers the last account and payment method used per type.
- When typing a description, it suggests past descriptions and pre-fills their category and account (e.g. "Uber" → Transporte).
- After saving, there is an "add another" shortcut.

### 7.4 Refunds
- A refund puts money into an account and **reduces net spending** in its category for the month of the refund date.
- It can optionally be **linked to the original expense**. The expense then shows "R$ X reembolsado".
- Category net spending can go below zero for a month. It is shown as is.
- Refunds do **not** count as income in any total.

### 7.5 Transaction list
- Grouped by day, newest first, with daily subtotals.
- **Filters** that can be combined: period (month picker + custom range), type, member, account or card, category (including subcategories), payment method, status (confirmed / pending recurring).
- **Text search** over description and notes.
- Every list shows the total of the filtered result (income, expenses, net).
- Tap a transaction to view, edit, duplicate or delete it. Installment and recurring transactions follow the series rules (§10).

---

## 8. Recurring transactions

- Any income, expense or transfer can be **made recurring**.
- **Frequency**: weekly, monthly (day of month, with "last day" supported), yearly, or every N months.
- **End**: never, after N occurrences, or on a date.
- **Fixed or variable amount**. A variable one still has an *expected* amount.
- **Pending until confirmed**:
  - Each occurrence appears on its date as **pending**. It is shown with a distinct style and does not change balances or actual totals.
  - Actions on a pending occurrence: **Confirm** (optionally changing amount, date or account), **Skip** (this occurrence only), **Edit series**.
  - Pending items past their date are flagged as **overdue** on the dashboard.
- Pending occurrences are generated **3 months ahead** so forecasts and upcoming lists work.
- Pending items show up in the projected balance (§5.2) and in "Upcoming" on the dashboard (§13).
- Examples from the spreadsheet: Spotify (monthly, débito automático), Mensalidade Faculdade (monthly, boleto), Salário (monthly, variable).

---

## 9. Credit cards

### 9.1 Card setup
| Field | Notes |
|---|---|
| Name | e.g. "Nubank Mastercard". |
| Owner | A member or shared. |
| Credit limit | Required. |
| Closing day | The day the statement closes (1–31; "last day" supported). |
| Due day | The day the bill is due. |
| Default paying account | The account usually used to pay the bill. |

### 9.2 How card purchases count
- A purchase is an **expense on the purchase date** (accrual). It counts in that month's totals, category totals and budgets.
- **Paying the bill is a transfer** from a bank account to the card. It is never counted as an expense again, so there is no double counting.
- The card has a balance (debt) that counts as **negative in net worth**.

### 9.3 Statements (`Faturas`)
- A purchase dated **on or before** the closing day falls in the current statement. After the closing day, it falls in the next one.
- Statement states: **Aberta** (open), **Fechada** (closed, awaiting payment), **Paga** (paid), **Parcialmente paga** (partially paid), **Vencida** (overdue).
- Statement view: its transactions, total, closing and due dates, amount paid, amount left.
- **"Pagar fatura"** creates a transfer from the paying account to the card, for the full amount by default (partial amounts allowed). A partial payment leaves the rest on the card balance.
- **Available limit** = limit − all unpaid amounts, including future installments.

### 9.4 Installments (`Parcelamento`)
- When adding a card expense, choose **"Parcelado em N×"** (2–48).
- The app creates **N installment transactions** labeled `1/N … N/N`. Installment *k* is dated **purchase date + (k−1) months** and falls into the matching statement.
- **Each installment counts as an expense in its own month** (and in that month's budget).
- Amounts are split evenly. The leftover cents go on the **first** installment.
- The full amount reduces the available limit right away. It is released as each statement is paid.
- Editing and deleting follow the series rules (§10). Deleting the purchase removes all its installments.

### 9.5 Card refunds and adjustments
- A refund on a card (estorno) lowers the card balance and offsets the category (§7.4).
- **"Atualizar saldo"** on a card creates a balance adjustment (§5.3) so it can be matched to the bank's number.

---

## 10. Series editing rules (recurring + installments)

Editing or deleting one transaction that belongs to a series asks:
- **Somente esta** (this one only)
- **Esta e as próximas** (this and future)
- **Todas** (all in the series)

Rules:
- Confirmed recurring occurrences keep their values under "this and future" unless they are on or after the selected one.
- Installments: changing the total amount or N re-splits all **unpaid** installments. Installments in statements that are already paid cannot change.
- Deleting an installment purchase always deletes the whole series (with a confirmation step).

---

## 11. Budgets (`Orçamentos`)

- A **monthly limit per expense category**, set for the whole household. Setting one on a parent category covers its subcategories.
- The **default limit** repeats every month. A **specific month can be overridden** without changing the default.
- **Spent** = expenses in the category for the month (card purchases and installments by their own dates) **minus refunds** in that category. Pending recurring items are shown separately as "previsto" (expected) and are not added to spent.
- **No rollover.** Each month starts fresh.
- Progress bar per category: green under 80%, warning from 80% up to 100%, red above 100%.
- **Alerts**: an in-app notification and a dashboard alert the first time a category passes **80%** and **100%** in a month.
- Budgets page: all budgeted categories for the selected month, total budgeted vs total spent, and a list of categories with spending but no budget.

---

## 12. Savings goals (`Metas`)

| Field | Notes |
|---|---|
| Name | e.g. "Reserva de emergência", "Viagem". |
| Target amount | Required. |
| Deadline | Optional. |
| Linked accounts | One or more accounts (usually investment or savings). |
| Icon / color | Optional. |

- **Progress** = the sum of the linked accounts' current balances, capped at 100% in the display.
- With a deadline: show months left and the **monthly saving needed** = `(target − current) / months left`, plus whether the goal is on track.
- An account can be linked to more than one goal. In that case each goal shows the same balance, and the UI warns that it is shared.
- Reaching the target marks the goal as **achieved** (with a small calm celebration, following the visual identity's tone). Goals can then be archived.

---

## 13. Dashboard (`Início`)

A month selector at the top. It defaults to the current month, and every block below follows it.

1. **Month totals**: income (earned), expenses (net of refunds), net result (green or red). Also **investment return** as its own line.
2. **Net worth**: the sum of all account balances included in net worth, minus credit card debt. Below it, a compact list of account and card balances.
3. **Per-member summary**: income, expenses and net per member for the month (the spreadsheet's `Resumo` per-person table).
4. **Charts**:
   - **Expenses by category**: bar chart for the **selected month**, which fixes the all-time bug. Tapping a bar shows its subcategories, then the filtered transaction list.
   - **12-month trend**: income vs expenses lines for the 12 months ending at the selected month, with net per month.
5. **Upcoming & alerts**:
   - Pending and overdue recurring items (confirm or skip right from the dashboard).
   - Card statements closing or due in the next 7 days, and overdue ones.
   - Budgets at or above 80%.
   - Goal progress (top 3).

Empty states use the brand tone, e.g. *"Comece registrando seu primeiro lançamento."*

---

## 14. Navigation (mobile-first)

Bottom tab bar on mobile, sidebar on desktop:
- **Início** (dashboard)
- **Lançamentos** (transactions)
- **+** (quick add, center)
- **Orçamentos & Metas** (budgets & goals)
- **Mais**: Contas & Cartões, Categorias, Membros, Configurações da casa, Perfil, Trocar de casa

PWA: installable, app icon and splash screen from the brand, and an app shell that opens instantly. Offline entry is **not** in scope; the app shows a clear offline state instead.

---

## 15. Milestones

All four milestones are part of the MVP. The order is about dependencies.

### M1 — Core (spreadsheet parity)
- Auth (email + password, Google), households with switcher, invites, members (with or without login)
- Accounts with opening balance, live balance, balance update (investment return / adjustment)
- Categories with subcategories (seeded)
- Transactions: income, expense, transfer, refund; quick add; list with filters and search
- Dashboard: totals, net worth, per-member summary, both charts
- Mobile-first layout, PWA basics

### M2 — Recurring + Budgets
- Recurring series, pending occurrences, confirm/skip, series editing
- Projected balance
- Category budgets with monthly overrides and 80% / 100% alerts
- Dashboard "Upcoming & alerts" (recurring + budgets)

### M3 — Credit cards
- Cards, statements with closing and due dates, paying the bill as a transfer, available limit
- Installments with series rules
- Dashboard alerts for statements; card debt in net worth

### M4 — Goals + polish
- Savings goals linked to accounts, monthly saving needed
- Dashboard goal progress
- PWA polish (install prompt, icons, offline state), empty states, onboarding for a new household (create first account, review categories)

---

## 16. Out of scope (for now)

- Importing the xlsx, OFX/CSV statements, Open Finance sync
- CSV/xlsx export
- Receipt attachments
- A separate reports page (custom ranges, comparisons)
- Bill splitting / who-owes-whom between people
- Pending/paid bills to pay and receive (beyond recurring and card statements)
- Private accounts and fine-grained roles
- Multiple currencies and languages
- Offline transaction entry
- Budget rollover and per-member budgets
