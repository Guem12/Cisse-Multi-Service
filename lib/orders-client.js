import { clearOrder, getOrderWhatsAppUrl } from "@/lib/cart";

export async function submitWhatsAppOrder(items, phone, details = {}) {
  const popup = window.open("about:blank", "_blank");
  if (popup) popup.opener = null;

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ slug, quantity, variant }) => ({ slug, quantity, variant })),
        deliveryAddress: details.deliveryAddress || "",
        paymentMethod: details.paymentMethod || "",
      }),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("Le serveur a renvoyé une réponse invalide.");
    }
    if (!response.ok) {
      throw new Error(result.error || "La commande n'a pas pu être enregistrée.");
    }

    const whatsappUrl = getOrderWhatsAppUrl(result.items, phone, {
      ...details,
      orderReference: result.reference,
    });
    if (popup) popup.location.href = whatsappUrl;
    else window.location.assign(whatsappUrl);
    return result;
  } catch (error) {
    popup?.close();
    throw error;
  }
}

export { clearOrder };
