import {
  GET as getClients,
  POST as createClient,
} from "@/lib/api/admin/clients.js";

export const prerender = false;
export const GET = ({ request }) => getClients(request);
export const POST = ({ request }) => createClient(request);
