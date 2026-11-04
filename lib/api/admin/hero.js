import { isAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

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
