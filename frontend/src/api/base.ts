/**
 * Shared API base URL for every backend call.
 *
 * Same-origin "/api" by default (Docker's nginx proxies it to the backend,
 * the Vite dev server too — see vite.config.ts). For hosted frontends
 * (e.g. Vercel) point this at the backend instead via the
 * VITE_API_BASE_URL build-time variable, e.g. "https://finos-api.onrender.com/api".
 *
 * Kept in its own module (not in client.ts) so lib/auth.ts can use it
 * without creating a client <-> auth import cycle.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") || "/api";

/** Absolute URL for the raw fetch() calls that bypass client.ts's request()
 * (backup download, auth probe) — keeps them on the same base. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Base prefix used by client.ts's request() for all JSON calls. */
export function apiBase(): string {
  return API_BASE;
}
