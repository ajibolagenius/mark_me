import { createContext, type AppDb } from "@markme/api";
import { jwtVerify } from "jose";
import { auth } from "@/lib/auth/server";
import { createAuthDb } from "@/lib/db";
import { ensureAppUser } from "@/lib/ensure-app-user";

function getExtensionSecret(): Uint8Array | null {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

/** Validates an extension Bearer token; returns userId or null. */
async function resolveExtensionToken(token: string): Promise<string | null> {
  const secret = getExtensionSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type === "extension" && typeof payload.userId === "string" && payload.userId) {
      return payload.userId;
    }
  } catch {
    // Invalid or expired token
  }
  return null;
}

/** For tRPC route handlers / server callers. Accepts Neon Auth sessions and extension Bearer tokens. */
export async function createApiContext(req?: Request) {
  const db = createAuthDb() as AppDb | undefined;
  if (!db) {
    throw new Error("DATABASE_URL is not set");
  }

  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const userId = await resolveExtensionToken(token);
      if (userId) {
        return createContext({ db, session: { userId } });
      }
    }
  }

  const { data: session } = await auth.getSession();
  const neonUser = session?.user;
  if (!neonUser?.id || !neonUser.email) {
    return createContext({ db, session: null });
  }

  const appUser = await ensureAppUser(db as never, {
    id: neonUser.id,
    email: neonUser.email,
    name: neonUser.name,
    image: neonUser.image,
    emailVerified: neonUser.emailVerified,
  });

  return createContext({
    db,
    session: { userId: String((appUser as { id: string }).id) },
  });
}
