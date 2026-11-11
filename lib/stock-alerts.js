import fs from "fs";
import path from "path";
import { initDb, prisma, query, queryOne } from "./postgres";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "stock-alerts-state.json");
const STATE_SETTING_KEY = "stock-alerts-state";

const DEFAULT_STATE = {
  enabled: true,
  interval: 15,
  channel: "sms",
  targets: [
    {
      id: "admin",
      type: "phone",
      value: process.env.ADMIN_PHONE || "+22362823995",
      active: true,
    },
  ],
  triggers: {
    lowStock: true,
    outOfStock: true,
  },
};

function readLocalState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const data = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...data };
    }
  } catch (e) {
    console.warn("Lecture stock-alerts-state.json échouée:", e.message);
  }
  return { ...DEFAULT_STATE };
}

async function writeState(state) {
  if (prisma) {
    await initDb();
    await prisma.setting.upsert({
      where: { key: STATE_SETTING_KEY },
      update: { value: JSON.stringify(state) },
      create: { key: STATE_SETTING_KEY, value: JSON.stringify(state) },
    });
    return;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Écriture stock-alerts-state.json échouée:", e.message);
  }
}

let checkTimer = null;

export async function startStockAlerts() {
  if (checkTimer) return;
  const state = await getStockAlertsState();
  if (!state.enabled) return;

  console.log("[stock-alerts] Moteur démarré, intervalle:", state.interval, "min");
  checkTimer = setInterval(async () => {
    try {
      const low = await query(
        "SELECT p._id, p.name, p.stock, p.price, p.images, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id WHERE p.stock > 0 AND p.stock <= $1 ORDER BY p.stock ASC",
        [Math.min(state.interval, 999)]
      );
      const out = await query(
        "SELECT p._id, p.name, p.stock, p.price, p.images, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id WHERE p.stock = 0"
      );

      if ((low && low.rows && low.rows.length) || (out && out.rows && out.rows.length)) {
        for (const row of low?.rows || []) {
          await sendAlert("Stock bas", `${row.name} : ${row.stock} en stock restant (catégorie ${row.category || ""})`, row);
        }
        for (const row of out?.rows || []) {
          await sendAlert("Rupture de stock", `${row.name} est en rupture de stock !`, row);
        }
      }
    } catch (e) {
      console.error("[stock-alerts] Problème lors du contrôle:", e.message);
    }
  }, state.interval * 60 * 1000);
}

export async function stopStockAlerts() {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}

export async function getStockAlertsState() {
  if (prisma) {
    await initDb();
    const setting = await prisma.setting.findUnique({ where: { key: STATE_SETTING_KEY } });
    if (setting) return { ...DEFAULT_STATE, ...JSON.parse(setting.value) };

    const state = readLocalState();
    await writeState(state);
    return state;
  }
  return readLocalState();
}

export async function setStockAlertsState(state) {
  const updated = { ...(await getStockAlertsState()), ...state };
  await writeState(updated);
  return updated;
}

async function sendAlert(type, message, product) {
  const targets = (await getStockAlertsState()).targets.filter((t) => t.active);
  if (!targets.length) return;

  const text = `[Cissé Multi-Service] ${type}\nProduit : ${product?.name}\nQuantité restante : ${product?.stock}\nPrix : ${product?.price?.toLocaleString("fr-FR")} FCFA\nURL : https://cisse-multi-service.vercel.app/produit/${product?._id}\nVous recevez ce message car l'alerte de stock est activée.`;

  for (const t of targets) {
    try {
      if (t.type === "whatsapp") {
        await sendWhatsApp(t.value, text);
      } else {
        await sendSms(t.value, text);
      }
    } catch (e) {
      console.error(`[stock-alerts] Échec pour ${t.type} ${t.value}:`, e.message);
    }
  }
}

async function sendWhatsApp(phone, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.warn("[stock-alerts] WhatsApp non configuré pour l'envoi d'alertes.");
    return;
  }
  const normalized = phone.replace(/\D/g, "");
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: `+${normalized}`,
    type: "template",
    template: {
      name: "stock_alert",
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

async function sendSms(phone, text) {
  const provider = process.env.SMS_PROVIDER || "twilio";
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (provider === "twilio" && accountSid && authToken && from) {
    const params = new URLSearchParams();
    params.append("From", from);
    params.append("To", phone);
    params.append("Body", text.slice(0, 1600));
    const res = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json", {
      method: "POST",
      body: params,
      headers: { Authorization: "Basic " + Buffer.from(accountSid + ":" + authToken).toString("base64") },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Twilio: ${res.status} ${JSON.stringify(err)}`);
    }
    return;
  }

  // Fallback HTTP : API SMS générique
  const apiKey = process.env.SMS_API_KEY;
  if (apiKey) {
    const res = await fetch("https://api.sms.example.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({ to: phone, text: text.slice(0, 1600) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`SMS API: ${res.status} ${JSON.stringify(err)}`);
    }
    return;
  }

  console.warn("[stock-alerts] Aucun fournisseur SMS/Twilio configuré pour ses alertes.");
}
