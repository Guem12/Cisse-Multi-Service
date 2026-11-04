import { GET as getHero } from "@/lib/api/admin/hero.js";

export const prerender = false;
export const GET = ({ request }) => getHero(request);
