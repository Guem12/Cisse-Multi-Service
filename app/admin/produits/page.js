import ProductList from "@/components/admin/ProductList";
import { getCategories, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogue Produits · Administration",
};

export default async function AdminProductsCataloguePage() {
  const [products, categories] = await Promise.all([
    getProducts({ includeInactive: true }),
    getCategories(),
  ]);

  return <ProductList initialProducts={products} categories={categories} />;
}
