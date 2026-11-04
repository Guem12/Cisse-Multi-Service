import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET /api/categories
export async function GET(request) {
  try {
    const categories = await getCategories();
    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
