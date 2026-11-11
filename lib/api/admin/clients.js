import { isAdmin } from "@/lib/guard";
import { getClients, createClient, updateClient, deleteClient } from "@/lib/clients";

export const dynamic = "force-dynamic";

// GET /api/admin/clients
export async function GET(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const clients = await getClients();
    return Response.json({ success: true, clients });
  } catch (error) {
    console.error("GET /api/admin/clients error:", error);
    return Response.json({ error: "Erreur lors de la récupération des clients" }, { status: 500 });
  }
}

// POST /api/admin/clients
export async function POST(request) {
  try {
    const admin = isAdmin(request);
    if (!admin) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await request.json();
    const { name, phone, email, address, city, ordersCount, totalSpent, status, notes } = body;
    if (!name || !phone) {
      return Response.json({ error: "Nom et téléphone sont requis" }, { status: 400 });
    }
    const client = await createClient({ name, phone, email, address, city, ordersCount, totalSpent, status, notes });
    return Response.json({ success: true, client });
  } catch (error) {
    console.error("POST /api/admin/clients error:", error);
    return Response.json({ error: "Erreur lors de la création du client" }, { status: 500 });
  }
}
