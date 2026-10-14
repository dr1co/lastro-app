import "server-only";
import type { ParseResult } from "@/lib/domain/validation";
import { formValues, type FormState } from "@/lib/forms";

/**
 * Builds an `ActionForm` Server Action: parses the submitted values and returns field errors (with the values,
 * so the form keeps them) or runs `handler` with the parsed data. `handler` may return a message or redirect.
 */
export function formAction<T>(
  parse: (raw: Record<string, string>) => ParseResult<T>,
  handler: (data: T, values: Record<string, string>) => Promise<FormState | void>,
) {
  return async (_prev: FormState, formData: FormData): Promise<FormState> => {
    const values = formValues(formData);
    const result = parse(values);
    if (!result.success) return { status: "error", errors: result.errors, values };
    return (await handler(result.data, values)) ?? null;
  };
}

export const success = (message: string): FormState => ({ status: "success", message });
export const failure = (message: string, values?: Record<string, string>): FormState => ({
  status: "error",
  message,
  values,
});
