import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";

export const dynamic = "force-dynamic";

// GET /api/admin/categories
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    await initDb();
    const rows = await prisma.category.findMany({ orderBy: { id: "asc" } });
    const categories = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      active: r.active,
    }));
    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return Response.json({ error: "Erreur lors de la récupération des catégories" }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await request.json();
    const { name, slug } = body;
    if (!name) {
      return Response.json({ error: "Le nom est obligatoire" }, { status: 400 });
    }

    await initDb();
    const slugValue = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existing = await prisma.category.findUnique({ where: { slug: slugValue } });
    let finalSlug = slugValue;
    if (existing) {
      finalSlug = `${slugValue}-${Date.now()}`;
      await prisma.category.update({ where: { id: existing.id }, data: { slug: finalSlug } });
    }
    const row = await prisma.category.create({
      data: { name, slug: finalSlug },
    });
    return Response.json({
      success: true,
      category: { id: row.id, name: row.name, slug: row.slug, active: row.active },
    });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return Response.json({ error: "Erreur lors de la création de la catégorie" }, { status: 500 });
  }
}
