import { initDb, prisma } from "@/lib/postgres";
import { normalizeProductVariants } from "@/lib/product-variants.js";

const paymentMethods = new Set(["Orange Money", "Moov Money", "Espèces"]);

class OrderValidationError extends Error {}

function firstImage(images) {
  try {
    const parsed = JSON.parse(images || "[]");
    const image = Array.isArray(parsed) ? parsed[0] : null;
    return typeof image === "string" ? image : image?.url || "";
  } catch {
    return "";
  }
}

function normalizeVariant(product, input) {
  const variants = normalizeProductVariants(product.variants);
  const selected = {};
  for (const variant of variants) {
    const value = typeof input?.[variant.name] === "string" ? input[variant.name].trim() : "";
    if (!variant.options.includes(value)) {
      throw new OrderValidationError(`Choisissez une option valide pour « ${variant.name} » sur ${product.name}.`);
    }
    selected[variant.name] = value;
  }
  return selected;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Données de commande invalides." }, { status: 400 });
  }

  if (!prisma) {
    return Response.json({ error: "La base de données des commandes n'est pas configurée." }, { status: 503 });
  }
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 40) {
    return Response.json({ error: "La commande doit contenir entre 1 et 40 articles." }, { status: 400 });
  }
  if (body.paymentMethod && !paymentMethods.has(body.paymentMethod)) {
    return Response.json({ error: "Mode de paiement invalide." }, { status: 400 });
  }
  if (typeof body.deliveryAddress === "string" && body.deliveryAddress.length > 120) {
    return Response.json({ error: "L'adresse ne peut pas dépasser 120 caractères." }, { status: 400 });
  }

  try {
    await initDb();
    if (body.items.some((item) => !item || typeof item.slug !== "string" || item.slug.length > 120)) {
      return Response.json({ error: "Un article de la commande est invalide." }, { status: 400 });
    }
    const slugs = [...new Set(body.items.map((item) => item.slug))];

    const products = await prisma.product.findMany({
      where: { slug: { in: slugs }, active: true },
      select: { id: true, slug: true, name: true, price: true, stock: true, images: true, variants: true },
    });
    const productBySlug = new Map(products.map((product) => [product.slug, product]));
    const requestedBySlug = new Map();
    const orderItems = body.items.map((item) => {
      if (!item || typeof item.slug !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        throw new OrderValidationError("La quantité ou l'article sélectionné est invalide.");
      }
      const product = productBySlug.get(item.slug);
      if (!product) throw new OrderValidationError("Un article n'est plus disponible dans le catalogue.");

      const variant = normalizeVariant(product, item.variant);
      requestedBySlug.set(item.slug, (requestedBySlug.get(item.slug) || 0) + item.quantity);
      if (requestedBySlug.get(item.slug) > product.stock) {
        throw new OrderValidationError(`Le stock disponible pour « ${product.name} » est insuffisant.`);
      }

      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        image: firstImage(product.images),
        variant,
      };
    });

    const total = Math.round(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const order = await prisma.order.create({
      data: {
        status: "whatsapp_pending",
        items: JSON.stringify(orderItems),
        total: total.toFixed(2),
        deliveryAddress: typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() || null : null,
        paymentMethod: body.paymentMethod || null,
      },
      select: { id: true, createdAt: true },
    });

    return Response.json({
      success: true,
      id: order.id,
      reference: order.id.slice(-8).toUpperCase(),
      createdAt: order.createdAt,
      items: orderItems,
      total,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/orders error:", error);
    return Response.json({ error: "Erreur lors de l'enregistrement de la commande." }, { status: 500 });
  }
}
