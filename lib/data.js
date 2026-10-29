import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "./mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const DEMO_CATEGORIES = [
  { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" },
  { _id: "cat-2", name: "Écouteurs sans fil", slug: "ecouteurs-sans-fil" },
  { _id: "cat-3", name: "Bandoulières", slug: "bandoulieres" },
  { _id: "cat-4", name: "Montres", slug: "montres" },
  { _id: "cat-5", name: "Cagoules", slug: "cagoules" },
  { _id: "cat-6", name: "Bracelets & bijouterie", slug: "bracelets-bijouterie" },
];

const plain = (d) => JSON.parse(JSON.stringify(d));

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

export const DEMO_CATEGORIES = [
  { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" },
  { _id: "cat-2", name: "Écouteurs sans fil", slug: "ecouteurs-sans-fil" },
  { _id: "cat-3", name: "Bandoulières", slug: "bandoulieres" },
  { _id: "cat-4", name: "Montres", slug: "montres" },
  { _id: "cat-5", name: "Cagoules", slug: "cagoules" },
  { _id: "cat-6", name: "Bracelets & bijouterie", slug: "bracelets-bijouterie" },
];

export const DEMO_PRODUCTS = [
  {
    _id: "prod-1",
    name: "Sac à dos urbain antivol",
    slug: "sac-a-dos-urbain-antivol",
    description: "Sac à dos moderne et résistant à l'eau, compartiment PC renforcé, port USB externe et fermetures discrètes antivol.",
    price: 15000,
    stock: 12,
    images: [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" },
    active: true,
  },
  {
    _id: "prod-2",
    name: "Écouteurs sans fil Pro TWS",
    slug: "ecouteurs-sans-fil-pro-tws",
    description: "Son stéréo haute définition, réduction active du bruit, autonomie de 24h avec boîtier de charge rapide.",
    price: 10000,
    stock: 25,
    images: [{ url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-2", name: "Écouteurs sans fil", slug: "ecouteurs-sans-fil" },
    active: true,
  },
  {
    _id: "prod-3",
    name: "Sacoche bandoulière cuir PU",
    slug: "sacoche-bandouliere-cuir-pu",
    description: "Sacoche élégante et compacte pour transporter portefeuille, clés, téléphone et documents en toute sérénité.",
    price: 8500,
    stock: 15,
    images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-3", name: "Bandoulières", slug: "bandoulieres" },
    active: true,
  },
  {
    _id: "prod-4",
    name: "Montre chronographe élégance",
    slug: "montre-chronographe-elegance",
    description: "Cadran noir et boîtier métallique soigné avec bracelet cuir marron, étanche 3ATM.",
    price: 18000,
    stock: 7,
    images: [{ url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-4", name: "Montres", slug: "montres" },
    active: true,
  },
  {
    _id: "prod-5",
    name: "Cagoule respirante multi-usages",
    slug: "cagoule-respirante-multi-usages",
    description: "Tissu respirant et extensible, idéale pour protection poussière, moto ou style streetwear.",
    price: 3000,
    stock: 30,
    images: [{ url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-5", name: "Cagoules", slug: "cagoules" },
    active: true,
  },
  {
    _id: "prod-6",
    name: "Bracelet chaîne gourmette dorée",
    slug: "bracelet-chaine-gourmette-doree",
    description: "Finitions soignées en acier inoxydable plaqué or, éclat durable résistant à l'eau.",
    price: 4500,
    stock: 20,
    images: [{ url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-6", name: "Bracelets & bijouterie", slug: "bracelets-bijouterie" },
    active: true,
  },
  {
    _id: "prod-7",
    name: "Sac à main tendance femme",
    slug: "sac-a-main-tendance-femme",
    description: "Sac élégant en simili-cuir avec fermeture dorée, parfait pour les sorties du quotidien.",
    price: 12000,
    stock: 10,
    images: [{ url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" },
    active: true,
  },
  {
    _id: "prod-8",
    name: "Montre connectée sport",
    slug: "montre-connectee-sport",
    description: "Suivi activité, fréquence cardiaque, notifications smartphone. Bracelet silicone respirant.",
    price: 22000,
    stock: 5,
    images: [{ url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80" }],
    category: { _id: "cat-4", name: "Montres", slug: "montres" },
    active: true,
  },
];

// Helper pour lecture des produits stockés localement avec cache en mémoire
let _cachedLocalProducts = null;

export function getLocalProducts() {
  if (_cachedLocalProducts && Array.isArray(_cachedLocalProducts) && _cachedLocalProducts.length > 0) {
    return _cachedLocalProducts;
  }
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        _cachedLocalProducts = list;
        return list;
      }
    }
  } catch (e) {
    console.warn("Erreur lecture products.json:", e.message);
  }
  saveLocalProducts(DEMO_PRODUCTS);
  _cachedLocalProducts = DEMO_PRODUCTS;
  return DEMO_PRODUCTS;
}

export function saveLocalProducts(list) {
  _cachedLocalProducts = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture products.json:", e);
  }
}

export async function getCategories() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const cats = await Category.find().sort({ name: 1 }).lean();
      if (cats.length > 0) return plain(cats);
    } catch (err) {
      console.warn("MongoDB non disponible, utilisation des catégories de démonstration:", err.message);
    }
  }
  return DEMO_CATEGORIES;
}

export async function getProducts({ categorySlug, limit, includeInactive } = {}) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const filter = includeInactive ? {} : { active: true };
      if (categorySlug) {
        const cat = await Category.findOne({ slug: categorySlug }).lean();
        if (!cat) return [];
        filter.category = cat._id;
      }
      let query = Product.find(filter).populate("category", "name slug").sort({ createdAt: -1 });
      if (limit) query = query.limit(limit);
      const results = await query.lean();
      if (results.length > 0) return plain(results);
    } catch (err) {
      console.warn("MongoDB non disponible, fallback getProducts:", err.message);
    }
  }

  // Fallback persistant local
  const all = getLocalProducts();
  let filtered = includeInactive ? all : all.filter((p) => p.active);
  if (categorySlug) {
    filtered = filtered.filter((p) => p.category?.slug === categorySlug);
  }
  if (limit) filtered = filtered.slice(0, limit);
  return filtered;
}

export async function getProductBySlug(slug) {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const res = await Product.findOne({ slug, active: true }).populate("category", "name slug").lean();
      if (res) return plain(res);
    } catch (err) {
      console.warn("MongoDB non disponible, fallback getProductBySlug:", err.message);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => p.slug === slug && p.active) || null;
}

export async function getProductById(id) {
  // Try MongoDB only if URI is configured and ID looks like an ObjectId
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const res = await Product.findById(id).populate("category", "name slug").lean();
      if (res) return plain(res);
    } catch (err) {
      console.warn("MongoDB non disponible, fallback getProductById:", err.message);
    }
  }

  // Fallback to local products storage
  const all = getLocalProducts();
  return all.find((p) => String(p._id) === String(id) || p.slug === id) || null;
}

// Mise à jour d'un produit (gère à la fois MongoDB et fichier local)
export async function updateProduct(id, data) {
  const categories = await getCategories();
  const matchedCat = categories.find(
    (c) => String(c._id) === String(data.category) || c.slug === data.category
  ) || { _id: data.category, name: "Article", slug: "article" };

  let mongoUpdated = null;

  // 1. Mise à jour MongoDB si configuré et ID valide
  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    try {
      await connectDB();
      const product = await Product.findById(id);
      if (product) {
        Object.assign(product, data);
        await product.save();
        mongoUpdated = plain(product);
      }
    } catch (e) {
      console.warn("Erreur updateProduct MongoDB:", e.message);
    }
  }

  // 2. Mise à jour locale persistante dans products.json
  const all = getLocalProducts();
  const index = all.findIndex((p) => String(p._id) === String(id) || p.slug === id);

  if (index !== -1) {
    const existing = all[index];
    const updated = {
      ...existing,
      ...data,
      _id: existing._id,
      slug: existing.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: {
        _id: matchedCat._id,
        name: matchedCat.name,
        slug: matchedCat.slug,
      },
    };
    all[index] = updated;
    saveLocalProducts(all);
    return updated;
  }

  return mongoUpdated;
}

// Création d'un produit (gère à la fois MongoDB et fichier local)
export async function createProduct(data) {
  const categories = await getCategories();
  const matchedCat = categories.find(
    (c) => String(c._id) === String(data.category) || c.slug === data.category
  ) || { _id: data.category, name: "Article", slug: "article" };

  const slug = (data.slug || data.name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // 1. Création MongoDB si configuré
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const created = await Product.create({ ...data, slug });
      return plain(created);
    } catch (e) {
      console.warn("Erreur createProduct MongoDB:", e.message);
    }
  }

  // 2. Création locale persistante
  const all = getLocalProducts();
  const newProduct = {
    ...data,
    _id: `prod-${Date.now()}`,
    slug: slug || `produit-${Date.now()}`,
    category: {
      _id: matchedCat._id,
      name: matchedCat.name,
      slug: matchedCat.slug,
    },
  };

  all.unshift(newProduct);
  saveLocalProducts(all);
  return newProduct;
}

// Suppression d'un produit (gère à la fois MongoDB et fichier local)
export async function deleteProduct(id) {
  if (process.env.MONGODB_URI && mongoose.isValidObjectId(id)) {
    try {
      await connectDB();
      await Product.findByIdAndDelete(id);
    } catch (e) {
      console.warn("Erreur deleteProduct MongoDB:", e.message);
    }
  }

  const all = getLocalProducts();
  const filtered = all.filter((p) => String(p._id) !== String(id) && p.slug !== id);
  saveLocalProducts(filtered);
  return true;
}
