import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json({ categories: await getCategories() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
