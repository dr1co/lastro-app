import { monthKey, monthsEnding } from "./dates";
import type { Transaction } from "./transactions";

export type Totals = { income: number; expenses: number; net: number };

type SummaryCategory = { id: string; name: string; color: string; parentId: string | null };

/** Income, expenses (net of refunds) and net for transactions already narrowed by the caller. */
function totals(txs: Transaction[]): Totals {
  let income = 0;
  let expenses = 0;
  for (const tx of txs) {
    if (tx.type === "income") income += tx.amount;
    else if (tx.type === "expense") expenses += tx.amount;
    else if (tx.type === "refund") expenses -= tx.amount;
  }
  return { income, expenses, net: income - expenses };
}

const inMonth = (txs: Transaction[], month: string) => txs.filter((tx) => monthKey(tx.date) === month);

/** Month totals, with investment returns reported apart from earned income. */
export function monthTotals(txs: Transaction[], month: string): Totals & { investmentReturn: number } {
  const monthTxs = inMonth(txs, month);
  const investmentReturn = monthTxs
    .filter((tx) => tx.type === "investment_return")
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { ...totals(monthTxs), investmentReturn };
}

/** Month totals for each given member, in the given order. */
export function totalsByMember(
  txs: Transaction[],
  month: string,
  members: { id: string; name: string }[],
): (Totals & { memberId: string; name: string })[] {
  const monthTxs = inMonth(txs, month);
  return members.map((member) => ({
    memberId: member.id,
    name: member.name,
    ...totals(monthTxs.filter((tx) => tx.memberId === member.id)),
  }));
}

/**
 * Net expenses per category for a month, largest first, skipping zero totals.
 * Without `parentId`, subcategories roll up into their parent; with it, that parent is broken down into its children.
 */
export function expensesByCategory(
  txs: Transaction[],
  month: string,
  categories: SummaryCategory[],
  parentId?: string,
): { categoryId: string; name: string; color: string; total: number }[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const groupOf = (categoryId: string) => {
    const category = byId.get(categoryId);
    if (!category) return undefined;
    if (parentId) return category.id === parentId || category.parentId === parentId ? category : undefined;
    return category.parentId ? byId.get(category.parentId) : category;
  };

  const sums = new Map<string, number>();
  for (const tx of inMonth(txs, month)) {
    if (!tx.categoryId || (tx.type !== "expense" && tx.type !== "refund")) continue;
    const group = groupOf(tx.categoryId);
    if (!group) continue;
    const delta = tx.type === "expense" ? tx.amount : -tx.amount;
    sums.set(group.id, (sums.get(group.id) ?? 0) + delta);
  }

  return [...sums]
    .filter(([, total]) => total !== 0)
    .map(([id, total]) => {
      const { name, color } = byId.get(id)!;
      return { categoryId: id, name, color, total };
    })
    .sort((a, b) => b.total - a.total);
}

/** Totals for each of the `count` months ending at `endMonth`, oldest first. */
export function monthlyTrend(txs: Transaction[], endMonth: string, count = 12): (Totals & { month: string })[] {
  return monthsEnding(endMonth, count).map((month) => ({ month, ...totals(inMonth(txs, month)) }));
}

/** Sum of the balances that count toward net worth. */
export function netWorth(accounts: { balance: number; includeInNetWorth: boolean }[]): number {
  return accounts.reduce((sum, a) => (a.includeInNetWorth ? sum + a.balance : sum), 0);
}
