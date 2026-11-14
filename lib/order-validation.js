const paymentMethods = new Set(["Orange Money", "Moov Money", "Espèces"]);

export function normalizeOrderDetails(body) {
  const deliveryAddress = typeof body?.deliveryAddress === "string"
    ? body.deliveryAddress.trim()
    : "";
  if (!deliveryAddress) {
    throw new Error("Indiquez le quartier et l'adresse de livraison.");
  }
  if (deliveryAddress.length > 120) {
    throw new Error("L'adresse ne peut pas dépasser 120 caractères.");
  }
  if (typeof body?.paymentMethod !== "string" || !paymentMethods.has(body.paymentMethod)) {
    throw new Error("Mode de paiement invalide.");
  }
  return { deliveryAddress, paymentMethod: body.paymentMethod };
}
