import { formatPrice } from "./format";

/**
 * Envoie une commande vers WhatsApp avec le texte, le lien et la photo du produit
 */
export async function sendWhatsAppProductOrder({
  name,
  price,
  qty = 1,
  slug,
  imageUrl,
  phone = "22362823995",
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${origin}/produit/${slug}`;
  const fullImgUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${origin}${imageUrl}`
    : "";

  let text =
    `Bonjour Cissé Multi-Service, je souhaite commander :\n\n` +
    `• *Produit :* ${name}\n` +
    `• *Quantité :* ${qty}\n` +
    `• *Prix unitaire :* ${formatPrice(price)}\n` +
    `• *Total articles :* ${formatPrice(price * qty)}\n` +
    `• *(Prix de livraison selon trajet)*\n\n` +
    (fullImgUrl ? `📸 *Photo du produit :*\n${fullImgUrl}\n\n` : "") +
    `🔗 *Lien du produit :*\n${productUrl}`;

  // Tente le partage natif avec fichier image si supporté (mobiles Android / iOS)
  if (typeof navigator !== "undefined" && navigator.canShare && fullImgUrl) {
    try {
      const res = await fetch(fullImgUrl, { mode: "cors" });
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${slug}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Commande : ${name}`,
            text: text,
          });
          return;
        }
      }
    } catch (e) {
      // Si CORS ou annulation, fallback classique wa.me
    }
  }

  // Redirection classique vers WhatsApp avec lien et photo intégrée
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}
