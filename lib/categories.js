import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");

const DEFAULT_CATEGORIES = [
  { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" },
  { _id: "cat-2", name: "Écouteurs sans fil", slug: "ecouteurs-sans-fil" },
  { _id: "cat-3", name: "Bandoulières", slug: "bandoulieres" },
  { _id: "cat-4", name: "Montres", slug: "montres" },
  { _id: "cat-5", name: "Cagoules", slug: "cagoules" },
  { _id: "cat-6", name: "Bracelets & bijouterie", slug: "bracelets-bijouterie" },
];

export async function getCategories() {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Lecture categories.json échouée:", e.message);
  }
  return DEFAULT_CATEGORIES;
}

export async function saveCategories(categories) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
    return categories;
  } catch (e) {
    console.error("Écriture categories.json échouée:", e.message);
    throw e;
  }
}

export async function createCategory(data) {
  const categories = await getCategories();
  const existing = categories.find((c) => c.name === data.name || c.slug === data.slug);
  if (existing) {
    return { error: "Une catégorie avec ce nom ou ce slug existe déjà" };
  }
  const newCategory = {
    _id: `cat-${Date.now()}`,
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export async function updateCategory(id, data) {
  const categories = await getCategories();
  const index = categories.findIndex((c) => c._id === id);
  if (index === -1) {
    return { error: "Catégorie non trouvée" };
  }
  categories[index] = {
    ...categories[index],
    name: data.name || categories[index].name,
    slug: data.slug || categories[index].slug,
    active: data.active !== undefined ? data.active : categories[index].active,
  };
  saveCategories(categories);
  return categories[index];
}

export async function deleteCategory(id) {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c._id !== id);
  if (filtered.length === categories.length) {
    return { error: "Catégorie non trouvée" };
  }
  saveCategories(filtered);
  return { ok: true };
}

export async function getCategoryById(id) {
  const categories = await getCategories();
  return categories.find((c) => c._id === id) || null;
}
