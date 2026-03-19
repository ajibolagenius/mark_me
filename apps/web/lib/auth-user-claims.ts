import { users } from "@markme/db/schema";
import { eq } from "drizzle-orm";
import type { JWT } from "next-auth/jwt";
import { createAuthDb } from "./db";

/** Loads app-specific claims after sign-in (runs on the server, not in Edge middleware). */
export async function applyUserClaimsToToken(token: JWT, userId: string) {
  const db = createAuthDb();
  if (!db) return;
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (row) {
    token.plan = row.plan;
    token.joinedAt = row.createdAt.toISOString();
  }
}
