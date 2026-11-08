import fs from "fs";
import path from "path";
import { initDb, prisma } from "./postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero-showcase.json");
const HERO_SETTING_KEY = "hero-showcase";

function readFileSlots() {
  try {
    if (!fs.existsSync(HERO_FILE)) return [];
    const data = JSON.parse(fs.readFileSync(HERO_FILE, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Lecture hero-showcase.json échouée:", error.message);
    return [];
  }
}

export function resolveHeroShowcase(slots = [], products = []) {
  const activeProducts = products.filter(
    (product) => product.active !== false && product.images?.some((image) => image?.url),
  );
  const productId = (product) => String(product._id || product.id || "");
  const usedIds = new Set();
  const resolved = [];

  for (const slot of slots) {
    const id = String(slot?.productId || "");
    const product = activeProducts.find((candidate) => productId(candidate) === id);
    if (!product || usedIds.has(id)) continue;

    const requestedIndex = Number(slot.imageIndex);
    const imageIndex = Number.isInteger(requestedIndex) && product.images[requestedIndex]?.url
      ? requestedIndex
      : 0;
    usedIds.add(id);
    resolved.push({ slot: resolved.length, productId: id, imageIndex });
  }

  for (const product of activeProducts) {
    const id = productId(product);
    if (usedIds.has(id)) continue;
    usedIds.add(id);
    resolved.push({ slot: resolved.length, productId: id, imageIndex: 0 });
    if (resolved.length === 4) break;
  }

  return resolved.slice(0, 4);
}

export async function getHeroShowcase(products) {
  let slots;

  if (prisma) {
    await initDb();
    const setting = await prisma.setting.findUnique({ where: { key: HERO_SETTING_KEY } });
    if (setting) {
      try {
        const parsed = JSON.parse(setting.value);
        slots = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Configuration vitrine invalide dans PostgreSQL:", error.message);
        throw new Error("La configuration des photos de la vitrine est invalide.");
      }
    }
  }

  if (!slots) slots = readFileSlots();
  if (!products) return slots;
  return resolveHeroShowcase(slots, products);
}

export async function getHeroItems(products) {
  const slots = await getHeroShowcase(products);
  const productMap = new Map(products.map((product) => [String(product._id || product.id), product]));
  return slots.flatMap((slot) => {
    const product = productMap.get(String(slot.productId));
    const image = product?.images?.[slot.imageIndex || 0];
    if (!product || !image) return [];
    return [{
      ...slot,
      product,
      imageUrl: image.url,
    }];
  });
}

export async function saveHeroShowcase(slots) {
  const value = JSON.stringify(slots);
  if (prisma) {
    await initDb();
    await prisma.setting.upsert({
      where: { key: HERO_SETTING_KEY },
      update: { value },
      create: { key: HERO_SETTING_KEY, value },
    });
    return slots;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(HERO_FILE, JSON.stringify(slots, null, 2), "utf-8");
    return slots;
  } catch (error) {
    console.error("Écriture hero-showcase.json échouée:", error.message);
    throw error;
  }
}
