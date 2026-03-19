import { aiUsage } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { AppDb } from "../context";

/** Requests per user per UTC day */
export const AI_DAILY_LIMIT = 100;

export async function consumeAiQuota(db: AppDb, userId: string): Promise<void> {
  const dateStr = new Date().toISOString().slice(0, 10);

  const existing = await db
    .select()
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.date, dateStr)))
    .limit(1);

  const row = existing[0];
  if (row) {
    if (row.queryCount >= AI_DAILY_LIMIT) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `AI daily limit (${AI_DAILY_LIMIT}) reached. Try again tomorrow.`,
      });
    }
    await db
      .update(aiUsage)
      .set({ queryCount: row.queryCount + 1 })
      .where(eq(aiUsage.id, row.id));
  } else {
    await db.insert(aiUsage).values({
      userId,
      date: dateStr,
      queryCount: 1,
    });
  }
}
