// @ts-nocheck — Neon Auth brings a second drizzle-orm copy that breaks PgColumn assignability.
import { users } from "@markme/db/schema";
import { eq } from "drizzle-orm";
import type { AuthDb } from "./db";

export type NeonAuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean | Date | null;
};

/**
 * Ensures a `public.users` row exists for a Neon Auth user.
 * Bookmarks/categories FKs point at `public.users`; Neon Auth stores identity in `neon_auth.*`.
 * App user id always matches the Neon Auth user id.
 */
export async function ensureAppUser(db: AuthDb, neonUser: NeonAuthUser) {
  const email = neonUser.email.trim().toLowerCase();
  const name =
    (neonUser.name && neonUser.name.trim()) || email.split("@")[0] || "User";
  const image = neonUser.image ?? null;
  const emailVerified =
    neonUser.emailVerified instanceof Date
      ? neonUser.emailVerified
      : neonUser.emailVerified
        ? new Date()
        : null;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, neonUser.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        email,
        name: neonUser.name?.trim() ? name : existing.name,
        image: image ?? existing.image,
        avatarUrl: image ?? existing.avatarUrl,
        emailVerified: emailVerified ?? existing.emailVerified,
      })
      .where(eq(users.id, neonUser.id))
      .returning();
    return updated ?? existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      id: neonUser.id,
      email,
      name,
      image,
      avatarUrl: image,
      emailVerified,
      plan: "free",
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [again] = await db
    .select()
    .from(users)
    .where(eq(users.id, neonUser.id))
    .limit(1);
  if (again) return again;

  throw new Error(
    `Could not provision app user for ${email}. Resolve email conflicts in public.users.`,
  );
}
