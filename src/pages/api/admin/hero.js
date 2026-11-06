import {
  GET as getHero,
  POST as saveHero,
} from "@/lib/api/admin/hero.js";

export const prerender = false;
export const GET = ({ request }) => getHero(request);
export const POST = ({ request }) => saveHero(request);
