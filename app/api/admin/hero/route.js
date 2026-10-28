import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { getHeroShowcase, saveHeroShowcase } from "@/lib/hero";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const slots = await getHeroShowcase();
  return NextResponse.json({ slots });
}

export async function POST(req) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { slots } = await req.json();
    if (!slots || !Array.isArray(slots) || slots.length !== 4) {
      return NextResponse.json({ error: "4 emplacements requis." }, { status: 400 });
    }
    const saved = await saveHeroShowcase(slots);
    return NextResponse.json({ success: true, slots: saved });
  } catch (err) {
    console.error("Erreur sauvegarde hero showcase:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
