import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;
export const metadata = { title: "Catalogue · Cissé-multi-service" };

export default async function Catalogue({ searchParams }) {
  const active = searchParams?.categorie;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ categorySlug: active })]);

  const pill = (on) =>
    `whitespace-nowrap rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-all ${
      on
        ? "border-indigo bg-indigo text-white dark:border-ocre dark:bg-ocre dark:text-indigo-deep"
        : "border-indigo/30 text-indigo dark:border-white/20 dark:text-white/80 hover:bg-white/10"
    }`;

  return (
    <div className="wrap pb-16">
      <h1 className="mt-8 font-titre text-4xl font-extrabold sm:text-5xl dark:text-white">Catalogue</h1>

      <nav aria-label="Catégories" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <Link href="/catalogue" className={pill(!active)}>Tout</Link>
        {categories.map((c) => (
          <Link key={c._id} href={`/catalogue?categorie=${c.slug}`} className={pill(active === c.slug)}>{c.name}</Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="mt-8 text-indigo/70 dark:text-white/60">Aucun produit dans cette catégorie pour le moment.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-indigo/70 dark:text-white/60">{products.length} article{products.length > 1 ? "s" : ""}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
