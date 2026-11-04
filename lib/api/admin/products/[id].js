import { isAdmin } from "@/lib/guard";
import { prisma, initDb } from "@/lib/postgres";
import { makeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

// GET /api/admin/products/[id]
export async function GET(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    await initDb();
    const id = params.id;
    const row = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!row) {
      return Response.json({ error: "Produit non trouvé" }, { status: 404 });
    }
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
    console.error("GET /api/admin/products/[id] error:", error);
    return Response.json({ error: "Erreur lors de la récupération du produit" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const { name, description, price, stock, category, active, images } = body;
    if (!name || !price || !category) {
      return Response.json({ error: "Nom, prix et catégorie sont requis" }, { status: 400 });
    }

    await initDb();
    const categoryId = typeof category === "string" ? category : category?._id || category?.slug;
    const existingCat = await prisma.category.findUnique({ where: { id: categoryId } });
    let finalCategoryId = categoryId;
    if (!existingCat) {
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
    let targetSlug = rawSlug;
    const existingSlug = await prisma.product.findUnique({ where: { slug: targetSlug } });
    const productSlug = existingSlug && existingSlug.id !== id ? `${targetSlug}-${Date.now()}` : targetSlug;

    const row = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images: JSON.stringify(images || []),
        categoryId: finalCategoryId,
        active: active !== undefined ? active : true,
        slug: productSlug,
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
    console.error("PUT /api/admin/products/[id] error:", error);
    return Response.json({ error: "Erreur lors de la mise à jour du produit" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    await initDb();
    const row = await prisma.product.delete({ where: { id } });
    return Response.json({ success: true, product: row });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    if (error.code === "P2025") {
      return Response.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    return Response.json({ error: "Erreur lors de la suppression du produit" }, { status: 500 });
  }
}
