import { isAdmin } from "@/lib/guard";
import { getClientById, updateClient, deleteClient } from "@/lib/clients";

export const dynamic = "force-dynamic";

// GET /api/admin/clients/[id]
export async function GET(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    const client = await getClientById(id);
    if (!client) {
      return Response.json({ error: "Client non trouvé" }, { status: 404 });
    }
    return Response.json({ success: true, client });
  } catch (error) {
    console.error("GET /api/admin/clients/[id] error:", error);
    return Response.json({ error: "Erreur lors de la récupération du client" }, { status: 500 });
  }
}

// PUT /api/admin/clients/[id]
export async function PUT(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    const body = await request.json();
    const { name, phone, email, address, city, ordersCount, totalSpent, status, notes } = body;
    const client = await updateClient(id, { name, phone, email, address, city, ordersCount, totalSpent, status, notes });
    if (!client) {
      return Response.json({ error: "Client non trouvé" }, { status: 404 });
    }
    return Response.json({ success: true, client });
  } catch (error) {
    console.error("PUT /api/admin/clients/[id] error:", error);
    return Response.json({ error: "Erreur lors de la mise à jour du client" }, { status: 500 });
  }
}

// DELETE /api/admin/clients/[id]
export async function DELETE(request, { params }) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const id = params.id;
    const result = await deleteClient(id);
    if (result?.error) {
      return Response.json({ error: result.error }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/clients/[id] error:", error);
    return Response.json({ error: "Erreur lors de la suppression du client" }, { status: 500 });
  }
}
