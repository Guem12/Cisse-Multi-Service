import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

function getItems(value) {
  try {
    const items = JSON.parse(value || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      try {
        const response = await fetch("/api/admin/orders", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Impossible de charger les commandes.");
        setOrders(result.orders);
      } catch (loadError) {
        if (loadError.name !== "AbortError") setError(loadError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadOrders();
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-4">
      <p className="text-sm text-indigo/70 dark:text-white/70">Les 100 commandes WhatsApp les plus récentes.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {loading && <p className="rounded-2xl bg-white p-6 text-sm text-indigo/70 shadow-sm dark:bg-[#111a35] dark:text-white/70">Chargement des commandes…</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-sm text-indigo/70 shadow-sm dark:bg-[#111a35] dark:text-white/70">Aucune commande enregistrée pour le moment.</p>
      )}
      {!loading && orders.map((order) => {
        const items = getItems(order.items);
        const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        return (
          <article key={order.id} className="rounded-2xl border border-indigo/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a35]">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-indigo/10 pb-3 dark:border-white/10">
              <div>
                <h2 className="font-bold text-indigo-deep dark:text-white">Commande {order.id.slice(-8).toUpperCase()}</h2>
                <p className="mt-1 text-xs text-indigo/65 dark:text-white/65">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}
                </p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400">{formatPrice(order.total)}</p>
                <p className="text-xs text-indigo/65 dark:text-white/65">{count} article{count === 1 ? "" : "s"} · En attente WhatsApp</p>
              </div>
            </header>
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li key={`${item.slug}-${index}`} className="flex flex-wrap justify-between gap-x-4 text-sm text-indigo-deep dark:text-white">
                  <span>{item.name}{Object.entries(item.variant || {}).map(([name, value]) => ` · ${name} : ${value}`).join("")} × {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            {(order.deliveryAddress || order.paymentMethod) && (
              <p className="mt-3 border-t border-indigo/10 pt-3 text-xs text-indigo/70 dark:border-white/10 dark:text-white/70">
                {order.deliveryAddress && <>Adresse : {order.deliveryAddress}</>}
                {order.deliveryAddress && order.paymentMethod && " · "}
                {order.paymentMethod && <>Paiement : {order.paymentMethod}</>}
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}
