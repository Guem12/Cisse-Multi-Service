"use client";

import Image from "next/image";
import Link from "next/link";

const CARD_STYLES = [
  {
    wrapper: "absolute top-0 left-4 w-44 sm:w-52",
    anim: "hero-float-1",
    delay: "0s",
    defaultLabel: "Nouveauté",
    defaultColor: "bg-ocre text-indigo-deep",
  },
  {
    wrapper: "absolute top-6 right-0 w-36 sm:w-44",
    anim: "hero-float-2",
    delay: "0.6s",
    defaultLabel: "Populaire",
    defaultColor: "bg-emerald-400 text-white",
  },
  {
    wrapper: "absolute bottom-4 left-0 w-44 sm:w-52",
    anim: "hero-float-3",
    delay: "1.2s",
    defaultLabel: "En stock",
    defaultColor: "bg-sky-400 text-white",
  },
  {
    wrapper: "absolute bottom-0 right-3 w-40 sm:w-48",
    anim: "hero-float-1",
    delay: "1.8s",
    defaultLabel: "Promo",
    defaultColor: "bg-rose-400 text-white",
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR").format(price) + " F";
}

export default function HeroCollage({ items, products = [] }) {
  // Accepte soit items (avec { product, label, labelColor }), soit products brut
  const displayList =
    items && items.length > 0
      ? items.slice(0, 4)
      : products.slice(0, 4).map((p, i) => ({
          product: p,
          label: CARD_STYLES[i]?.defaultLabel,
          labelColor: CARD_STYLES[i]?.defaultColor,
        }));

  if (!displayList.length) return null;

  return (
    <>
      <style>{`
        @keyframes hero-float-1 {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-14px) rotate(-1deg); }
        }
        @keyframes hero-float-2 {
          0%, 100% { transform: translateY(0px) rotate(2.5deg); }
          50%       { transform: translateY(-18px) rotate(1.5deg); }
        }
        @keyframes hero-float-3 {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50%       { transform: translateY(-10px) rotate(-0.5deg); }
        }
        .hero-float-1 { animation: hero-float-1 5s ease-in-out infinite; }
        .hero-float-2 { animation: hero-float-2 6.5s ease-in-out infinite; }
        .hero-float-3 { animation: hero-float-3 4.5s ease-in-out infinite; }

        /* Carte claire : fond blanc/gris clair */
        .hero-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.6);
        }
        .hero-card-info { background: #FFFFFF; }
        .hero-card-name { color: #0E1530; }

        /* Carte sombre : fond noir nuit */
        html.dark .hero-card {
          background: rgba(6,12,30,0.85);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
        }
        html.dark .hero-card-info { background: #0D1428; }
        html.dark .hero-card-name { color: #F0F2FA; }
      `}</style>

      {/* Hauteur calculée : carte du dessus (haut) + carte du dessous (bas, agrandie) + marge,
          pour que la zone nom/prix des cartes du fond reste entièrement visible. */}
      <div className="relative hidden lg:block h-[570px] xl:h-[584px] w-full select-none">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full bg-ocre/20 blur-3xl" />
        </div>

        {displayList.map((entry, i) => {
          const s = CARD_STYLES[i] || CARD_STYLES[0];
          const product = entry.product || {};
          const label = entry.label || s.defaultLabel;
          const labelColor = entry.labelColor || s.defaultColor;
          const imgUrl = product.images?.[0]?.url;

          return (
            <Link
              key={`${i}-${product._id || "empty"}`}
              href={product.slug ? `/produit/${product.slug}` : "/catalogue"}
              className={s.wrapper + " " + s.anim + " group cursor-pointer block"}
              style={{ animationDelay: s.delay }}
            >
              <div className="hero-card rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <div className="relative aspect-square w-full overflow-hidden bg-slate-900/10">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={product.name || "Produit"}
                      fill
                      sizes="208px"
                      priority={i === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-white/30 text-4xl">★</span>
                    </div>
                  )}
                  <span
                    className={
                      "absolute top-2 left-2 text-[10px] font-black tracking-wide px-2.5 py-0.5 rounded-full shadow-md " +
                      labelColor
                    }
                  >
                    {label}
                  </span>
                </div>
                <div className="hero-card-info px-3 py-2.5">
                  <p className="hero-card-name text-xs font-semibold leading-tight line-clamp-1">
                    {product.name || "Produit vitrine"}
                  </p>
                  <p className="text-ocre text-sm font-extrabold mt-0.5">
                    {product.price ? formatPrice(product.price) : "Sur devis"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-ocre/60 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-white/40 animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
        </div>
      </div>
    </>
  );
}
