import { aiUsage, users } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { AppDb } from "../context";

const LIMIT_BY_PLAN: Record<string, number> = {
  free: 25,
  pro: 200,
  team: 1000,
};

function dailyLimitForPlan(plan: string | undefined): number {
  const freeFallback = LIMIT_BY_PLAN.free ?? 25;
  if (!plan) return freeFallback;
  return LIMIT_BY_PLAN[plan] ?? freeFallback;
}

/** Default free-tier cap (when plan cannot be read). */
export const AI_DAILY_LIMIT_FREE = LIMIT_BY_PLAN.free ?? 25;

export async function consumeAiQuota(db: AppDb, userId: string): Promise<void> {
  const dateStr = new Date().toISOString().slice(0, 10);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const limit = dailyLimitForPlan(user?.plan);

  const existing = await db
    .select()
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.date, dateStr)))
    .limit(1);

  const row = existing[0];
  if (row) {
    if (row.queryCount >= limit) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `AI daily limit (${limit}) reached for your plan. Try again tomorrow.`,
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
