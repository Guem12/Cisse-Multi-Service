import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero-showcase.json");

const DEFAULT_SLOTS = [
  {
    slot: 0,
    productId: "prod-6",
    label: "Tendance",
    labelColor: "bg-indigo-500 text-white",
  },
  {
    slot: 1,
    productId: "prod-2",
    label: "Populaire",
    labelColor: "bg-emerald-400 text-white",
  },
  {
    slot: 2,
    productId: "prod-3",
    label: "En stock",
    labelColor: "bg-sky-400 text-white",
  },
  {
    slot: 3,
    productId: "prod-4",
    label: "Promo",
    labelColor: "bg-rose-400 text-white",
  },
];

export async function getHeroShowcase() {
  try {
    if (fs.existsSync(HERO_FILE)) {
      const raw = fs.readFileSync(HERO_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length >= 4) return data;
    }
  } catch (e) {
    console.warn("Lecture hero-showcase.json échouée:", e.message);
  }
  return DEFAULT_SLOTS;
}

export async function getHeroItems(products) {
  const slots = await getHeroShowcase();
  const productMap = new Map(products.map((p) => [p._id, p]));
  return slots
    .map((slot) => {
      const product = productMap.get(slot.productId);
      if (!product) return null;
      return {
        slot: slot.slot,
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        label: slot.label,
        labelColor: slot.labelColor,
      };
    })
    .filter(Boolean);
}

export async function saveHeroShowcase(slots) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(HERO_FILE, JSON.stringify(slots, null, 2), "utf-8");
    return slots;
  } catch (e) {
    console.error("Écriture hero-showcase.json échouée:", e.message);
    throw e;
  }
}
