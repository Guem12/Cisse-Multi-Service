import {
  GET as getProduct,
  PUT as updateProduct,
  DELETE as deleteProduct,
  PATCH as updateStock,
} from "@/lib/api/admin/products/[id].js";

export const prerender = false;
export const GET = ({ request, params }) => getProduct(request, { params });
export const PUT = ({ request, params }) => updateProduct(request, { params });
export const DELETE = ({ request, params }) => deleteProduct(request, { params });
export const PATCH = ({ request, params }) => updateStock(request, { params });
