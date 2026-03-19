import { pgTable, text, integer, date } from "drizzle-orm/pg-core";
import { users } from "./users";

export const aiUsage = pgTable("ai_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  queryCount: integer("query_count").notNull().default(0),
});
