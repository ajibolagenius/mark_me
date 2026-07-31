import { z } from "zod";
import { httpUrlSchema } from "../lib/url";

export const bookmarkIdSchema = z.string().min(1);

export const listBookmarksSchema = z.object({
  categoryId: z.string().min(1).optional(),
});

export const createBookmarkSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(500),
  url: httpUrlSchema,
  note: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(50)).default([]),
  pinned: z.boolean().optional(),
  faviconUrl: z.string().url().max(2048).optional().nullable(),
});

export const updateBookmarkSchema = z.object({
  id: bookmarkIdSchema,
  title: z.string().min(1).max(500).optional(),
  url: httpUrlSchema.optional(),
  note: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  pinned: z.boolean().optional(),
  faviconUrl: z.string().url().max(2048).optional().nullable(),
  categoryId: z.string().min(1).optional(),
});

export const searchBookmarksSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(50),
});
