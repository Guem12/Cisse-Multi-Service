import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getOrderItems } from "@/lib/cart";

export default function CatalogOrderBar({ phone = "22362823995" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const updateItems = () => setItems(getOrderItems());
    updateItems();
    window.addEventListener("cisse_order_updated", updateItems);
    window.addEventListener("storage", updateItems);
    return () => {
      window.removeEventListener("cisse_order_updated", updateItems);
      window.removeEventListener("storage", updateItems);
    };
  }, []);

  const count = items.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
  if (count === 0) return null;

  const total = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );
  function continueOrder() {
    window.dispatchEvent(new CustomEvent("cisse_open_order", { detail: { phone } }));
  }

  return (
    <>
      <div className="h-24 lg:h-20" aria-hidden="true" />
      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-indigo/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(4,10,26,0.15)] backdrop-blur dark:border-white/10 dark:bg-[#0E1530]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 lg:pr-20">
          <div className="min-w-0">
            <p aria-live="polite" className="text-xs font-semibold text-indigo-deep dark:text-white truncate sm:text-sm">
              Ma commande ({count} {count === 1 ? "article" : "articles"})
            </p>
            <p className="font-titre text-base font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-lg">
              {formatPrice(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={continueOrder}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-700 active:scale-95 sm:text-sm"
          >
            Finaliser ma commande
          </button>
        </div>
      </aside>
    </>
  );
}
