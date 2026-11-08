import { isAdmin } from "@/lib/guard";
import { getProducts } from "@/lib/data.js";
import { getHeroShowcase, saveHeroShowcase } from "@/lib/hero.js";

export const dynamic = "force-dynamic";

// GET /api/admin/hero
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const products = await getProducts();
    const slots = await getHeroShowcase(products);
    return Response.json({ success: true, slots });
  } catch (error) {
    console.error("GET /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de la récupération des produits mis en avant" }, { status: 500 });
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

    const products = await getProducts();
    const activeProducts = new Map(products.map((product) => [String(product._id), product]));
    const normalizedSlots = slots.map((slot, index) => {
      const productId = String(slot?.productId || "");
      const product = activeProducts.get(productId);
      const imageIndex = Number(slot?.imageIndex ?? 0);
      const images = product?.images || [];
      if (!product || !Number.isInteger(imageIndex) || !images[imageIndex]) return null;
      return { slot: index, productId, imageIndex };
    });
    const selectedIds = normalizedSlots.map((slot) => slot?.productId || "");
    if (
      new Set(selectedIds).size !== slots.length ||
      normalizedSlots.some((slot) => !slot)
    ) {
      return Response.json(
        { error: "Chaque emplacement doit contenir un produit actif différent avec une photo valide." },
        { status: 400 },
      );
    }
    const savedSlots = await saveHeroShowcase(normalizedSlots);
    return Response.json({ success: true, slots: savedSlots });
  } catch (error) {
    console.error("POST /api/admin/hero error:", error);
    return Response.json({ error: "Erreur lors de l’enregistrement des produits mis en avant" }, { status: 500 });
  }
}
