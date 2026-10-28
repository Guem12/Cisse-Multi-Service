"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function ProductList({ initialProducts, categories }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" ||
        p.category?.slug === selectedCategory ||
        p.category?._id === selectedCategory;
      let matchesStock = true;
      if (stockFilter === "in_stock") matchesStock = p.stock > 5;
      else if (stockFilter === "low_stock") matchesStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === "out_of_stock") matchesStock = p.stock <= 0;
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = p.active;
      else if (statusFilter === "inactive") matchesStatus = !p.active;
      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }, [initialProducts, search, selectedCategory, stockFilter, statusFilter]);

  const totalCount = initialProducts.length;
  const activeCount = initialProducts.filter((p) => p.active).length;
  const lowStockCount = initialProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = initialProducts.filter((p) => p.stock <= 0).length;

  const STATS = [
    {
      label: "Total produits", value: totalCount, color: "#6366f1", bg: "rgba(99,102,241,0.12)",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      label: "En ligne", value: activeCount, color: "#10b981", bg: "rgba(16,185,129,0.12)",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Stock faible", value: lowStockCount, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      label: "Ruptures", value: outOfStockCount, color: "#ef4444", bg: "rgba(239,68,68,0.12)",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="rounded-2xl p-6 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div>
          <h1 className="font-titre text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
            Catalogue Produits
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Gérez vos articles, vérifiez les stocks et publiez vos nouveautés.
          </p>
        </div>
        <Link href="/admin/produits/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-indigo-deep shadow-lg transition-all hover:scale-[1.03] active:scale-95 shrink-0"
          style={{ backgroundColor: "#E0A030", boxShadow: "0 4px 16px rgba(224,160,48,0.3)" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un produit
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border flex items-center gap-4 transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="text-2xl font-titre font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 border flex flex-col md:flex-row gap-3"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none" style={{ color: "var(--text-faint)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit ou categorie…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-ocre"
            style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-main)" }} />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-ocre"
            style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-main)" }}>
            <option value="all">Toutes categories</option>
            {categories.map((c) => <option key={c._id || c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-ocre"
            style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-main)" }}>
            <option value="all">Tous les stocks</option>
            <option value="in_stock">En stock (plus de 5)</option>
            <option value="low_stock">Stock faible (1-5)</option>
            <option value="out_of_stock">Rupture (0)</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-ocre"
            style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-main)" }}>
            <option value="all">Tous statuts</option>
            <option value="active">En ligne</option>
            <option value="inactive">Masque</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {filtered.length} produit{filtered.length !== 1 ? "s" : ""} affiche{filtered.length !== 1 ? "s" : ""}
        </p>
        {(search || selectedCategory !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setSearch(""); setSelectedCategory("all"); setStockFilter("all"); setStatusFilter("all"); }}
            className="text-xs font-semibold text-ocre hover:underline">
            Reinitialiser les filtres
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        {filtered.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-faint)" }}>
              X
            </div>
            <h3 className="font-titre text-lg font-bold" style={{ color: "var(--text-main)" }}>Aucun produit trouve</h3>
            <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
              Modifiez vos filtres ou ajoutez un nouvel article.
            </p>
            <Link href="/admin/produits/nouveau"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-sm text-indigo-deep"
              style={{ backgroundColor: "#E0A030" }}>
              Ajouter un produit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider border-b"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <th className="py-4 px-5">Article</th>
                  <th className="py-4 px-5">Categorie</th>
                  <th className="py-4 px-5">Prix</th>
                  <th className="py-4 px-5">Stock</th>
                  <th className="py-4 px-5">Statut</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const img = p.images?.[0]?.url;
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p._id} className="transition-colors border-b"
                      style={{ borderColor: "var(--border)" }}>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border"
                            style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                            {img ? (
                              <Image src={img} alt={p.name} fill className="object-cover" sizes="44px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text-faint)" }}>?</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/produits/${p._id}`}
                              className="font-bold text-sm truncate block hover:text-ocre transition-colors"
                              style={{ color: "var(--text-main)" }}>
                              {p.name}
                            </Link>
                            <span className="text-xs" style={{ color: "var(--text-faint)" }}>/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                          {p.category?.name || "Non categorise"}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-titre font-bold text-sm" style={{ color: "#E0A030" }}>
                          {formatPrice(p.price)}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Rupture
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Faible ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{p.stock} unites
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {p.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-faint)" }}>
                            <span className="w-2 h-2 rounded-full bg-gray-400" />Masque
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/produit/${p.slug}`} target="_blank" title="Voir sur le site"
                            className="p-2 rounded-lg transition-colors hover:bg-indigo/10"
                            style={{ color: "var(--text-muted)" }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link href={`/admin/produits/${p._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all bg-indigo/10 text-indigo hover:bg-indigo hover:text-white">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
