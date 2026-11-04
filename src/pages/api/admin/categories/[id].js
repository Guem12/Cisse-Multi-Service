import {
  GET as getCategory,
  PUT as updateCategory,
  DELETE as deleteCategory,
} from "@/lib/api/admin/categories/[id].js";

export const prerender = false;
export const GET = ({ request, params }) => getCategory(request, { params });
export const PUT = ({ request, params }) => updateCategory(request, { params });
export const DELETE = ({ request, params }) => deleteCategory(request, { params });
