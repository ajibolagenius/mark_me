import { z } from "zod";

export const suggestTagsSchema = z.object({
  prefix: z.string().max(50).default(""),
  limit: z.number().int().min(1).max(50).default(20),
});
