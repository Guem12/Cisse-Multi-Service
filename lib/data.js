import fs from "node:fs";
import path from "node:path";
import { prisma, initDb } from "./postgres.js";
import { normalizeProductVariants } from "./product-variants.js";

async function ensureDb() {
  if (prisma) {
    await initDb();
    return;
  }
  // Fallback JSON si PostgreSQL n'est pas configuré
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
    return rows.map((r) => ({
      _id: r.id,
      name: r.name,
      slug: r.slug,
      images: JSON.parse(r.images || "[]"),
      active: r.active,
    }));
  }
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
    const where = includeInactive ? {} : { active: true };
    if (categorySlug) where.category = { slug: categorySlug };
    const rows = await prisma.product.findMany({
      where,
      include: { category: true },
      ...(limit ? { take: limit, orderBy: { createdAt: "desc" } } : {}),
    });
    // Prisma Decimal → Number (sinon React refuse d'afficher le prix)
    const plain = rows.map((r) => ({
      _id: r.id,
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      price: Number(r.price),
      stock: r.stock,
      images: JSON.parse(r.images || "[]"),
      variants: normalizeProductVariants(r.variants || "[]"),
      categoryId: r.categoryId,
      active: r.active,
      category: r.category ? { _id: r.category.id, name: r.category.name || "", slug: r.category.slug || "" } : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    if (limit) return plain.slice(0, limit);
    return plain;
  }
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (Array.isArray(data)) {
        let filtered = includeInactive ? data : data.filter((p) => p.active);
        if (categorySlug) filtered = filtered.filter((p) => p.category?.slug === categorySlug);
        if (limit) filtered = filtered.slice(0, limit);
        return filtered.map((product) => ({
          ...product,
          variants: normalizeProductVariants(product.variants),
        }));
      }
    }
  } catch (e) {
    console.warn("Lecture produits échouée:", e.message);
  }
  return [];
}

function mapProductRow(row) {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    images: JSON.parse(row.images || "[]"),
    variants: normalizeProductVariants(row.variants || "[]"),
    categoryId: row.categoryId,
    active: row.active,
    category: row.category ? { _id: row.category.id, name: row.category.name || "", slug: row.category.slug || "" } : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function catalogOrder(sort) {
  if (sort === "prix-asc") return { price: "asc" };
  if (sort === "prix-desc") return { price: "desc" };
  if (sort === "nom") return { name: "asc" };
  return { createdAt: "desc" };
}

function matchesCatalog(product, { categorySlug, query, minPrice, maxPrice }) {
  if (categorySlug && product.category?.slug !== categorySlug) return false;
  if (query) {
    const haystack = `${product.name || ""} ${product.description || ""}`.toLocaleLowerCase("fr");
    if (!haystack.includes(query)) return false;
  }
  const price = Number(product.price);
  if (minPrice != null && price < minPrice) return false;
  if (maxPrice != null && price > maxPrice) return false;
  return true;
}

function sortCatalog(items, sort) {
  const copy = [...items];
  if (sort === "prix-asc") return copy.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "prix-desc") return copy.sort((a, b) => Number(b.price) - Number(a.price));
  if (sort === "nom") return copy.sort((a, b) => String(a.name).localeCompare(String(b.name), "fr"));
  return copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getProductPage({
  categorySlug,
  query,
  minPrice,
  maxPrice,
  sort = "recent",
  page = 1,
  pageSize = 24,
} = {}) {
  await ensureDb();

  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 24;
  const safeSort = ["recent", "prix-asc", "prix-desc", "nom"].includes(sort) ? sort : "recent";
  const needle = String(query || "").trim().toLocaleLowerCase("fr").slice(0, 80);

  if (prisma) {
    const where = { active: true };
    if (categorySlug) where.category = { slug: categorySlug };
    if (needle) {
      where.OR = [
        { name: { contains: needle, mode: "insensitive" } },
        { description: { contains: needle, mode: "insensitive" } },
      ];
    }
    if (minPrice != null || maxPrice != null) {
      where.price = {};
      if (minPrice != null) where.price.gte = minPrice;
      if (maxPrice != null) where.price.lte = maxPrice;
    }

    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: catalogOrder(safeSort),
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: rows.map(mapProductRow),
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }

  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      if (Array.isArray(data)) {
        const filtered = sortCatalog(
          data.filter((product) => product.active && matchesCatalog(product, {
            categorySlug,
            query: needle,
            minPrice,
            maxPrice,
          })),
          safeSort,
        );
        return {
          items: filtered
            .slice((safePage - 1) * safePageSize, safePage * safePageSize)
            .map((product) => ({ ...product, variants: normalizeProductVariants(product.variants) })),
          total: filtered.length,
          page: safePage,
          pageCount: Math.ceil(filtered.length / safePageSize),
        };
      }
    }
  } catch (e) {
    console.warn("Lecture produits échouée:", e.message);
  }

  return { items: [], total: 0, page: safePage, pageCount: 0 };
}

export async function getStorefrontFacts() {
  await ensureDb();
  if (prisma) {
    const [categories, productCount] = await Promise.all([
      prisma.category.findMany({
        where: { active: true, products: { some: { active: true } } },
        select: {
          name: true,
          slug: true,
          images: true,
          _count: { select: { products: { where: { active: true } } } },
          products: {
            where: { active: true },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { images: true },
          },
        },
      }),
      prisma.product.count({ where: { active: true } }),
    ]);
    const listed = categories.map((category) => {
      const categoryImages = JSON.parse(category.images || "[]");
      const productImages = JSON.parse(category.products[0]?.images || "[]");
      return {
        name: category.name,
        slug: category.slug,
        count: category._count.products,
        image: categoryImages[0]?.url || productImages[0]?.url || "",
      };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
    return {
      productCount,
      categories: listed,
    };
  }

  const products = await getProducts();
  const buckets = new Map();
  for (const product of products) {
    const slug = product.category?.slug;
    const name = product.category?.name;
    if (!slug || !name) continue;
    const current = buckets.get(slug) || { name, slug, count: 0, image: "" };
    current.count += 1;
    if (!current.image && product.images?.[0]?.url) current.image = product.images[0].url;
    buckets.set(slug, current);
  }
  const categories = [...buckets.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
  return { productCount: products.length, categories };
}

export async function getSimilarProducts(product, limit = 4) {
  if (!product) return [];
  const primary = await getProductPage({
    categorySlug: product.category?.slug || undefined,
    pageSize: limit + 8,
  });
  const same = primary.items.filter((item) => item.slug !== product.slug);
  if (same.length >= limit || !product.category?.slug) return same.slice(0, limit);
  const more = await getProductPage({ pageSize: limit + 12 });
  const extra = more.items.filter((item) => item.slug !== product.slug && !same.some((entry) => entry.slug === item.slug));
  return [...same, ...extra].slice(0, limit);
}

export async function getProductBySlug(slug) {
  await ensureDb();
  if (prisma) {
    const row = await prisma.product.findFirst({
      where: { slug, active: true },
      include: { category: true },
    });
    if (!row) return null;
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), variants: normalizeProductVariants(row.variants || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      const product = data.find((p) => p.slug === slug && p.active) || null;
      return product ? { ...product, variants: normalizeProductVariants(product.variants) } : null;
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
    const row = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!row) return null;
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), variants: normalizeProductVariants(row.variants || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const file = path.join(process.cwd(), "data", "products.json");
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      const product = data.find((p) => String(p._id) === String(id) || p.slug === id) || null;
      return product ? { ...product, variants: normalizeProductVariants(product.variants) } : null;
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
        variants: JSON.stringify(normalizeProductVariants(data.variants)),
        categoryId,
        active: data.active !== undefined ? data.active : true,
      },
    });
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), variants: normalizeProductVariants(row.variants || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const file = path.join(process.cwd(), "data", "products.json");
  const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : [];
  const category = data.category || { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" };
  const slug = (data.slug || data.name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const newProduct = { ...data, variants: normalizeProductVariants(data.variants), _id: `prod-${Date.now()}`, slug: slug || `produit-${Date.now()}`, category, active: data.active !== undefined ? data.active : true };
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
        variants: JSON.stringify(normalizeProductVariants(data.variants)),
        categoryId,
        active: data.active !== undefined ? data.active : data.active,
      },
    });
    return { _id: row.id, name: row.name, slug: row.slug, description: row.description, price: Number(row.price), stock: row.stock, images: JSON.parse(row.images || "[]"), variants: normalizeProductVariants(row.variants || "[]"), category: { _id: row.categoryId, name: row.category?.name || "", slug: row.category?.slug || "" }, active: row.active, categoryId: row.categoryId };
  }
  const file = path.join(process.cwd(), "data", "products.json");
  let all = [];
  if (fs.existsSync(file)) all = JSON.parse(fs.readFileSync(file, "utf-8"));
  const index = all.findIndex((p) => String(p._id) === String(id) || p.slug === id);
  if (index === -1) return { error: "Produit non trouvé" };
  const category = data.category || { _id: "cat-1", name: "Sacs à dos", slug: "sacs-a-dos" };
  all[index] = { ...all[index], ...data, variants: normalizeProductVariants(data.variants), category, active: data.active !== undefined ? data.active : all[index].active };
  fs.writeFileSync(file, JSON.stringify(all, null, 2), "utf-8");
  return all[index];
}

export async function deleteProduct(id) {
  await ensureDb();
  if (prisma) {
    const r = await prisma.product.delete({ where: { id } });
    return { ok: true };
  }
  const file = path.join(process.cwd(), "data", "products.json");
  if (!fs.existsSync(file)) return { ok: true };
  let all = JSON.parse(fs.readFileSync(file, "utf-8"));
  const filtered = all.filter((p) => String(p._id) !== String(id) && p.slug !== id);
  fs.writeFileSync(file, JSON.stringify(filtered, null, 2), "utf-8");
  return { ok: true };
}
