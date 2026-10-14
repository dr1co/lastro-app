const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formats integer cents as BRL, e.g. `123456` → `R$ 1.234,56`. */
export function formatMoney(cents: number): string {
  return formatter.format(cents / 100);
}

const COMMA_DECIMAL = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/;
const DOT_DECIMAL = /^(\d+)\.(\d{1,2})$/;

/**
 * Parses a pt-BR money string into integer cents, or `null` when invalid.
 * Accepts `R$`, thousands dots and a decimal comma; a lone dot with 1–2 decimals is also read as decimal.
 */
export function parseMoney(input: string): number | null {
  let value = input.replace(/R\$/g, "").replace(/\s/g, "");
  const negative = value.startsWith("-");
  if (negative) value = value.slice(1);

  const match = value.match(DOT_DECIMAL) ?? value.match(COMMA_DECIMAL);
  if (!match) return null;

  const units = Number(match[1].replace(/\./g, ""));
  const decimals = Number((match[2] ?? "").padEnd(2, "0"));
  const cents = units * 100 + decimals;
  return negative ? -cents : cents;
}
