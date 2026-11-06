import { isAdmin } from "@/lib/guard";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero-showcase.json");

// GET /api/admin/hero
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { getHeroShowcase } = await import("@/lib/hero");
    const slots = await getHeroShowcase();
    return Response.json({ success: true, slots });
  } catch (error) {
    console.error("GET /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de la récupération du héros" }, { status: 500 });
  }
}

// POST /api/admin/hero
export async function POST(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await request.json();
    const { slots } = body;
    
    if (!Array.isArray(slots) || slots.length !== 4) {
      return Response.json({ error: "4 slots requis" }, { status: 400 });
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(HERO_FILE, JSON.stringify(slots, null, 2), "utf-8");
    
    return Response.json({ success: true, slots });
  } catch (error) {
    console.error("POST /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de la sauvegarde du héros" }, { status: 500 });
  }
}
