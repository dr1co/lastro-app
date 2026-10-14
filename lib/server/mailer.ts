import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

export type Email = { to: string; subject: string; text: string };

const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;

/**
 * Sends an email through `SMTP_URL`. Without it (dev and e2e), the email is logged and appended to
 * `<MAIL_OUTBOX_DIR>/outbox.jsonl` so links can be opened locally and read by Cypress.
 */
export async function sendEmail(email: Email): Promise<void> {
  if (transport) {
    await transport.sendMail({ from: process.env.MAIL_FROM ?? "Lastro <no-reply@localhost>", ...email });
    return;
  }
  const dir = path.resolve(process.env.MAIL_OUTBOX_DIR ?? ".mail-outbox");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(dir, "outbox.jsonl"), JSON.stringify({ ...email, sentAt: new Date() }) + "\n");
  console.info(`[mail] to=${email.to} subject="${email.subject}"\n${email.text}`);
}

/** Absolute URL of an app path, based on `BETTER_AUTH_URL`. */
export function appUrl(pathname: string): string {
  return new URL(pathname, process.env.BETTER_AUTH_URL).toString();
}
