import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { query, queryOne, queryExec } from "@/lib/postgres";

export async function GET() {
  try {
    const cats = await query("SELECT id, name, slug, created_at, updated_at FROM categories ORDER BY name ASC");
    return NextResponse.json({ categories: cats.rows });
  } catch (e) {
    console.error("Erreur categories:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
    }

    const existing = await queryOne("SELECT id FROM categories WHERE name = $1", [name.trim()]);
    if (existing) {
      return NextResponse.json({ error: "Cette catégorie existe déjà." }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().normalize("NFD").replace(/[^\w-]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "");

    const result = await queryExec(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug, created_at",
      [name.trim(), slug]
    );

    return NextResponse.json({ category: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("Erreur création catégorie:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id, name } = await req.json();
    if (!id || !name || !String(name).trim()) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const existing = await queryOne("SELECT id FROM categories WHERE id != $1 AND name = $2", [id, name.trim()]);
    if (existing) {
      return NextResponse.json({ error: "Cette catégorie existe déjà." }, { status: 400 });
    }

    await queryExec(
      "UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [name.trim(), id]
    );

    return NextResponse.json({ success: true, message: "Catégorie mise à jour" });
  } catch (e) {
    console.error("Erreur mise à jour catégorie:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await queryExec("DELETE FROM categories WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Catégorie supprimée" });
  } catch (e) {
    console.error("Erreur suppression catégorie:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
