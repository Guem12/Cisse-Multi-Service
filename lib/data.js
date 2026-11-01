import { prisma, initDb } from "./postgres.js";

async function ensureDb() {
  if (prisma) {
    await initDb();
    return;
  }
  // Fallback JSON si PostgreSQL n'est pas configuré
  const fs = require("fs");
  const path = require("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DATA_FILE = path.join(DATA_DIR, "products.json");
  if (fs.existsSync(DATA_FILE)) return;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
}

export async function getCategories() {
  await ensureDb();
  if (prisma) {
    const rows = await prisma.category.findMany({ orderBy: { id: "asc" } });
    return rows.map((r) => ({ _id: r.id, name: r.name, slug: r.slug, active: r.active }));
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "categories.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Lecture categories échouée:", e.message);
  }
  return [
    { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos", active: true },
    { _id: "cat-2", name: "Écouteurs sans fil", slug: "ecouteurs-sans-fil", active: true },
    { _id: "cat-3", name: "Bandoulières", slug: "bandoulieres", active: true },
    { _id: "cat-4", name: "Montres", slug: "montres", active: true },
    { _id: "cat-5", name: "Cagoules", slug: "cagoules", active: true },
    { _id: "cat-6", name: "Bracelets & bijouterie", slug: "bracelets-bijouterie", active: true },
  ];
}
export async function getProducts({ categorySlug, limit, includeInactive } = {}) {
  await ensureDb();
  if (prisma) {
    const where = { active: true };
    if (categorySlug) where.category = { slug: categorySlug };
    const rows = await prisma.product.findMany({ where });
    // Prisma Decimal → Number (sinon React refuse d'afficher le prix)
    const plain = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: Number(r.price),
      stock: r.stock,
      images: JSON.parse(r.images || "[]"),
      categoryId: r.categoryId,
      active: r.active,
      category: r.category ? { _id: r.category.id, name: r.category.name || "", slug: r.category.slug || "" } : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    if (limit) return plain.slice(0, limit);
    return plain;
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (Array.isArray(data)) {
        let filtered = data.filter((p) => true);
        if (categorySlug) filtered = filtered.filter((p) => p.category?.slug === categorySlug);
        if (limit) filtered = filtered.slice(0, limit);
        return filtered;
      }
    }
  } catch (e) {
    console.warn("Lecture produits échouée:", e.message);
  }
  return [];
}

export async function getProductBySlug(slug) {
  await ensureDb();
  if (prisma) {
    const row = await prisma.product.findUnique({ where: { slug } });
    if (!row) return null;
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      return data.find((p) => p.slug === slug && p.active) || null;
    }
  } catch (e) {
    console.warn("Lecture produit échouée:", e.message);
  }
  return null;
}

export async function getCategoryBySlug(slug) {
  await ensureDb();
  if (prisma) {
    const row = await prisma.category.findUnique({ where: { slug } });
    if (!row) return null;
    return { _id: row.id, name: row.name, slug: row.slug, active: row.active };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "categories.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      return data.find((c) => c.slug === slug) || null;
    }
  } catch (e) {
    console.warn("Lecture catégorie échouée:", e.message);
  }
  return null;
}

export async function getProductById(id) {
  await ensureDb();
  if (prisma) {
    const row = await prisma.product.findUnique({ where: { id } });
    if (!row) return null;
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      return data.find((p) => String(p._id) === String(id) || p.slug === id) || null;
    }
  } catch (e) {
    console.warn("Lecture produit échouée:", e.message);
  }
  return null;
}

export async function createProduct(data) {
  await ensureDb();
  if (prisma) {
    let categoryId = data.categoryId || data.category?._id || data.categorySlug || "cat-1";
    if (!data.category) {
      const existing2 = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!existing2) {
        const cat = await prisma.category.create({ data: { name: "Autre", slug: "autre" } });
        categoryId = cat.id;
      }
    } else {
      const existing = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!existing) {
        const cat = await prisma.category.upsert({
          where: { slug: data.category.slug },
          create: { name: data.category.name, slug: data.category.slug },
          update: { name: data.category.name },
        });
        categoryId = cat.id;
      }
    }
    const price = typeof data.price === "string" ? parseFloat(data.price) : data.price;
    const stock = typeof data.stock === "string" ? parseInt(data.stock, 10) : data.stock;
    const images = Array.isArray(data.images) ? data.images : [];
    const rawSlug = data.slug || data.name;
    const existingSlug = await prisma.product.findUnique({ where: { slug: rawSlug } });
    const productSlug = existingSlug ? `${rawSlug}-${Date.now()}` : rawSlug;
    const row = await prisma.product.create({
      data: {
        name: data.name,
        slug: productSlug,
        description: data.description,
    price: Number(price),
    stock: Number(stock),
        images: JSON.stringify(images),
        categoryId,
        active: data.active !== undefined ? data.active : true,
      },
    });
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : [];
  const category = data.category || { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" };
  const slug = (data.slug || data.name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const newProduct = { ...data, _id: `prod-${Date.now()}`, slug: slug || `produit-${Date.now()}`, category, active: data.active !== undefined ? data.active : true };
  all.unshift(newProduct);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all, null, 2), "utf-8");
  return newProduct;
}

export async function updateProduct(id, data) {
  await ensureDb();
  if (prisma) {
    let categoryId = data.categoryId || data.category?._id || data.categorySlug || "cat-1";
    if (data.category) {
      const existing = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!existing) {
        const cat = await prisma.category.upsert({
          where: { slug: data.category.slug },
          create: { name: data.category.name, slug: data.category.slug },
          update: { name: data.category.name },
        });
        categoryId = cat.id;
      }
    }
    const price = typeof data.price === "string" ? parseFloat(data.price) : data.price;
    const stock = typeof data.stock === "string" ? parseInt(data.stock, 10) : data.stock;
    const images = Array.isArray(data.images) ? data.images : [];
    const rawSlug = data.slug || data.name;
    let targetSlug = rawSlug;
    if (!targetSlug) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (existing) targetSlug = existing.slug;
    }
    const existingSlug2 = targetSlug ? await prisma.product.findUnique({ where: { slug: targetSlug } }) : null;
    const productSlug = targetSlug && existingSlug2 && existingSlug2.id !== id ? `${targetSlug}-${Date.now()}` : targetSlug;
    const row = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: productSlug,
    price: Number(price),
    stock: Number(stock),
        images: JSON.stringify(images),
        categoryId,
        active: data.active !== undefined ? data.active : data.active,
      },
    });
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  let all = [];
  if (fs.existsSync(file)) all = JSON.parse(fs.readFileSync(file, "utf-8"));
  const index = all.findIndex((p) => String(p._id) === String(id) || p.slug === id);
  if (index === -1) return { error: "Produit non trouvé" };
  const category = data.category || { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" };
  all[index] = { ...all[index], ...data, category, active: data.active !== undefined ? data.active : all[index].active };
  fs.writeFileSync(file, JSON.stringify(all, null, 2), "utf-8");
  return all[index];
}

export async function deleteProduct(id) {
  await ensureDb();
  if (prisma) {
    const r = await prisma.product.delete({ where: { id } });
    return { ok: true };
  }
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "data", "products.json");
  if (!fs.existsSync(file)) return { ok: true };
  let all = JSON.parse(fs.readFileSync(file, "utf-8"));
  const filtered = all.filter((p) => String(p._id) !== String(id) && p.slug !== id);
  fs.writeFileSync(file, JSON.stringify(filtered, null, 2), "utf-8");
  return { ok: true };
}
