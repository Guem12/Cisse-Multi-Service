"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConfirm } from "./ConfirmDialog";

export default function ProductForm({ categories = [], product }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [f, setF] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    category: product?.category?._id || product?.category || categories[0]?._id || "",
    active: product?.active ?? true,
  });
  const [images, setImages] = useState(product?.images || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError("");
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error || "Échec de l'envoi de l'image");
          break;
        }
        setImages((prev) => [...prev, json]);
      } catch (err) {
        setError("Erreur réseau lors de l'upload de l'image.");
        break;
      }
    }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        product ? `/api/admin/products/${product._id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...f, images }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Une erreur est survenue lors de l'enregistrement.");
        setBusy(false);
        return;
      }
      setSuccess(product ? "Modifications enregistrées avec succès !" : "Produit ajouté avec succès !");
      setTimeout(() => {
        router.push("/admin/produits");
        router.refresh();
      }, 800);
    } catch (err) {
      setError("Erreur réseau.");
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Supprimer ce produit ?",
      message:
        "Le produit sera retiré du catalogue, images comprises. Cette action est définitive.",
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/products/${product._id}`, { method: "DELETE" });
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      setError("Erreur lors de la suppression.");
      setBusy(false);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune catégorie n'est encore disponible.
        </p>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-deep bg-ocre hover:opacity-90 transition-opacity"
        >
          Créer une catégorie d'abord
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full space-y-6">
      {dialog}
      {/* Nom du produit */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Nom du produit *
        </label>
        <input
          required
          value={f.name}
          onChange={set("name")}
          placeholder="ex. Sac à dos urbain antivol"
          className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        />
      </div>

      {/* Catégorie & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Catégorie *
          </label>
          <select
            value={f.category}
            onChange={set("category")}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre cursor-pointer"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border)",
              color: "var(--text-main)",
            }}
          >
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Prix de vente (FCFA) *
          </label>
          <input
            type="number"
            min="0"
            required
            value={f.price}
            onChange={set("price")}
            placeholder="ex. 15000"
            className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border)",
              color: "var(--text-main)",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Quantité en stock
          </label>
          <input
            type="number"
            min="0"
            value={f.stock}
            onChange={set("stock")}
            placeholder="0"
            className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border)",
              color: "var(--text-main)",
            }}
          />
        </div>

        {/* Visibilité Switch */}
        <div className="flex flex-col justify-center pt-2 sm:pt-4">
          <label className="relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
            <input
              type="checkbox"
              checked={f.active}
              onChange={set("active")}
              className="w-5 h-5 rounded text-ocre focus:ring-ocre/40 cursor-pointer accent-[#E0A030]"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold" style={{ color: "var(--text-main)" }}>
                Visible sur le site
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {f.active ? "Le produit apparaît dans le catalogue public" : "Masqué pour les clients"}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Description du produit
        </label>
        <textarea
          rows={4}
          value={f.description}
          onChange={set("description")}
          placeholder="Détails, caractéristiques, matériaux, dimensions…"
          className="w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre resize-y"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        />
      </div>

      {/* Photos du produit */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Photos du produit ({images.length})
          </label>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            Première image = image principale
          </span>
        </div>

        {/* Prévisualisation des images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3 p-3 rounded-xl border" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
            {images.map((img, i) => (
              <div key={img.publicId || img.url || i} className="relative group rounded-xl overflow-hidden border shadow-sm"
                style={{ borderColor: "var(--border)", width: "88px", height: "88px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-ocre text-indigo-deep text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Supprimer la photo"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <label
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-ocre group"
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderColor: "var(--border)",
          }}
        >
          <svg className="w-8 h-8 mb-2 text-ocre transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
            {busy ? "Envoi de la photo en cours…" : "Cliquez pour importer des photos"}
          </span>
          <span className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
            PNG, JPG, WebP jusqu'à 5 Mo
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Boutons d'action centrés */}
      <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-center gap-3" style={{ borderColor: "var(--border)" }}>
        <button
          type="submit"
          disabled={busy}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-indigo-deep transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: "#E0A030",
            boxShadow: "0 4px 16px rgba(224,160,48,0.3)",
          }}
        >
          {busy ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enregistrement…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {product ? "Enregistrer les modifications" : "Ajouter le produit au catalogue"}
            </>
          )}
        </button>

        <Link
          href="/admin/produits"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Annuler
        </Link>

        {product && (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Supprimer définitivement
          </button>
        )}
      </div>
    </form>
  );
}
