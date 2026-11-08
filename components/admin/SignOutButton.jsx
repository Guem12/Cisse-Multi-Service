import { signOut } from "@/lib/astro-compat";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="sidebar-signout flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-red-400/15 hover:text-red-100"
    >
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="nav-label">Déconnexion</span>
    </button>
  );
}
