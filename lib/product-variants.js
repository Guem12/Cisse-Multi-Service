const VARIANT_NAMES = new Map([
  ["couleur", "Couleur"],
  ["color", "Couleur"],
  ["taille", "Taille"],
  ["size", "Taille"],
]);

export function normalizeProductVariants(value) {
  let variants = value;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(variants)) return [];

  const normalized = new Map();
  for (const variant of variants) {
    const name = VARIANT_NAMES.get(String(variant?.name || variant?.type || "").trim().toLowerCase());
    if (!name || !Array.isArray(variant.options)) continue;
    const options = [...new Set(
      variant.options
        .filter((option) => typeof option === "string")
        .map((option) => option.trim().slice(0, 40))
        .filter(Boolean),
    )].slice(0, 20);
    if (options.length) normalized.set(name, { name, options });
  }
  return [...normalized.values()];
}

export function parseVariantOptions(value) {
  if (typeof value !== "string") return [];
  return [...new Set(value.split(",").map((option) => option.trim().slice(0, 40)).filter(Boolean))].slice(0, 20);
}
