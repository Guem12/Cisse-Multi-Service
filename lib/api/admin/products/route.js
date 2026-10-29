import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { cleanProduct } from "@/lib/products";
import { createProduct } from "@/lib/data";
import { notifyStockAlertAsync } from "@/lib/stock-alerts";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const rawData = await req.json();
    const data = cleanProduct(rawData);
    if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

    const result = await createProduct(data);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    notifyStockAlertAsync(result);
    return NextResponse.json({ success: true, product: result }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la création du produit" }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const rawData = await req.json();
    const data = cleanProduct(rawData);
    if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

    const result = await updateProduct(data.id, data);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, product: result });
  } catch (e) {
    console.error("PUT /api/admin/products error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    await queryExec("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Produit supprimé" });
  } catch (e) {
    console.error("DELETE /api/admin/products error:", e);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
