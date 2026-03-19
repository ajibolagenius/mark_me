/**
 * GET /api/extension-token
 *
 * Returns a signed JWT for use by the Chrome extension.
 * Requires a valid NextAuth session (httpOnly cookie).
 * The token is separate from the NextAuth session and can be revoked
 * independently by rotating EXTENSION_TOKEN_SECRET.
 */
import { auth } from "@/auth";
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
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const secret = getSecret();
  const expiresAt = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

  const token = await new SignJWT({ userId: session.user.id, type: "extension" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_DAYS}d`)
    .sign(secret);

  return Response.json({
    token,
    userId: session.user.id,
    expiresAt,
  });
}
