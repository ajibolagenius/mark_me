import { z } from "zod";

/** Normalize bare hosts to https://; leave http(s) as-is. */
export function normalizeBookmarkUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** True when the string is a valid http(s) URL (after optional https:// prefix). */
export function isHttpUrl(raw: string): boolean {
  try {
    const parsed = new URL(normalizeBookmarkUrl(raw));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const httpUrlSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine(isHttpUrl, { message: "URL must be a valid http(s) address" })
  .transform(normalizeBookmarkUrl);
