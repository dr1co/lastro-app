import { z } from "zod";
import { strings } from "@/lib/strings";
import { isISODate } from "./dates";
import { toParseResult, type ParseResult } from "./validation";

export const TRANSACTION_TYPES = ["income", "expense", "transfer", "refund", "investment_return", "adjustment"] as const;
export const USER_TRANSACTION_TYPES = ["income", "expense", "transfer", "refund"] as const;
export const PAYMENT_METHODS = ["pix", "debit", "credit", "boleto", "auto_debit", "bank_transfer", "cash"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type UserTransactionType = (typeof USER_TRANSACTION_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type CategoryKind = "income" | "expense";

/** The fields of a transaction that drive balances and summaries. Amounts are cents. */
export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  memberId: string;
};

/**
 * How a transaction changes account balances.
 * User types carry positive amounts; system types (`investment_return`, `adjustment`) are signed.
 */
export function balanceEffects(tx: Transaction): { accountId: string; delta: number }[] {
  switch (tx.type) {
    case "expense":
      return [{ accountId: tx.accountId, delta: -tx.amount }];
    case "transfer":
      return [
        { accountId: tx.accountId, delta: -tx.amount },
        { accountId: tx.toAccountId!, delta: tx.amount },
      ];
    default:
      return [{ accountId: tx.accountId, delta: tx.amount }];
  }
}

/** The category kind a transaction type requires, or `null` when it has no category. */
export function categoryKindFor(type: TransactionType): CategoryKind | null {
  if (type === "income") return "income";
  if (type === "expense" || type === "refund") return "expense";
  return null;
}

const blankToNull = (value: unknown) => (typeof value === "string" && value.trim() === "" ? null : value);
const optionalText = z.preprocess(blankToNull, z.string().trim().nullable().default(null));
const optionalId = z.preprocess(blankToNull, z.string().nullable().default(null));
const { errors } = strings;

const transactionInputSchema = z
  .object({
    date: z.string().refine(isISODate, errors.invalidDate),
    type: z.enum(USER_TRANSACTION_TYPES, errors.invalidOption),
    amount: z.number(errors.positiveAmount).int(errors.positiveAmount).positive(errors.positiveAmount),
    description: optionalText,
    categoryId: optionalId,
    accountId: z.string(errors.required).min(1, errors.required),
    toAccountId: optionalId,
    memberId: z.string(errors.required).min(1, errors.required),
    paymentMethod: z.preprocess(blankToNull, z.enum(PAYMENT_METHODS, errors.invalidOption).nullable().default(null)),
    notes: optionalText,
  })
  .superRefine((input, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (input.type === "transfer") {
      if (!input.toAccountId) issue("toAccountId", errors.required);
      else if (input.toAccountId === input.accountId) issue("toAccountId", errors.sameAccount);
      if (input.categoryId) issue("categoryId", errors.transferCategory);
      return;
    }
    if (!input.categoryId) issue("categoryId", errors.required);
    if (input.type !== "refund" && !input.description) issue("description", errors.required);
  })
  .transform((input) => (input.type === "transfer" ? input : { ...input, toAccountId: null }));

export type TransactionInput = z.output<typeof transactionInputSchema>;

/** Validates user input for income, expense, transfer and refund transactions. */
export function parseTransactionInput(raw: unknown): ParseResult<TransactionInput> {
  return toParseResult(transactionInputSchema.safeParse(raw));
}
