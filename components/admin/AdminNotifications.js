"use client";
import { useState, useEffect, useId, useRef } from "react";
import Link from "next/link";

/**
 * Cloche de notifications de l'espace admin.
 *
 * 1. Alertes automatiques de stock : produits en rupture et produits dont le
 *    stock est inférieur ou égal à LOW_STOCK_THRESHOLD. Les alertes sont
 *    recalculées à chaque ouverture du panneau.
 * 2. Contact WhatsApp : message préadressé au numéro du profil administrateur.
 *
 * L'envoi réel est confirmé dans WhatsApp : cette page n'envoie rien en
 * dehors d'une action explicite de l'utilisateur.
 *
 * variant : "desktop" (panneau calé à gauche) | "mobile" (panneau calé à droite)
 */
const LOW_STOCK_THRESHOLD = 5;

function collectAlerts(products) {
  const outOfStock = [];
  const lowStock = [];
  for (const p of products) {
    const stock = Number(p.stock);
    if (!Number.isFinite(stock)) continue; // stock inconnu : pas d'alerte fausse
    const item = { _id: p._id, name: p.name, slug: p.slug, stock };
    if (stock <= 0) outOfStock.push(item);
    else if (stock <= LOW_STOCK_THRESHOLD) lowStock.push(item);
  }
  return { outOfStock, lowStock, total: outOfStock.length + lowStock.length };
}

export default function AdminNotifications({ variant = "desktop" }) {
  const uid = useId();
  const panelId = `notif-panel-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const textareaId = `notif-message-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [open, setOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [message, setMessage] = useState(
    "Bonjour, je vous contacte depuis l’administration de Cissé Multi-Service."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [alerts, setAlerts] = useState(null);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");
  const rootRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      setAlertsError("");
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de récupérer les stocks.");
      setAlerts(collectAlerts(Array.isArray(data.products) ? data.products : []));
    } catch (err) {
      setAlertsError(err.message || "Impossible de vérifier les stocks.");
    } finally {
      setAlertsLoading(false);
    }
  };

  // Alertes visibles sur la cloche dès l'arrivée sur l'espace admin
  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    setError("");
    if (!willOpen) return;

    // À chaque ouverture : stocks frais + numéro du profil si pas encore chargé
    fetchAlerts();
    if (adminPhone || loading) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/profile", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de récupérer le profil administrateur.");
      setAdminPhone(data.profile?.phone || "");
    } catch (err) {
      setError(err.message || "Impossible de récupérer le numéro WhatsApp administrateur.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (text) => {
    const phone = adminPhone.replace(/[^0-9]/g, "");
    if (!phone) {
      setError("Ajoutez un numéro WhatsApp dans le profil administrateur.");
      return;
    }
    if (!text.trim()) {
      setError("Saisissez un message avant de continuer.");
      return;
    }
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const buildAlertMessage = () => {
    if (!alerts) return "";
    const lines = [
      ...alerts.outOfStock.map((p) => `• RUPTURE : ${p.name} (stock ${p.stock})`),
      ...alerts.lowStock.map((p) => `• Stock faible : ${p.name} (plus que ${p.stock})`),
    ];
    return `Alertes stocks Cissé Multi-Service (${alerts.total}) :\n${lines.join("\n")}`;
  };

  const align = variant === "mobile" ? "right-0" : "left-0";
  const badgeCount = alerts && !alertsLoading ? alerts.total : 0;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={toggle}
        className={
          variant === "mobile"
            ? "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 active:scale-90"
            : "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        }
        style={variant === "desktop" ? { borderColor: "var(--border)", color: "var(--text-muted)" } : undefined}
        aria-label={
          badgeCount > 0
            ? `Notifications : ${badgeCount} alerte${badgeCount > 1 ? "s" : ""} de stock`
            : "Notifications et message administrateur"
        }
        aria-expanded={open}
        aria-controls={panelId}
        title={badgeCount > 0 ? `${badgeCount} alerte(s) de stock` : "Notifications et message administrateur"}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4.5-5.8V4a1.5 1.5 0 00-3 0v1.2A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>
        {badgeCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[1.15rem] rounded-full bg-red-500 px-1 text-[10px] font-black leading-[1.15rem] text-white shadow-lg"
            aria-hidden="true"
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications et contact administrateur"
          className={`absolute ${align} top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl max-h-[calc(100vh-7rem)] overflow-y-auto`}
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="mb-3">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-main)" }}>
              Notifications
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Alertes de stock automatiques et contact administrateur.
            </p>
          </div>

          {/* ── Alertes de stock ─────────────────────────────── */}
          <section aria-label="Alertes de stock" className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Stocks
              </h3>
              <button
                type="button"
                onClick={fetchAlerts}
                className="text-xs font-semibold underline transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
                disabled={alertsLoading}
              >
                {alertsLoading ? "Vérification…" : "Actualiser"}
              </button>
            </div>

            {alertsLoading && !alerts ? (
              <p className="py-2 text-sm" style={{ color: "var(--text-muted)" }}>
                Vérification des stocks…
              </p>
            ) : alertsError ? (
              <p role="alert" className="text-xs font-medium text-red-500">
                {alertsError}
              </p>
            ) : !alerts || alerts.total === 0 ? (
              <p
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
              >
                ✓ Aucune alerte : tous les stocks sont suffisants.
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.outOfStock.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-bold text-red-500">
                      En rupture ({alerts.outOfStock.length})
                    </p>
                    <ul className="space-y-1">
                      {alerts.outOfStock.map((p) => (
                        <li
                          key={p._id}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs"
                          style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "var(--text-main)" }}
                        >
                          <span className="truncate font-semibold">{p.name}</span>
                          <span className="shrink-0 font-black text-red-500">{p.stock}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {alerts.lowStock.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-bold text-amber-500">
                      Stock faible · ≤ {LOW_STOCK_THRESHOLD} ({alerts.lowStock.length})
                    </p>
                    <ul className="space-y-1">
                      {alerts.lowStock.map((p) => (
                        <li
                          key={p._id}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs"
                          style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "var(--text-main)" }}
                        >
                          <span className="truncate font-semibold">{p.name}</span>
                          <span className="shrink-0 font-black text-amber-500">{p.stock}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openWhatsApp(buildAlertMessage())}
                    disabled={!adminPhone}
                    className="flex-1 rounded-xl bg-ocre px-3 py-2 text-xs font-bold text-indigo-deep transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prévenir par WhatsApp
                  </button>
                  <Link
                    href="/admin/produits"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border px-3 py-2 text-xs font-bold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                  >
                    Gérer
                  </Link>
                </div>
              </div>
            )}
          </section>

          <div className="mb-4 border-t pt-4" style={{ borderColor: "var(--border)" }} />

          {/* ── Contact WhatsApp ─────────────────────────────── */}
          <section aria-label="Message WhatsApp">
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Message WhatsApp
            </h3>

            {loading ? (
              <p className="py-2 text-sm" style={{ color: "var(--text-muted)" }}>
                Chargement du numéro…
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  Destinataire :{" "}
                  <span className="font-semibold" style={{ color: "var(--text-main)" }}>
                    {adminPhone || "Numéro non configuré"}
                  </span>
                </p>
                <label className="sr-only" htmlFor={textareaId}>
                  Votre message
                </label>
                <textarea
                  id={textareaId}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Écrivez votre message…"
                  className="w-full resize-y rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ocre/40"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border)",
                    color: "var(--text-main)",
                  }}
                />
                {error && (
                  <p role="alert" className="mt-2 text-xs font-medium text-red-500">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => openWhatsApp(message)}
                  disabled={!adminPhone}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ocre px-4 py-2.5 text-sm font-bold text-indigo-deep transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2a10 10 0 00-8.66 15L2 22l5.18-1.31A10 10 0 1012 2zm0 18a8 8 0 01-4.08-1.12l-.29-.17-3.07.78.82-2.99-.19-.31A8 8 0 1112 20zm4.39-5.99c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.31.98 2.47c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
                  </svg>
                  Envoyer via WhatsApp
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
