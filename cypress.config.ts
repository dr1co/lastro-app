import { defineConfig } from "cypress";
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

loadEnv({ path: ".env.test", quiet: true });

const sql = postgres(process.env.DATABASE_URL!, { onnotice: () => {} });
const outbox = path.resolve(process.env.MAIL_OUTBOX_DIR!, "outbox.jsonl");

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3100",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
    setupNodeEvents(on) {
      on("task", {
        async "db:reset"() {
          const tables = await sql<{ tablename: string }[]>`
            select tablename from pg_tables where schemaname = 'public' and tablename not like '__drizzle%'`;
          await sql.unsafe(`truncate ${tables.map((t) => `"${t.tablename}"`).join(", ")} cascade`);
          fs.rmSync(outbox, { force: true });
          return null;
        },
        async "user:verify"(email: string) {
          await sql`update "user" set email_verified = true where email = ${email}`;
          return null;
        },
        "email:last"(to: string) {
          if (!fs.existsSync(outbox)) return null;
          const emails = fs
            .readFileSync(outbox, "utf8")
            .trim()
            .split("\n")
            .map((line) => JSON.parse(line))
            .filter((email) => email.to === to);
          return emails.at(-1) ?? null;
        },
      });
    },
  },
});
