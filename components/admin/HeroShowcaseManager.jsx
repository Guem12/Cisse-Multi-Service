import { useState } from "react";
import { formatPrice } from "@/lib/format";

const SLOT_LABELS = [
  "Photo 1 · Haut gauche",
  "Photo 2 · Haut droite",
  "Photo 3 · Bas gauche",
  "Photo 4 · Bas droite",
];

function getImages(product) {
  return (product?.images || [])
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image?.url);
}

export default function HeroShowcaseManager({ initialSlots = [], products = [] }) {
  const [slots, setSlots] = useState(() =>
    Array.from({ length: 4 }, (_, index) => initialSlots[index] || {
      slot: index,
      productId: "",
      imageIndex: 0,
    }),
  );
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const availableProducts = products.filter(
    (product) => product.active && getImages(product).length > 0,
  );

  function updateSlot(index, values) {
    setSlots((current) => current.map((slot, slotIndex) =>
      slotIndex === index ? { ...slot, ...values } : slot,
    ));
  }

  async function handleSave() {
    setSaving(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const selectedIds = slots.map((slot) => String(slot.productId || ""));
      if (slots.length !== 4 || selectedIds.some((id) => !id) || new Set(selectedIds).size !== 4) {
        throw new Error("Choisissez quatre produits différents pour les photos flottantes.");
      }

      const invalidPhoto = slots.some((slot) => {
        const product = availableProducts.find((item) => String(item._id) === String(slot.productId));
        return !product || !getImages(product).some(({ index }) => index === Number(slot.imageIndex));
      });
      if (invalidPhoto) throw new Error("Choisissez une photo disponible pour chaque produit.");

      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de l’enregistrement.");

      setSlots(result.slots);
      setStatusMsg({ text: "Les quatre photos flottantes sont enregistrées sur la page d’accueil.", type: "success" });
    } catch (error) {
      setStatusMsg({ text: error.message || "Erreur lors de l’enregistrement.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header
        className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E0A030]/10 px-3 py-1 text-xs font-bold text-ocre">
            <span aria-hidden="true">★</span> Page d’accueil
          </div>
          <h1 className="font-titre text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--text-main)" }}>
            Photos flottantes
          </h1>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>
            Choisissez les quatre produits et les photos affichés dans le collage du haut de la page d’accueil. L’ordre des emplacements détermine leur position.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || availableProducts.length < 4}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-indigo-deep transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          style={{ backgroundColor: "#E0A030", boxShadow: "0 4px 16px rgba(224,160,48,0.3)" }}
        >
          {saving ? "Enregistrement…" : "Enregistrer les photos"}
        </button>
      </header>

      {statusMsg.text && (
        <p
          role={statusMsg.type === "error" ? "alert" : "status"}
          className={`rounded-xl border p-4 text-sm font-semibold ${
            statusMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {statusMsg.text}
        </p>
      )}

      {availableProducts.length < 4 && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
          Il faut au moins quatre produits actifs avec une photo pour configurer les quatre emplacements.
        </p>
      )}

      <section aria-labelledby="hero-preview-title" className="space-y-4">
        <div>
          <h2 id="hero-preview-title" className="text-base font-bold" style={{ color: "var(--text-main)" }}>
            Aperçu des quatre photos
          </h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Le collage public affiche les images sans titre ni bouton.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {slots.map((slot, index) => {
            const product = availableProducts.find((item) => String(item._id) === String(slot.productId));
            const image = getImages(product).find(({ index: imageIndex }) => imageIndex === Number(slot.imageIndex))?.image;
            return (
              <article
                key={index}
                className="overflow-hidden rounded-2xl border"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
              >
                <div className="relative grid aspect-square place-items-center bg-gradient-to-br from-amber-100 to-amber-300/70 dark:from-slate-800 dark:to-slate-700">
                  {image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={product?.name || ""} className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="px-2 text-center text-xs" style={{ color: "var(--text-muted)" }}>Sélectionnez un produit</span>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white">
                    Photo {index + 1}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-bold" style={{ color: "var(--text-main)" }}>
                    {product?.name || "Emplacement à configurer"}
                  </p>
                  {product && <p className="mt-1 text-xs font-bold text-ocre">{formatPrice(product.price)}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-label="Configuration des photos flottantes" className="grid gap-4 lg:grid-cols-2">
        {slots.map((slot, index) => {
          const product = availableProducts.find((item) => String(item._id) === String(slot.productId));
          const images = getImages(product);
          const selectedElsewhere = new Set(
            slots.filter((_, slotIndex) => slotIndex !== index).map((item) => String(item.productId)),
          );
          return (
            <article
              key={index}
              className="space-y-4 rounded-2xl border p-4 sm:p-5"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <h3 className="font-bold" style={{ color: "var(--text-main)" }}>{SLOT_LABELS[index]}</h3>
              <div>
                <label htmlFor={`hero-product-${index}`} className="mb-2 block text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  Produit
                </label>
                <select
                  id={`hero-product-${index}`}
                  value={slot.productId}
                  onChange={(event) => updateSlot(index, { productId: event.target.value, imageIndex: 0 })}
                  className="min-h-11 w-full rounded-xl border px-3 text-sm"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                >
                  <option value="">Choisir un produit</option>
                  {availableProducts.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      disabled={selectedElsewhere.has(String(item._id))}
                    >
                      {item.name} · {formatPrice(item.price)}
                      {selectedElsewhere.has(String(item._id)) ? " (déjà utilisé)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`hero-image-${index}`} className="mb-2 block text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  Photo du produit
                </label>
                <select
                  id={`hero-image-${index}`}
                  value={slot.imageIndex ?? 0}
                  onChange={(event) => updateSlot(index, { imageIndex: Number(event.target.value) })}
                  disabled={!product}
                  className="min-h-11 w-full rounded-xl border px-3 text-sm disabled:opacity-50"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                >
                  {images.map(({ image: photo, index: imageIndex }) => (
                    <option key={imageIndex} value={imageIndex}>
                      {photo.alt || photo.name || `Photo ${imageIndex + 1}`}
                    </option>
                  ))}
                  {!images.length && <option value={0}>Aucune photo disponible</option>}
                </select>
              </div>
            </article>
          );
        })}
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || availableProducts.length < 4}
        className="min-h-12 w-full rounded-xl px-6 py-3 text-sm font-bold text-indigo-deep transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        style={{ backgroundColor: "#E0A030" }}
      >
        {saving ? "Enregistrement…" : "Enregistrer les photos"}
      </button>
    </div>
  );
}
