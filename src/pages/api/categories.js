import { GET as getCategories } from "@/lib/api/categories.js";

export const prerender = false;
export const GET = ({ request }) => getCategories(request);
