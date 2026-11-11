import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeProductVariants } from "../lib/product-variants.js";

const dataDirectory = path.join(process.cwd(), "data");
const readJson = (filename, fallback) => {
  const file = path.join(dataDirectory, filename);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
};
const validDate = (value) => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL est requis pour migrer les données.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function importProductsAndCategories() {
  const localProducts = readJson("products.json", []);
  const localCategories = readJson("categories.json", []);
  const categoryBySlug = new Map();
  for (const category of localCategories) {
    if (category?.slug) categoryBySlug.set(category.slug, category);
  }
  for (const product of localProducts) {
    if (product.category?.slug && !categoryBySlug.has(product.category.slug)) {
      categoryBySlug.set(product.category.slug, product.category);
    }
  }

  const currentCategories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const databaseCategorySlugs = new Set(currentCategories.map((category) => category.slug));
  const missingCategories = [...categoryBySlug.values()]
    .filter((category) => !databaseCategorySlugs.has(category.slug))
    .map((category) => ({
      id: String(category._id || `legacy-category-${category.slug}`),
      name: category.name,
      slug: category.slug,
      images: JSON.stringify(Array.isArray(category.images) ? category.images : []),
      active: category.active !== false,
    }));
  if (missingCategories.length) {
    await prisma.category.createMany({ data: missingCategories, skipDuplicates: true });
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const currentProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
  const productSlugs = new Set(currentProducts.map((product) => product.slug));
  const productIds = new Set(currentProducts.map((product) => product.id));
  const missingProducts = localProducts
    .filter((product) => product?.slug && !productSlugs.has(product.slug))
    .map((product) => {
      const sourceId = String(product._id || `legacy-${product.slug}`);
      const id = productIds.has(sourceId) ? `legacy-${product.slug}` : sourceId;
      const categoryId = categoryIdBySlug.get(product.category?.slug);
      if (!categoryId) throw new Error(`Catégorie introuvable pour le produit ${product.slug}.`);
      productIds.add(id);
      productSlugs.add(product.slug);
      return {
        id,
        name: product.name,
        slug: product.slug,
        description: product.description || null,
        price: Number(product.price || 0),
        stock: Math.max(0, Number(product.stock) || 0),
        images: JSON.stringify(Array.isArray(product.images) ? product.images : []),
        variants: JSON.stringify(normalizeProductVariants(product.variants)),
        categoryId,
        active: product.active !== false,
        createdAt: validDate(product.createdAt),
        updatedAt: validDate(product.updatedAt || product.createdAt),
      };
    });
  if (missingProducts.length) {
    await prisma.product.createMany({ data: missingProducts, skipDuplicates: true });
  }

  return { categories: missingCategories.length, products: missingProducts.length };
}

async function importClients() {
  const markerKey = "clients-json-import-v1";
  if (await prisma.setting.findUnique({ where: { key: markerKey } })) return 0;
  const clients = readJson("clients.json", []);
  const rows = clients.filter((client) => client?.name && client?.phone).map((client, index) => {
    const createdAt = validDate(client.createdAt);
    return {
      id: String(client._id || `legacy-client-${index + 1}`),
      name: String(client.name).trim(),
      phone: String(client.phone).trim(),
      email: client.email || null,
      address: client.address || null,
      city: client.city || null,
      ordersCount: Math.max(0, Number(client.ordersCount) || 0),
      totalSpent: Number(client.totalSpent) || 0,
      status: client.status || "Nouveau",
      notes: client.notes || null,
      createdAt,
      updatedAt: createdAt,
    };
  });
  if (rows.length) await prisma.client.createMany({ data: rows, skipDuplicates: true });
  await prisma.setting.upsert({
    where: { key: markerKey },
    update: { value: "complete" },
    create: { key: markerKey, value: "complete" },
  });
  return rows.length;
}

async function importSetting(key, filename, transform = (value) => value) {
  if (await prisma.setting.findUnique({ where: { key } })) return false;
  const value = readJson(filename, null);
  if (value === null) return false;
  await prisma.setting.create({ data: { key, value: JSON.stringify(await transform(value)) } });
  return true;
}

try {
  await prisma.$connect();
  const catalog = await importProductsAndCategories();
  const clients = await importClients();
  const profileImported = await importSetting("admin-profile", "admin-profile.json");
  const alertsImported = await importSetting("stock-alerts-state", "stock-alerts-state.json");
  const heroImported = await importSetting("hero-showcase", "hero-showcase.json", async (selection) => {
    const sourceSlots = JSON.parse(fs.readFileSync(path.join(dataDirectory, "products.json"), "utf-8"));
    const legacyProduct = sourceSlots.find((product) => String(product._id) === String(selection?.productId));
    if (!legacyProduct) return selection;
    const databaseProduct = await prisma.product.findUnique({ where: { slug: legacyProduct.slug }, select: { id: true } });
    return databaseProduct ? { ...selection, productId: databaseProduct.id } : selection;
  });

  console.log(JSON.stringify({
    importedCategories: catalog.categories,
    importedProducts: catalog.products,
    checkedClients: clients,
    importedAdminProfile: profileImported,
    importedStockAlerts: alertsImported,
    importedHeroSelection: heroImported,
  }));
} finally {
  await prisma.$disconnect();
}