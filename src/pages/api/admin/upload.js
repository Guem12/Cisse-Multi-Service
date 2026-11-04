import { POST as upload } from "@/lib/api/admin/upload.js";

export const prerender = false;
export const POST = ({ request }) => upload(request);
