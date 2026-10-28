"use client";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function DashboardStats({ products = [], categories = [], heroSlots = [] }) {
  // Calculs statistiques
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const avgPrice = totalProducts > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalProducts) : 0;

  // Répartition par catégorie
  const categoryStats = categories.map((cat) => {
    const catProducts = products.filter(
      (p) => p.category?.slug === cat.slug || p.category?._id === cat._id || p.category === cat._id
    );
    const count = catProducts.length;
    const stock = catProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
    const value = catProducts.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
    const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
    return { ...cat, count, stock, value, pct };
  }).sort((a, b) => b.count - a.count);

  // Les 4 produits de la vitrine
  const heroItems = heroSlots.map((slot, i) => {
    const product = products.find((p) => String(p._id) === String(slot.productId)) || products[i];
    return { ...slot, product };
  });

  return (
    <div className="space-y-8">
      {/* En-tête de bienvenue & Actions rapides */}
      <div
        className="rounded-2xl p-6 sm:p-8 border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-emerald-500/10 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Tableau de bord en direct
          </div>
          <h1 className="font-titre text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
            Statistiques & Pilotage · Cissé Multi-Service
          </h1>
          <p className="text-sm mt-1 max-w-xl" style={{ color: "var(--text-muted)" }}>
            Visualisez les performances de votre catalogue, la valeur marchande de votre stock et personnalisez la vitrine de votre boutique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/vitrine"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm text-indigo-deep shadow transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#E0A030" }}
          >
            <span>★</span> Gérer la Vitrine (Hero)
          </Link>

          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
          >
            <span>+</span> Nouveau produit
          </Link>
        </div>
      </div>

      {/* Cartes KPI clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Valeur totale du stock */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between transition-transform hover:-translate-y-1 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Valeur du stock
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-titre text-2xl font-black text-emerald-500">
              {formatPrice(totalStockValue)}
            </span>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
              {totalStockUnits} unités en inventaire
            </p>
          </div>
        </div>

        {/* KPI 2 : Total Références */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between transition-transform hover:-translate-y-1 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Catalogue Produits
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-titre text-2xl font-black" style={{ color: "var(--text-main)" }}>
              {totalProducts} articles
            </span>
            <p className="text-xs mt-1 text-emerald-500 font-semibold">
              {activeProducts} en ligne sur le site ({totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}%)
            </p>
          </div>
        </div>

        {/* KPI 3 : Prix moyen */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between transition-transform hover:-translate-y-1 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Prix moyen article
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-titre text-2xl font-black text-ocre">
              {formatPrice(avgPrice)}
            </span>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
              Sur {categories.length} catégories
            </p>
          </div>
        </div>

        {/* KPI 4 : Alertes stock */}
        <div
          className="rounded-2xl p-5 border flex flex-col justify-between transition-transform hover:-translate-y-1 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Alertes stock
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className={`font-titre text-2xl font-black ${outOfStock.length > 0 ? "text-rose-500" : "text-amber-500"}`}>
              {outOfStock.length + lowStock.length} alertes
            </span>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {outOfStock.length} rupture(s) · {lowStock.length} stock(s) faible(s)
            </p>
          </div>
        </div>
      </div>

      {/* SECTION VITRINE D'ACCUEIL (LA PHOTO DU CLIENT !) */}
      <div
        className="rounded-2xl p-6 sm:p-8 border space-y-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-ocre text-lg">★</span>
              <h2 className="font-titre text-xl font-extrabold" style={{ color: "var(--text-main)" }}>
                Vitrine d'accueil en direct (Hero Collage)
              </h2>
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Ces 4 produits s'affichent directement sur les cartes flottantes de votre page d'accueil avec leurs badges personnalisés.
            </p>
          </div>

          <Link
            href="/admin/vitrine"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-deep bg-ocre shadow hover:scale-105 transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier les 4 cartes vitrine
          </Link>
        </div>

        {/* Les 4 cartes affichées en miniature */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {heroItems.map((item, idx) => {
            const product = item.product;
            const imgUrl = product?.images?.[0]?.url;

            return (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border shadow-sm flex flex-col group transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <div className="relative aspect-square w-full bg-slate-900/10 overflow-hidden">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={product?.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/40">
                      Pas de photo
                    </div>
                  )}

                  <span className={`absolute top-2 left-2 text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full shadow ${item.labelColor}`}>
                    {item.label}
                  </span>

                  <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
                    Carte #{idx + 1}
                  </span>
                </div>

                <div className="p-3">
                  <p className="text-xs font-bold truncate" style={{ color: "var(--text-main)" }}>
                    {product?.name || "Article"}
                  </p>
                  <p className="text-ocre font-black text-xs mt-1">
                    {product?.price ? formatPrice(product.price) : "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid deux colonnes : Répartition par Catégorie & Alertes Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Répartition par catégorie */}
        <div
          className="rounded-2xl p-6 border space-y-5"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-titre text-lg font-bold" style={{ color: "var(--text-main)" }}>
              Répartition par Catégorie
            </h2>
            <Link href="/admin/categories" className="text-xs font-bold text-ocre hover:underline">
              Gérer ({categories.length})
            </Link>
          </div>

          <div className="space-y-4">
            {categoryStats.map((c) => (
              <div key={c._id || c.slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: "var(--text-main)" }}>{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "var(--text-muted)" }}>{c.count} produit(s) ({c.stock} pcs)</span>
                    <span className="font-bold text-ocre">{formatPrice(c.value)}</span>
                  </div>
                </div>

                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-subtle)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#6366f1] via-[#E0A030] to-[#10b981]"
                    style={{ width: `${Math.max(c.pct, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne 2 : Surveillance & Alertes de Stock */}
        <div
          className="rounded-2xl p-6 border space-y-5"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-titre text-lg font-bold" style={{ color: "var(--text-main)" }}>
              Surveillance des Stocks
            </h2>
            <Link href="/admin/produits" className="text-xs font-bold text-ocre hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>

          {outOfStock.length === 0 && lowStock.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-bold text-emerald-500">Tous les stocks sont au vert !</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Aucune rupture ni stock faible détecté pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {[...outOfStock, ...lowStock].map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 rounded-xl border text-xs"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        p.stock <= 0 ? "bg-red-500 animate-ping" : "bg-amber-500"
                      }`}
                    />
                    <div className="truncate">
                      <p className="font-bold truncate" style={{ color: "var(--text-main)" }}>
                        {p.name}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {p.category?.name || "Catégorie"} · {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        p.stock <= 0 ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {p.stock <= 0 ? "Rupture (0)" : `${p.stock} restant(s)`}
                    </span>

                    <Link
                      href={`/admin/produits/${p._id}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-ocre text-indigo-deep hover:opacity-90"
                    >
                      Réapprovisionner
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
