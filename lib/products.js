// Nettoie et valide les données d'un produit
export function cleanProduct(b = {}) {
  const data = {
    name: String(b.name || "").trim(),
    description: String(b.description || "").trim(),
    price: Number(b.price),
    stock: Math.max(0, parseInt(b.stock, 10) || 0),
    category: b.category,
    images: (b.images || []).filter((i) => i?.url).map((i) => ({ url: i.url, publicId: i.publicId })),
    active: b.active !== false,
  };
  if (!data.name) return { error: "Le nom est obligatoire." };
  if (!Number.isFinite(data.price) || data.price < 0) return { error: "Le prix est invalide." };
  if (!data.category || String(data.category).trim().length === 0) return { error: "Choisissez une catégorie." };
  return data;
}
