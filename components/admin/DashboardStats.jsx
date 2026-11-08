import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";

function Sparkline({ values, positive = true }) {
  if (values.length < 2) {
    return <span className="text-[11px] admin-text-muted">Historique en cours</span>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 27 - ((value - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-8 w-24" viewBox="0 0 100 30" role="img" aria-label="Tendance sur les derniers relevés">
      <polyline
        fill="none"
        stroke={positive ? "#15803d" : "#b91c1c"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function Trend({ metric, current, history, inverse = false }) {
  const today = history.at(-1)?.date;
  if (!today) return <span className="text-[11px] admin-text-muted">Tendance indisponible</span>;
  const valueFor = (snapshot) =>
    metric === "stockAlerts"
      ? Number(snapshot.lowStock || 0) + Number(snapshot.outOfStock || 0)
      : Number(snapshot[metric]);

  const boundary = new Date(`${today}T00:00:00Z`);
  boundary.setUTCDate(boundary.getUTCDate() - 7);
  const earliest = new Date(`${today}T00:00:00Z`);
  earliest.setUTCDate(earliest.getUTCDate() - 14);
  const previous = [...history]
    .reverse()
    .find((snapshot) => {
      const date = new Date(`${snapshot.date}T00:00:00Z`);
      return date <= boundary && date >= earliest && Number.isFinite(valueFor(snapshot));
    });
  const values = history.slice(-7).map(valueFor);

  if (!previous) {
    return (
      <div className="flex items-center gap-2">
        <Sparkline values={values} />
        <span className="text-[11px] admin-text-muted">Comparaison après 7 jours</span>
      </div>
    );
  }

  const previousValue = valueFor(previous);
  const change = current - previousValue;
  const percent = previousValue === 0
    ? null
    : Math.round((change / Math.abs(previousValue) * 100) * 10) / 10;
  const favorable = inverse ? change <= 0 : change >= 0;
  const text = percent === null
    ? (change === 0 ? "Stable" : change > 0 ? "Nouveau" : "−")
    : `${change > 0 ? "+" : ""}${percent}%`;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold ${favorable ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
        {text}
      </span>
      <Sparkline values={values} positive={favorable} />
      <span className="text-[11px] admin-text-muted">sur 7 jours</span>
    </div>
  );
}

function downloadCsv(products) {
  const quote = (value) => {
    let text = String(value ?? "");
    if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    ["Produit", "Catégorie", "Prix (FCFA)", "Stock", "Statut"],
    ...products.map((product) => [
      product.name,
      product.category?.name || "Non catégorisé",
      product.price,
      product.stock,
      product.active ? "En ligne" : "Masqué",
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(quote).join(";")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cisse-multi-service-catalogue.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardStats({
  products = [],
  categories = [],
  heroSlots = [],
  history = [],
}) {
  const [currentProducts, setCurrentProducts] = useState(products);
  const [updating, setUpdating] = useState({});
  const [stockError, setStockError] = useState("");

  const activeProducts = currentProducts.filter((product) => product.active);
  const outOfStock = currentProducts.filter((product) => product.stock <= 0);
  const lowStock = currentProducts.filter((product) => product.stock > 0 && product.stock <= 5);
  const stockAlerts = [...outOfStock, ...lowStock];
  const totalStockUnits = currentProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const totalStockValue = currentProducts.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
    0,
  );
  const averagePrice = currentProducts.length
    ? currentProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) / currentProducts.length
    : 0;
  const categoryStats = categories
    .map((category) => {
      const categoryProducts = currentProducts.filter(
        (product) =>
          product.category?.slug === category.slug ||
          product.category?._id === category._id ||
          product.categoryId === category._id ||
          product.category === category._id,
      );
      return {
        ...category,
        count: categoryProducts.length,
        stock: categoryProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0),
        value: categoryProducts.reduce(
          (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
          0,
        ),
      };
    })
    .sort((left, right) => right.count - left.count || String(left.name).localeCompare(String(right.name), "fr"));

  const showcaseItems = useMemo(() => {
    const activeById = new Map(activeProducts.map((product) => [String(product._id), product]));
    const usedIds = new Set();
    return heroSlots.flatMap((slot) => {
      const id = String(slot.productId || "");
      const product = activeById.get(id);
      if (!product || usedIds.has(id)) return [];
      usedIds.add(id);
      return [{ ...slot, product }];
    });
  }, [activeProducts, heroSlots]);

  const recentChanges = [...currentProducts]
    .filter((product) => product.updatedAt || product.createdAt)
    .sort(
      (left, right) =>
        new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt),
    )
    .slice(0, 5);

  async function adjustStock(product, amount) {
    const nextStock = Math.max(0, Number(product.stock || 0) + amount);
    if (nextStock === Number(product.stock || 0)) return;

    setStockError("");
    setUpdating((state) => ({ ...state, [product._id]: true }));
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "La mise à jour du stock a échoué.");
      setCurrentProducts((items) =>
        items.map((item) =>
          item._id === product._id
            ? { ...item, stock: result.product.stock, updatedAt: result.product.updatedAt }
            : item,
        ),
      );
    } catch (error) {
      setStockError(error.message);
    } finally {
      setUpdating((state) => ({ ...state, [product._id]: false }));
    }
  }

  const stockCards = [
    {
      label: "Valeur du stock",
      value: formatPrice(totalStockValue),
      detail: `${totalStockUnits.toLocaleString("fr-FR")} unités en inventaire`,
      metric: "stockValue",
      trendValue: totalStockValue,
      href: "/admin/produits",
      color: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Catalogue",
      value: `${currentProducts.length} produits`,
      detail: `${activeProducts.length} en vente sur la boutique`,
      metric: "products",
      trendValue: activeProducts.length,
      href: "/admin/produits",
      color: "text-page-main",
    },
    {
      label: "Prix moyen",
      value: formatPrice(averagePrice),
      detail: `${categories.length} catégories`,
      metric: "averagePrice",
      trendValue: averagePrice,
      href: "/admin/produits",
      color: "text-ocre",
    },
    {
      label: "Alertes stock",
      value: `${stockAlerts.length} alertes`,
      detail: `${outOfStock.length} rupture(s) · ${lowStock.length} stock(s) faible(s)`,
      metric: "stockAlerts",
      trendValue: stockAlerts.length,
      href: "#stock-alerts",
      color: outOfStock.length
        ? "text-red-700 dark:text-red-400"
        : lowStock.length
          ? "text-[color:var(--alert-low-text)]"
          : "text-emerald-700 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border p-5 sm:p-7"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Boutique en ligne · Espace de gestion
            </p>
            <h1 className="font-titre text-2xl font-extrabold leading-tight text-page-main sm:text-3xl">
              Vue d’ensemble
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-page-muted">
              Gérez votre catalogue, vos stocks et les produits mis en avant sur la page d’accueil de votre boutique.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <a href="/admin/vitrine" className="admin-action-primary">Page d’accueil</a>
            <a href="/admin/produits/nouveau" className="admin-action-secondary">+ Ajouter un produit</a>
            <button type="button" onClick={() => downloadCsv(currentProducts)} className="admin-action-secondary">
              Export Excel (.csv)
            </button>
            <button type="button" onClick={() => window.print()} className="admin-action-secondary">
              Exporter en PDF
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Statistiques du catalogue" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stockCards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-page-muted">{card.label}</span>
              <span className="text-ocre transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span>
            </div>
            <p className={`mt-4 truncate font-titre text-2xl font-black ${card.color}`} title={card.value}>
              {card.value}
            </p>
            <p className="mt-1 text-xs text-page-muted">{card.detail}</p>
            {card.metric && (
              <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <Trend
                  metric={card.metric}
                  current={card.trendValue}
                  history={history}
                  inverse={card.metric === "lowStock" || card.metric === "outOfStock" || card.metric === "stockAlerts"}
                />
              </div>
            )}
          </a>
        ))}
      </section>

      <section
        className="rounded-2xl border p-5 sm:p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-titre text-lg font-bold text-page-main">Produits mis en avant</h2>
            <p className="mt-1 text-sm text-page-muted">
              {showcaseItems.length} produit{showcaseItems.length !== 1 ? "s" : ""} actif{showcaseItems.length !== 1 ? "s" : ""} mis en avant sur {activeProducts.length} produit{activeProducts.length !== 1 ? "s" : ""} en ligne.
            </p>
            {showcaseItems.length !== heroSlots.length && (
              <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300" role="status">
                Certains emplacements ne correspondent plus à un produit actif du catalogue.
              </p>
            )}
          </div>
          <a href="/admin/vitrine" className="admin-action-primary no-print">Gérer la page d’accueil</a>
        </div>

        {showcaseItems.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed p-6 text-center text-sm text-page-muted" style={{ borderColor: "var(--border)" }}>
            Aucun produit actif n’est actuellement mis en avant.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {showcaseItems.map((item) => {
              const imageUrl = item.product.images?.[item.imageIndex || 0]?.url;
              return (
                <article key={`${item.slot}-${item.product._id}`} className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                  <div className="relative aspect-square bg-subtle">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs font-semibold text-page-muted">Pas de photo</div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-indigo-deep/90 px-2 py-1 text-[10px] font-bold text-white">
                      {item.label || `Emplacement ${Number(item.slot) + 1}`}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-bold text-page-main">{item.product.name}</p>
                    <p className="mt-1 text-xs font-bold text-ocre">{formatPrice(item.product.price)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div
          className="rounded-2xl border p-5 sm:p-6"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-titre text-lg font-bold text-page-main">Répartition par catégorie</h2>
              <p className="mt-1 text-xs text-page-muted">{categories.length} catégorie{categories.length !== 1 ? "s" : ""}</p>
            </div>
            <a href="/admin/categories" className="text-sm font-bold text-ocre hover:underline">Gérer</a>
          </div>
          {categoryStats.length === 0 ? (
            <p className="rounded-xl bg-subtle p-5 text-center text-sm text-page-muted">Aucune catégorie n’a encore été créée.</p>
          ) : (
            <ul className="space-y-4">
              {categoryStats.map((category) => {
                const percent = currentProducts.length ? Math.round(category.count / currentProducts.length * 100) : 0;
                return (
                  <li key={category._id || category.slug}>
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-semibold text-page-main">{category.name}</span>
                      <span className="text-right text-xs text-page-muted">
                        {category.count
                          ? `${category.count} produit${category.count !== 1 ? "s" : ""} · ${category.stock} unité${category.stock !== 1 ? "s" : ""}`
                          : "Aucun produit"}
                      </span>
                    </div>
                    {category.count > 0 && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle">
                        <div className="h-full rounded-full bg-ocre" style={{ width: `${Math.max(percent, 3)}%` }} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          id="stock-alerts"
          className="scroll-mt-24 rounded-2xl border p-5 sm:p-6"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-titre text-lg font-bold text-page-main">À réapprovisionner</h2>
              <p className="mt-1 text-xs text-page-muted">{stockAlerts.length} produit{stockAlerts.length !== 1 ? "s" : ""} à surveiller</p>
            </div>
            <a href="/admin/produits?stock=alertes" className="text-sm font-bold text-ocre hover:underline">Catalogue</a>
          </div>
          {stockError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">{stockError}</p>}
          {stockAlerts.length === 0 ? (
            <p className="rounded-xl bg-subtle p-6 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Aucun stock faible ou en rupture.
            </p>
          ) : (
            <ul className="max-h-[380px] space-y-3 overflow-y-auto">
              {stockAlerts.map((product) => (
                <li
                  key={product._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}
                >
                  <div className="min-w-0">
                    <a href={`/admin/produits/${encodeURIComponent(product._id)}`} className="block truncate text-sm font-bold text-page-main hover:text-ocre">
                      {product.name}
                    </a>
                    <p className="mt-1 text-xs text-page-muted">{product.category?.name || "Sans catégorie"} · {formatPrice(product.price)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.stock <= 0 ? "admin-alert-out" : "admin-alert-low"}`}>
                      {product.stock <= 0 ? "Rupture de stock" : `Stock faible · ${product.stock} restant${product.stock !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" aria-label={`Modifier le stock de ${product.name}`}>
                    <button
                      type="button"
                      onClick={() => adjustStock(product, -1)}
                      disabled={Boolean(updating[product._id]) || product.stock <= 0}
                      className="admin-stock-button"
                      aria-label={`Retirer une unité de ${product.name}`}
                    >−</button>
                    <span className="min-w-8 text-center text-sm font-bold text-page-main" aria-live="polite">{product.stock}</span>
                    <button
                      type="button"
                      onClick={() => adjustStock(product, 1)}
                      disabled={Boolean(updating[product._id])}
                      className="admin-stock-button"
                      aria-label={`Ajouter une unité à ${product.name}`}
                    >+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className="rounded-2xl border p-5 sm:p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-titre text-lg font-bold text-page-main">Dernières modifications</h2>
            <p className="mt-1 text-xs text-page-muted">Produits créés ou modifiés récemment</p>
          </div>
          <a href="/admin/produits" className="text-sm font-bold text-ocre hover:underline">Voir le catalogue</a>
        </div>
        {recentChanges.length === 0 ? (
          <p className="rounded-xl bg-subtle p-5 text-center text-sm text-page-muted">Aucune modification récente à afficher.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentChanges.map((product) => {
              const changedAt = product.updatedAt || product.createdAt;
              const date = new Date(changedAt);
              if (!Number.isFinite(date.getTime())) return null;
              return (
                <li key={product._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <a href={`/admin/produits/${encodeURIComponent(product._id)}`} className="font-semibold text-page-main hover:text-ocre">
                    {product.name}
                  </a>
                  <time className="text-xs text-page-muted" dateTime={date.toISOString()}>
                    {date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap gap-3 no-print" aria-label="Actions rapides">
        <a href="/admin/produits/nouveau" className="admin-action-primary">+ Nouveau produit</a>
        <a href="/admin/categories" className="admin-action-secondary">Gérer les catégories</a>
        <a href="/admin/clients" className="admin-action-secondary">Consulter les clients</a>
        <a href="/admin/vitrine" className="admin-action-secondary">Produits mis en avant</a>
        <button type="button" onClick={() => downloadCsv(currentProducts)} className="admin-action-secondary">Exporter le catalogue</button>
      </section>
    </div>
  );
}
