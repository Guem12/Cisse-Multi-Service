import {
  GET as getProfile,
  PUT as updateProfile,
} from "@/lib/api/admin/profile.js";

export const prerender = false;
export const GET = ({ request }) => getProfile(request);
export const PUT = ({ request }) => updateProfile(request);
