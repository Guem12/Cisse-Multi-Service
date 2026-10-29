import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { getProductById, updateProduct, deleteProduct } from "@/lib/data";

export async function GET(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (e) {
    console.error("GET /api/admin/products/[id] error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const rawData = await req.json();
    const result = await updateProduct(params.id, rawData);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, product: result });
  } catch (e) {
    console.error("PUT /api/admin/products/[id] error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const result = await deleteProduct(params.id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Produit supprimé" });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id] error:", e);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
