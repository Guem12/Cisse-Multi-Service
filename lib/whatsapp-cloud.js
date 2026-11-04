import { query } from "./postgres";

export async function isWhatsAppConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsApp(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    throw new Error("WhatsApp Business non configuré (token ou phone number id manquant)");
  }
  const normalized = String(to).replace(/\D/g, "");
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: `+${normalized}`,
    type: "template",
    template: {
      name: "order_confirmation",
      language: { code: "fr" },
      components: [
        { type: "body", parameters: [{ type: "text", text: text.slice(0, 1024) }] },
      ],
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp: ${res.status} ${JSON.stringify(err)}`);
  }
}
