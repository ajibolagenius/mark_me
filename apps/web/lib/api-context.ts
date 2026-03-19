import { auth } from "@/auth";
import { createAuthDb } from "@/lib/db";
import { createContext } from "@markme/api";
import { jwtVerify } from "jose";

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

/** For tRPC route handlers / server callers. Accepts NextAuth sessions and extension Bearer tokens. */
export async function createApiContext(req?: Request) {
  const db = createAuthDb();
  if (!db) {
    throw new Error("DATABASE_URL is not set");
  }

  // Check for extension Bearer token first
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

  // Fall back to NextAuth session cookie
  const session = await auth();
  return createContext({
    db,
    session: session?.user?.id ? { userId: session.user.id } : null,
  });
}
