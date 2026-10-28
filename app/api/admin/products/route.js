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

    const product = await createProduct(data);
    // Alerte SMS stock (non bloquante, hors temps de réponse)
    notifyStockAlertAsync(product);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/products error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la création du produit" }, { status: 500 });
  }
}
