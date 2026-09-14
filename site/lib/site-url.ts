/**
 * Single source of truth for the canonical site URL.
 *
 * Reads `NEXT_PUBLIC_SITE_URL` at build time. The value is expected to be a
 * fully-qualified URL (e.g. `https://sachncs.github.io/hurstify`) when used
 * for absolute metadata, and may be a path-only value (e.g. `/hurstify`)
 * for client-side routing. We expose both forms.
 */
const defaultBase = 'https://sachncs.github.io/hurstify';

function normalizeBase(raw: string | undefined): string {
  if (!raw) return defaultBase;
  if (/^https?:\/\//.test(raw)) return raw.replace(/\/$/, '');
  // Path-only value (e.g. `/hurstify`); route it through the default host.
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path;
}

export const siteUrl: string = normalizeBase(
  process.env.NEXT_PUBLIC_SITE_URL,
);

/**
 * Path-only basePath used by `next.config.mjs` (the same value is also set
 * there). Useful for tests and for callers that need the bare subpath.
 */
export const siteBasePath: string = normalizeBase(
  process.env.NEXT_PUBLIC_BASE_PATH,
).replace(/^https?:\/\/[^/]+/, '');
