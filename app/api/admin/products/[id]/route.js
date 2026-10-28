import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { cleanProduct } from "@/lib/products";
import { deleteImage } from "@/lib/cloudinary";
import { updateProduct, deleteProduct, getProductById } from "@/lib/data";
import { notifyStockAlertAsync, forgetStockAlert } from "@/lib/stock-alerts";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Non autorisé" }, { status: 401 });
const dropImages = (images = []) =>
  Promise.all(images.filter((i) => i.publicId).map((i) => deleteImage(i.publicId).catch(() => {})));

// PUT /api/admin/products/[id]
export async function PUT(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const rawData = await req.json();
    const data = cleanProduct(rawData);
    if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

    const existing = await getProductById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // Supprimer les images Cloudinary qui ont été retirées
    if (existing.images && Array.isArray(existing.images) && data.images) {
      const kept = new Set(data.images.map((i) => i.publicId).filter(Boolean));
      await dropImages(existing.images.filter((i) => i.publicId && !kept.has(i.publicId)));
    }

    const product = await updateProduct(params.id, data);
    // Alerte SMS stock (non bloquante, hors temps de réponse)
    notifyStockAlertAsync(product || { ...existing, ...data });
    return NextResponse.json({ success: true, product });
  } catch (e) {
    console.error("PUT /api/admin/products/[id] error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const existing = await getProductById(params.id);
    if (existing?.images) {
      await dropImages(existing.images);
    }
    await deleteProduct(params.id);
    // Un produit supprimé ne doit plus déclencher d'alerte : on oublie son suivi.
    forgetStockAlert(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id] error:", e);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
  }
}
