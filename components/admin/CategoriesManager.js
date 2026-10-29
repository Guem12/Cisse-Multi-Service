"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConfirm } from "./ConfirmDialog";

function CategoryRow({ category, onDone, onError }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);
  const { confirm, dialog } = useConfirm();

  async function call(method, body) {
    onError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        onError(json.error || "Une erreur est survenue.");
      } else {
        setEditing(false);
        onDone();
      }
    } catch {
      onError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all hover:border-indigo/40 dark:border-white/10" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
      {dialog}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
          {category.images?.[0]?.url ? (
            <img
              src={category.images[0].url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-base" style={{ color: "var(--text-faint)" }}>
              📁
            </div>
          )}
        </div>
        {editing ? (
          <input
            className="field py-1.5 px-3 text-sm font-semibold max-w-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoFocus
          />
        ) : (
          <div className="min-w-0">
            <h3 className="font-bold text-indigo-deep truncate" style={{ color: "var(--text-main)" }}>{category.name}</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>slug: {category.slug}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {editing ? (
          <>
            <button
              onClick={() => call("PUT", { name })}
              disabled={loading || !name.trim()}
              className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "#10B981", color: "white", boxShadow: "0 2px 8px rgba(16,185,129,0.3)", disabled: loading }}
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(category.name);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/catalogue?categorie=${category.slug}`}
              target="_blank"
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
              title="Voir sur le site public"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              Renommer
            </button>
            <button
              onClick={async () => {
                const ok = await confirm({
                  title: "Supprimer cette catégorie ?",
                  message: `La catégorie « ${category.name} » sera supprimée. Les produits qu'elle contient ne le seront pas.`,
                  confirmLabel: "Supprimer",
                  tone: "danger",
                });
                if (ok) call("DELETE");
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-faint)" }}
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CategoriesManager({ categories }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const done = () => router.refresh();

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Impossible d'ajouter la catégorie.");
      } else {
        setName("");
        done();
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-main)" }}>
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-main)" }}>
        <h1 className="font-titre text-2xl sm:text-3xl font-extrabold text-indigo-deep"
          style={{ color: "var(--text-main)" }}>
          Catégories ({categories.length})
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Organisez les rayons pour faciliter les achats des clients.
        </p>

        {/* Add Form */}
        <form onSubmit={add} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocre transition-all"
            style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
            required
            placeholder="Nom de la nouvelle catégorie (ex: Ceintures cuir)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <button
            disabled={loading || !name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ backgroundColor: "#E0A030", color: "white", boxShadow: "0 4px 16px rgba(224,160,48,0.3)", disabled: loading }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter la catégorie
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl border text-sm flex items-center gap-2"
            style={{ backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", color: "#B91C1C" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
            <p style={{ color: "var(--text-muted)" }}>Aucune catégorie pour le moment.</p>
          </div>
        ) : (
          categories.map((c) => (
            <CategoryRow key={c._id} category={c} onDone={done} onError={setError} />
          ))
        )}
      </div>
    </div>
  );
}
