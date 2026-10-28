import fs from "fs";
import path from "path";
import { connectDB } from "./mongodb";
import Setting from "@/models/Setting";
import { getProducts } from "./data";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "hero-showcase.json");

export const DEFAULT_HERO_SLOTS = [
  {
    slot: 0,
    productId: "prod-1",
    label: "Nouveauté",
    labelColor: "bg-ocre text-indigo-deep",
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

let _cachedHeroSlots = null;

export async function getHeroShowcase() {
  if (_cachedHeroSlots && Array.isArray(_cachedHeroSlots) && _cachedHeroSlots.length === 4) {
    return _cachedHeroSlots;
  }

  // 1. Essayer depuis MongoDB si configuré
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const setting = await Setting.findOne({ key: "hero_showcase" }).lean();
      if (setting?.value && Array.isArray(setting.value) && setting.value.length === 4) {
        _cachedHeroSlots = setting.value;
        return setting.value;
      }
    } catch (e) {
      console.warn("MongoDB getHeroShowcase fallback vers fichier:", e.message);
    }
  }

  // 2. Essayer depuis le fichier JSON local
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 4) {
        _cachedHeroSlots = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erreur lecture hero-showcase.json:", e.message);
  }

  _cachedHeroSlots = DEFAULT_HERO_SLOTS;
  return DEFAULT_HERO_SLOTS;
}

export async function saveHeroShowcase(slots) {
  if (!Array.isArray(slots) || slots.length !== 4) {
    throw new Error("Il faut exactement 4 éléments pour la vitrine Hero.");
  }
  _cachedHeroSlots = slots;

  // Sauvegarde dans le fichier local
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(slots, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture fichier hero-showcase.json:", e);
  }

  // Sauvegarde dans MongoDB si disponible
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      await Setting.findOneAndUpdate(
        { key: "hero_showcase" },
        { key: "hero_showcase", value: slots },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn("MongoDB saveHeroShowcase warning:", e.message);
    }
  }

  return slots;
}

export async function getHeroItems(existingProducts) {
  const [slots, allProducts] = await Promise.all([
    getHeroShowcase(),
    existingProducts || getProducts({ includeInactive: true }),
  ]);

  return slots.map((slot, index) => {
    // Trouver le produit sélectionné par ID
    const found = allProducts.find((p) => String(p._id) === String(slot.productId));
    // S'il n'existe pas, prendre un produit par défaut avec photo
    const fallback = allProducts.filter((p) => p.images?.[0]?.url)[index] || allProducts[0];
    const product = found || fallback;

    return {
      slot: slot.slot ?? index,
      product,
      label: slot.label || DEFAULT_HERO_SLOTS[index].label,
      labelColor: slot.labelColor || DEFAULT_HERO_SLOTS[index].labelColor,
    };
  });
}

