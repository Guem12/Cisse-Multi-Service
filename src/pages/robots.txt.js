export const prerender = false;

export function GET({ site }) {
  const base = import.meta.env.PUBLIC_SITE_URL || site?.origin || "https://cisse-multi-service.netlify.app";
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
