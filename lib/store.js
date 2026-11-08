export const BRAND = "Cissé Multi-Service";
export const SITE_URL = "https://cisse-multi-service.vercel.app";
export const DEFAULT_TITLE = "Cissé Multi-Service – Sacs, montres et accessoires à Bamako";
export const DEFAULT_OG_IMAGE = "/og-default.jpg";
export const LOW_STOCK_MAX = 5;
export const WHATSAPP_GREETING = "Bonjour Cissé Multi-Service, je souhaite passer une commande.";

export const PRICE_BANDS = [
  { value: "", label: "Tous les prix" },
  { value: "0-10000", label: "Jusqu'à 10 000 FCFA" },
  { value: "10000-25000", label: "10 000 à 25 000 FCFA" },
  { value: "25000-", label: "25 000 FCFA et plus" },
];

export const SORTS = [
  { value: "recent", label: "Plus récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nom", label: "Nom (A → Z)" },
];

export function siteOrigin() {
  const configured = import.meta.env.PUBLIC_SITE_URL || SITE_URL;
  return String(configured).replace(/\/$/, "");
}

export function absoluteUrl(path = "/", origin = siteOrigin()) {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path || "/", origin).href;
}

export function waLink(phone, text = WHATSAPP_GREETING) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function frenchList(items) {
  const names = items.filter(Boolean);
  if (names.length === 0) return "sacs, montres et accessoires";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
}

export function assortmentPhrase(categories = []) {
  const names = categories.slice(0, 3).map((category) => category.name);
  if (categories.length > 3) return frenchList([...names.slice(0, 2), "accessoires"]);
  return frenchList(names);
}

export function metaDescription(categories = [], count = 0) {
  const assortment = assortmentPhrase(categories);
  const stockLine = count > 0
    ? `${count} produit${count > 1 ? "s" : ""} au catalogue.`
    : "Catalogue en cours de mise à jour.";
  return `Cissé Multi-Service, boutique à Bamako : ${assortment}. ${stockLine} Commande par WhatsApp, livraison selon le trajet.`;
}

export function parsePriceBand(value) {
  if (!value || !/^\d*-?\d*$/.test(value) || !value.includes("-")) return {};
  const [minRaw, maxRaw] = value.split("-");
  const minPrice = minRaw === "" ? undefined : Number(minRaw);
  const maxPrice = maxRaw === "" ? undefined : Number(maxRaw);
  return {
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };
}

export function isLowStock(stock) {
  return Number(stock) > 0 && Number(stock) <= LOW_STOCK_MAX;
}

export function jsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
