"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Fenêtre de confirmation moderne pour l'espace admin.
 * Remplace les confirm() natifs du navigateur.
 *
 * Utilisation :
 *   const { confirm, dialog } = useConfirm();
 *   ...
 *   const ok = await confirm({ title, message, confirmLabel, tone: "danger" });
 *   if (!ok) return;
 *   ...
 *   return (<>{dialog}<div>…</div></>);
 *
 * `confirm()` résout true (validation) ou false (annulation / Échap / clic à côté).
 * `dialog` est un portail rendu dans document.body : il peut être placé n'importe
 * où dans le JSX, y compris à l'intérieur d'un <form>.
 */

const TONES = {
  danger: {
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
    buttonBg: "#ef4444",
    buttonHover: "#dc2626",
  },
  default: {
    iconBg: "rgba(224,160,48,0.15)",
    iconColor: "#E0A030",
    buttonBg: "#E0A030",
    buttonHover: "#c98b1f",
  },
};

const TRASH_PATH =
  "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16";
const CHECK_PATH = "M5 13l4 4L19 7";

export function ConfirmDialog({
  open = true,
  title = "Confirmation",
  message,
  detail,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cancelRef = useRef(null);
  const leavingRef = useRef(false);
  const colors = TONES[tone] || TONES.default;

  // Entrée fluide au montage
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Sortie fluide (160 ms) avant la fermeture réelle
  const close = useCallback(
    (result) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      setLeaving(true);
      window.setTimeout(() => {
        if (result) onConfirm?.();
        else onCancel?.();
      }, 160);
    },
    [onConfirm, onCancel]
  );

  // Focus par défaut sur « Annuler » : une validation destructive doit être voulue
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Verrouillage du défilement de la page pendant l'ouverture
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Échap = annuler, Entrée = valider (hors boutons déjà en focus)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      } else if (e.key === "Enter" && e.target?.tagName !== "BUTTON") {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  if (!open || typeof document === "undefined") return null;

  const shown = visible && !leaving;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Voile */}
      <div
        className={`absolute inset-0 bg-indigo-deep/60 backdrop-blur-sm transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => close(false)}
        aria-hidden="true"
      />

      {/* Carte */}
      <div
        className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-all duration-200 ease-out ${
          shown ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"
        }`}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.iconBg, color: colors.iconColor }}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={tone === "danger" ? TRASH_PATH : CHECK_PATH}
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-base font-extrabold leading-tight"
              style={{ color: "var(--text-main)" }}
            >
              {title}
            </h2>
            {message && (
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {message}
              </p>
            )}
            {detail && (
              <p
                className="mt-2 rounded-xl px-3 py-2 text-xs font-semibold"
                style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}
              >
                {detail}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            ref={cancelRef}
            onClick={() => close(false)}
            className="rounded-xl border px-5 py-2.5 text-sm font-bold transition-all hover:bg-black/5 active:scale-95 dark:hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: colors.buttonBg }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.buttonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.buttonBg)}
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Hook : { confirm, dialog } — voir commentaire en haut de fichier. */
export function useConfirm() {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback(
    (input) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setOptions(typeof input === "string" ? { message: input } : input);
      }),
    []
  );

  const settle = useCallback((value) => {
    setOptions(null);
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, dialog };
}
