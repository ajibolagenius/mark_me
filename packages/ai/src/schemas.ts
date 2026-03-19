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

export type AutoTagResult = z.infer<typeof autoTagResultSchema>;
export type SummaryResult = z.infer<typeof summaryResultSchema>;
export type DuplicateResult = z.infer<typeof duplicateResultSchema>;
export type ReorgResult = z.infer<typeof reorgResultSchema>;
