import { z } from "zod";

export const aiChatSchema = z.object({
  message: z.string().min(1).max(8000),
});

export const aiAutoTagSchema = z.object({
  title: z.string().min(1).max(500),
  url: z.string().min(1).max(2048),
});

export const aiSummarizeSchema = z.object({
  categoryId: z.string().min(1),
});

export const aiDetectDuplicatesSchema = z.object({
  minScore: z.number().min(0).max(1).default(0.85),
});

export const aiReorganizeSchema = z.object({
  hint: z.string().max(500).optional(),
});

export const aiAutoOrganizeSchema = z.object({
  categoryId: z.string().optional(),
});

export const aiCleanTagsSchema = z.object({
  limit: z.number().int().min(1).max(300).default(200),
});

export const aiBatchTagSchema = z.object({
  bookmarkIds: z.array(z.string()).max(40).optional(),
});

export const aiDigestSchema = z.object({
  topicOrTimeframe: z.string().max(300).optional(),
});

