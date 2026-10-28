"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getOrderItems,
  removeFromOrder,
  updateOrderQty,
  clearOrder,
  getOrderWhatsAppUrl,
} from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function OrderDrawer({ isOpen, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getOrderItems());

    const handleUpdate = () => setItems(getOrderItems());
    window.addEventListener("cisse_order_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cisse_order_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const total = items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  const totalCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside className="relative z-10 flex w-full max-w-md flex-col bg-white dark:bg-[#0E1530] text-indigo-deep dark:text-white shadow-2xl h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo/10 dark:border-white/10 px-5 py-4 bg-indigo-deep text-white">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-ocre">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            <h2 className="font-titre text-lg font-bold">Ma Commande</h2>
            {totalCount > 0 && (
              <span className="rounded-full bg-ocre px-2 py-0.5 text-xs font-extrabold text-indigo-deep">
                {totalCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-indigo/60 dark:text-white/60">
              <span className="text-5xl mb-3">🛍️</span>
              <p className="font-bold text-indigo-deep dark:text-white">Votre commande est vide</p>
              <p className="mt-1 text-xs text-indigo/60 dark:text-white/60 max-w-xs">
                Parcourez le catalogue et cliquez sur « Ajouter à ma commande » pour regrouper vos articles.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-full bg-indigo dark:bg-ocre px-5 py-2 text-xs font-bold text-white dark:text-indigo-deep hover:bg-indigo-deep transition"
              >
                Explorer le catalogue
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-indigo/10 dark:divide-white/10">
              {items.map((it) => (
                <li key={it.slug} className="py-4 flex gap-3 items-center">
                  {it.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brume dark:bg-indigo-deep">
                      <Image src={it.image} alt={it.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-brume dark:bg-indigo-deep flex items-center justify-center text-[10px] text-indigo/50 dark:text-white/50">
                      Photo
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produit/${it.slug}`}
                      onClick={onClose}
                      className="font-bold text-sm text-indigo-deep dark:text-white hover:text-ocre dark:hover:text-ocre transition truncate block"
                    >
                      {it.name}
                    </Link>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatPrice(it.price)}
                    </p>

                    {/* Quantité boutons */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-indigo/20 dark:border-white/20 bg-gray-50 dark:bg-white/10">
                        <button
                          type="button"
                          onClick={() => updateOrderQty(it.slug, it.quantity - 1)}
                          className="h-6 w-6 flex items-center justify-center text-sm font-bold text-indigo-deep dark:text-white hover:bg-indigo/10 dark:hover:bg-white/10 rounded-l"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-indigo-deep dark:text-white">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateOrderQty(it.slug, it.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center text-sm font-bold text-indigo-deep dark:text-white hover:bg-indigo/10 dark:hover:bg-white/10 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromOrder(it.slug)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline ml-2"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-indigo/10 dark:border-white/10 p-5 bg-gray-50 dark:bg-[#141D3D]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-semibold text-indigo/70 dark:text-white/70">Total articles</span>
              <span className="font-titre text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatPrice(total)}
              </span>
            </div>

            <p className="text-[11px] text-indigo/60 dark:text-white/60 mb-4">
              🚚 Prix de livraison selon trajet.
            </p>

            <a
              href={getOrderWhatsAppUrl(items)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Commander tout sur WhatsApp
            </a>

            <button
              type="button"
              onClick={clearOrder}
              className="mt-2 w-full text-center text-xs text-indigo/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 py-1"
            >
              Vider la commande
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
