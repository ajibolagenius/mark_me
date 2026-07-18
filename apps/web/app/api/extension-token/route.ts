/**
 * GET /api/extension-token
 *
 * Returns a signed JWT for use by the Chrome extension.
 * Requires a valid Neon Auth session (httpOnly cookie).
 */
import { auth } from "@/lib/auth/server";
import { createAuthDb } from "@/lib/db";
import { ensureAppUser } from "@/lib/ensure-app-user";
import { SignJWT } from "jose";

const TOKEN_TTL_DAYS = 30;

function getSecret(): Uint8Array {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "EXTENSION_TOKEN_SECRET must be set to at least 32 characters in your environment.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function GET() {
  const { data: session } = await auth.getSession();
  const neonUser = session?.user;

  if (!neonUser?.id || !neonUser.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = createAuthDb();
  if (!db) {
    return new Response("Database not configured", { status: 503 });
  }

  const appUser = await ensureAppUser(db as never, {
    id: neonUser.id,
    email: neonUser.email,
    name: neonUser.name,
    image: neonUser.image,
    emailVerified: neonUser.emailVerified,
  });

  const secret = getSecret();
  const expiresAt = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  const userId = String((appUser as { id: string }).id);

  const token = await new SignJWT({ userId, type: "extension" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_DAYS}d`)
    .sign(secret);

  return Response.json({
    token,
    userId,
    expiresAt,
  });
}
