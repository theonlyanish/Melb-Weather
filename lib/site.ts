// Single source of truth for the public site URL.
// The fallback must be a domain we actually control — localsky.app is owned
// by an unrelated product, so pointing canonical/OG/sitemap URLs there
// tells search engines to index someone else's site instead of ours.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://localsky.vercel.app";
