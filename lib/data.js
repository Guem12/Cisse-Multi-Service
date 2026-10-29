import fs from "fs";
import path from "path";
import { query, queryOne, queryExec } from "./postgres";

const plain = (d) => JSON.parse(JSON.stringify(d));

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// Données de démonstration (fallback si PostgreSQL vide)
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

// Helper pour lire les produits locaux (fallback)
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
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture products.json:", e);
  }
}

// Récupérer les catégories
export async function getCategories() {
  if (process.env.DATABASE_URL) {
    try {
      const cats = await query("SELECT id, name, slug, created_at, updated_at FROM categories ORDER BY name ASC");
      if (cats.rows.length > 0) {
        return cats.rows.map((c) => ({ ...c, images: [] }));
      }
    } catch (err) {
      console.warn("PostgreSQL non disponible, utilisation catégories de démonstration:", err.message);
    }
  }
  return DEMO_CATEGORIES;
}

// Récupérer les produits
export async function getProducts({ categorySlug, limit, includeInactive } = {}) {
  if (process.env.DATABASE_URL) {
    try {
      let sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
      `;
      const params = [];
      if (!includeInactive) {
        sql += " WHERE p.active = TRUE";
      }
      if (categorySlug) {
        const cat = await queryOne("SELECT id FROM categories WHERE slug = $1", [categorySlug]);
        if (cat) {
          sql += " AND c.id = $2";
          params.push(categorySlug);
        }
      }
      sql += " ORDER BY p.created_at DESC";
      if (limit) {
        sql += " LIMIT $3";
        params.push(limit);
      }
      const products = await query(sql, params);
      return products.rows;
    } catch (err) {
      console.warn("PostgreSQL non disponible, fallback products:", err.message);
    }
  }

  // Fallback local
  const all = getLocalProducts();
  let filtered = includeInactive ? all : all.filter((p) => p.active);
  if (categorySlug) {
    filtered = filtered.filter((p) => p.category?.slug === categorySlug);
  }
  if (limit) filtered = filtered.slice(0, limit);
  return filtered;
}

// Récupérer un produit par slug
export async function getProductBySlug(slug) {
  if (process.env.DATABASE_URL) {
    try {
      const product = await queryOne(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.slug = $1 AND p.active = TRUE`,
        [slug]
      );
      if (product) return product;
    } catch (err) {
      console.warn("PostgreSQL non disponible, fallback getProductBySlug:", err.message);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => p.slug === slug && p.active) || null;
}

// Récupérer un produit par ID
export async function getProductById(id) {
  if (process.env.DATABASE_URL) {
    try {
      const product = await queryOne(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
      );
      if (product) return product;
    } catch (err) {
      console.warn("PostgreSQL non disponible, fallback getProductById:", err.message);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => String(p._id) === String(id) || p.slug === id) || null;
}

// Créer un produit
export async function createProduct(data) {
  const categories = await getCategories();
  const matchedCat = categories.find(
    (c) => String(c._id) === String(data.category) || c.slug === data.category
  ) || { _id: data.category, name: "Article", slug: "article" };

  const name = data.name.trim();
  const description = data.description?.trim() || "";
  const price = Number(data.price) || 0;
  const stock = Math.max(0, parseInt(data.stock, 10) || 0);
  const active = data.active !== false;
  const images = (data.images || []).filter((i) => i?.url).map((i) => ({ url: i.url, publicId: i.publicId }));

  if (!name) return { error: "Le nom est obligatoire." };
  if (!price || price < 0) return { error: "Le prix est invalide." };
  if (!matchedCat) return { error: "Choisissez une catégorie valide." };

  const slug = name.toLowerCase().normalize("NFD").replace(/[^\w-]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "");

  if (process.env.DATABASE_URL) {
    try {
      const result = await queryExec(
        `INSERT INTO products (name, slug, description, price, stock, active, category_id, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, slug, description, price, stock, active, category_id, created_at, updated_at`,
        [name, slug, description, price, stock, active, matchedCat._id, JSON.stringify(images)]
      );
      return { success: true, id: result.rows[0].id };
    } catch (err) {
      console.error("Erreur création produit PostgreSQL:", err);
      return { error: "Erreur lors de la création du produit." };
    }
  }

  // Fallback local
  const all = getLocalProducts();
  const newProduct = {
    ...data,
    _id: `prod-${Date.now()}`,
    slug: slug || `produit-${Date.now()}`,
    category: { _id: matchedCat._id, name: matchedCat.name, slug: matchedCat.slug },
  };
  all.unshift(newProduct);
  saveLocalProducts(all);
  return newProduct;
}

// Mettre à jour un produit
export async function updateProduct(id, data) {
  const categories = await getCategories();
  const matchedCat = categories.find(
    (c) => String(c._id) === String(data.category) || c.slug === data.category
  ) || { _id: data.category, name: "Article", slug: "article" };

  const name = data.name.trim();
  const description = data.description?.trim() || "";
  const price = Number(data.price) || 0;
  const stock = Math.max(0, parseInt(data.stock, 10) || 0);
  const active = data.active !== false;
  const images = (data.images || []).filter((i) => i?.url).map((i) => ({ url: i.url, publicId: i.publicId }));

  if (!name) return { error: "Le nom est obligatoire." };
  if (!price || price < 0) return { error: "Le prix est invalide." };
  if (!matchedCat) return { error: "Choisissez une catégorie valide." };

  const slug = name.toLowerCase().normalize("NFD").replace(/[^\w-]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "");

  if (process.env.DATABASE_URL) {
    try {
      await queryExec(
        `UPDATE products
         SET name = $1, slug = $2, description = $3, price = $4, stock = $5, active = $6, category_id = $7, images = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [name, slug, description, price, stock, active, matchedCat._id, JSON.stringify(images), id]
      );
      return { success: true, message: "Produit mis à jour" };
    } catch (err) {
      console.error("Erreur mise à jour produit PostgreSQL:", err);
      return { error: "Erreur lors de la mise à jour du produit." };
    }
  }

  const all = getLocalProducts();
  const index = all.findIndex((p) => String(p._id) === String(id) || p.slug === id);
  if (index !== -1) {
    all[index] = {
      ...all[index],
      ...data,
      name,
      slug: slug || all[index].slug,
      category: { _id: matchedCat._id, name: matchedCat.name, slug: matchedCat.slug },
    };
    saveLocalProducts(all);
    return all[index];
  }
  return null;
}

// Supprimer un produit
export async function deleteProduct(id) {
  if (process.env.DATABASE_URL) {
    try {
      await queryExec("DELETE FROM products WHERE id = $1", [id]);
      return true;
    } catch (err) {
      console.error("Erreur suppression produit PostgreSQL:", err);
      return false;
    }
  }

  const all = getLocalProducts();
  const filtered = all.filter((p) => String(p._id) !== String(id) && p.slug !== id);
  saveLocalProducts(filtered);
  return true;
}
