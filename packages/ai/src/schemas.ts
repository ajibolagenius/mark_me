import { z } from "zod";

/** Structured output: suggested tags for a bookmark. */
export const autoTagResultSchema = z.object({
  tags: z.array(z.string()).max(12).describe("Short, lowercase, specific tags"),
});

/** Structured output: category / collection summary. */
export const summaryResultSchema = z.object({
  summary: z.string().describe("2–4 sentences"),
  keyTopics: z.array(z.string()).max(12).describe("Main themes"),
});

/** Structured output: semantically similar bookmark pairs (use bookmark ids from context). */
export const duplicateResultSchema = z.object({
  duplicates: z
    .array(
      z.object({
        a: z.string().describe("First bookmark id"),
        b: z.string().describe("Second bookmark id"),
        similarity: z.number().min(0).max(1),
      }),
    )
    .max(30),
});

/** Structured output: reorganization suggestions. */
export const reorgResultSchema = z.object({
  suggestions: z
    .array(
      z.object({
        action: z.string(),
        reason: z.string(),
      }),
    )
    .max(20),
});

/** Structured output: auto-organize library proposals */
export const autoOrganizeResultSchema = z.object({
  newCategories: z
    .array(
      z.object({
        name: z.string(),
        emoji: z.string(),
        color: z.number().int().min(0).max(7),
        description: z.string().optional(),
      }),
    )
    .max(10),
  moves: z
    .array(
      z.object({
        bookmarkId: z.string(),
        targetCategoryName: z.string(),
        reason: z.string(),
      }),
    )
    .max(60),
});


/** Structured output: clean and consolidate tags */
export const cleanTagsResultSchema = z.object({
  junkTagsToRemove: z.array(z.string()).max(100).describe("Stop words, protocol/domain junk, or meaningless words"),
  tagMerges: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    )
    .max(50)
    .describe("Synonyms or variant spellings to consolidate"),
});

/** Structured output: batch tag suggestions */
export const batchTagResultSchema = z.object({
  suggestions: z
    .array(
      z.object({
        bookmarkId: z.string(),
        tags: z.array(z.string()).max(6),
      }),
    )
    .max(40),
});

/** Structured output: reading digest / newsletter */
export const digestResultSchema = z.object({
  title: z.string(),
  overview: z.string(),
  sections: z.array(
    z.object({
      category: z.string(),
      highlights: z.array(z.string()),
      summary: z.string(),
    }),
  ),
  markdown: z.string(),
});

export type AutoTagResult = z.infer<typeof autoTagResultSchema>;
export type SummaryResult = z.infer<typeof summaryResultSchema>;
export type DuplicateResult = z.infer<typeof duplicateResultSchema>;
export type ReorgResult = z.infer<typeof reorgResultSchema>;
export type AutoOrganizeResult = z.infer<typeof autoOrganizeResultSchema>;
export type CleanTagsResult = z.infer<typeof cleanTagsResultSchema>;
export type BatchTagResult = z.infer<typeof batchTagResultSchema>;
export type DigestResult = z.infer<typeof digestResultSchema>;
