import { accountBalance, balanceAdjustment } from "@/lib/domain/balance";
import { tx } from "./fixtures";

const bank = { id: "bank", kind: "checking" as const, openingBalance: 44508, openingDate: "2026-10-01" };
const cdb = { id: "cdb", kind: "investment" as const, openingBalance: 4171369, openingDate: "2026-10-01" };

describe("accountBalance", () => {
  const txs = [
    tx({ type: "income", amount: 226607, date: "2026-10-05" }),
    tx({ type: "expense", amount: 4090, date: "2026-10-02" }),
    tx({ type: "transfer", amount: 60000, date: "2026-10-05", toAccountId: "cdb", categoryId: null }),
    tx({ type: "expense", amount: 999, date: "2026-09-30" }),
    tx({ type: "expense", amount: 777, date: "2026-10-20" }),
    tx({ type: "expense", amount: 555, accountId: "other" }),
  ];

  it("applies transactions between the opening date and the as-of date", () => {
    expect(accountBalance(bank, txs, "2026-10-14")).toBe(44508 + 226607 - 4090 - 60000);
  });

  it("includes transfers into the account", () => {
    expect(accountBalance(cdb, txs, "2026-10-14")).toBe(4171369 + 60000);
  });

  it("includes future-dated transactions once the as-of date reaches them", () => {
    expect(accountBalance(bank, txs, "2026-10-31")).toBe(44508 + 226607 - 4090 - 60000 - 777);
  });
});

describe("balanceAdjustment", () => {
  it("records an investment return on investment accounts", () => {
    expect(
      balanceAdjustment({ account: cdb, balanceOnDate: 4231369, newBalance: 4250000, date: "2026-10-10" }),
    ).toEqual({ type: "investment_return", amount: 18631, accountId: "cdb", date: "2026-10-10" });
  });

  it("records a negative return when the balance drops", () => {
    expect(
      balanceAdjustment({ account: cdb, balanceOnDate: 100000, newBalance: 99000, date: "2026-10-10" }),
    ).toMatchObject({ type: "investment_return", amount: -1000 });
  });

  it("records a balance adjustment on other accounts", () => {
    expect(
      balanceAdjustment({ account: bank, balanceOnDate: 10000, newBalance: 10300, date: "2026-10-10" }),
    ).toMatchObject({ type: "adjustment", amount: 300 });
  });

  it("returns null when nothing changes", () => {
    expect(balanceAdjustment({ account: bank, balanceOnDate: 10000, newBalance: 10000, date: "2026-10-10" })).toBeNull();
  });
});
