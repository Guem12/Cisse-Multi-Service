import { isAdmin } from "@/lib/guard";
import { initDb, prisma } from "@/lib/postgres";

export async function GET(request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return Response.json({ error: "La base de données n'est pas configurée." }, { status: 503 });
  }

  try {
    await initDb();
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        status: true,
        items: true,
        total: true,
        deliveryAddress: true,
        paymentMethod: true,
        createdAt: true,
      },
    });
    return Response.json({
      success: true,
      orders: orders.map((order) => ({ ...order, total: Number(order.total) })),
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return Response.json({ error: "Erreur lors de la récupération des commandes." }, { status: 500 });
  }
}
