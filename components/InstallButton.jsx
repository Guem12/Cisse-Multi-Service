import { useState, useEffect } from "react";

const IOS_DISMISSED_KEY = "cisse_pwa_ios_dismissed";

function checkIsStandalone() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    (typeof document !== "undefined" && document.referrer.includes("android-app://"))
  );
}

function checkIsIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(ua);
  const isIpadOs = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return isIosDevice || isIpadOs;
}

export default function InstallButton({ variant = "drawer", className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIosNotice, setShowIosNotice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Si déjà en mode standalone, ne rien afficher du tout
    if (checkIsStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 2. Gestion Android / Chromium / Desktop (beforeinstallprompt)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setShowIosNotice(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 3. Gestion iPhone / Safari
    if (checkIsIos()) {
      let isDismissed = false;
      try {
        isDismissed = localStorage.getItem(IOS_DISMISSED_KEY) === "true";
      } catch (err) {
        // En cas d'erreur localStorage (mode privé strict), ne pas bloquer
      }

      if (!isDismissed) {
        setShowIosNotice(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setCanInstall(false);
      }
    } catch (err) {
      console.warn("Erreur lors de l'invite d'installation:", err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismissIos = () => {
    try {
      localStorage.setItem(IOS_DISMISSED_KEY, "true");
    } catch (err) {}
    setShowIosNotice(false);
  };

  // Rendu Android / Chrome : Bouton "Installer l'application"
  if (canInstall) {
    const isFooter = variant === "footer";
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Installer l'application Cissé Multi-Service sur votre appareil"
          className={
            isFooter
              ? "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:border-ocre hover:bg-ocre/10 hover:text-ocre focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre"
              : "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-ocre/40 bg-ocre/10 px-4 py-2.5 text-sm font-bold text-ocre transition-all hover:bg-ocre hover:text-indigo-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocre"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Installer l’application</span>
        </button>
      </div>
    );
  }

  // Rendu iOS / Safari : Encart d'aide à l'installation
  if (showIosNotice) {
    const isFooter = variant === "footer";
    return (
      <div
        className={`relative rounded-2xl border border-white/15 bg-white/5 p-3.5 text-xs text-white/80 shadow-md ${
          isFooter ? "max-w-sm" : "w-full"
        } ${className}`}
        role="region"
        aria-label="Installation sur iPhone"
      >
        <button
          type="button"
          onClick={handleDismissIos}
          aria-label="Fermer l'encart d'installation"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p className="font-semibold text-white pr-5">Installer l’application :</p>
        <p className="mt-1 leading-relaxed">
          Touchez <span className="inline-flex items-center gap-0.5 font-bold text-ocre">Partager <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline h-3.5 w-3.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span>, puis <span className="font-bold text-white">« Sur l’écran d’accueil »</span>.
        </p>
      </div>
    );
  }

  return null;
}
