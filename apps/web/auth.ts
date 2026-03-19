import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "@markme/db/schema";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { createAuthDb } from "./lib/db";

const db = createAuthDb();

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { authorizeWithDemoCredentials } = await import("./lib/demo-credentials");
        return authorizeWithDemoCredentials(credentials);
      },
    }),
    ...(Array.isArray(authConfig.providers) ? authConfig.providers : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image ?? undefined;
        const { applyUserClaimsToToken } = await import("./lib/auth-user-claims");
        await applyUserClaimsToToken(token, user.id);
      }
      return token;
    },
  },
  ...(db
    ? {
        adapter: DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: sessions,
          verificationTokensTable: verificationTokens,
        }),
      }
    : {}),
});
