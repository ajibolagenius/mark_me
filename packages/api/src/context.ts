import type * as schema from "@markme/db/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export type AppDb = PostgresJsDatabase<typeof schema>;

export interface Session {
  userId: string;
}

export interface ApiContext {
  db: AppDb;
  session: Session | null;
}

export function createContext(opts: {
  db: AppDb;
  session: Session | null;
}): ApiContext {
  return { db: opts.db, session: opts.session };
}
