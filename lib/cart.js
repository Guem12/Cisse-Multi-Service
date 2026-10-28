// Gestion du panier / liste de commande locale pour Cissé Multi-Service

export function getOrderItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cisse_order");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOrderItems(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cisse_order", JSON.stringify(items));
    window.dispatchEvent(new Event("cisse_order_updated"));
  } catch (e) {
    console.error(e);
  }
}

export function addToOrder(product, quantity = 1) {
  const items = getOrderItems();
  const existing = items.find((i) => i.slug === product.slug);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
  } else {
    items.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url || "",
    });
  }
  saveOrderItems(items);
  return items;
}

export function removeFromOrder(slug) {
  const items = getOrderItems().filter((i) => i.slug !== slug);
  saveOrderItems(items);
  return items;
}

export function updateOrderQty(slug, qty) {
  const items = getOrderItems();
  const item = items.find((i) => i.slug === slug);
  if (item) {
    if (qty <= 0) {
      return removeFromOrder(slug);
    }
    item.quantity = qty;
    saveOrderItems(items);
  }
  return items;
}

export function clearOrder() {
  saveOrderItems([]);
}

export function getOrderWhatsAppUrl(items, number = "22362823995") {
  if (!items || items.length === 0) {
    return `https://wa.me/${number}?text=${encodeURIComponent(
      "Bonjour Cissé Multi-Service, je souhaite passer une commande."
    )}`;
  }
  let total = 0;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = items.map((it) => {
    const sub = (it.price || 0) * (it.quantity || 1);
    total += sub;
    const fullImg = it.image
      ? it.image.startsWith("http")
        ? it.image
        : `${origin}${it.image}`
      : "";
    return (
      `• *${it.name}* × ${it.quantity} = ${new Intl.NumberFormat("fr-FR").format(sub)} FCFA\n` +
      (fullImg ? `  📸 Photo : ${fullImg}\n` : "") +
      `  🔗 Lien : ${origin}/produit/${it.slug}`
    );
  });

  const text = `Bonjour Cissé Multi-Service, je souhaite commander :\n\n${lines.join(
    "\n\n"
  )}\n\n*Total articles : ${new Intl.NumberFormat("fr-FR").format(
    total
  )} FCFA*\n\n*(Prix de livraison selon trajet)*`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
