import { POST as createOrder } from "@/lib/api/orders.js";

export const prerender = false;
export const POST = ({ request }) => createOrder(request);
