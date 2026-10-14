import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db/client";
import { account, session, user, verification } from "@/lib/db/schema";
import { MIN_PASSWORD_LENGTH } from "@/lib/domain/auth";
import { strings } from "@/lib/strings";
import { sendEmail } from "./mailer";

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: strings.app.name,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  user: {
    additionalFields: {
      lastHouseholdId: { type: "string", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) =>
      sendEmail({ to: user.email, subject: strings.emails.reset.subject, text: strings.emails.reset.body(user.name, url) }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) =>
      sendEmail({ to: user.email, subject: strings.emails.verify.subject, text: strings.emails.verify.body(user.name, url) }),
  },
  socialProviders: googleEnabled
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } }
    : {},
  rateLimit: { enabled: process.env.AUTH_RATE_LIMIT !== "off" },
  plugins: [nextCookies()],
});
