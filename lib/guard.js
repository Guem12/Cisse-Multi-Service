import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function isAdmin() {
  return !!(await getServerSession(authOptions));
}
