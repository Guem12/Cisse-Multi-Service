import {
  GET as getProducts,
  POST as createProduct,
} from "@/lib/api/admin/products.js";

export const prerender = false;
export const GET = ({ request }) => getProducts(request);
export const POST = ({ request }) => createProduct(request);
