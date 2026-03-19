import type { Options } from "postgres";

function tryParseHostname(url: string): string | null {
  try {
    const withProtocol = /^postgres(ql)?:\/\//i.test(url) ? url : `postgresql://${url}`;
    const forUrl = withProtocol.replace(/^postgres(ql)?:\/\//i, "http://");
    return new URL(forUrl).hostname;
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
 * Options for `postgres(url, opts)` so cloud Postgres (TLS required) works without
 * changing the connection string. Override with DATABASE_SSL=require|disable.
 */
export function getPostgresConnectionOptions(
  connectionString: string,
): Options<Record<string, never>> {
  const lower = connectionString.toLowerCase();
  if (lower.includes("sslmode=disable")) {
    return {};
  }

  const env = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (env === "require" || env === "true" || env === "1") {
    return { ssl: "require" };
  }
  if (env === "disable" || env === "false" || env === "0") {
    return {};
  }

  const host = tryParseHostname(connectionString);
  if (host && looksLikeCloudPostgres(host)) {
    return { ssl: "require" };
  }

  return {};
}
