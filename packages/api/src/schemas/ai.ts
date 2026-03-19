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
