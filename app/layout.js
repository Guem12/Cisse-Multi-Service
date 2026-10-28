import { Bricolage_Grotesque, Figtree } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

const titre = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-titre", display: "swap" });
const main = Figtree({ subsets: ["latin"], variable: "--font-main", display: "swap" });

export const metadata = {
  title: "Cissé-multi-service",
  description: "Sacs à dos, écouteurs sans fil, montres, bandoulières, cagoules et bijoux. Commande par WhatsApp.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({ children }) {
  const envNumbers = [process.env.NEXT_PUBLIC_WHATSAPP_1, process.env.NEXT_PUBLIC_WHATSAPP_2].filter(Boolean);
  const numbers = envNumbers.length > 0 ? envNumbers : ["22362823995", "22373082453"];

  return (
    <html lang="fr" suppressHydrationWarning className={`${titre.variable} ${main.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('cisse_theme') === 'dark' || (!localStorage.getItem('cisse_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col transition-colors duration-300" style={{backgroundColor: 'var(--bg-page)', color: 'var(--text-main)'}}>
        <LayoutShell numbers={numbers}>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}