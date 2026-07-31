import { z } from "zod";
import { httpUrlSchema } from "../lib/url";

const bookmarkShape = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  url: httpUrlSchema,
  tags: z.array(z.string()).default([]),
  note: z.string().optional(),
  pinned: z.boolean().optional(),
  addedAt: z.number().optional(),
});

const categoryShape = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  color: z.number(),
  icon: z.string(),
  tags: z.array(z.string()).default([]),
  bookmarks: z.array(bookmarkShape),
});

export const importJsonSchema = z.object({
  categories: z.array(categoryShape).min(0).max(500),
  mode: z.enum(["replace", "merge"]).default("replace"),
});

export type ImportCategoryInput = z.infer<typeof categoryShape>;
export type ImportBookmarkInput = z.infer<typeof bookmarkShape>;
