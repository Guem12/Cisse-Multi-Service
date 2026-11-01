import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// S'assurer que DATABASE_URL est chargé depuis .env.local si absent
const path = require("path");
const fs = require("fs");
if (!process.env.DATABASE_URL) {
  try {
    if (fs.existsSync(path.join(__dirname, "..", ".env.local"))) {
      require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
    }
  } catch (e) {
    // .env.local peut absent
  }
}

const globalForPrisma = globalThis;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL non défini, le mode PostgreSQL est désactivé.");
    return null;
  }
  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"] });
  } catch (e) {
    console.error("Impossible de créer le client Prisma:", e.message);
    return null;
  }
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function initDb() {
  if (!prisma) return;
  try {
    await prisma.$connect();
  } catch (e) {
    console.error("DB connection error:", e.message);
    throw e;
  }
}
