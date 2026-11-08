import { useState } from "react";
import { formatPhone, formatPrice } from "@/lib/format";
import { addToOrder } from "@/lib/cart";

export default function WhatsAppOrder({ name, price, stock, slug, image, variants = [] }) {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");

  const envNumbers = [
    import.meta.env.PUBLIC_WHATSAPP_1,
    import.meta.env.PUBLIC_WHATSAPP_2,
  ].filter(Boolean);
  const numbers = envNumbers.length > 0 ? envNumbers : ["22362823995", "22373082453"];
  const needsSelection = variants.some((variant) => variant.options?.length && !selected[variant.name]);

  function addProduct(number, openDrawer) {
    if (needsSelection) {
      setMessage("Choisissez une option avant de continuer.");
      return;
    }
    const added = addToOrder(
      { name, price, stock, slug, images: image ? [{ url: image }] : [] },
      qty,
      selected,
    );
    if (!added) {
      setMessage("Impossible d'ajouter cet article. Vérifiez le stock disponible.");
      return;
    }
    setMessage(openDrawer ? "" : "Ajouté à votre commande.");
    if (openDrawer) {
      window.dispatchEvent(new CustomEvent("cisse_open_order", { detail: { phone: number } }));
    }
  }

  if (stock <= 0) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
        <p className="text-sm font-semibold text-red-700">Ce produit est en rupture de stock.</p>
        <p className="mt-1 text-xs text-red-700">Contactez-nous pour connaître la date de réapprovisionnement.</p>
      </div>
    );
  }

  return (
    <>
      {variants.map((variant) => (
        variant.options?.length > 0 && (
          <label key={variant.name} className="mt-4 block text-sm font-semibold text-indigo-deep dark:text-white">
            {variant.name}
            <select
              value={selected[variant.name] || ""}
              onChange={(event) => setSelected((current) => ({ ...current, [variant.name]: event.target.value }))}
              className="field mt-1"
              required
            >
              <option value="">Choisir {variant.name.toLowerCase()}</option>
              {variant.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        )
      ))}

      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-indigo-deep/80 dark:text-white/80">Quantité</span>
        <div className="flex items-center gap-3 rounded-full bg-brume px-3 py-1.5 dark:bg-white/10">
          <button type="button" aria-label="Diminuer la quantité" onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-bold text-indigo-deep shadow dark:bg-[#151f42] dark:text-white">−</button>
          <span className="w-8 text-center font-titre text-lg font-extrabold text-indigo-deep dark:text-white" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Augmenter la quantité" onClick={() => setQty(Math.min(stock, qty + 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-bold text-indigo-deep shadow dark:bg-[#151f42] dark:text-white">+</button>
        </div>
        <span className="ml-auto font-titre text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{formatPrice(price * qty)}</span>
      </div>

      <div className="mt-6 border-t border-indigo/10 pt-4 dark:border-white/10">
        <button type="button" onClick={() => addProduct(numbers[0], true)} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:bg-emerald-700">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          Commander sur WhatsApp
        </button>
        <button type="button" onClick={() => addProduct(numbers[0], false)} className="mt-2 w-full rounded-2xl border-2 border-indigo/20 bg-gray-50 px-5 py-3.5 text-sm font-extrabold text-indigo-deep transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
          Ajouter à ma commande
        </button>
        {numbers[1] && (
          <button type="button" onClick={() => addProduct(numbers[1], true)} className="mt-2 w-full rounded-2xl border-2 border-emerald-600 px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
            Contacter {formatPhone(numbers[1])}
          </button>
        )}
        {message && <p role="status" className="mt-2 text-center text-sm font-semibold text-indigo-deep dark:text-white">{message}</p>}
        <p className="mt-3 text-center text-xs leading-relaxed text-indigo/70 dark:text-white/70">Livraison selon le trajet, chiffrée sur WhatsApp avant confirmation.</p>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-indigo-deep px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{name}</p>
            <p className="font-titre text-base font-extrabold text-ocre">{formatPrice(price * qty)}</p>
          </div>
          <button type="button" onClick={() => addProduct(numbers[0], true)} className="ml-auto shrink-0 rounded-full bg-ocre px-4 py-3 text-sm font-extrabold text-indigo-deep">Commander</button>
        </div>
      </div>
      <div className="h-36 lg:hidden" aria-hidden="true" />
    </>
  );
}
