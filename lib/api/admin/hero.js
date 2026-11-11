import { isAdmin } from "@/lib/guard";
import { getProducts } from "@/lib/data.js";
import { getHeroSelection, saveHeroSelection } from "@/lib/hero.js";

export const dynamic = "force-dynamic";

// GET /api/admin/hero
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const products = await getProducts();
    const selection = await getHeroSelection(products);
    return Response.json({ success: true, selection });
  } catch (error) {
    console.error("GET /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de la récupération du produit à la une" }, { status: 500 });
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
    const { selection } = body;
    const productId = String(selection?.productId || "");
    const imageIndex = Number(selection?.imageIndex ?? 0);

    const products = await getProducts();
    const product = products.find((item) => String(item._id || item.id) === productId);
    if (!product || !Number.isInteger(imageIndex) || !product.images?.[imageIndex]?.url) {
      return Response.json(
        { error: "Choisissez un produit actif et une photo valide." },
        { status: 400 },
      );
    }
    const savedSelection = await saveHeroSelection({ productId, imageIndex });
    return Response.json({ success: true, selection: savedSelection });
  } catch (error) {
    console.error("POST /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de l’enregistrement du produit à la une" }, { status: 500 });
  }
}
