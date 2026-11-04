import {
  GET as getProduct,
  PUT as updateProduct,
  DELETE as deleteProduct,
} from "@/lib/api/admin/products/[id].js";

export const prerender = false;
export const GET = ({ request, params }) => getProduct(request, { params });
export const PUT = ({ request, params }) => updateProduct(request, { params });
export const DELETE = ({ request, params }) => deleteProduct(request, { params });
