import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import WhatsAppOrder from "@/components/WhatsAppOrder";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

// Cache ISR 60 secondes pour des pages produits ultra rapides
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts({ limit: 50 });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  const img = p.images?.[0]?.url;
  return {
    title: `${p.name} · Cissé Multi-Service`,
    description: p.description?.slice(0, 150) || `${p.name} chez Cissé Multi-Service`,
    openGraph: {
      title: `${p.name} - Cissé Multi-Service`,
      description: `${p.name} - Prix : ${new Intl.NumberFormat("fr-FR").format(p.price)} FCFA (Prix de livraison selon trajet)`,
      images: img ? [{ url: img, width: 800, height: 800, alt: p.name }] : [],
    },
  };
}

export default async function Produit({ params }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();

  const inStock = p.stock > 0;

  return (
    <div className="min-h-screen bg-paper dark:bg-indigo-deep pb-16 transition-colors duration-200">
      {/* ── Fil d'ariane ── */}
      <div className="wrap pt-4 sm:pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-indigo/60 dark:text-white/60 overflow-x-auto whitespace-nowrap" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-indigo-deep dark:hover:text-white transition-colors">Accueil</Link>
          <span>›</span>
          <Link href="/catalogue" className="hover:text-indigo-deep dark:hover:text-white transition-colors">Catalogue complet</Link>
          {p.category?.name && (
            <>
              <span>›</span>
              <Link
                href={`/catalogue?categorie=${p.category.slug}`}
                className="hover:text-indigo-deep dark:hover:text-white transition-colors font-medium text-indigo-deep dark:text-white"
              >
                {p.category.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* ── Fiche produit en 2 colonnes équilibrées ── */}
      <article className="wrap pt-2 grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-14 items-start">
        {/* Colonne Gauche : Galerie photo aux proportions équilibrées */}
        <ProductGallery
          images={p.images}
          name={p.name}
          inStock={inStock}
        />

        {/* Colonne Droite : Informations produit & Commande */}
        <div className="flex flex-col">
          {/* Catégorie */}
          {p.category?.name && (
            <Link
              href={`/catalogue?categorie=${p.category.slug}`}
              className="text-xs font-extrabold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors w-fit"
            >
              {p.category.name}
            </Link>
          )}

          {/* Titre */}
          <h1 className="mt-1 font-titre text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-indigo-deep dark:text-white">
            {p.name}
          </h1>

          {/* Description complète */}
          {p.description && (
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-indigo-deep/80 dark:text-white/80 whitespace-pre-line">
              {p.description}
            </p>
          )}

          {/* Alerte stock faible */}
          {inStock && p.stock <= 5 && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-400/30 rounded-full px-3 py-1 w-fit">
              <span>⚠️</span> Plus que {p.stock} en stock !
            </p>
          )}

          {/* ── Prix & Livraison ── */}
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141D3D] border border-indigo/10 dark:border-white/10 shadow-sm">
            <div>
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-indigo/50 dark:text-white/50 mb-0.5">
                Prix spécial
              </p>
              <p className="font-titre text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                {formatPrice(p.price)}
              </p>
            </div>

            {/* Badge livraison selon trajet */}
            <div className="flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 shadow-sm">
              <span className="text-base">🚚</span>
              <span>Prix de livraison selon trajet</span>
            </div>
          </div>

          {/* ── Sélecteur de quantité & Boutons WhatsApp ── */}
          <WhatsAppOrder
            name={p.name}
            price={p.price}
            stock={p.stock}
            slug={p.slug}
            image={p.images?.[0]?.url}
          />
        </div>
      </article>
    </div>
  );
}
