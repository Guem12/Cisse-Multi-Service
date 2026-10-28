import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { isAdmin } from "@/lib/guard";
import { uniqueSlug } from "@/lib/slug";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const name = String((await req.json()).name || "").trim();
    if (!name) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
    await connectDB();
    const category = await Category.create({ name, slug: await uniqueSlug(Category, name) });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
