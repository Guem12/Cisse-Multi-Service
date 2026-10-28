import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { deleteClient } from "@/lib/clients";

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await deleteClient(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
