import type { Options } from "postgres";

function tryParseUrl(url: string): URL | null {
  try {
    const withProtocol = /^postgres(ql)?:\/\//i.test(url) ? url : `postgresql://${url}`;
    const asHttp = withProtocol.replace(/^postgres(ql)?:\/\//i, "http://");
    return new URL(asHttp);
  } catch {
    return null;
  }
}

function looksLikeCloudPostgres(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.endsWith(".supabase.co") ||
    h.includes("pooler.supabase.com") ||
    h.includes("supabase.com") ||
    h.endsWith(".neon.tech") ||
    h.includes(".neon.tech") ||
    h.includes("railway.app") ||
    h.endsWith(".render.com") ||
    h.includes("amazonaws.com")
  );
}

/**
 * Returns true when the URL targets Supabase's pgBouncer pooler in
 * transaction mode (port 6543 or hostname contains "pooler.supabase.com").
 * In that mode postgres-js must NOT use server-side prepared statements.
 */
function looksLikeSupabasePooler(parsed: URL): boolean {
  const h = parsed.hostname.toLowerCase();
  return h.includes("pooler.supabase.com") || parsed.port === "6543";
}

/**
 * Options for `postgres(url, opts)` so cloud Postgres (TLS required) and
 * Supabase's pgBouncer pooler (prepare: false) work without changing the
 * connection string. Override SSL with DATABASE_SSL=require|disable.
 */
export function getPostgresConnectionOptions(
  connectionString: string,
): Options<Record<string, never>> {
  const lower = connectionString.toLowerCase();
  if (lower.includes("sslmode=disable")) {
    return {};
  }

  const parsed = tryParseUrl(connectionString);
  const host = parsed?.hostname ?? null;

  const sslEnv = process.env.DATABASE_SSL?.trim().toLowerCase();
  let ssl: Options<Record<string, never>>["ssl"];

  if (sslEnv === "require" || sslEnv === "true" || sslEnv === "1") {
    ssl = "require";
  } else if (sslEnv === "disable" || sslEnv === "false" || sslEnv === "0") {
    ssl = undefined;
  } else if (host && looksLikeCloudPostgres(host)) {
    ssl = "require";
  }

  // pgBouncer transaction mode does not support prepared statements
  const prepare = parsed && looksLikeSupabasePooler(parsed) ? false : undefined;

  return {
    ...(ssl !== undefined && { ssl }),
    ...(prepare !== undefined && { prepare }),
  };
}
