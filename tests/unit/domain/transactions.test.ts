import {
  balanceEffects,
  categoryKindFor,
  parseTransactionInput,
} from "@/lib/domain/transactions";
import { tx } from "./fixtures";

describe("balanceEffects", () => {
  it("adds income and refunds to the account", () => {
    expect(balanceEffects(tx({ type: "income", amount: 226607 }))).toEqual([
      { accountId: "bank", delta: 226607 },
    ]);
    expect(balanceEffects(tx({ type: "refund", amount: 1450 }))).toEqual([
      { accountId: "bank", delta: 1450 },
    ]);
  });

  it("subtracts expenses from the account", () => {
    expect(balanceEffects(tx({ type: "expense", amount: 4090 }))).toEqual([
      { accountId: "bank", delta: -4090 },
    ]);
  });

  it("moves money between accounts on transfers", () => {
    const transfer = tx({ type: "transfer", amount: 60000, toAccountId: "cdb", categoryId: null });
    expect(balanceEffects(transfer)).toEqual([
      { accountId: "bank", delta: -60000 },
      { accountId: "cdb", delta: 60000 },
    ]);
  });

  it("applies signed amounts for system adjustments", () => {
    expect(balanceEffects(tx({ type: "investment_return", amount: -500, accountId: "cdb" }))).toEqual([
      { accountId: "cdb", delta: -500 },
    ]);
    expect(balanceEffects(tx({ type: "adjustment", amount: 300 }))).toEqual([
      { accountId: "bank", delta: 300 },
    ]);
  });
});

describe("categoryKindFor", () => {
  it("maps transaction types to the category kind they need", () => {
    expect(categoryKindFor("income")).toBe("income");
    expect(categoryKindFor("expense")).toBe("expense");
    expect(categoryKindFor("refund")).toBe("expense");
    expect(categoryKindFor("transfer")).toBeNull();
    expect(categoryKindFor("adjustment")).toBeNull();
  });
});

describe("parseTransactionInput", () => {
  const base = {
    date: "2026-10-02",
    type: "expense",
    amount: 4090,
    description: "Spotify",
    categoryId: "bills",
    accountId: "bank",
    memberId: "giovane",
    paymentMethod: "auto_debit",
  };

  it("accepts a valid expense", () => {
    const result = parseTransactionInput(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({ ...base, toAccountId: null, notes: null });
    }
  });

  it("rejects non-positive and fractional amounts", () => {
    expect(parseTransactionInput({ ...base, amount: 0 }).success).toBe(false);
    expect(parseTransactionInput({ ...base, amount: 10.5 }).success).toBe(false);
  });

  it("requires description and category on income and expenses", () => {
    const noDesc = parseTransactionInput({ ...base, description: "  " });
    expect(noDesc.success).toBe(false);
    if (!noDesc.success) expect(noDesc.errors).toHaveProperty("description");

    const noCat = parseTransactionInput({ ...base, type: "income", categoryId: null });
    expect(noCat.success).toBe(false);
    if (!noCat.success) expect(noCat.errors).toHaveProperty("categoryId");
  });

  it("requires a category on refunds but not a description", () => {
    expect(parseTransactionInput({ ...base, type: "refund", description: "" }).success).toBe(true);
    expect(parseTransactionInput({ ...base, type: "refund", categoryId: null }).success).toBe(false);
  });

  it("requires a different destination account and no category on transfers", () => {
    const transfer = { ...base, type: "transfer", categoryId: null, description: "", toAccountId: "cdb" };
    expect(parseTransactionInput(transfer).success).toBe(true);

    const same = parseTransactionInput({ ...transfer, toAccountId: "bank" });
    expect(same.success).toBe(false);
    if (!same.success) expect(same.errors).toHaveProperty("toAccountId");

    expect(parseTransactionInput({ ...transfer, toAccountId: null }).success).toBe(false);
    expect(parseTransactionInput({ ...transfer, categoryId: "bills" }).success).toBe(false);
  });

  it("drops the destination account on non-transfers", () => {
    const result = parseTransactionInput({ ...base, toAccountId: "cdb" });
    expect(result.success && result.data.toAccountId).toBeNull();
  });

  it("rejects system types and invalid dates or payment methods", () => {
    expect(parseTransactionInput({ ...base, type: "adjustment" }).success).toBe(false);
    expect(parseTransactionInput({ ...base, date: "2026-02-30" }).success).toBe(false);
    expect(parseTransactionInput({ ...base, paymentMethod: "bitcoin" }).success).toBe(false);
  });

  it("treats blank optional fields as null", () => {
    const result = parseTransactionInput({ ...base, paymentMethod: "", notes: " " });
    expect(result.success && result.data).toMatchObject({ paymentMethod: null, notes: null });
  });
});
