import fs from "fs";
import path from "path";
import { initDb, prisma } from "./postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero-showcase.json");
const HERO_SETTING_KEY = "hero-showcase";

function parseSelection(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value && typeof value === "object" ? value : null;
}

function readFileSelection() {
  try {
    if (!fs.existsSync(HERO_FILE)) return null;
    return parseSelection(JSON.parse(fs.readFileSync(HERO_FILE, "utf-8")));
  } catch (error) {
    console.warn("Lecture hero-showcase.json échouée:", error.message);
    return null;
  }
}

export function resolveHeroSelection(selection, products = []) {
  const activeProducts = products.filter(
    (product) => product.active !== false && product.images?.some((image) => image?.url),
  );
  const productId = (product) => String(product._id || product.id || "");
  const requestedId = String(selection?.productId || "");
  const product = activeProducts.find((candidate) => productId(candidate) === requestedId) || activeProducts[0];
  if (!product) return null;

  const requestedIndex = Number(selection?.imageIndex ?? 0);
  const imageIndex = Number.isInteger(requestedIndex) && product.images[requestedIndex]?.url
    ? requestedIndex
    : 0;
  return { productId: productId(product), imageIndex };
}

export async function getHeroSelection(products) {
  let selection = null;

  if (prisma) {
    await initDb();
    const setting = await prisma.setting.findUnique({ where: { key: HERO_SETTING_KEY } });
    if (setting) {
      try {
        selection = parseSelection(JSON.parse(setting.value));
      } catch (error) {
        console.error("Configuration vitrine invalide dans PostgreSQL:", error.message);
        throw new Error("La configuration du produit d’accueil est invalide.");
      }
    }
  }

  if (!selection) selection = readFileSelection();
  if (selection && prisma) await saveHeroSelection(selection);
  if (!products) return selection;
  return resolveHeroSelection(selection, products);
}

export async function saveHeroSelection(selection) {
  const value = JSON.stringify(selection);
  if (prisma) {
    await initDb();
    await prisma.setting.upsert({
      where: { key: HERO_SETTING_KEY },
      update: { value },
      create: { key: HERO_SETTING_KEY, value },
    });
    return selection;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(HERO_FILE, JSON.stringify(selection, null, 2), "utf-8");
    return selection;
  } catch (error) {
    console.error("Écriture hero-showcase.json échouée:", error.message);
    throw error;
  }
}
