import { auth } from "@/auth";
import { createAuthDb } from "@/lib/db";
import { createContext } from "@markme/api";

/** For tRPC route handlers / server callers (Phase 6). */
export async function createApiContext() {
  const session = await auth();
  const db = createAuthDb();
  if (!db) {
    throw new Error("DATABASE_URL is not set");
  }
  return createContext({
    db,
    session: session?.user?.id ? { userId: session.user.id } : null,
  });
}
