import { notFound } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modifier le produit · Administration",
};

export default async function EditProductPage({ params }) {
  const [product, categories] = await Promise.all([getProductById(params.id), getCategories()]);
  if (!product) notFound();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Navigation retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/produits"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-ocre"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux produits
        </Link>

        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          Édition produit
        </span>
      </div>

      {/* En-tête centré */}
      <div className="text-center space-y-2">
        <h1
          className="font-titre text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--text-main)" }}
        >
          Modifier le produit
        </h1>
        <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
          Mettez à jour les informations, prix, photos ou état du stock de cet article.
        </p>
      </div>

      {/* Formulaire dans une carte centrée */}
      <div
        className="rounded-2xl border p-6 sm:p-8 shadow-sm transition-all"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
