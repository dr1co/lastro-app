/** What a form Server Action returns to `ActionForm`: a message, per-field errors and the submitted values to restore. */
export type FormState = {
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
} | null;

/** Plain string values of a form submission, without React's internal `$ACTION` fields or files. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (!key.startsWith("$ACTION") && typeof value === "string") values[key] = value;
  }
  return values;
}

/** A single string value from Next's `searchParams`/`params`, ignoring repeated keys. */
export function param(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}
