import { auth } from "@/lib/auth/server";
import { createAuthDb } from "@/lib/db";
import { ensureAppUser } from "@/lib/ensure-app-user";

/**
 * Upserts `public.users` from the current Neon Auth session.
 * Called after sign-up / sign-in so app FKs have a profile row immediately.
 */
export async function POST() {
  const { data: session } = await auth.getSession();
  const neonUser = session?.user;
  if (!neonUser?.id || !neonUser.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAuthDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const appUser = await ensureAppUser(db as never, {
    id: neonUser.id,
    email: neonUser.email,
    name: neonUser.name,
    image: neonUser.image,
    emailVerified: neonUser.emailVerified,
  });

  return Response.json({
    id: String((appUser as { id: string }).id),
    email: String((appUser as { email: string }).email),
    name: String((appUser as { name: string }).name),
    plan: String((appUser as { plan: string }).plan),
  });
}
