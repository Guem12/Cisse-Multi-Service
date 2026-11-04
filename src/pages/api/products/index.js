import { GET as getProducts } from "@/lib/api/products.js";

export const prerender = false;
export const GET = ({ request }) => getProducts(request);
