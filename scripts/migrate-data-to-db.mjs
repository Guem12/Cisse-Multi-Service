import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadObject } from "../lib/neon-storage.js";
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
const imageTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".avif", "image/avif"],
]);

function listFiles(directory, baseDirectory = directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath, baseDirectory);
    if (!entry.isFile()) return [];
    return [{ fullPath, relativePath: path.relative(baseDirectory, fullPath).split(path.sep).join("/") }];
  });
}

function uploadRelativePath(value) {
  const pathname = String(value).split(/[?#]/, 1)[0].replace(/\\/g, "/");
  const marker = pathname.lastIndexOf("/uploads/");
  let relative = marker >= 0 ? pathname.slice(marker + "/uploads/".length) : pathname.startsWith("uploads/") ? pathname.slice("uploads/".length) : "";
  if (!relative) return "";
  try {
    relative = relative.split("/").map(decodeURIComponent).join("/");
  } catch {
    return "";
  }
  return relative;
}

function rewriteImageReferences(value, uploadedUrls) {
  if (typeof value === "string") {
    const relativePath = uploadRelativePath(value);
    return uploadedUrls.get(relativePath) || value;
  }
  if (Array.isArray(value)) return value.map((entry) => rewriteImageReferences(entry, uploadedUrls));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      rewriteImageReferences(entry, uploadedUrls),
    ]));
  }
  return value;
}

async function uploadLegacyImages() {
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const files = listFiles(uploadDirectory);
  const uploadedUrls = new Map();
  let uploaded = 0;
  for (const file of files) {
    const extension = path.extname(file.relativePath).toLowerCase();
    const contentType = imageTypes.get(extension);
    if (!contentType) continue;
    const buffer = fs.readFileSync(file.fullPath);
    const digest = createHash("sha256").update(buffer).digest("hex");
    const key = `migrated/uploads/${digest}${extension}`;
    uploadedUrls.set(file.relativePath, await uploadObject(key, buffer, contentType));
    uploaded += 1;
  }
  return { uploadedUrls, uploaded };
}

async function rewriteStoredImageReferences(uploadedUrls) {
  if (!uploadedUrls.size) return 0;
  let updated = 0;

  for (const product of await prisma.product.findMany({ select: { id: true, images: true } })) {
    const images = JSON.stringify(rewriteImageReferences(JSON.parse(product.images || "[]"), uploadedUrls));
    if (images !== product.images) {
      await prisma.product.update({ where: { id: product.id }, data: { images } });
      updated += 1;
    }
  }
  for (const category of await prisma.category.findMany({ select: { id: true, images: true } })) {
    const images = JSON.stringify(rewriteImageReferences(JSON.parse(category.images || "[]"), uploadedUrls));
    if (images !== category.images) {
      await prisma.category.update({ where: { id: category.id }, data: { images } });
      updated += 1;
    }
  }
  for (const setting of await prisma.setting.findMany({ select: { id: true, value: true } })) {
    let parsed;
    let serialized = true;
    try {
      parsed = JSON.parse(setting.value);
    } catch {
      parsed = setting.value;
      serialized = false;
    }
    const rewritten = rewriteImageReferences(parsed, uploadedUrls);
    const value = serialized ? JSON.stringify(rewritten) : rewritten;
    if (value !== setting.value) {
      await prisma.setting.update({ where: { id: setting.id }, data: { value } });
      updated += 1;
    }
  }
  return updated;
}

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
      images: JSON.stringify(rewriteImageReferences(Array.isArray(category.images) ? category.images : [], uploadedImageUrls)),
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
        images: JSON.stringify(rewriteImageReferences(Array.isArray(product.images) ? product.images : [], uploadedImageUrls)),
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

let uploadedImageUrls = new Map();
try {
  await prisma.$connect();
  const uploadResult = await uploadLegacyImages();
  uploadedImageUrls = uploadResult.uploadedUrls;
  const catalog = await importProductsAndCategories();
  const clients = await importClients();
  const profileImported = await importSetting("admin-profile", "admin-profile.json", async (profile) => rewriteImageReferences(profile, uploadedImageUrls));
  const alertsImported = await importSetting("stock-alerts-state", "stock-alerts-state.json");
  const heroImported = await importSetting("hero-showcase", "hero-showcase.json", async (selection) => {
    const sourceSlots = JSON.parse(fs.readFileSync(path.join(dataDirectory, "products.json"), "utf-8"));
    const legacyProduct = sourceSlots.find((product) => String(product._id) === String(selection?.productId));
    if (!legacyProduct) return selection;
    const databaseProduct = await prisma.product.findUnique({ where: { slug: legacyProduct.slug }, select: { id: true } });
    return databaseProduct ? { ...selection, productId: databaseProduct.id } : selection;
  });
  const updatedImageRecords = await rewriteStoredImageReferences(uploadedImageUrls);

  console.log(JSON.stringify({
    importedCategories: catalog.categories,
    importedProducts: catalog.products,
    checkedClients: clients,
    importedAdminProfile: profileImported,
    importedStockAlerts: alertsImported,
    importedHeroSelection: heroImported,
    uploadedImages: uploadResult.uploaded,
    updatedImageRecords,
  }));
} finally {
  await prisma.$disconnect();
}