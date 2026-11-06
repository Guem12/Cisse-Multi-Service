import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";

export const dynamic = "force-dynamic";

// GET /api/admin/categories/[id]
export async function GET(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    await initDb();
    const id = params.id;
    const row = await prisma.category.findUnique({ where: { id } });
    if (!row) {
      return Response.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }
    return Response.json({
      success: true,
      category: { id: row.id, name: row.name, slug: row.slug, active: row.active },
    });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] error:", error);
    return Response.json({ error: "Erreur lors de la récupération de la catégorie" }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const { name, slug, active } = body;
    if (!name) {
      return Response.json({ error: "Le nom est obligatoire" }, { status: 400 });
    }

    await initDb();
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }
    const slugValue = slug || existing.slug;
    const slugCheck = await prisma.category.findUnique({ where: { slug: slugValue } });
    let finalSlug = slugValue;
    if (slugCheck && slugCheck.id !== id) {
      finalSlug = `${slugValue}-${Date.now()}`;
    }
    const row = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        active: active !== undefined ? active : existing.active,
      },
    });
    return Response.json({
      success: true,
      category: { id: row.id, name: row.name, slug: row.slug, active: row.active },
    });
  } catch (error) {
    console.error("PUT /api/admin/categories/[id] error:", error);
    return Response.json({ error: "Erreur lors de la mise à jour de la catégorie" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    await initDb();
    const row = await prisma.category.delete({ where: { id } });
    return Response.json({ success: true, category: { id: row.id, name: row.name, slug: row.slug, active: row.active } });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    if (error.code === "P2025") {
      return Response.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }
    return Response.json({ error: "Erreur lors de la suppression de la catégorie" }, { status: 500 });
  }
}
