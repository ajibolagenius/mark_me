import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

/** Non-empty secret from env; empty strings from `.env` are treated as unset. */
function readAuthSecret(): string | undefined {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

const devAuthSecret =
  process.env.NODE_ENV === "development"
    ? "markme-dev-only-do-not-use-in-production"
    : undefined;

/** Edge-safe providers (no DB). Credentials live in `auth.ts`. */
const providers: NextAuthConfig["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  );
}

if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  );
}

export const authConfig = {
  trustHost: true,
  secret: readAuthSecret() ?? devAuthSecret,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (
        path.startsWith("/dashboard") ||
        path.startsWith("/profile") ||
        path === "/newtab" ||
        path.startsWith("/newtab/")
      ) {
        return !!auth?.user;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.image = token.picture ?? null;
        session.user.plan = token.plan ?? "free";
        session.user.joinedAt = token.joinedAt;
      }
      return session;
    },
  },
  providers,
} satisfies NextAuthConfig;
