import { signOut } from "@/lib/astro-compat";

export default function SignOutButton() {
  return <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-indigo/70 underline">Déconnexion</button>;
}
