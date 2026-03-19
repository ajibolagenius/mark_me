import { users } from "@markme/db/schema";
import { MOCK_USERS } from "@markme/ui";
import { eq } from "drizzle-orm";
import { createAuthDb } from "./db";

/** Shape expected by NextAuth Credentials `authorize`. */
export type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: Date | null;
};

export async function authorizeWithDemoCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
): Promise<AuthorizedUser | null> {
  const email = String(credentials?.email ?? "")
    .toLowerCase()
    .trim();
  const password = String(credentials?.password ?? "");
  if (!email || !password) return null;

  const mock = MOCK_USERS[email];
  if (!(mock && mock.password === password)) return null;

  const db = createAuthDb();
  if (!db) return null;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      emailVerified: existing.emailVerified,
      image: existing.image,
    };
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: mock.name,
      plan: mock.plan,
    })
    .returning();
  if (!created) return null;
  return {
    id: created.id,
    email: created.email,
    name: created.name,
    emailVerified: created.emailVerified,
    image: created.image,
  };
}
