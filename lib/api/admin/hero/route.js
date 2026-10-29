import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    // Si base PostgreSQL, récupérer les settings
    // Sinon fallback
    return NextResponse.json({ success: true, data: { message: "API admin heros" } });
  } catch (e) {
    console.error("Erreur GET /api/admin/hero:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    // Logique de mise à jour des hero items
    return NextResponse.json({ success: true, message: "Mise à jour faite" });
  } catch (e) {
    console.error("Erreur PUT /api/admin/hero:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
