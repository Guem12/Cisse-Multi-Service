"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.target);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      setBusy(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <>
      <style>{`
        @keyframes grid-fade {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.75; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .admin-login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #060C1E 0%, #0A1128 50%, #0E1530 100%);
          padding: 24px 16px;
        }
        .admin-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: grid-fade 6s ease-in-out infinite;
        }
        .orb-1 {
          position: absolute;
          top: 25%; left: 15%;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: rgba(99,102,241,0.07);
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-2 {
          position: absolute;
          bottom: 20%; right: 15%;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: rgba(224,160,48,0.06);
          filter: blur(70px);
          pointer-events: none;
        }
        .float-badge {
          animation: float-badge 4s ease-in-out infinite;
        }
        .glass-card {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          background: rgba(13, 20, 40, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          z-index: 10;
        }
        .top-bar {
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #E0A030, #10b981);
        }
        .input-admin {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #F0F2FA;
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .input-admin::placeholder { color: rgba(255,255,255,0.22); }
        .input-admin:focus {
          border-color: rgba(224,160,48,0.6);
          background: rgba(224,160,48,0.05);
          box-shadow: 0 0 0 3px rgba(224,160,48,0.10);
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.28);
          pointer-events: none;
        }
        .btn-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          padding: 14px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(135deg, #E0A030, #c8901f);
          color: #0E1530;
          box-shadow: 0 6px 24px rgba(224,160,48,0.28);
          margin-top: 8px;
        }
        .btn-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 8px 30px rgba(224,160,48,0.4); }
        .btn-submit:active:not(:disabled) { transform: scale(0.98); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          font-size: 13px;
          font-weight: 500;
        }
        .card-body { padding: 36px 40px; }
        @media (max-width: 480px) { .card-body { padding: 28px 24px; } }
        .card-footer {
          padding: 12px 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lbl { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="admin-login-page">
        <div className="admin-grid" />
        <div className="orb-1" />
        <div className="orb-2" />

        {/* Floating status badge */}
        <div className="float-badge" style={{ position: "absolute", top: "24px", right: "24px", zIndex: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 14px", borderRadius: "999px",
            background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
            backdropFilter: "blur(8px)"
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "grid-fade 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>Système en ligne</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card">
          <div className="top-bar" />

          <div className="card-body">
            {/* Identity */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "64px", height: "64px", borderRadius: "18px", marginBottom: "16px",
                background: "linear-gradient(135deg, #1B2A5C, #0A1128)",
                border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon-blanc.svg" alt="" width="36" height="36" style={{ height: "36px", width: "36px" }} />
              </div>

              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 12px", borderRadius: "999px", marginBottom: "12px",
                  background: "rgba(224,160,48,0.10)", border: "1px solid rgba(224,160,48,0.20)"
                }}>
                  <svg width="12" height="12" fill="#E0A030" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E0A030" }}>
                    Accès Restreint
                  </span>
                </div>
              </div>

              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#F0F2FA", margin: "0 0 4px" }}>
                Espace Administration
              </h1>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Cissé Multi-Service · Panneau de gestion
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Email */}
              <div>
                <span className="lbl">Adresse e-mail</span>
                <div style={{ position: "relative" }}>
                  <svg className="input-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue="admin@cisse.ml"
                    placeholder="admin@cisse.ml"
                    className="input-admin"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <span className="lbl">Mot de passe</span>
                <div style={{ position: "relative" }}>
                  <svg className="input-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="input-admin"
                    style={{ paddingRight: "44px" }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    tabIndex={-1}
                    aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPwd
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-box">
                  <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={busy} className="btn-submit">
                {busy ? (
                  <>
                    <svg className="spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Back */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link href="/" style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", transition: "color 0.2s" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la boutique
              </Link>
            </div>
          </div>

          {/* Card footer */}
          <div className="card-footer">
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} Cissé Multi-Service
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Connexion sécurisée
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060C1E] flex items-center justify-center text-white/50">Chargement…</div>}>
      <LoginContent />
    </Suspense>
  );
}
