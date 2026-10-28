import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET /api/products?categorie=montres
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const products = await getProducts({ categorySlug: searchParams.get("categorie") || undefined });
    return NextResponse.json({ products });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
