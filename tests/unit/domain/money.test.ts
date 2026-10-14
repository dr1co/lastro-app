import { formatMoney, parseMoney } from "@/lib/domain/money";

const nbsp = " ";

describe("formatMoney", () => {
  it("formats cents as BRL", () => {
    expect(formatMoney(123456)).toBe(`R$${nbsp}1.234,56`);
    expect(formatMoney(0)).toBe(`R$${nbsp}0,00`);
    expect(formatMoney(5)).toBe(`R$${nbsp}0,05`);
  });

  it("formats negatives with a leading minus", () => {
    expect(formatMoney(-4090)).toBe(`-R$${nbsp}40,90`);
  });
});

describe("parseMoney", () => {
  it.each([
    ["1.234,56", 123456],
    ["1234,56", 123456],
    ["R$ 2.266,07", 226607],
    ["40,9", 4090],
    ["17", 1700],
    ["1.000", 100000],
    ["0,05", 5],
    ["-12,50", -1250],
    ["  600  ", 60000],
  ])("parses %p as %p cents", (input, cents) => {
    expect(parseMoney(input)).toBe(cents);
  });

  it.each(["", "abc", "1,234,5", "12,345", "1.23,45", "--1"])(
    "rejects %p",
    (input) => {
      expect(parseMoney(input)).toBeNull();
    },
  );
});
