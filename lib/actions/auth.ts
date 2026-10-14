"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authErrorMessage,
  parseEmailOnly,
  parseNewPassword,
  parseSignIn,
  parseSignUp,
  safeNextPath,
} from "@/lib/domain/auth";
import { auth } from "@/lib/server/auth";
import { failure, formAction, success } from "@/lib/server/form-action";
import { strings } from "@/lib/strings";

/** Runs a Better Auth call, turning its errors into a translated message. */
async function attempt(call: () => Promise<unknown>): Promise<string | null> {
  try {
    await call();
    return null;
  } catch (error) {
    if (error instanceof APIError) return authErrorMessage(error.body?.code);
    throw error;
  }
}

export const signUp = formAction(parseSignUp, async ({ name, email, password }, values) => {
  const error = await attempt(async () =>
    auth.api.signUpEmail({
      body: { name, email, password, callbackURL: safeNextPath(values.next) },
      headers: await headers(),
    }),
  );
  if (error) return failure(error, values);
  redirect(`/verifique-seu-email?email=${encodeURIComponent(email)}`);
});

export const signIn = formAction(parseSignIn, async ({ email, password }, values) => {
  const error = await attempt(async () =>
    auth.api.signInEmail({ body: { email, password }, headers: await headers() }),
  );
  if (error) return failure(error, { email: values.email });
  redirect(safeNextPath(values.next));
});

export const requestPasswordReset = formAction(parseEmailOnly, async ({ email }) => {
  await attempt(() => auth.api.requestPasswordReset({ body: { email, redirectTo: "/redefinir-senha" } }));
  return success(strings.auth.forgot.sent);
});

export const resetPassword = formAction(parseNewPassword, async ({ token, password }, values) => {
  const error = await attempt(() => auth.api.resetPassword({ body: { token, newPassword: password } }));
  if (error) return failure(error, { token: values.token });
  redirect("/entrar?redefinida=1");
});

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/entrar");
}
