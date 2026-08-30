import {
    isOpenRouterConfigured,
    runAutoOrganizeStructured,
    runAutoTagStructured,
    runBatchTagStructured,
    runBookmarkAssistantCompletion,
    runCleanTagsStructured,
    runDigestStructured,
    runDuplicatesStructured,
    runReorganizeStructured,
    runSummarizeStructured,
} from "@markme/ai";
import { bookmarks, categories } from "@markme/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { consumeAiQuota } from "../lib/ai-quota";
import { buildBookmarkContextText } from "../lib/bookmark-context";
import { requireCategoryForUser } from "../lib/ownership";
import {
    aiAutoOrganizeSchema,
    aiAutoTagSchema,
    aiBatchTagSchema,
    aiChatSchema,
    aiCleanTagsSchema,
    aiDetectDuplicatesSchema,
    aiDigestSchema,
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

    autoOrganize: protectedProcedure
        .input(aiAutoOrganizeSchema.optional())
        .mutation(async ({ ctx, input: rawInput }) => {
            const input = rawInput ?? {};
            try {
                await consumeAiQuota(ctx.db, ctx.session.userId);
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                // Continue with quota fallback if table error
            }

            try {
                const userCats = await ctx.db
                    .select()
                    .from(categories)
                    .where(eq(categories.userId, ctx.session.userId));

                const userBms = await ctx.db
                    .select()
                    .from(bookmarks)
                    .where(eq(bookmarks.userId, ctx.session.userId));

                const existingCatNames = userCats.map((c) => c.name);

                let targetBookmarks = userBms
                    .filter((b) => !input.categoryId || b.categoryId === input.categoryId)
                    .map((b) => ({
                        id: b.id,
                        title: b.title,
                        url: b.url,
                        tags: b.tags ?? [],
                    }));

                if (targetBookmarks.length === 0) {
                    return { newCategories: [], moves: [], notice: "No bookmarks found to organize." };
                }

                if (!isOpenRouterConfigured()) {
                    // Heuristic rule-based fallback
                    const moves: { bookmarkId: string; targetCategoryName: string; reason: string }[] = [];
                    for (const b of targetBookmarks) {
                        const u = b.url.toLowerCase();
                        if (u.includes("github.com") || u.includes("stackoverflow.com") || u.includes("npm") || u.includes("gitlab")) {
                            moves.push({ bookmarkId: b.id, targetCategoryName: "Dev Tools", reason: "Developer domain detected" });
                        } else if (u.includes("dribbble.com") || u.includes("figma.com") || u.includes("behance") || u.includes("unsplash")) {
                            moves.push({ bookmarkId: b.id, targetCategoryName: "Design", reason: "Design domain detected" });
                        } else if (u.includes("youtube.com") || u.includes("vimeo.com") || u.includes("netflix") || u.includes("twitch")) {
                            moves.push({ bookmarkId: b.id, targetCategoryName: "Media & Video", reason: "Media streaming site" });
                        } else if (u.includes("twitter.com") || u.includes("x.com") || u.includes("linkedin") || u.includes("reddit")) {
                            moves.push({ bookmarkId: b.id, targetCategoryName: "Social & Community", reason: "Social media platform" });
                        } else if (u.includes("news") || u.includes("medium.com") || u.includes("dev.to") || u.includes("substack")) {
                            moves.push({ bookmarkId: b.id, targetCategoryName: "Reading & News", reason: "Article / News site" });
                        }
                    }
                    const neededCats = [...new Set(moves.map((m) => m.targetCategoryName))].filter(
                        (name) => !existingCatNames.some((c) => c.toLowerCase() === name.toLowerCase()),
                    );
                    return {
                        newCategories: neededCats.map((name, i) => ({
                            name,
                            emoji: name.includes("Dev") ? "⚡" : name.includes("Design") ? "🎨" : name.includes("Media") ? "🎬" : name.includes("Social") ? "💬" : "📚",
                            color: (i + 1) % 7,
                        })),
                        moves,
                    };
                }

                try {
                    const result = await runAutoOrganizeStructured(targetBookmarks, existingCatNames);
                    return { ...result, notice: undefined };
                } catch {
                    return {
                        newCategories: [],
                        moves: [],
                        notice: "AI organization encountered an issue. Try again or check your OpenRouter API key.",
                    };
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to process organization request.",
                });
            }
        }),

    cleanTags: protectedProcedure
        .input(aiCleanTagsSchema.optional())
        .mutation(async ({ ctx, input: rawInput }) => {
            try {
                await consumeAiQuota(ctx.db, ctx.session.userId);
            } catch (err) {
                if (err instanceof TRPCError) throw err;
            }

            try {
                const userBookmarks = await ctx.db
                    .select({ tags: bookmarks.tags })
                    .from(bookmarks)
                    .where(eq(bookmarks.userId, ctx.session.userId));

                const freqMap: Record<string, number> = {};
                for (const b of userBookmarks) {
                    for (const t of b.tags ?? []) {
                        const norm = t.trim().toLowerCase();
                        if (norm) freqMap[norm] = (freqMap[norm] || 0) + 1;
                    }
                }

                const tagsWithFrequency = Object.entries(freqMap).map(([tag, count]) => ({ tag, count }));
                const defaultJunk = new Set([
                    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with",
                    "is", "that", "this", "it", "any", "all", "from", "by", "com", "https",
                    "http", "www", "org", "net", "io", "dev", "html", "php", "index",
                ]);

                if (!isOpenRouterConfigured()) {
                    const junk = tagsWithFrequency
                        .filter((item) => defaultJunk.has(item.tag) || item.tag.length < 2)
                        .map((item) => item.tag);
                    return {
                        junkTagsToRemove: junk,
                        tagMerges: [] as { from: string; to: string }[],
                    };
                }

                try {
                    return await runCleanTagsStructured(tagsWithFrequency);
                } catch {
                    const junk = tagsWithFrequency
                        .filter((item) => defaultJunk.has(item.tag) || item.tag.length < 2)
                        .map((item) => item.tag);
                    return {
                        junkTagsToRemove: junk,
                        tagMerges: [] as { from: string; to: string }[],
                    };
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to scan tags.",
                });
            }
        }),

    batchTag: protectedProcedure
        .input(aiBatchTagSchema.optional())
        .mutation(async ({ ctx, input: rawInput }) => {
            const input = rawInput ?? {};
            try {
                await consumeAiQuota(ctx.db, ctx.session.userId);
            } catch (err) {
                if (err instanceof TRPCError) throw err;
            }

            try {
                let rows = await ctx.db
                    .select()
                    .from(bookmarks)
                    .where(eq(bookmarks.userId, ctx.session.userId));

                if (input.bookmarkIds && input.bookmarkIds.length > 0) {
                    rows = rows.filter((b) => input.bookmarkIds?.includes(b.id));
                } else {
                    rows = rows.filter((b) => !b.tags || b.tags.length <= 1).slice(0, 30);
                }

                if (rows.length === 0) {
                    return { suggestions: [] };
                }

                const payload = rows.map((b) => ({ id: b.id, title: b.title, url: b.url }));

                if (!isOpenRouterConfigured()) {
                    const suggestions = payload.map((b) => ({
                        bookmarkId: b.id,
                        tags: autoTagFallback(b.title, b.url).tags,
                    }));
                    return { suggestions };
                }

                try {
                    return await runBatchTagStructured(payload);
                } catch {
                    const suggestions = payload.map((b) => ({
                        bookmarkId: b.id,
                        tags: autoTagFallback(b.title, b.url).tags,
                    }));
                    return { suggestions };
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate batch tags.",
                });
            }
        }),

    digest: protectedProcedure
        .input(aiDigestSchema.optional())
        .mutation(async ({ ctx, input: rawInput }) => {
            const input = rawInput ?? {};
            try {
                await consumeAiQuota(ctx.db, ctx.session.userId);
            } catch (err) {
                if (err instanceof TRPCError) throw err;
            }

            try {
                const context = await buildBookmarkContextText(ctx.db, ctx.session.userId);

                if (!isOpenRouterConfigured()) {
                    const userCats = await ctx.db
                        .select()
                        .from(categories)
                        .where(eq(categories.userId, ctx.session.userId));
                    const userBms = await ctx.db
                        .select()
                        .from(bookmarks)
                        .where(eq(bookmarks.userId, ctx.session.userId));

                    const sections = userCats.map((c) => {
                        const catBms = userBms.filter((b) => b.categoryId === c.id);
                        return {
                            category: c.name,
                            highlights: catBms.slice(0, 4).map((b) => b.title),
                            summary: `${catBms.length} bookmark(s) saved in ${c.name}.`,
                        };
                    });

                    const md = `# Bookmark Reading Digest\n\n${sections.map((s) => `## ${s.category}\n${s.summary}\n${s.highlights.map((h) => `- ${h}`).join("\n")}`).join("\n\n")}`;
                    return {
                        title: "Bookmark Reading Digest",
                        overview: `Overview of your library containing ${userBms.length} bookmarks across ${userCats.length} categories.`,
                        sections,
                        markdown: md,
                    };
                }

                try {
                    return await runDigestStructured(context, input.topicOrTimeframe);
                } catch {
                    throw new TRPCError({
                        code: "BAD_GATEWAY",
                        message: "AI provider error generating digest",
                    });
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate digest.",
                });
            }
        }),
});


