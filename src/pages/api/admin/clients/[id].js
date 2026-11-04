import {
  GET as getClient,
  PUT as updateClient,
  DELETE as deleteClient,
} from "@/lib/api/admin/clients/[id].js";

export const prerender = false;
export const GET = ({ request, params }) => getClient(request, { params });
export const PUT = ({ request, params }) => updateClient(request, { params });
export const DELETE = ({ request, params }) => deleteClient(request, { params });
