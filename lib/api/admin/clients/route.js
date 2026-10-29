import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { query, queryOne, queryExec } from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const clients = await query("SELECT * FROM clients ORDER BY created_at DESC");
    return NextResponse.json({ clients: clients.rows });
  } catch (e) {
    console.error("Erreur clients:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    // Logique d'ajout client
    return NextResponse.json({ success: true, message: "Client ajouté" });
  } catch (e) {
    console.error("Erreur POST clients:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
