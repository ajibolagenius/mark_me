import { getPostgresConnectionOptions } from "@markme/db/postgres-options";
import * as schema from "@markme/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  mmPostgres?: ReturnType<typeof postgres>;
};

/**
 * Server-only DB for NextAuth adapter and auth callbacks.
 * Returns undefined when DATABASE_URL is missing (e.g. CI build without DB).
 */
export function createAuthDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const client =
    globalForDb.mmPostgres ?? postgres(url, getPostgresConnectionOptions(url));
  globalForDb.mmPostgres = client;
  return drizzle(client, { schema });
}

export type AuthDb = NonNullable<ReturnType<typeof createAuthDb>>;
