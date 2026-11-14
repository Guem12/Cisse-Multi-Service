import { GET as getOrders } from "@/lib/api/admin/orders.js";

export const prerender = false;
export const GET = ({ request }) => getOrders(request);
