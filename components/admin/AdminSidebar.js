"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import AdminNotifications from "./AdminNotifications";

export default function AdminSidebar({
  collapsed = false,
  toggleSidebar,
  dark = false,
  toggleTheme,
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {
      label: "Tableau de bord",
      href: "/admin",
      exact: true,
      badge: "Stats",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Clients",
      href: "/admin/clients",
      badge: "VIP",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Vitrine Accueil",
      href: "/admin/vitrine",
      badge: "★ Hero",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: "Produits",
      href: "/admin/produits",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Catégories",
      href: "/admin/categories",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      label: "Nouveau produit",
      href: "/admin/produits/nouveau",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ];

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-indigo px-4 py-3 text-white sticky top-0 z-50 shadow">
        <Link href="/admin" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-fond-sombre.svg" alt="Cissé-multi-service" width="110" height="38" className="h-8 w-auto" />
          <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded text-ocre">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <AdminNotifications variant="mobile" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-indigo-deep/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop fixed / Mobile drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 text-white flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"} shadow-2xl`}
        style={{
          background: "linear-gradient(180deg, #0A1128 0%, #0E1530 60%, #0A0E22 100%)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/admin" className="block" onClick={() => setMobileOpen(false)}>
            {collapsed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon-blanc.svg" alt="CMS" width="36" height="36" className="h-9 w-9 rounded-lg shadow" />
            ) : (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-fond-sombre.svg" alt="Cissé-multi-service" width="130" height="42" className="h-9 w-auto" />
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-ocre">Espace Gestion</span>
                </div>
              </div>
            )}
          </Link>

          {/* Bouton pour rétrécir / agrandir (visible sur desktop quand non rétracté) */}
          {!collapsed && toggleSidebar && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Rétrécir la barre latérale"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Mobile close */}
          <button
            type="button"
            className="lg:hidden text-white/70 hover:text-white p-1"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Bouton agrandir quand rétracté */}
        {collapsed && toggleSidebar && (
          <div className="hidden lg:flex justify-center py-2 border-b border-white/5">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-ocre transition-all hover:scale-110"
              title="Agrandir la barre latérale"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-white/35 mb-2">
              Menu Principal
            </p>
          )}

          {links.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-xl font-medium text-sm transition-all relative group ${
                  collapsed
                    ? "justify-center p-3"
                    : "gap-3 px-3.5 py-2.5"
                } ${
                  active
                    ? "bg-ocre text-indigo-deep font-bold shadow-md shadow-ocre/20"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span>{item.icon}</span>

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          active ? "bg-indigo-deep text-ocre" : "bg-white/15 text-white/80"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Bulle info-bulle en mode rétracté */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-indigo-deep text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10 mt-4">
            {!collapsed && (
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-white/35 mb-2">
                Raccourcis
              </p>
            )}

            <Link
              href="/"
              target="_blank"
              className={`flex items-center rounded-xl text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white transition-all group relative ${
                collapsed ? "justify-center p-3" : "justify-between px-3.5 py-2"
              }`}
              title={collapsed ? "Voir la boutique" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {!collapsed && <span>Voir la vitrine</span>}
              </div>
              {!collapsed && <span className="text-white/40">↗</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-indigo-deep text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Voir la vitrine ↗
                </span>
              )}
            </Link>

            <Link
              href="/catalogue"
              target="_blank"
              className={`flex items-center rounded-xl text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white transition-all group relative ${
                collapsed ? "justify-center p-3" : "justify-between px-3.5 py-2"
              }`}
              title={collapsed ? "Catalogue public" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {!collapsed && <span>Catalogue public</span>}
              </div>
              {!collapsed && <span className="text-white/40">↗</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-indigo-deep text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Catalogue public ↗
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer / Déconnexion uniquement */}
        <div className="p-3 border-t border-white/10 bg-indigo-deep/50">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors border border-red-400/20 ${
              collapsed ? "justify-center p-2.5" : "justify-center gap-2 py-2.5"
            }`}
            title="Se déconnecter"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
