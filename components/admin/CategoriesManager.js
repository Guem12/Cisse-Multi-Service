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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-brume gap-3 hover:border-indigo/30 transition-all">
      {dialog}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo/5 text-indigo flex items-center justify-center font-bold text-base flex-shrink-0">
          📁
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
            <h3 className="font-bold text-indigo-deep truncate">{category.name}</h3>
            <p className="text-xs text-indigo/50">slug: {category.slug}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {editing ? (
          <>
            <button
              onClick={() => call("PUT", { name })}
              disabled={loading || !name.trim()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(category.name);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-paper text-indigo font-medium text-xs hover:bg-brume transition-colors"
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/catalogue?categorie=${category.slug}`}
              target="_blank"
              className="p-2 rounded-lg text-indigo/60 hover:text-indigo hover:bg-paper transition-colors"
              title="Voir sur le site public"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo/5 hover:bg-indigo text-indigo hover:text-white font-medium text-xs transition-all"
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
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-xs transition-all"
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
    <div className="space-y-6 max-w-4xl">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-brume shadow-sm">
        <h1 className="font-titre text-2xl sm:text-3xl font-extrabold text-indigo-deep">
          Catégories ({categories.length})
        </h1>
        <p className="text-sm text-indigo/70 mt-1">
          Organisez les rayons pour faciliter les achats des clients.
        </p>

        {/* Add Form */}
        <form onSubmit={add} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 rounded-xl border border-brume bg-paper/50 focus:bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocre"
            required
            placeholder="Nom de la nouvelle catégorie (ex: Ceintures cuir)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <button
            disabled={loading || !name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocre px-6 py-2.5 font-bold text-sm text-indigo-deep shadow-md shadow-ocre/20 hover:bg-ocre/90 disabled:opacity-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter la catégorie
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-brume text-center">
            <p className="text-indigo/60">Aucune catégorie pour le moment.</p>
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
