import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  avatarUrl: z.string().url().max(2048).optional().nullable(),
});
