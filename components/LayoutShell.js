"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { formatPhone } from "@/lib/format";

export default function LayoutShell({ children, numbers = [] }) {
  const pathname = usePathname();
  const isSpecial = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  if (isSpecial) {
    return <div className="flex-1 min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#0A1230] dark:bg-[#020710] text-white">
        <div className="wrap py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-fond-sombre.svg"
                alt="Cissé-multi-service"
                width="110"
                height="40"
                className="h-8 sm:h-9 w-auto"
              />
              <p className="mt-2 max-w-sm text-xs sm:text-sm text-white/75 leading-relaxed">
                Sacs, montres, écouteurs et accessoires de qualité. Commandez directement sur WhatsApp en toute simplicité.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ocre">Contact WhatsApp</span>
              <div className="flex flex-wrap gap-2">
                {numbers.map((n) => (
                  <a
                    key={n}
                    href={`https://wa.me/${n}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full border border-white/30 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors hover:bg-white/10 hover:border-white/50"
                  >
                    WhatsApp {formatPhone(n)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-white/10 pt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-white/50">
            <p>© {new Date().getFullYear()} Cissé-multi-service · Bamako, Mali</p>
            <p className="text-[11px] text-white/40">Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </>
  );
}
