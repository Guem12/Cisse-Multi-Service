import {
  GET as getCategories,
  POST as createCategory,
} from "@/lib/api/admin/categories.js";

export const prerender = false;
export const GET = ({ request }) => getCategories(request);
export const POST = ({ request }) => createCategory(request);
