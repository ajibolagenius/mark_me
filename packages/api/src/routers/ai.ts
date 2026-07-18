import {
    isOpenRouterConfigured,
    runAutoTagStructured,
    runBookmarkAssistantCompletion,
    runDuplicatesStructured,
    runReorganizeStructured,
    runSummarizeStructured,
} from "@markme/ai";
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
    aiReorganizeSchema,
    aiSummarizeSchema,
} from "../schemas/ai";
import { protectedProcedure, router } from "../trpc";

const STOP = new Set(["the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with"]);

function autoTagFallback(title: string, url: string): { tags: string[] } {
    const blob = `${title} ${url}`.toLowerCase();
    const words = blob.split(/[^a-z0-9]+/i).filter((w) => w.length > 2 && !STOP.has(w));
    const unique = [...new Set(words)].slice(0, 8);
    return { tags: unique };
}

function urlDuplicateGroups(
    rows: { id: string; title: string; url: string }[],
): { urlKey: string; bookmarks: { id: string; title: string; url: string }[] }[] {
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
    return [...byUrl.values()]
        .filter((g) => g.length > 1)
        .map((g) => ({
            urlKey: g[0]?.url ?? "",
            bookmarks: g.map((b) => ({ id: b.id, title: b.title, url: b.url })),
        }));
}

export const aiRouter = router({
    chat: protectedProcedure.input(aiChatSchema).mutation(async ({ ctx, input }) => {
        await consumeAiQuota(ctx.db, ctx.session.userId);
        const context = await buildBookmarkContextText(ctx.db, ctx.session.userId);
        if (!isOpenRouterConfigured()) {
            return {
                text: "AI is not configured (set OPENROUTER_API_KEY). Your message was received.",
            };
        }
        try {
            const text = await runBookmarkAssistantCompletion(context, input.message);
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
        if (!isOpenRouterConfigured()) {
            return autoTagFallback(input.title, input.url);
        }
        try {
            return await runAutoTagStructured(input.title, input.url);
        } catch {
            return autoTagFallback(input.title, input.url);
        }
    }),

    summarize: protectedProcedure.input(aiSummarizeSchema).mutation(async ({ ctx, input }) => {
        await consumeAiQuota(ctx.db, ctx.session.userId);
        const cat = await requireCategoryForUser(ctx.db, ctx.session.userId, input.categoryId);
        const rows = await ctx.db.select().from(bookmarks).where(eq(bookmarks.categoryId, cat.id));
        if (rows.length === 0) {
            return {
                summary: `Category "${cat.name}" has no bookmarks yet.`,
                keyTopics: [] as string[],
            };
        }
        const lines = rows
            .map(
                (b) =>
                    `- "${b.title}" ${b.url} [tags: ${b.tags?.join(", ") || "none"}]${b.note ? ` note: ${b.note}` : ""}`,
            )
            .join("\n");
        if (!isOpenRouterConfigured()) {
            const titles = rows.map((b) => b.title).slice(0, 12);
            return {
                summary: `"${cat.name}" contains ${rows.length} bookmark(s). Examples: ${titles.join(", ")}.`,
                keyTopics: cat.tags ?? [],
            };
        }
        try {
            return await runSummarizeStructured(cat.name, lines);
        } catch {
            const titles = rows.map((b) => b.title).slice(0, 12);
            return {
                summary: `"${cat.name}" contains ${rows.length} bookmark(s). Examples: ${titles.join(", ")}.`,
                keyTopics: cat.tags ?? [],
            };
        }
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
            const urlGroups = urlDuplicateGroups(rows);

            if (!isOpenRouterConfigured()) {
                return {
                    duplicates: [] as { a: string; b: string; similarity: number }[],
                    urlDuplicateGroups: urlGroups,
                };
            }
            try {
                const payload = rows.map((b) => ({
                    id: b.id,
                    title: b.title,
                    url: b.url,
                    tags: b.tags ?? [],
                }));
                const { duplicates } = await runDuplicatesStructured(payload);
                const filtered = duplicates.filter((d) => d.similarity >= input.minScore);
                return { duplicates: filtered, urlDuplicateGroups: urlGroups };
            } catch {
                return {
                    duplicates: [] as { a: string; b: string; similarity: number }[],
                    urlDuplicateGroups: urlGroups,
                };
            }
        }),

    reorganize: protectedProcedure.input(aiReorganizeSchema).mutation(async ({ ctx, input }) => {
        await consumeAiQuota(ctx.db, ctx.session.userId);
        const context = await buildBookmarkContextText(ctx.db, ctx.session.userId);
        if (!isOpenRouterConfigured()) {
            return {
                suggestions: [] as { action: string; reason: string }[],
                notice: "AI is not configured (set OPENROUTER_API_KEY).",
            };
        }
        try {
            const { suggestions } = await runReorganizeStructured(context, input.hint);
            return { suggestions, notice: undefined as string | undefined };
        } catch {
            throw new TRPCError({
                code: "BAD_GATEWAY",
                message: "AI provider error",
            });
        }
    }),
});
