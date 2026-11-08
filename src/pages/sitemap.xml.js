import { getProducts } from "../../lib/data.js";
import { siteOrigin } from "../../lib/store.js";

export const prerender = false;

export async function GET() {
  const base = siteOrigin();
  const products = await getProducts();
  const urls = [
    { loc: base },
    { loc: `${base}/catalogue` },
    { loc: `${base}/qui-sommes-nous` },
    { loc: `${base}/livraison-paiement` },
    { loc: `${base}/retours-echanges` },
    ...products.map((product) => ({
      loc: `${base}/produit/${encodeURIComponent(product.slug)}`,
      lastmod: product.updatedAt,
    })),
  ];
  const entries = urls.map(({ loc, lastmod }) =>
    `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}</url>`,
  ).join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
