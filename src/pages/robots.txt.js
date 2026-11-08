import { siteOrigin } from "../../lib/store.js";

export const prerender = false;

export function GET() {
  const base = siteOrigin();
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
