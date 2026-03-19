import { bookmarks } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { consumeAiQuota } from "../lib/ai-quota";
import { buildBookmarkContextText } from "../lib/bookmark-context";
import { requireCategoryForUser } from "../lib/ownership";
import {
  aiAutoTagSchema,
  aiChatSchema,
  aiDetectDuplicatesSchema,
  aiSummarizeSchema,
} from "../schemas/ai";
import { protectedProcedure, router } from "../trpc";

const STOP = new Set(["the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with"]);

export const aiRouter = router({
  chat: protectedProcedure.input(aiChatSchema).mutation(async ({ ctx, input }) => {
    await consumeAiQuota(ctx.db, ctx.session.userId);
    const context = await buildBookmarkContextText(ctx.db, ctx.session.userId);
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        text: "AI is not configured (set ANTHROPIC_API_KEY). Your message was received.",
      };
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the AI assistant for mark_me, a bookmark manager app. The user has the following bookmarks:\n\n${context}\n\nHelp the user organize, tag, summarize, and discover insights about their bookmarks. Be concise and helpful.`,
          messages: [{ role: "user", content: input.message }],
        }),
      });
      const data = (await res.json()) as {
        content?: { text?: string }[];
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(data.error?.message ?? res.statusText);
      }
      const text =
        data.content?.map((c) => c.text ?? "").join("") ??
        "Sorry, I couldn't process that request.";
      return { text };
    } catch {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: "AI provider error",
      });
    }
  }),

  autoTag: protectedProcedure.input(aiAutoTagSchema).mutation(async ({ ctx, input }) => {
    await consumeAiQuota(ctx.db, ctx.session.userId);
    const blob = `${input.title} ${input.url}`.toLowerCase();
    const words = blob.split(/[^a-z0-9]+/i).filter((w) => w.length > 2 && !STOP.has(w));
    const unique = [...new Set(words)].slice(0, 8);
    return { tags: unique };
  }),

  summarize: protectedProcedure.input(aiSummarizeSchema).mutation(async ({ ctx, input }) => {
    await consumeAiQuota(ctx.db, ctx.session.userId);
    const cat = await requireCategoryForUser(ctx.db, ctx.session.userId, input.categoryId);
    const rows = await ctx.db.select().from(bookmarks).where(eq(bookmarks.categoryId, cat.id));
    if (rows.length === 0) {
      return {
        summary: `Category "${cat.name}" has no bookmarks yet.`,
      };
    }
    const titles = rows.map((b) => b.title).slice(0, 12);
    return {
      summary: `"${cat.name}" contains ${rows.length} bookmark(s). Examples: ${titles.join(", ")}.`,
    };
  }),

  detectDuplicates: protectedProcedure
    .input(aiDetectDuplicatesSchema)
    .mutation(async ({ ctx, input }) => {
      void input.minScore;
      await consumeAiQuota(ctx.db, ctx.session.userId);
      const rows = await ctx.db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, ctx.session.userId));
      const byUrl = new Map<string, typeof rows>();
      for (const b of rows) {
        try {
          const u = new URL(b.url.startsWith("http") ? b.url : `https://${b.url}`);
          const key = `${u.hostname}${u.pathname}`.toLowerCase();
          const list = byUrl.get(key) ?? [];
          list.push(b);
          byUrl.set(key, list);
        } catch {
          const key = b.url.toLowerCase();
          const list = byUrl.get(key) ?? [];
          list.push(b);
          byUrl.set(key, list);
        }
      }
      const groups = [...byUrl.values()].filter((g) => g.length > 1);
      return {
        duplicateGroups: groups.map((g) => ({
          urlKey: g[0]?.url ?? "",
          bookmarks: g.map((b) => ({ id: b.id, title: b.title, url: b.url })),
        })),
      };
    }),
});
