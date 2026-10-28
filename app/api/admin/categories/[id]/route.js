import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/guard";

const unauthorized = () => NextResponse.json({ error: "Non autorisé" }, { status: 401 });

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const name = String((await req.json()).name || "").trim();
    if (!name || !mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    await connectDB();
    await Category.findByIdAndUpdate(params.id, { name }); // le slug reste stable
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return unauthorized();
  try {
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    await connectDB();
    if (await Product.exists({ category: params.id })) {
      return NextResponse.json({ error: "Cette catégorie contient encore des produits." }, { status: 409 });
    }
    await Category.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
