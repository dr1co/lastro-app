import { z } from "zod";
import { strings } from "@/lib/strings";
import { toParseResult } from "./validation";

const { errors } = strings;

export const MIN_PASSWORD_LENGTH = 8;

const email = z
  .string(errors.required)
  .trim()
  .toLowerCase()
  .min(1, errors.required)
  .pipe(z.email(errors.invalidEmail));
const password = z.string(errors.required).min(MIN_PASSWORD_LENGTH, errors.passwordTooShort).max(128, errors.tooLong);

const withConfirmation = <T extends z.ZodObject<{ password: typeof password; confirmPassword: z.ZodString }>>(schema: T) =>
  schema.refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: errors.passwordMismatch,
  });

const signUpSchema = withConfirmation(
  z.object({
    name: z.string(errors.required).trim().min(1, errors.required).max(60, errors.tooLong),
    email,
    password,
    confirmPassword: z.string(errors.required),
  }),
);

const signInSchema = z.object({
  email,
  password: z.string(errors.required).min(1, errors.required),
});

const newPasswordSchema = withConfirmation(
  z.object({
    token: z.string(errors.required).min(1, errors.required),
    password,
    confirmPassword: z.string(errors.required),
  }),
);

/** Validates the sign-up form. */
export const parseSignUp = (raw: unknown) => toParseResult(signUpSchema.safeParse(raw));
/** Validates the sign-in form. */
export const parseSignIn = (raw: unknown) => toParseResult(signInSchema.safeParse(raw));
/** Validates the password-reset form (token from the email link plus the new password). */
export const parseNewPassword = (raw: unknown) => toParseResult(newPasswordSchema.safeParse(raw));
/** Validates the forgot-password form. */
export const parseEmailOnly = (raw: unknown) => toParseResult(z.object({ email }).safeParse(raw));

export const DEFAULT_NEXT_PATH = "/inicio";

/** Returns `next` only when it is a same-site absolute path; anything else falls back to the dashboard. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return DEFAULT_NEXT_PATH;
  return next;
}

/** pt-BR message for a Better Auth error code. */
export function authErrorMessage(code: string | undefined): string {
  return (code && strings.auth.errors[code]) || errors.generic;
}
