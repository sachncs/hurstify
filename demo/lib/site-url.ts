/**
 * Single source of truth for the canonical site URL.
 *
 * Reads `NEXT_PUBLIC_SITE_URL` at build time (or `SITE_URL` on the server
 * for `metadataBase`) and falls back to a development placeholder. The
 * fallback is intentionally NOT a real production URL so the deployed
 * build can be detected as misconfigured if the env var is missing.
 */
const fallback = 'https://hurstify.example.com';

function normalize(raw: string | undefined): string {
  if (!raw) return fallback;
  return raw.replace(/\/$/, '');
}

export const siteUrl: string = normalize(
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
);
