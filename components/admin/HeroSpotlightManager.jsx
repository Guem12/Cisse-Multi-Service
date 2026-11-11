import { useState } from "react";
import { formatPrice } from "@/lib/format";

function getImages(product) {
  return (product?.images || [])
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image?.url);
}

export default function HeroSpotlightManager({ initialSelection = null, products = [] }) {
  const availableProducts = products.filter(
    (product) => product.active && getImages(product).length > 0,
  );
  const [selection, setSelection] = useState(() => initialSelection || {
    productId: String(availableProducts[0]?._id || availableProducts[0]?.id || ""),
    imageIndex: 0,
  });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const selectedProduct = availableProducts.find(
    (product) => String(product._id || product.id) === String(selection.productId),
  );
  const images = getImages(selectedProduct);
  const selectedImage = images.find(({ index }) => index === Number(selection.imageIndex))?.image || images[0]?.image;

  async function handleSave() {
    if (!selectedProduct || !selectedImage) {
      setStatusMsg({ text: "Choisissez un produit actif avec une photo.", type: "error" });
      return;
    }

    setSaving(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: {
          productId: String(selectedProduct._id || selectedProduct.id),
          imageIndex: Number(selection.imageIndex),
        } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de l’enregistrement.");

      setSelection(result.selection);
      setStatusMsg({ text: "Le produit de la page d’accueil est enregistré.", type: "success" });
    } catch (error) {
      setStatusMsg({ text: error.message || "Erreur lors de l’enregistrement.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E0A030]/10 px-3 py-1 text-xs font-bold text-ocre">Page d’accueil</div>
          <h1 className="font-titre text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--text-main)" }}>Produit à la une</h1>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>Choisissez le produit et la photo affichés dans le visuel rond de la page d’accueil.</p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving || !availableProducts.length} className="min-h-11 w-full shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-indigo-deep transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" style={{ backgroundColor: "#E0A030" }}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </header>

      {statusMsg.text && (
        <p role={statusMsg.type === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm font-semibold ${statusMsg.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"}`}>
          {statusMsg.text}
        </p>
      )}

      {!availableProducts.length ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
          Aucun produit actif avec une photo n’est disponible pour la mise en avant.
        </p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]" aria-label="Configuration du produit à la une">
          <div className="space-y-5 rounded-2xl border p-5" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <div>
              <label htmlFor="hero-product" className="mb-2 block text-sm font-bold" style={{ color: "var(--text-main)" }}>Produit</label>
              <select id="hero-product" value={selection.productId} onChange={(event) => setSelection({ productId: event.target.value, imageIndex: 0 })} className="min-h-11 w-full rounded-xl border px-3 text-sm" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}>
                {availableProducts.map((product) => (
                  <option key={product._id || product.id} value={String(product._id || product.id)}>
                    {product.name} · {formatPrice(product.price)} FCFA
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hero-image" className="mb-2 block text-sm font-bold" style={{ color: "var(--text-main)" }}>Photo du produit</label>
              <select id="hero-image" value={selection.imageIndex ?? 0} onChange={(event) => setSelection((current) => ({ ...current, imageIndex: Number(event.target.value) }))} disabled={!selectedProduct} className="min-h-11 w-full rounded-xl border px-3 text-sm disabled:opacity-50" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}>
                {images.map(({ image, index }) => <option key={index} value={index}>{image.alt || image.name || `Photo ${index + 1}`}</option>)}
              </select>
            </div>
          </div>

          <article className="overflow-hidden rounded-2xl border p-5" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text-main)" }}>Aperçu</h2>
            <div className="mx-auto grid aspect-square w-full max-w-[220px] place-items-center overflow-hidden rounded-full border border-white/30 bg-indigo/30 p-4">
              {selectedImage?.url && <img src={selectedImage.url} alt={selectedProduct?.name || ""} className="h-full w-full rounded-full object-contain" />}
            </div>
            <p className="mt-4 truncate text-center text-sm font-bold" style={{ color: "var(--text-main)" }}>{selectedProduct?.name || "Aucun produit"}</p>
            {selectedProduct && <p className="mt-1 text-center text-sm font-bold text-ocre">{formatPrice(selectedProduct.price)} FCFA</p>}
          </article>
        </section>
      )}
    </div>
  );
}