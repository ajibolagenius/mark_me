import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getPostgresConnectionOptions } from "./postgres-connection-options";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy packages/db/.env.example to .env and fill in the value.",
  );
}

const queryClient = postgres(connectionString, getPostgresConnectionOptions(connectionString));

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
