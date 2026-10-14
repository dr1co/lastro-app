import { balanceEffects, type Transaction } from "./transactions";

export const ACCOUNT_KINDS = ["checking", "savings", "investment", "cash", "wallet"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

export type BalanceAccount = {
  id: string;
  kind: AccountKind;
  openingBalance: number;
  openingDate: string;
};

/** Opening balance plus every effect on the account dated from its opening date up to `asOf`. */
export function accountBalance(account: BalanceAccount, txs: Transaction[], asOf: string): number {
  let balance = account.openingBalance;
  for (const tx of txs) {
    if (tx.date < account.openingDate || tx.date > asOf) continue;
    for (const effect of balanceEffects(tx)) {
      if (effect.accountId === account.id) balance += effect.delta;
    }
  }
  return balance;
}

/**
 * The system transaction that brings an account to `newBalance` on `date`:
 * an investment return for investment accounts, an adjustment otherwise, or `null` if nothing changes.
 */
export function balanceAdjustment(params: {
  account: BalanceAccount;
  balanceOnDate: number;
  newBalance: number;
  date: string;
}) {
  const amount = params.newBalance - params.balanceOnDate;
  if (amount === 0) return null;
  return {
    type: params.account.kind === "investment" ? ("investment_return" as const) : ("adjustment" as const),
    amount,
    accountId: params.account.id,
    date: params.date,
  };
}
