import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

type NeonAuthInstance = ReturnType<typeof createNeonAuth>;

let _auth: NeonAuthInstance | undefined;

function getAuth(): NeonAuthInstance {
  if (!_auth) {
    _auth = createNeonAuth({
      baseUrl: requireEnv("NEON_AUTH_BASE_URL"),
      cookies: {
        secret: requireEnv("NEON_AUTH_COOKIE_SECRET"),
        sessionDataTtl: 300,
        sameSite: "lax",
      },
    });
  }
  return _auth;
}

/**
 * Neon Auth (Managed Better Auth) — lazy singleton.
 * Proxies `/api/auth/*`, session cookies, and `getSession()`.
 */
export const auth: NeonAuthInstance = new Proxy({} as NeonAuthInstance, {
  get(_target, prop, _receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
