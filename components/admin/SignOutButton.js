"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-indigo/70 underline">Déconnexion</button>;
}
