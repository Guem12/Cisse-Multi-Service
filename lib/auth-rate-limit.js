import { createHash } from "node:crypto";
import { initDb, prisma } from "./postgres.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const GLOBAL_KEY = Symbol.for("cisse.admin-login-attempts");
let databaseReady;
let lastDatabaseCleanup = 0;

function getAttempts() {
  if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = new Map();
  return globalThis[GLOBAL_KEY];
}

function getClientKey(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",").at(-1)?.trim();
  const ip = forwardedIp || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip.slice(0, 128)).digest("hex");
}

async function ensureDatabase() {
  if (!prisma) return false;
  if (!databaseReady) {
    databaseReady = (async () => {
      await initDb();
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "AdminLoginAttempt" (
          "key" TEXT PRIMARY KEY,
          "count" INTEGER NOT NULL,
          "resetAt" TIMESTAMPTZ NOT NULL
        )
      `;
    })();
  }
  try {
    await databaseReady;
    return true;
  } catch (error) {
    databaseReady = undefined;
    throw error;
  }
}

export async function consumeLoginAttempt(request) {
  if (await ensureDatabase()) {
    const [entry] = await prisma.$queryRaw`
      INSERT INTO "AdminLoginAttempt" ("key", "count", "resetAt")
      VALUES (${getClientKey(request)}, 1, NOW() + INTERVAL '15 minutes')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "AdminLoginAttempt"."resetAt" <= NOW() THEN 1
          ELSE "AdminLoginAttempt"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "AdminLoginAttempt"."resetAt" <= NOW() THEN NOW() + INTERVAL '15 minutes'
          ELSE "AdminLoginAttempt"."resetAt"
        END
      RETURNING "count", "resetAt"
    `;
    if (Date.now() - lastDatabaseCleanup > 60 * 60 * 1000) {
      try {
        await prisma.$executeRaw`DELETE FROM "AdminLoginAttempt" WHERE "resetAt" < NOW() - INTERVAL '1 day'`;
        lastDatabaseCleanup = Date.now();
      } catch (error) {
        console.error("Unable to clean expired administrator login attempts:", error);
      }
    }
    const retryAfter = Math.max(1, Math.ceil((new Date(entry.resetAt).getTime() - Date.now()) / 1000));
    return { allowed: entry.count <= MAX_ATTEMPTS, retryAfter };
  }

  const attempts = getAttempts();
  const key = getClientKey(request);
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= MAX_ATTEMPTS,
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export async function clearLoginFailures(request) {
  if (await ensureDatabase()) {
    await prisma.$executeRaw`DELETE FROM "AdminLoginAttempt" WHERE "key" = ${getClientKey(request)}`;
    return;
  }
  getAttempts().delete(getClientKey(request));
}
