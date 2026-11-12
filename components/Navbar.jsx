import { useState, useEffect } from "react";
import { Link, usePathname } from "@/lib/astro-compat";
import OrderDrawer from "@/components/OrderDrawer";
import { getOrderItems } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/qui-sommes-nous", label: "Boutique" },
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
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [orderPhone, setOrderPhone] = useState(import.meta.env.PUBLIC_WHATSAPP_1 || "22362823995");
  const pathname = usePathname();

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

  useEffect(() => {
    const openOrder = (event) => {
      if (event.detail?.phone) setOrderPhone(event.detail.phone);
      setOrderDrawerOpen(true);
    };
    window.addEventListener("cisse_open_order", openOrder);
    return () => window.removeEventListener("cisse_open_order", openOrder);
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0E1530]/95 pt-[env(safe-area-inset-top,0px)] shadow-sm shadow-black/10 backdrop-blur-xl lg:pt-0">
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-1 px-3 sm:gap-3 sm:px-6 lg:h-[76px] lg:px-8">

        {/* ── Logo + Nom (gauche toute) ── */}
        <Link
          href="/"
          aria-label="Cissé Multi-Service, accueil"
          className="group flex min-h-11 shrink-0 items-center gap-1.5 transition-opacity hover:opacity-90 sm:gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-blanc.svg"
            alt=""
            width="36"
            height="36"
            className="h-8 w-8 rounded-lg shadow-sm transition group-hover:brightness-110 sm:h-10 sm:w-10"
          />
          <div className="leading-tight">
            <span className="block font-titre text-xs font-extrabold tracking-tight text-white sm:text-base">
              Cissé Multi-Service
            </span>
            <span className="block text-[9px] font-medium uppercase tracking-wider text-ocre sm:text-xs">
              Boutique en ligne
            </span>
          </div>
        </Link>

        {/* ── Nav desktop (centre) ── */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex" aria-label="Navigation principale">
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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90 lg:h-9 lg:w-9"
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

          <button
            type="button"
            onClick={() => setOrderDrawerOpen(true)}
            aria-label={`Ma commande${orderCount > 0 ? `, ${orderCount} article${orderCount === 1 ? "" : "s"}` : ""}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-ocre px-2 text-xs font-bold text-indigo-deep shadow-md transition hover:bg-yellow-500 active:scale-95 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="hidden h-4 w-4 shrink-0 min-[380px]:block">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            <span>Ma commande</span>
            {orderCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
                {orderCount}
              </span>
            )}
          </button>

          {/* Bouton Ma Commande — desktop */}
          <button
            type="button"
            onClick={() => setOrderDrawerOpen(true)}
            className="relative hidden lg:inline-flex min-h-11 items-center gap-2 rounded-full bg-ocre hover:bg-yellow-500 active:scale-95 px-5 py-2 text-sm font-bold text-indigo-deep shadow-md transition-all duration-200 hover:shadow-lg"
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

        </div>
      </div>

      {/* ── Slide-over Tiroir de commande ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid min-h-12 grid-cols-3 border-t border-white/15 bg-indigo-deep px-2 pb-[env(safe-area-inset-bottom,0px)] pt-1 text-white backdrop-blur-xl lg:hidden" aria-label="Navigation mobile">
        <a
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-center text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre ${pathname === "/" ? "text-ocre" : "text-white/90"}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />
          </svg>
          <span>Accueil</span>
          {pathname === "/" && <span aria-hidden="true" className="absolute bottom-1 h-0.5 w-8 rounded-full bg-ocre" />}
        </a>
        <a
          href="/catalogue"
          aria-current={pathname === "/catalogue" ? "page" : undefined}
          className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-center text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre ${pathname === "/catalogue" ? "text-ocre" : "text-white/90"}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Catalogue</span>
          {pathname === "/catalogue" && <span aria-hidden="true" className="absolute bottom-1 h-0.5 w-8 rounded-full bg-ocre" />}
        </a>
        <button
          type="button"
          onClick={() => setOrderDrawerOpen(true)}
          aria-label={`Ma commande${orderCount > 0 ? `, ${orderCount} article${orderCount === 1 ? "" : "s"}` : ""}`}
          className="relative flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-center text-base font-semibold text-white/90 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span>Commande</span>
          {orderCount > 0 && (
            <span className="absolute right-1/4 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-ocre px-1 text-[11px] font-extrabold text-indigo-deep">
              {orderCount}
            </span>
          )}
        </button>
      </nav>
      <OrderDrawer
        isOpen={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        phone={orderPhone}
      />
    </header>
  );
}
