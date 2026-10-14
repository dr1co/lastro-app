import type { z } from "zod";

/** Result of validating raw input: parsed data, or the first error message per field. */
export type ParseResult<T> = { success: true; data: T } | { success: false; errors: Record<string, string> };

/** Turns a zod parse into a `ParseResult` with one message per field (`form` for root issues). */
export function toParseResult<T>(result: z.ZodSafeParseResult<T>): ParseResult<T> {
  if (result.success) return { success: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return { success: false, errors };
}
