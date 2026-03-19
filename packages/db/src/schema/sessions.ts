import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/** Auth.js / NextAuth database session rows (table name `session`). */
export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
});
