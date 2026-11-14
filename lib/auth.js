import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminProfile } from "./admin-profile.js";

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

function decodeBase32(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = secret.toUpperCase().replace(/=+$/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const character of normalized) {
    const digit = alphabet.indexOf(character);
    if (digit < 0) return null;
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function verifyTotp(secret, token) {
  if (!/^\d{6}$/.test(String(token || ""))) return false;
  const key = decodeBase32(secret);
  if (!key?.length) return false;

  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let offset = -1; offset <= 1; offset += 1) {
    const message = Buffer.alloc(8);
    message.writeBigInt64BE(BigInt(counter + offset));
    const digest = createHmac("sha1", key).update(message).digest();
    const position = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[position] & 0x7f) << 24) |
      ((digest[position + 1] & 0xff) << 16) |
      ((digest[position + 2] & 0xff) << 8) |
      (digest[position + 3] & 0xff);
    const code = String(binary % 1_000_000).padStart(6, "0");
    if (safeEqual(token, code)) return true;
  }
  return false;
}

function sign(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export async function verifyAdminCredentials(email, password, totpCode) {
  if (!email || !password) return null;

  let profile;
  try {
    profile = await getAdminProfile();
  } catch (error) {
    console.error("Unable to load administrator profile:", error);
    return null;
  }

  const targetEmail = profile.email || process.env.ADMIN_EMAIL;
  const targetPassword = profile.password || process.env.ADMIN_PASSWORD;
  const totpSecret = process.env.ADMIN_TOTP_SECRET;
  const secondFactorValid = !totpSecret || verifyTotp(totpSecret, totpCode);
  if (
    secondFactorValid &&
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
