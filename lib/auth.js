import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminProfile } from "./admin-profile";

const SESSION_COOKIE = "cisse_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET must be set to enable administrator sessions");
  }
  return secret;
}

function safeEqual(left = "", right = "") {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export async function verifyAdminCredentials(email, password) {
  if (!email || !password) return null;

  let profile;
  try {
    profile = await getAdminProfile();
  } catch (error) {
    console.error("Unable to load administrator profile:", error);
  }

  const targetEmail = profile?.email || process.env.ADMIN_EMAIL;
  const targetPassword = profile?.password || process.env.ADMIN_PASSWORD;
  if (
    targetEmail &&
    targetPassword &&
    safeEqual(email, targetEmail) &&
    safeEqual(password, targetPassword)
  ) {
    return {
      email: targetEmail,
      name: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Administrateur",
    };
  }

  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envEmail && envPassword && safeEqual(email, envEmail) && safeEqual(password, envPassword)) {
    return { email: envEmail, name: "Administrateur" };
  }

  return null;
}

export function createAdminSessionCookie({ email, name }) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin",
      email,
      name,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    }),
  ).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

export function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function hasAdminSession(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return false;

  const value = cookie.slice(SESSION_COOKIE.length + 1);
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  let expectedSignature;
  try {
    expectedSignature = sign(payload);
  } catch (error) {
    console.error("Administrator session is not configured:", error);
    return false;
  }
  if (!safeEqual(signature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.sub === "admin" && session.email && session.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
