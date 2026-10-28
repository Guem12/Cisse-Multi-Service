"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

const COLOR_PRESETS = [
  { label: "Ocre Doré", value: "bg-ocre text-indigo-deep", bgClass: "bg-[#E0A030] text-[#0A1230]" },
  { label: "Vert Émeraude", value: "bg-emerald-400 text-white", bgClass: "bg-emerald-400 text-white" },
  { label: "Bleu Ciel", value: "bg-sky-400 text-white", bgClass: "bg-sky-400 text-white" },
  { label: "Rose / Promo", value: "bg-rose-400 text-white", bgClass: "bg-rose-400 text-white" },
  { label: "Violet Tendance", value: "bg-indigo-500 text-white", bgClass: "bg-indigo-500 text-white" },
  { label: "Orange Flash", value: "bg-amber-500 text-white", bgClass: "bg-amber-500 text-white" },
];

const BADGE_SUGGESTIONS = [
  "Nouveauté",
  "Populaire",
  "En stock",
  "Promo",
  "Top Vente",
  "Coup de cœur",
  "Tendance",
  "Offre Spéciale",
];

const SLOT_INFO = [
  {
    title: "Emplacement 1 (Haut Gauche - Grand)",
    defaultLabel: "Nouveauté",
    desc: "Carte principale la plus visible du collage d'accueil",
  },
  {
    title: "Emplacement 2 (Haut Droite)",
    defaultLabel: "Populaire",
    desc: "Deuxième carte flottante en hauteur",
  },
  {
    title: "Emplacement 3 (Bas Gauche)",
    defaultLabel: "En stock",
    desc: "Troisième carte flottante en bas à gauche",
  },
  {
    title: "Emplacement 4 (Bas Droite)",
    defaultLabel: "Promo",
    desc: "Quatrième carte flottante en bas à droite",
  },
];

export default function HeroShowcaseManager({ initialSlots, products }) {
  const router = useRouter();
  const [slots, setSlots] = useState(initialSlots);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const updateSlot = (index, key, val) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  async function handleSave() {
    setSaving(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de sauvegarde");

      setStatusMsg({ text: "Vitrine d'accueil mise à jour avec succès !", type: "success" });
      router.refresh();
    } catch (err) {
      setStatusMsg({ text: err.message || "Erreur lors de la sauvegarde", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div
        className="rounded-2xl p-6 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#E0A030]/10 text-ocre">
            <span>★</span> Section Vitrine Accueil
          </div>
          <h1 className="font-titre text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
            Gestion de la Vitrine d'accueil (Hero Collage)
          </h1>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Choisissez précisément quels produits s'affichent sur les 4 cartes flottantes de la page d'accueil ainsi que le texte et la couleur de leur badge.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-indigo-deep transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
          style={{
            backgroundColor: "#E0A030",
            boxShadow: "0 4px 16px rgba(224,160,48,0.3)",
          }}
        >
          {saving ? (
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
              Enregistrer la vitrine
            </>
          )}
        </button>
      </div>

      {/* Message feedback */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {statusMsg.type === "success" ? "✓" : "⚠️"} {statusMsg.text}
        </div>
      )}

      {/* Aperçu en direct des 4 cartes */}
      <div
        className="rounded-2xl p-6 border space-y-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
            Aperçu en direct des 4 cartes d'accueil
          </h2>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            Reproduit l'aspect visuel de la boutique
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slots.map((s, idx) => {
            const product = products.find((p) => String(p._id) === String(s.productId)) || products[idx];
            const imgUrl = product?.images?.[0]?.url;

            return (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border shadow-md flex flex-col group transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Image & Badge */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-900/10">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={product?.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/10 text-xl font-bold">
                      Sans photo
                    </div>
                  )}

                  {/* Badge en haut à gauche */}
                  <span
                    className={`absolute top-2.5 left-2.5 text-[11px] font-black tracking-wide px-2.5 py-1 rounded-full shadow-md ${s.labelColor}`}
                  >
                    {s.label || "Badge"}
                  </span>

                  {/* Numéro d'emplacement */}
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur">
                    #{idx + 1}
                  </span>
                </div>

                {/* Info produit */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs font-bold line-clamp-1" style={{ color: "var(--text-main)" }}>
                      {product?.name || "Produit non sélectionné"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {product?.category?.name || "Catégorie"}
                    </p>
                  </div>
                  <p className="text-ocre font-black text-sm mt-2">
                    {product?.price ? formatPrice(product.price) : "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Éditeur détaillé des 4 emplacements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slots.map((s, idx) => {
          const info = SLOT_INFO[idx] || SLOT_INFO[0];

          return (
            <div
              key={idx}
              className="rounded-2xl p-6 border space-y-5"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              {/* En-tête de la carte d'édition */}
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-ocre text-indigo-deep font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-base" style={{ color: "var(--text-main)" }}>
                      {info.title}
                    </h3>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {info.desc}
                  </p>
                </div>

                {/* Badge actuel en direct */}
                <span className={`text-[11px] font-black tracking-wide px-3 py-1 rounded-full shadow shrink-0 ${s.labelColor}`}>
                  {s.label || "Badge"}
                </span>
              </div>

              {/* Sélection du produit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Produit affiché *
                </label>
                <select
                  value={s.productId}
                  onChange={(e) => updateSlot(idx, "productId", e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--text-main)",
                  }}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · {formatPrice(p.price)} {p.active ? "" : "(Masqué)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Libellé du badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Texte du badge
                  </label>
                  <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                    max 16 caractères
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={s.label}
                  onChange={(e) => updateSlot(idx, "label", e.target.value)}
                  placeholder="ex. Nouveauté, Promo, Tendance…"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--text-main)",
                  }}
                />

                {/* Suggestions rapides */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BADGE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => updateSlot(idx, "label", sug)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors hover:border-ocre hover:text-ocre"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                        backgroundColor: "var(--bg-subtle)",
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleur du badge */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Couleur du badge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = s.labelColor === color.value;
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateSlot(idx, "labelColor", color.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                          isSelected ? "ring-2 ring-ocre border-ocre scale-[1.02]" : "hover:border-ocre/50"
                        }`}
                        style={{
                          backgroundColor: "var(--bg-subtle)",
                          borderColor: isSelected ? "#E0A030" : "var(--border)",
                          color: "var(--text-main)",
                        }}
                      >
                        <span className="truncate">{color.label}</span>
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.bgClass}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton de sauvegarde inférieur */}
      <div
        className="rounded-2xl p-6 border flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          💡 Les modifications enregistrées s'appliquent immédiatement sur la page d'accueil de la boutique.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-indigo-deep transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: "#E0A030",
            boxShadow: "0 4px 16px rgba(224,160,48,0.3)",
          }}
        >
          {saving ? "Enregistrement en cours…" : "Sauvegarder la vitrine d'accueil"}
        </button>
      </div>
    </div>
  );
}
