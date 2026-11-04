import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";
import { makeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

// GET /api/admin/products
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    await initDb();
    const rows = await prisma.product.findMany({
      where: {},
      orderBy: { id: "asc" },
      include: { category: true },
    });
    const products = rows.map((r) => ({
      _id: r.id,
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: Number(r.price),
      stock: r.stock,
      images: JSON.parse(r.images || "[]"),
      category: { _id: r.categoryId, name: r.category?.name || "", slug: r.category?.slug || "" },
      active: r.active,
    }));
    return Response.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return Response.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 });
  }
}

// POST /api/admin/products
export async function POST(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await request.json();
    const { name, description, price, stock, category, active, images } = body;
    if (!name || !price || !category) {
      return Response.json({ error: "Nom, prix et catégorie sont requis" }, { status: 400 });
    }

    await initDb();
    const categoryId = typeof category === "string" ? category : category?._id || category?.slug;
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    let finalCategoryId = categoryId;
    if (!existing) {
      const upserted = await prisma.category.upsert({
        where: { slug: typeof category === "string" ? category : category.slug },
        create: {
          name: typeof category === "string" ? category : category.name,
          slug: typeof category === "string" ? category : category.slug,
        },
        update: {
          name: typeof category === "string" ? category : category.name,
        },
      });
      finalCategoryId = upserted.id;
    }

    const rawSlug = makeSlug(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug: rawSlug } });
    const productSlug = existingSlug ? `${rawSlug}-${Date.now()}` : rawSlug;

    const row = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        description,
        price: Number(price),
        stock: Number(stock),
        images: JSON.stringify(images || []),
        categoryId: finalCategoryId,
        active: active !== undefined ? active : true,
      },
      include: { category: true },
    });
    return Response.json({
      success: true,
      product: {
        _id: row.id,
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
    console.error("POST /api/admin/products error:", error);
    return Response.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
