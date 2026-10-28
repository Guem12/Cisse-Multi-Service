"use client";
import { useState } from "react";
import { formatPhone, formatPrice } from "@/lib/format";
import { addToOrder } from "@/lib/cart";
import { sendWhatsAppProductOrder } from "@/lib/whatsapp";

export default function WhatsAppOrder({ name, price, stock, slug, image }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const envNumbers = [
    process.env.NEXT_PUBLIC_WHATSAPP_1,
    process.env.NEXT_PUBLIC_WHATSAPP_2,
  ].filter(Boolean);
  const numbers = envNumbers.length > 0 ? envNumbers : ["22362823995", "22373082453"];

  function handleAddToOrder() {
    addToOrder({ name, price, stock, slug, images: image ? [{ url: image }] : [] }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (stock <= 0) {
    return (
      <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-5 text-center">
        <p className="text-sm font-semibold text-red-600">
          😔 Ce produit est en rupture de stock pour le moment.
        </p>
        <p className="mt-1 text-xs text-red-400">Revenez bientôt ou contactez-nous sur WhatsApp.</p>
      </div>
    );
  }

  function order(number) {
    sendWhatsAppProductOrder({
      name,
      price,
      qty,
      slug,
      imageUrl: image,
      phone: number,
    });
  }

  return (
    <>
      {/* ── Sélecteur quantité ── */}
      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-indigo-deep/70 dark:text-white/70">Quantité</span>
        <div className="flex items-center gap-3 rounded-full bg-brume dark:bg-white/10 px-3 py-1.5">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="h-8 w-8 rounded-full bg-white dark:bg-[#151f42] shadow text-xl font-bold text-indigo-deep dark:text-white flex items-center justify-center hover:bg-indigo hover:text-white active:scale-90 transition-all"
          >
            −
          </button>
          <span
            className="w-8 text-center font-titre text-lg font-extrabold text-indigo-deep dark:text-white"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQty(Math.min(stock, qty + 1))}
            className="h-8 w-8 rounded-full bg-white dark:bg-[#151f42] shadow text-xl font-bold text-indigo-deep dark:text-white flex items-center justify-center hover:bg-indigo hover:text-white active:scale-90 transition-all"
          >
            +
          </button>
        </div>
        <span className="ml-auto font-titre font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">
          {formatPrice(price * qty)}
        </span>
      </div>

      {/* ── Boutons de commande ── */}
      <div className="mt-6 border-t border-indigo/10 dark:border-white/10 pt-4">

        {/* Bouton principal Commander */}
        <button
          type="button"
          onClick={() => order(numbers[0])}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition-all duration-200"
        >
          {/* Icône WhatsApp */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          Commander sur WhatsApp
        </button>

        {/* Bouton Ajouter à ma commande */}
        <button
          type="button"
          onClick={handleAddToOrder}
          className={`mt-2 w-full flex items-center justify-center gap-2 rounded-2xl border-2 py-3.5 px-5 text-sm font-extrabold transition-all duration-200 active:scale-[0.98] ${
            added
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-inner"
              : "bg-gray-50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border-indigo/20 dark:border-white/20 text-indigo-deep dark:text-white shadow-sm"
          }`}
        >
          {added ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-emerald-600 dark:text-emerald-400">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <span>Ajouté à votre commande !</span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold leading-none">+</span>
              <span>Ajouter à ma commande</span>
            </>
          )}
        </button>

        {/* 2ème numéro si disponible */}
        {numbers[1] && (
          <button
            type="button"
            onClick={() => order(numbers[1])}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-white dark:bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-[0.98] px-5 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Contacter {formatPhone(numbers[1])}
          </button>
        )}

        {/* Note livraison */}
        <p className="mt-3 text-center text-xs text-indigo/50 dark:text-white/50 leading-relaxed">
          🚚 Prix de livraison selon trajet. Contactez-nous pour un devis.
        </p>
      </div>
    </>
  );
}
