import type { Transaction } from "@/lib/domain/transactions";

let seq = 0;

/** Builds a transaction with sensible defaults for tests. */
export function tx(overrides: Partial<Transaction>): Transaction {
  seq += 1;
  return {
    id: `tx-${seq}`,
    date: "2026-10-05",
    type: "expense",
    amount: 1000,
    accountId: "bank",
    toAccountId: null,
    categoryId: "food",
    memberId: "giovane",
    ...overrides,
  };
}
