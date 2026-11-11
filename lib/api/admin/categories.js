import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";
import { makeSlug } from "@/lib/slug.js";

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
      images: JSON.parse(r.images || "[]"),
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
    const inputCategories = Array.isArray(body.categories)
      ? body.categories
      : [{ name: body.name, images: body.images }];
    if (!inputCategories.length || inputCategories.length > 20) {
      return Response.json({ error: "Ajoutez entre 1 et 20 catégories à la fois." }, { status: 400 });
    }

    const categoriesToCreate = inputCategories.map((item) => ({
      name: String(item?.name || "").trim(),
      images: Array.isArray(item?.images)
        ? item.images.filter((image) => typeof image?.url === "string" && image.url).slice(0, 1)
        : [],
    }));
    if (categoriesToCreate.some((item) => !item.name || !makeSlug(item.name))) {
      return Response.json({ error: "Chaque catégorie doit avoir un nom valide." }, { status: 400 });
    }
    const names = categoriesToCreate.map((item) => makeSlug(item.name));
    if (new Set(names).size !== names.length) {
      return Response.json({ error: "Les catégories ajoutées doivent avoir des noms différents." }, { status: 400 });
    }

    await initDb();
    const existingSlugs = new Set(
      (await prisma.category.findMany({ select: { slug: true } })).map((category) => category.slug),
    );
    const rows = categoriesToCreate.map((item) => {
      const baseSlug = makeSlug(item.name);
      let slug = baseSlug;
      let suffix = 2;
      while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
      existingSlugs.add(slug);
      return { name: item.name, slug, images: JSON.stringify(item.images) };
    });
    await prisma.category.createMany({ data: rows });
    const createdRows = await prisma.category.findMany({ where: { slug: { in: rows.map((row) => row.slug) } } });
    const createdBySlug = new Map(createdRows.map((row) => [row.slug, row]));
    const created = rows.map((row) => createdBySlug.get(row.slug)).filter(Boolean);
    return Response.json({
      success: true,
      categories: created.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        images: JSON.parse(row.images || "[]"),
        active: row.active,
      })),
    });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return Response.json({ error: "Erreur lors de la création de la catégorie" }, { status: 500 });
  }
}
