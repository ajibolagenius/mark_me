import {
  boolean,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Neon Auth (Managed Better Auth) tables in `neon_auth`.
 * Managed by Neon — do not migrate with drizzle-kit push.
 * Column names are camelCase (Better Auth default).
 */
export const neonAuth = pgSchema("neon_auth");

export const neonAuthUsers = neonAuth.table(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text("role"),
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { withTimezone: true, mode: "date" }),
  },
  (table) => [unique("user_email_key").on(table.email)],
);

export const neonAuthSessions = neonAuth.table("session", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: uuid("userId")
    .notNull()
    .references(() => neonAuthUsers.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonatedBy"),
  activeOrganizationId: text("activeOrganizationId"),
});

export const neonAuthAccounts = neonAuth.table("account", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => neonAuthUsers.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull(),
});

export const neonAuthVerifications = neonAuth.table("verification", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
