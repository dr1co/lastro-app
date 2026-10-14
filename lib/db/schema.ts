import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { ACCOUNT_KINDS } from "@/lib/domain/balance";
import { PAYMENT_METHODS, TRANSACTION_TYPES } from "@/lib/domain/transactions";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
const cents = (name: string) => bigint(name, { mode: "number" });
const isoDate = (name: string) => date(name, { mode: "string" });

/* Better Auth core tables (user, session, account, verification). */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  lastHouseholdId: text("last_household_id"),
  ...timestamps,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

/* Domain tables. Every row belongs to one household. */

export const accountKind = pgEnum("account_kind", ACCOUNT_KINDS);
export const categoryKind = pgEnum("category_kind", ["income", "expense"]);
export const transactionType = pgEnum("transaction_type", TRANSACTION_TYPES);
export const paymentMethod = pgEnum("payment_method", PAYMENT_METHODS);

export const households = pgTable("households", {
  id: id(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => user.id),
  ...timestamps,
});

export const members = pgTable(
  "members",
  {
    id: id(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    color: text("color"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("members_household_idx").on(t.householdId),
    uniqueIndex("members_household_user_idx").on(t.householdId, t.userId).where(sql`${t.userId} is not null`),
  ],
);

export const invites = pgTable(
  "invites",
  {
    id: id(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    email: text("email"),
    memberId: text("member_id").references(() => members.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("invites_household_idx").on(t.householdId)],
);

export const financialAccounts = pgTable(
  "financial_accounts",
  {
    id: id(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: accountKind("kind").notNull(),
    ownerMemberId: text("owner_member_id").references(() => members.id),
    openingBalance: cents("opening_balance").notNull().default(0),
    openingDate: isoDate("opening_date").notNull(),
    color: text("color"),
    icon: text("icon"),
    includeInNetWorth: boolean("include_in_net_worth").notNull().default(true),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("financial_accounts_household_name_idx").on(t.householdId, t.name)],
);

export const categories = pgTable(
  "categories",
  {
    id: id(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: categoryKind("kind").notNull(),
    parentId: text("parent_id"),
    icon: text("icon"),
    color: text("color").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("categories_household_idx").on(t.householdId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: id(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    date: isoDate("date").notNull(),
    type: transactionType("type").notNull(),
    amount: cents("amount").notNull(),
    description: text("description"),
    categoryId: text("category_id").references(() => categories.id),
    accountId: text("account_id")
      .notNull()
      .references(() => financialAccounts.id),
    toAccountId: text("to_account_id").references(() => financialAccounts.id),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id),
    paymentMethod: paymentMethod("payment_method"),
    notes: text("notes"),
    refundOfId: text("refund_of_id"),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    index("transactions_household_date_idx").on(t.householdId, t.date),
    index("transactions_account_idx").on(t.accountId),
    index("transactions_to_account_idx").on(t.toAccountId),
  ],
);
