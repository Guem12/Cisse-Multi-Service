function cleanVariant(variant = {}) {
  return Object.fromEntries(
    ["Couleur", "Taille"]
      .filter((name) => typeof variant[name] === "string" && variant[name].trim())
      .map((name) => [name, variant[name].trim().slice(0, 40)]),
  );
}

export function getOrderLineId(item) {
  return `${item.slug}::${JSON.stringify(cleanVariant(item.variant))}`;
}

export function getOrderItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cisse_order");
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items)
      ? items
          .filter((item) => item?.slug)
          .map((item) => ({
            ...item,
            quantity: Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0
              ? Number(item.quantity)
              : 1,
          }))
      : [];
  } catch (error) {
    console.error("Impossible de lire la commande locale:", error);
    return [];
  }
}

export function saveOrderItems(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cisse_order", JSON.stringify(items));
    window.dispatchEvent(new Event("cisse_order_updated"));
    return true;
  } catch (error) {
    console.error("Impossible d'enregistrer la commande locale:", error);
    window.dispatchEvent(new CustomEvent("cisse_order_error", { detail: "La commande n'a pas pu être enregistrée sur cet appareil." }));
    return false;
  }
}

export function addToOrder(product, quantity = 1, variant = {}) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
  const items = getOrderItems();
  const cleanSelection = cleanVariant(variant);
  const lineId = getOrderLineId({ slug: product.slug, variant: cleanSelection });
  const existing = items.find((item) => getOrderLineId(item) === lineId);
  const nextQuantity = (Number(existing?.quantity) || 0) + quantity;
  const stock = Number(product.stock);
  const productQuantity = items
    .filter((item) => item.slug === product.slug)
    .reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  if (Number.isFinite(stock) && productQuantity + quantity > stock) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cisse_order_error", { detail: "La quantité demandée dépasse le stock disponible." }));
    }
    return false;
  }

  if (existing) {
    existing.quantity = nextQuantity;
    if (Number.isFinite(stock)) existing.stock = stock;
  } else {
    items.push({
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      quantity,
      stock: Number.isFinite(stock) ? stock : undefined,
      image: product.images?.[0]?.url || product.image || "",
      variant: cleanSelection,
    });
  }
  return saveOrderItems(items);
}

export function removeFromOrder(lineId) {
  const items = getOrderItems().filter((item) => getOrderLineId(item) !== lineId);
  saveOrderItems(items);
  return items;
}

export function updateOrderQty(lineId, quantity) {
  const items = getOrderItems();
  const item = items.find((entry) => getOrderLineId(entry) === lineId);
  if (!item) return items;
  if (quantity <= 0) return removeFromOrder(lineId);
  const otherVariantQuantity = items
    .filter((entry) => entry.slug === item.slug && entry !== item)
    .reduce((sum, entry) => sum + (Number(entry.quantity) || 1), 0);
  if (
    !Number.isSafeInteger(quantity) ||
    (Number.isFinite(item.stock) && otherVariantQuantity + quantity > item.stock)
  ) return items;
  item.quantity = quantity;
  saveOrderItems(items);
  return items;
}

export function clearOrder() {
  saveOrderItems([]);
}

export function getOrderWhatsAppUrl(items, number = "22362823995", details = {}) {
  const phone = String(number).replace(/\D/g, "");
  if (!items || items.length === 0) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(
      "Bonjour Cissé Multi-Service, je souhaite passer une commande.",
    )}`;
  }
  let total = 0;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = items.map((item) => {
    const subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    total += subtotal;
    const fullImage = item.image
      ? item.image.startsWith("http")
        ? item.image
        : `${origin}${item.image}`
      : "";
    const variants = Object.entries(cleanVariant(item.variant))
      .map(([name, value]) => `${name} : ${value}`)
      .join(" · ");
    return [
      `• *${item.name}*${variants ? ` (${variants})` : ""} × ${item.quantity} = ${new Intl.NumberFormat("fr-FR").format(subtotal)} FCFA`,
      ...(fullImage ? [`  📸 Photo : ${fullImage}`] : []),
      `  🔗 Lien : ${origin}/produit/${item.slug}`,
    ].join("\n");
  });
  const delivery = details.deliveryAddress?.trim() || "À préciser";
  const payment = details.paymentMethod || "À convenir";
  const text = `Bonjour Cissé Multi-Service, je souhaite commander :\n\n${lines.join(
    "\n\n",
  )}\n\n*Total articles : ${new Intl.NumberFormat("fr-FR").format(
    total,
  )} FCFA*\n*Quartier / adresse : ${delivery}*\n*Mode de paiement souhaité : ${payment}*\n\n(Frais de livraison et disponibilité à confirmer selon le trajet.)`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
