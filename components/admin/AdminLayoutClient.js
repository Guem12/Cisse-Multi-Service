"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminProfileSettings from "./AdminProfileSettings";
import AdminNotifications from "./AdminNotifications";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      // 1. État sidebar rétractée
      const isCol = localStorage.getItem("cisse_admin_sidebar_collapsed") === "true";
      setCollapsed(isCol);

      // 2. État thème sombre
      const isDark =
        localStorage.getItem("cisse_theme") === "dark" ||
        (!localStorage.getItem("cisse_theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("cisse_admin_sidebar_collapsed", next ? "true" : "false");
    } catch (e) {}
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cisse_theme", next ? "dark" : "light");
    } catch (e) {}
  };

  // Breadcrumb intelligent
  let sectionName = "Tableau de bord";
  if (pathname === "/admin/clients") sectionName = "Clients";
  else if (pathname === "/admin/vitrine") sectionName = "Vitrine Accueil";
  else if (pathname.startsWith("/admin/produits/nouveau")) sectionName = "Nouveau produit";
  else if (pathname.startsWith("/admin/produits")) sectionName = "Catalogue Produits";
  else if (pathname.startsWith("/admin/categories")) sectionName = "Catégories";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ backgroundColor: "var(--bg-subtle)" }}>
      {/* Sidebar Latérale Rétractable */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        toggleSidebar={toggleSidebar}
        dark={dark}
        toggleTheme={toggleTheme}
      />

      {/* Zone de contenu principale — s'adapte dynamiquement selon la largeur de la sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Barre supérieure Admin (Desktop) */}
        <header
          className="hidden lg:flex items-center justify-between h-16 px-6 sm:px-8 sticky top-0 z-30 border-b backdrop-blur-md"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text-main)" }}>
                Administration
              </span>
              <span style={{ color: "var(--text-faint)" }}>/</span>
              <span className="font-medium text-ocre">{sectionName}</span>
            </div>
          </div>

          {/* Droite : Notifications, Mode Sombre/Clair, Indicateur en ligne & Lien boutique */}
          <div className="flex items-center gap-3">
            {/* Cloche de notifications, juste à côté du mode sombre */}
            <AdminNotifications />

            {/* BOUTON BASCULEUR MODE SOMBRE / CLAIR */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-main)",
              }}
              title={dark ? "Passer en mode clair" : "Passer en mode sombre"}
              aria-label="Basculer le thème"
            >
              {dark ? (
                <>
                  <svg className="w-4 h-4 text-amber-400 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                  <span>Mode Clair</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                  <span>Mode Sombre</span>
                </>
              )}
            </button>

            {/* Statut connecté */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connecté
            </div>

            {/* Bouton voir la boutique */}
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Voir la boutique</span>
            </a>

            <div className="h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

            {/* Photo de profil admin TOUT À DROITE avec options de paramétrage */}
            <AdminProfileSettings dark={dark} toggleTheme={toggleTheme} />
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Pied de page Admin */}
        <footer
          className="hidden lg:flex items-center justify-between px-8 py-3 border-t text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-faint)", backgroundColor: "var(--bg-surface)" }}
        >
          <span>© {new Date().getFullYear()} Cissé Multi-Service · Espace Admin</span>
          <span>Bamako, Mali</span>
        </footer>
      </div>
    </div>
  );
}
