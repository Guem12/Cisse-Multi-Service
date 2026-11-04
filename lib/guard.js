import { hasAdminSession } from "./auth";

export function isAdmin(request) {
  return hasAdminSession(request);
}
