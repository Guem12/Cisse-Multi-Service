"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";

export default function AdminProfileSettings() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Données du profil administrateur
  const [profile, setProfile] = useState({
    firstName: "Mamadou",
    lastName: "Cissé",
    phone: "22362823995",
    email: "admin@cisse.ml",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  });

  // Champs pour le changement de mot de passe
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Charger le profil réel depuis l'API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            firstName: data.profile.firstName || "Mamadou",
            lastName: data.profile.lastName || "Cissé",
            phone: data.profile.phone || "22362823995",
            email: data.profile.email || "admin@cisse.ml",
            avatar: data.profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          });
        }
      }
    } catch (e) {
      console.warn("Impossible de charger le profil admin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProfile();

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Téléversement d'une nouvelle photo de profil depuis la page "Modifier mes informations"
  const handleAvatarFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("L'image est trop volumineuse (maximum 5 Mo).");
      return;
    }

    try {
      setUploadingAvatar(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du téléversement de la photo.");
      }

      if (data.url) {
        setProfile((prev) => ({ ...prev, avatar: data.url }));
        setSuccessMsg("Photo sélectionnée ! Pensez à enregistrer pour valider.");
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error("Erreur avatar:", err);
      setErrorMsg(err.message || "Erreur lors du chargement de l'image.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sauvegarde des modifications complètes (Photo, Nom, Prénom, Téléphone, Email, Mot de passe)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (passwords.newPassword) {
      if (passwords.newPassword.length < 4) {
        setErrorMsg("Le nouveau mot de passe doit comporter au moins 4 caractères.");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        setErrorMsg("Les deux mots de passe ne correspondent pas.");
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          email: profile.email,
          avatar: profile.avatar,
          password: passwords.newPassword || undefined,
          confirmPassword: passwords.confirmPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      setSuccessMsg("Informations et mot de passe enregistrés avec succès !");
      setPasswords({ newPassword: "", confirmPassword: "" });

      if (data.profile) {
        setProfile((prev) => ({ ...prev, ...data.profile }));
      }

      setTimeout(() => {
        setSuccessMsg("");
        setModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Admin Cissé";

  return (
    <div className="relative" ref={menuRef}>
      {/* BOUTON AVATAR PROFIL (TOUT À DROITE DE LA BARRE D'ADMIN) */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm group select-none cursor-pointer"
        style={{
          borderColor: dropdownOpen ? "#E0A030" : "var(--border)",
          backgroundColor: "var(--bg-subtle)",
        }}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        title="Options du compte administrateur"
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt={fullName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-ocre/40 group-hover:ring-ocre transition-all shadow-sm"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0D1428]" />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold truncate max-w-[120px]" style={{ color: "var(--text-main)" }}>
            {fullName}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Administrateur
          </span>
        </div>

        {/* Chevron animé */}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 hidden sm:block ${
            dropdownOpen ? "rotate-180 text-ocre" : "text-slate-400"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* MENU DÉROULANT DU PROFIL (UNIQUEMENT PROFIL & DÉCONNEXION) */}
      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2.5 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* En-tête profil */}
          <div className="p-4 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={fullName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-ocre shadow"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold truncate" style={{ color: "var(--text-main)" }}>
                  {fullName}
                </p>
                <p className="text-xs truncate text-slate-400">
                  {profile.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-ocre/20 text-ocre border border-ocre/30">
                  Super Administrateur
                </span>
              </div>
            </div>
          </div>

          {/* Option unique : Modifier mes informations */}
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setErrorMsg("");
                setSuccessMsg("");
                setModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 group cursor-pointer"
              style={{ color: "var(--text-main)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-ocre/15 text-ocre shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="block font-bold">Modifier mes informations</span>
                <span className="block text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Photo, nom, téléphone, email & mot de passe
                </span>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Déconnexion */}
          <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}

      {/* PAGE / MODAL « MODIFIER MES INFORMATIONS » (PHOTO, NOM, PRÉNOM, TÉLÉPHONE, EMAIL, MOT DE PASSE) */}
      {modalOpen && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl m-auto rounded-2xl border p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            {/* Input de fichier caché pour le changement de photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleAvatarFile(e.target.files?.[0])}
              className="hidden"
              id="info-avatar-file-upload"
            />

            {/* En-tête de la fenêtre */}
            <div className="flex items-center justify-between pb-4 border-b mb-6" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ocre/15 text-ocre flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-titre text-lg font-bold" style={{ color: "var(--text-main)" }}>
                    Modifier mes informations
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Photo de profil, coordonnées personnelles et mot de passe.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Notification d'erreur */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold flex items-center gap-2">
                <span>⚠</span> {errorMsg}
              </div>
            )}

            {/* Notification de succès */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <span>✓</span> {successMsg}
              </div>
            )}

            {/* FORMULAIRE COMPLET */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* 1. PHOTO DE PROFIL DANS LA PAGE MODIFIER MES INFORMATIONS */}
              <div
                className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 sm:gap-6"
                style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}
              >
                <div className="relative group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"}
                    alt={fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-ocre/60 shadow-md"
                  />
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-ocre border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <label
                      htmlFor="info-avatar-file-upload"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ocre text-indigo-deep flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer ring-2 ring-white dark:ring-[#0D1428]"
                      title="Changer la photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-ocre">
                      Photo de Profil
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed mb-3.5" style={{ color: "var(--text-muted)" }}>
                    Formats acceptés : JPG, PNG ou WebP (taille maximale 5 Mo).
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <label
                      htmlFor="info-avatar-file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-deep bg-ocre hover:bg-ocre/90 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 select-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{uploadingAvatar ? "Téléversement..." : "Changer la photo"}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80" }))}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    >
                      Par défaut
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. INFORMATIONS PERSONNELLES (PRÉNOM & NOM) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ocre mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Identité de l'administrateur
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Prénom *
                    </label>
                    <input
                      required
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      placeholder="Mamadou"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                      style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Nom *
                    </label>
                    <input
                      required
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      placeholder="Cissé"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                      style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. COORDONNÉES (TÉLÉPHONE & EMAIL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-emerald-500">
                    Numéro de Téléphone (WhatsApp) *
                  </label>
                  <input
                    required
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="22362823995"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                  <span className="text-[10px] mt-1 block" style={{ color: "var(--text-faint)" }}>
                    Format international (ex: 22362823995)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Adresse E-mail de connexion *
                  </label>
                  <input
                    required
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="admin@cisse.ml"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                    style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                  />
                  <span className="text-[10px] mt-1 block" style={{ color: "var(--text-faint)" }}>
                    Utilisée pour vous connecter à l'admin
                  </span>
                </div>
              </div>

              {/* 4. SÉCURITÉ & MOT DE PASSE */}
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ocre flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Changer le Mot de passe
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-ocre hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? "Masquer les mots de passe" : "Afficher les mots de passe"}
                  </button>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
                  Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe actuel.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Nouveau mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                      style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-muted)" }}>
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-ocre/40 focus:border-ocre"
                      style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>
              </div>

              {/* BOUTONS D'ACTION CENTRÉS AU MILIEU */}
              <div className="pt-5 border-t flex flex-col sm:flex-row items-center justify-center gap-3" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-bold text-indigo-deep bg-ocre shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-indigo-deep border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer toutes les modifications</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
