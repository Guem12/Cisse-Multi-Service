import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroCollage from "@/components/HeroCollage";
import { getCategories, getProducts } from "@/lib/data";
import { getHeroItems } from "@/lib/hero";

// Revalidation ISR automatique toutes les 60 secondes (chargement instantané en cache statique)
export const revalidate = 60;

const STEPS = [
  ["Choisissez", "Parcourez le catalogue et ouvrez la fiche du produit qui vous plaît."],
  ["Envoyez sur WhatsApp", "Le bouton prépare le message avec le produit, la quantité et le total."],
  ["Recevez", "Nous vous répondons pour confirmer la commande et organiser la remise."],
];

export default async function Home() {
  const __t0 = Date.now();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: 24 }),
  ]);
  const heroItems = await getHeroItems(products);
  console.log("[PERF accueil] données:", Date.now() - __t0, "ms");
  const cover = {};
  for (const p of products) {
    const s = p.category?.slug;
    if (s && !cover[s] && p.images?.[0]?.url) cover[s] = p.images[0].url;
  }

  return (
    <>
      <section className="motif-tissu text-white overflow-hidden overlay-dark">
        <div className="wrap py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: text */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-3 rounded-2xl sm:rounded-full bg-white/10 px-4 py-2.5 backdrop-blur mb-6 border border-white/20 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-blanc.svg" alt="Cissé Multi-Service" width="28" height="28" className="h-7 w-7 rounded-md shadow shrink-0" />
              <div className="leading-tight text-left">
                <span className="block text-xs sm:text-sm font-extrabold tracking-wider uppercase text-ocre">
                  Cissé Multi-Service
                </span>
                <span className="block text-[11px] sm:text-xs text-white/90 font-medium tracking-wide">
                  Boutique en ligne
                </span>
              </div>
            </div>
            <h1 className="font-titre text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Sacs, montres,{" "}
              <span className="text-ocre">écouteurs</span>{" "}
              et accessoires.
            </h1>
            <p className="mt-5 max-w-md text-base sm:text-lg text-white/85">
              Choisissez vos articles, puis commandez directement sur WhatsApp — livraison selon votre trajet.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/catalogue" className="rounded-full bg-ocre px-7 py-3.5 font-bold text-indigo-deep shadow-lg transition-transform hover:scale-105 active:scale-95">
                Voir le catalogue
              </Link>
              <a href="https://wa.me/22362823995" target="_blank" rel="noopener"
                className="rounded-full border-2 border-white/40 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 active:scale-95">
                Commander par WhatsApp
              </a>
            </div>

            {/* Stats bar */}
            <div className="mt-10 flex gap-8">
              <div>
                <span className="block text-2xl font-extrabold text-ocre">100+</span>
                <span className="text-xs text-white/70 uppercase tracking-wider">Produits</span>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-extrabold text-ocre">WhatsApp</span>
                <span className="text-xs text-white/70 uppercase tracking-wider">Commande rapide</span>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <span className="block text-2xl font-extrabold text-ocre">24h</span>
                <span className="text-xs text-white/70 uppercase tracking-wider">Réponse</span>
              </div>
            </div>
          </div>

          {/* Right: floating product collage */}
          <HeroCollage items={heroItems} />
        </div>
      </section>

      <div className="wrap pb-16">
        <section className="mt-10">
          <h2 className="font-titre text-2xl font-bold text-page-main">Catégories</h2>
          <ul className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {categories.map((c) => (
              <li key={c._id} className="shrink-0">
                <Link href={`/catalogue?categorie=${c.slug}`}
                  className="motif-tissu relative block h-48 w-40 overflow-hidden rounded-lg">
                  {cover[c.slug] && (
                    <Image src={cover[c.slug]} alt="" fill sizes="160px" className="object-cover" />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-indigo-deep/85 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 font-titre text-lg font-bold leading-tight text-white">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-titre text-2xl font-bold text-page-main">Nouveautés</h2>
            <Link href="/catalogue" className="font-medium text-indigo dark:text-ocre underline hover:text-ocre">Tout le catalogue</Link>
          </div>
          {products.length === 0 ? (
            <p className="mt-4 text-page-muted">Aucun produit pour le moment.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        <section className="mt-16 border-t divider pt-10">
                <h2 className="font-titre text-2xl font-bold text-page-main">Comment commander</h2>
              <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="font-titre text-5xl font-extrabold text-brule dark:text-ocre">{i + 1}</span>
                <h3 className="mt-1 text-lg font-bold text-page-main">{title}</h3>
                <p className="mt-1 max-w-xs text-page-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
