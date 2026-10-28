import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Page introuvable</h1>
      <p className="mt-2 text-indigo/70">Ce produit n'existe plus ou le lien est incorrect.</p>
      <Link href="/catalogue" className="btn-primary mt-6 inline-block">Voir le catalogue</Link>
    </div>
  );
}
