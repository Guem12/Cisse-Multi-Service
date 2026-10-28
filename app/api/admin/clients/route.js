import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { getClients, createClient } from "@/lib/clients";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const clients = await getClients();
  return NextResponse.json({ clients });
}

export async function POST(req) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Le nom et le numéro de téléphone sont obligatoires." }, { status: 400 });
    }
    const client = await createClient(body);
    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    console.error("Erreur création client:", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
