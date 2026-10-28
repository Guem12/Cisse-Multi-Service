"use client";
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatPrice, formatPhone } from "@/lib/format";
import { useConfirm } from "./ConfirmDialog";

const STATUS_COLORS = {
  VIP: "bg-[#E0A030]/15 text-ocre border-[#E0A030]/30",
  Régulier: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Actif: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  Nouveau: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

export default function ClientList({ initialClients = [] }) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Bamako",
    address: "",
    ordersCount: 1,
    totalSpent: 0,
    status: "Actif",
    notes: "",
  });

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, selectedStatus]);

  const totalClients = clients.length;
  const vipCount = clients.filter((c) => c.status === "VIP").length;
  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const avgRevenue = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0;

  async function handleAddClient(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'ajout");

      setClients((prev) => [data.client, ...prev]);
      setModalOpen(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        city: "Bamako",
        address: "",
        ordersCount: 1,
        totalSpent: 0,
        status: "Actif",
        notes: "",
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    const ok = await confirm({
      title: "Supprimer ce client ?",
      message: `La fiche de ${name} sera retirée du répertoire. Cette action est définitive.`,
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      setClients((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-6">
      {dialog}
      {/* En-tête */}
      <div
        className="rounded-2xl p-6 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-sky-500/10 text-sky-500">
            👥 Gestion Relations Clients
          </div>
          <h1 className="font-titre text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-main)" }}>
            Répertoire des Clients
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Suivez les contacts WhatsApp, les commandes passées et fidélisez votre clientèle.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-sm text-indigo-deep shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
          style={{ backgroundColor: "#E0A030", boxShadow: "0 4px 16px rgba(224,160,48,0.3)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </button>
      </div>

      {/* Cartes KPI Clients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-sky-500/10 text-sky-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Total Clients
            </span>
            <p className="font-titre text-2xl font-black mt-0.5" style={{ color: "var(--text-main)" }}>
              {totalClients}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#E0A030]/10 text-ocre">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Clients VIP
            </span>
            <p className="font-titre text-2xl font-black text-ocre mt-0.5">
              {vipCount}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              CA Cumulé Clients
            </span>
            <p className="font-titre text-2xl font-black text-emerald-500 mt-0.5">
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Panier moyen
            </span>
            <p className="font-titre text-2xl font-black mt-0.5" style={{ color: "var(--text-main)" }}>
              {formatPrice(avgRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et Filtres */}
      <div
        className="rounded-2xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border)",
              color: "var(--text-main)",
            }}
          />
        </div>

        {/* Filtres par statut */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {["all", "VIP", "Régulier", "Actif", "Nouveau"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedStatus === st
                  ? "bg-ocre text-indigo-deep border-ocre shadow"
                  : "hover:border-ocre/40"
              }`}
              style={{
                borderColor: selectedStatus === st ? "#E0A030" : "var(--border)",
                backgroundColor: selectedStatus === st ? "#E0A030" : "var(--bg-subtle)",
                color: selectedStatus === st ? "#0A1230" : "var(--text-muted)",
              }}
            >
              {st === "all" ? "Tous" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des Clients */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)" }}>
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Client</th>
                <th className="py-3.5 px-4">Contact WhatsApp</th>
                <th className="py-3.5 px-4">Ville / Quartier</th>
                <th className="py-3.5 px-4">Commandes</th>
                <th className="py-3.5 px-4">Total Dépensé</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Aucun client ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((cli) => {
                  const cleanPhone = cli.phone.replace(/\D/g, "");
                  const initials = cli.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={cli._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      {/* Client info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-gradient-to-tr from-[#1B2A5C] to-[#E0A030] text-white shadow">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "var(--text-main)" }}>
                              {cli.name}
                            </p>
                            {cli.email && (
                              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                                {cli.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp contact */}
                      <td className="py-3.5 px-4">
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                          </svg>
                          {formatPhone(cli.phone)}
                        </a>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--text-main)" }}>{cli.city}</span>
                        {cli.address && <p className="text-[11px] truncate max-w-[140px]">{cli.address}</p>}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                        {cli.ordersCount} commande(s)
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-black text-sm text-ocre">
                        {formatPrice(cli.totalSpent)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[cli.status] || STATUS_COLORS.Actif}`}>
                          {cli.status === "VIP" && "★ "}
                          {cli.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener"
                            className="p-1.5 rounded-lg border hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                            title="Contacter sur WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(cli._id, cli.name)}
                            className="p-1.5 rounded-lg border hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de client — Rendu directement dans document.body pour centrage parfait */}
      {modalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg m-auto rounded-2xl border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5 border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-titre text-xl font-bold" style={{ color: "var(--text-main)" }}>
                  Ajouter un nouveau client
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Renseignez les coordonnées pour enregistrer ce contact.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Nom complet du client *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex. Modibo Diakité"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Numéro WhatsApp / Tél *
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="ex. 22376123456"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Statut du client
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre cursor-pointer"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Régulier">Régulier</option>
                    <option value="VIP">VIP</option>
                    <option value="Nouveau">Nouveau</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Ville
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bamako"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Quartier / Adresse
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Hamdallaye ACI 2000"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Commandes passées
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.ordersCount}
                    onChange={(e) => setForm({ ...form, ordersCount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Total dépensé (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalSpent}
                    onChange={(e) => setForm({ ...form, totalSpent: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Notes / Préférences client
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Articles préférés, instructions de livraison…"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre resize-none"
                  style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                />
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-center gap-3" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-bold text-indigo-deep bg-ocre shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Enregistrement…" : "Enregistrer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
