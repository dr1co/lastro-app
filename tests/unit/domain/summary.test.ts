import {
  expensesByCategory,
  monthTotals,
  monthlyTrend,
  netWorth,
  totalsByMember,
} from "@/lib/domain/summary";
import { tx } from "./fixtures";

const categories = [
  { id: "food", name: "Alimentação", color: "#C9827A", parentId: null },
  { id: "transport", name: "Transporte", color: "#91B8C4", parentId: null },
  { id: "uber", name: "Uber", color: "#91B8C4", parentId: "transport" },
  { id: "leisure", name: "Lazer", color: "#D5B978", parentId: null },
  { id: "salary", name: "Salário", color: "#8DB8A5", parentId: null },
];

const october = [
  tx({ type: "income", amount: 226607, categoryId: "salary" }),
  tx({ type: "expense", amount: 10526, categoryId: "food" }),
  tx({ type: "expense", amount: 3995, categoryId: "uber" }),
  tx({ type: "expense", amount: 2800, categoryId: "transport" }),
  tx({ type: "expense", amount: 17690, categoryId: "leisure", memberId: "rosangela" }),
  tx({ type: "refund", amount: 1450, categoryId: "food" }),
  tx({ type: "transfer", amount: 60000, categoryId: null, toAccountId: "cdb" }),
  tx({ type: "investment_return", amount: 1772, categoryId: null, accountId: "cdb" }),
  tx({ type: "adjustment", amount: 300, categoryId: null }),
  tx({ type: "expense", amount: 99999, date: "2026-11-01" }),
];

describe("monthTotals", () => {
  it("sums income, expenses net of refunds and investment returns separately", () => {
    expect(monthTotals(october, "2026-10")).toEqual({
      income: 226607,
      expenses: 10526 + 3995 + 2800 + 17690 - 1450,
      net: 226607 - (10526 + 3995 + 2800 + 17690 - 1450),
      investmentReturn: 1772,
    });
  });

  it("returns zeros for an empty month", () => {
    expect(monthTotals(october, "2027-03")).toEqual({ income: 0, expenses: 0, net: 0, investmentReturn: 0 });
  });
});

describe("totalsByMember", () => {
  it("summarizes every given member, including those without activity", () => {
    const members = [
      { id: "giovane", name: "Giovane" },
      { id: "rosangela", name: "Rosangela" },
      { id: "kid", name: "Kid" },
    ];
    expect(totalsByMember(october, "2026-10", members)).toEqual([
      { memberId: "giovane", name: "Giovane", income: 226607, expenses: 15871, net: 226607 - 15871 },
      { memberId: "rosangela", name: "Rosangela", income: 0, expenses: 17690, net: -17690 },
      { memberId: "kid", name: "Kid", income: 0, expenses: 0, net: 0 },
    ]);
  });
});

describe("expensesByCategory", () => {
  it("rolls subcategories into parents, net of refunds, sorted by total", () => {
    expect(expensesByCategory(october, "2026-10", categories)).toEqual([
      { categoryId: "leisure", name: "Lazer", color: "#D5B978", total: 17690 },
      { categoryId: "food", name: "Alimentação", color: "#C9827A", total: 9076 },
      { categoryId: "transport", name: "Transporte", color: "#91B8C4", total: 6795 },
    ]);
  });

  it("breaks a parent down into its subcategories", () => {
    expect(expensesByCategory(october, "2026-10", categories, "transport")).toEqual([
      { categoryId: "uber", name: "Uber", color: "#91B8C4", total: 3995 },
      { categoryId: "transport", name: "Transporte", color: "#91B8C4", total: 2800 },
    ]);
  });

  it("ignores other months (fixes the spreadsheet's all-time sum)", () => {
    expect(expensesByCategory(october, "2026-11", categories)).toEqual([
      { categoryId: "food", name: "Alimentação", color: "#C9827A", total: 99999 },
    ]);
    expect(expensesByCategory(october, "2026-12", categories)).toEqual([]);
  });
});

describe("monthlyTrend", () => {
  it("returns income, expenses and net for each month ending at the given one", () => {
    const trend = monthlyTrend(october, "2026-11", 3);
    expect(trend.map((m) => m.month)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(trend[0]).toEqual({ month: "2026-09", income: 0, expenses: 0, net: 0 });
    expect(trend[1].expenses).toBe(33561);
    expect(trend[2]).toEqual({ month: "2026-11", income: 0, expenses: 99999, net: -99999 });
  });
});

describe("netWorth", () => {
  it("sums balances included in net worth", () => {
    expect(
      netWorth([
        { balance: 100000, includeInNetWorth: true },
        { balance: -5000, includeInNetWorth: true },
        { balance: 999999, includeInNetWorth: false },
      ]),
    ).toBe(95000);
  });
});
