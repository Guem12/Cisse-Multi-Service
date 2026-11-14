import { useState, useEffect, useRef, useCallback } from "react";
import { Link, usePathname } from "@/lib/astro-compat";
import OrderDrawer from "@/components/OrderDrawer";
import { getOrderItems } from "@/lib/cart";
import { waLink } from "@/lib/store";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/qui-sommes-nous", label: "Boutique" },
];
const MOBILE_MENU_FOCUS_KEY = "cisse-mobile-menu-focus";

function NavLink({ href, label, onClick, mobile = false, menuOpen = false }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={mobile
        ? `relative flex h-14 w-full items-center border-b border-white/10 px-4 text-lg font-semibold transition-colors duration-200 motion-reduce:transition-none ${active ? "text-ocre" : "text-white hover:bg-white/5"}`
        : `relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 select-none ${active ? "bg-white/20 text-white shadow-inner ring-1 ring-white/40" : "text-white/70 hover:bg-white/10 hover:text-white active:scale-95"}`
      }
      aria-current={active ? "page" : undefined}
      tabIndex={mobile && !menuOpen ? -1 : undefined}
    >
      {mobile && (
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-[3px] bg-ocre transition-opacity duration-200 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {label}
      {!mobile && active && (
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileOrderButtonRef = useRef(null);
  const desktopOrderButtonRef = useRef(null);
  const desktopNavRef = useRef(null);
  const menuPanelRef = useRef(null);
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
    try {
      if (sessionStorage.getItem(MOBILE_MENU_FOCUS_KEY) !== "true") return;
      sessionStorage.removeItem(MOBILE_MENU_FOCUS_KEY);
      menuButtonRef.current?.focus({ preventScroll: true });
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

  const openOrderDrawer = useCallback(() => {
    setOrderDrawerOpen(true);
    window.requestAnimationFrame(() => {
      document.querySelector("header.sticky aside button[aria-label='Fermer']")?.focus({ preventScroll: true });
    });
  }, []);

  const closeOrderDrawer = useCallback(() => {
    setOrderDrawerOpen(false);
    window.requestAnimationFrame(() => {
      const returnTarget = window.innerWidth >= 768
        ? desktopOrderButtonRef.current
        : mobileOrderButtonRef.current;
      returnTarget?.focus({ preventScroll: true });
    });
  }, []);

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

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeMenuAfterNavigation = useCallback((event) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      try {
        sessionStorage.setItem(MOBILE_MENU_FOCUS_KEY, "true");
      } catch (e) {}
    }
    closeMobileMenu();
  }, [closeMobileMenu]);

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) closeMobileMenu();
    else openMobileMenu();
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuPanelRef.current?.querySelector("a, button")?.focus({ preventScroll: true });

    const handleMenuKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = menuPanelRef.current?.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const closeOnDesktopResize = () => {
      if (window.innerWidth >= 768) closeMobileMenu();
    };

    window.addEventListener("keydown", handleMenuKeyDown);
    window.addEventListener("resize", closeOnDesktopResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleMenuKeyDown);
      window.removeEventListener("resize", closeOnDesktopResize);
      if (window.innerWidth >= 768) {
        desktopNavRef.current?.querySelector("a")?.focus({ preventScroll: true });
      } else {
        menuButtonRef.current?.focus({ preventScroll: true });
      }
    };
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0E1530] pt-[env(safe-area-inset-top,0px)] shadow-sm shadow-black/10 md:pt-0">
      <div className="relative mx-auto flex h-[60px] w-full max-w-7xl items-center justify-between gap-3 px-4 md:h-[76px] md:px-8">
        <Link
          href="/"
          aria-label="Cissé Multi-Service, accueil"
          className="group flex min-h-11 min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-90 md:flex-none md:gap-3"
        >
          <img
            src="/icon-blanc.svg"
            alt=""
            width="36"
            height="36"
            className="h-9 w-9 shrink-0 rounded-lg shadow-sm transition group-hover:brightness-110 md:h-10 md:w-10"
          />
          <div className="min-w-0 leading-tight">
            <span className="block truncate whitespace-nowrap font-titre text-base font-bold tracking-tight text-white">
              Cissé Multi-Service
            </span>
            <span className="block truncate whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-ocre">
              Boutique en ligne
            </span>
          </div>
        </Link>

        <nav ref={desktopNavRef} className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>

        {/* ── Actions (droite) ── */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Toggle thème */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
            title={dark ? "Mode jour" : "Mode nuit"}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white motion-reduce:transition-none md:flex"
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
            ref={mobileOrderButtonRef}
            type="button"
            onClick={openOrderDrawer}
            aria-label="Ma commande"
            title={`Ma commande${orderCount > 0 ? `, ${orderCount} article${orderCount === 1 ? "" : "s"}` : ""}`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre motion-reduce:transition-none md:hidden"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            {orderCount > 0 && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ocre px-1 text-[11px] font-black text-indigo-deep">
                {orderCount}
              </span>
            )}
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="navigation-mobile-menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre motion-reduce:transition-none md:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <button
            ref={desktopOrderButtonRef}
            type="button"
            onClick={openOrderDrawer}
            className="relative hidden min-h-11 items-center gap-2 rounded-full bg-ocre px-5 py-2 text-sm font-bold text-indigo-deep shadow-md transition-all duration-200 hover:bg-yellow-500 hover:shadow-lg active:scale-95 motion-reduce:transition-none md:inline-flex"
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

      <div
        id="navigation-mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className={`fixed inset-0 z-[60] transition-opacity duration-200 motion-reduce:transition-none md:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
          <button
            type="button"
            tabIndex={mobileMenuOpen ? 0 : -1}
            onClick={closeMobileMenu}
            aria-label="Fermer le menu"
            className="absolute inset-0 h-full w-full bg-black/60"
          />
          <aside
            ref={menuPanelRef}
            role="dialog"
            aria-modal={mobileMenuOpen ? "true" : undefined}
            aria-label="Menu de navigation"
            className={`absolute bottom-0 right-0 top-[calc(60px+env(safe-area-inset-top,0px))] flex w-full max-w-sm flex-col bg-[#0E1530] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-transform duration-200 motion-reduce:transition-none ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex-1 overflow-y-auto px-4">
              <nav aria-label="Navigation mobile">
                <NavLink href="/" label="Accueil" mobile menuOpen={mobileMenuOpen} onClick={closeMenuAfterNavigation} />
                <NavLink href="/catalogue" label="Catalogue" mobile menuOpen={mobileMenuOpen} onClick={closeMenuAfterNavigation} />
                <button
                  type="button"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => {
                    closeMobileMenu();
                    openOrderDrawer();
                  }}
                  className="flex h-14 w-full items-center justify-between border-b border-white/10 px-4 text-left text-lg font-semibold text-white transition-colors duration-200 hover:bg-white/5 motion-reduce:transition-none"
                >
                  <span>Ma commande</span>
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-ocre px-1.5 text-sm font-bold text-indigo-deep">
                    {orderCount}
                  </span>
                </button>
              </nav>
              <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4">
                <span className="text-base font-semibold text-white">Thème</span>
                <button
                  type="button"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  role="switch"
                  aria-label="Thème sombre"
                  aria-checked={dark}
                  onClick={toggleTheme}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre motion-reduce:transition-none ${dark ? "bg-ocre" : "bg-white/25"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none ${dark ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
            <div className="px-4 py-4">
              <a
                href={waLink(orderPhone)}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={closeMobileMenu}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 text-base font-bold text-white transition-colors duration-200 hover:bg-[#0d6e63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre motion-reduce:transition-none"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.76-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Commander sur WhatsApp
              </a>
            </div>
          </aside>
      </div>
      <OrderDrawer
        isOpen={orderDrawerOpen}
        onClose={closeOrderDrawer}
        phone={orderPhone}
      />
    </header>
  );
}
