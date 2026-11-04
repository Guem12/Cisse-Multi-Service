import { GET as getProduct } from "@/lib/api/products/[slug].js";

export const prerender = false;
export const GET = ({ request, params }) => getProduct(request, { params });
