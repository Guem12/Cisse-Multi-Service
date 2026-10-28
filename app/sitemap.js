import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await getProducts();
  return [
    { url: base },
    { url: `${base}/catalogue` },
    ...products.map((p) => ({ url: `${base}/produit/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
