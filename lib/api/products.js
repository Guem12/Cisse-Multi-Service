import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorie");

    const where = { active: true };
    if (categorySlug) where.category = { slug: categorySlug };
    const rows = await prisma.product.findMany({
      where,
      orderBy: { id: "asc" },
      select: { id: true, name: true, slug: true, stock: true },
    });
    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      stock: r.stock,
    }));

    return Response.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
