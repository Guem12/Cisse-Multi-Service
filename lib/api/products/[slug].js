import { prisma, initDb } from "@/lib/postgres";

export const dynamic = "force-dynamic";

// GET /api/products/[slug]
export async function GET(request, { params }) {
  try {
    await initDb();
    const slug = params.slug;
    const row = await prisma.product.findFirst({
      where: { slug, active: true },
      include: { category: true },
    });
    if (!row) {
      return Response.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    return Response.json({
      success: true,
      product: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: Number(row.price),
        stock: row.stock,
        images: JSON.parse(row.images || "[]"),
        category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" },
        active: row.active,
      },
    });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
