import {
  addMonths,
  formatDate,
  formatMonth,
  isISODate,
  monthKey,
  monthRange,
  monthsEnding,
  todayISO,
} from "@/lib/domain/dates";

describe("dates", () => {
  it("formats ISO dates as DD/MM/YYYY", () => {
    expect(formatDate("2026-10-05")).toBe("05/10/2026");
  });

  it("validates ISO dates", () => {
    expect(isISODate("2026-02-28")).toBe(true);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("05/10/2026")).toBe(false);
  });

  it("returns today in America/Sao_Paulo", () => {
    expect(todayISO(new Date("2026-10-15T02:30:00Z"))).toBe("2026-10-14");
    expect(todayISO(new Date("2026-10-15T03:30:00Z"))).toBe("2026-10-15");
  });

  it("derives the month key of a date", () => {
    expect(monthKey("2026-10-05")).toBe("2026-10");
  });

  it("returns a half-open range for a month", () => {
    expect(monthRange("2026-10")).toEqual({ start: "2026-10-01", end: "2026-11-01" });
    expect(monthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });

  it("adds months across years", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2027-01", -1)).toBe("2026-12");
  });

  it("lists the N months ending at a month, ascending", () => {
    expect(monthsEnding("2027-01", 3)).toEqual(["2026-11", "2026-12", "2027-01"]);
  });

  it("formats a month label in pt-BR", () => {
    expect(formatMonth("2026-10")).toBe("outubro de 2026");
  });
});
