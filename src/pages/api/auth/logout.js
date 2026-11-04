import { clearAdminSessionCookie } from "../../../../lib/auth";

export const prerender = false;

export function POST() {
  return Response.json(
    { success: true },
    { headers: { "Set-Cookie": clearAdminSessionCookie() } },
  );
}
