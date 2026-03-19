import { z } from "zod";

export const categoryIdSchema = z.string().min(1);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  emoji: z.string().min(1).max(10).default("📁"),
  color: z.number().int().min(0).max(20).default(0),
  tags: z.array(z.string().min(1).max(50)).default([]),
  position: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  name: z.string().min(1).max(200).optional(),
  emoji: z.string().min(1).max(10).optional(),
  color: z.number().int().min(0).max(20).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(categoryIdSchema).min(1),
});
