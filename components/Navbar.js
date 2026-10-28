"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OrderDrawer from "@/components/OrderDrawer";
import { getOrderItems } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
];

function NavLink({ href, label, onClick }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative px-4 py-1.5 rounded-full text-sm font-semibold
        transition-all duration-200 select-none
        ${active
          ? "text-white bg-white/20 ring-1 ring-white/40 shadow-inner"
          : "text-white/70 hover:text-white hover:bg-white/10 active:scale-95"
        }
      `}
      aria-current={active ? "page" : undefined}
    >
      {label}
      {/* Barre active animée en bas */}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-ocre" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    try {
      const isDark =
        localStorage.getItem("cisse_theme") === "dark" ||
        (!localStorage.getItem("cisse_theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cisse_theme", next ? "dark" : "light");
    } catch (e) {}
  };

  useEffect(() => {
    const updateCount = () => {
      const items = getOrderItems();
      const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      setOrderCount(count);
    };
    updateCount();
    window.addEventListener("cisse_order_updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("cisse_order_updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-indigo-deep dark:bg-indigo-deep shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 flex h-14 sm:h-[70px] items-center justify-between gap-4 relative">

        {/* ── Logo + Nom (gauche toute) ── */}
        <Link
          href="/"
          aria-label="Cissé Multi-Service, accueil"
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group transition-transform hover:scale-[1.02]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-blanc.svg"
            alt=""
            width="36"
            height="36"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg shadow group-hover:brightness-110 transition"
          />
          <div className="leading-tight">
            <span className="block font-titre font-extrabold text-white text-sm sm:text-base tracking-tight">
              Cissé Multi-Service
            </span>
            <span className="block text-[10px] sm:text-xs font-medium text-ocre tracking-wider uppercase">
              Boutique en ligne
            </span>
          </div>
        </Link>

        {/* ── Nav desktop (centre) ── */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-1" aria-label="Navigation principale">
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
            className="sm:hidden h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white active:scale-90 transition-all duration-200"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        {/* ── Actions (droite) ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Toggle thème */}
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
            title={dark ? "Mode jour" : "Mode nuit"}
            className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white active:scale-90 transition-all duration-200"
          >
            {dark ? (
              /* Soleil */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
              </svg>
            ) : (
              /* Lune */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Bouton Ma Commande — desktop */}
          <button
            type="button"
            onClick={() => setOrderDrawerOpen(true)}
            className="relative hidden sm:inline-flex items-center gap-2 rounded-full bg-ocre hover:bg-yellow-500 active:scale-95 px-5 py-2 text-sm font-bold text-indigo-deep shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            <span>Ma Commande</span>
            {orderCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white shadow">
                {orderCount}
              </span>
            )}
          </button>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative sm:hidden h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {!dark ? (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
                title={dark ? "Mode jour" : "Mode nuit"}
                className="sm:hidden absolute top-1 right-1 h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white active:scale-90 transition-all duration-200"
              >
                {dark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ) : (
              <span />
            )}
            {orderCount > 0 && !menuOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ocre px-1 text-[10px] font-black text-indigo-deep">
                {orderCount}
              </span>
            )}
            <span className={`transition-transform duration-300 ${menuOpen ? "rotate-90" : "rotate-0"}`}>
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* ── Menu mobile déroulant ── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="bg-indigo-deep border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-1"
          aria-label="Menu mobile"
        >
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} onClick={() => setMenuOpen(false)} />
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setOrderDrawerOpen(true);
            }}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-ocre hover:bg-yellow-500 active:scale-95 px-5 py-2.5 text-sm font-bold text-indigo-deep transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            <span>Ma Commande</span>
            {orderCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white shadow">
                {orderCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ── Slide-over Tiroir de commande ── */}
      <OrderDrawer
        isOpen={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
      />
    </header>
  );
}
