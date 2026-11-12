import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getOrderItems, getOrderWhatsAppUrl } from "@/lib/cart";

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
  const whatsappUrl = getOrderWhatsAppUrl(items, phone);

  return (
    <>
      <div className="h-28 lg:h-20" aria-hidden="true" />
      <aside className="fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-30 border-t border-indigo/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(4,10,26,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#0E1530]/95 lg:bottom-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:pr-20">
          <p aria-live="polite" className="text-sm font-semibold text-indigo-deep dark:text-white">
            Ma commande ({count} article{count === 1 ? "" : "s"}) <span aria-hidden="true">·</span> Total {formatPrice(total)}
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Envoyer sur WhatsApp
          </a>
        </div>
      </aside>
    </>
  );
}
