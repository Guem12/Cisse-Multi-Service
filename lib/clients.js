import fs from "fs";
import path from "path";
import { connectDB } from "./mongodb";
import Client from "@/models/Client";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "clients.json");

const DEMO_CLIENTS = [
  {
    _id: "cli-1",
    name: "Abdoulaye Traoré",
    phone: "22376123456",
    email: "abdoulaye.traore@gmail.com",
    city: "Bamako",
    address: "Hamdallaye ACI 2000",
    ordersCount: 4,
    totalSpent: 62000,
    status: "VIP",
    notes: "Client régulier pour les sacs à dos antivol et montres.",
    createdAt: "2026-09-12T10:00:00.000Z",
  },
  {
    _id: "cli-2",
    name: "Fatoumata Coulibaly",
    phone: "22365987412",
    email: "fatou.coul@yahoo.fr",
    city: "Bamako",
    address: "Badalabougou SEMA",
    ordersCount: 3,
    totalSpent: 38500,
    status: "Régulier",
    notes: "Préfère la livraison en après-midi. Commande par WhatsApp.",
    createdAt: "2026-09-20T14:30:00.000Z",
  },
  {
    _id: "cli-3",
    name: "Ibrahim Cissé",
    phone: "22379554433",
    email: "ibrahim.cisse@outlook.com",
    city: "Bamako",
    address: "Yirimadio 585 Logements",
    ordersCount: 2,
    totalSpent: 28000,
    status: "Actif",
    notes: "Acheté écouteurs Pro TWS et bracelet gourmette.",
    createdAt: "2026-10-02T11:15:00.000Z",
  },
  {
    _id: "cli-4",
    name: "Oumou Diarra",
    phone: "22366882211",
    email: "oumou.diarra@gmail.com",
    city: "Bamako",
    address: "Kalaban Coura ACI",
    ordersCount: 5,
    totalSpent: 75000,
    status: "VIP",
    notes: "Excellente cliente, commande souvent pour des cadeaux.",
    createdAt: "2026-08-15T09:40:00.000Z",
  },
  {
    _id: "cli-5",
    name: "Moussa Konaté",
    phone: "22378441199",
    email: "moussa.k@gmail.com",
    city: "Kati",
    address: "Kati Centre",
    ordersCount: 1,
    totalSpent: 15000,
    status: "Nouveau",
    notes: "Première commande de sac à dos urbain.",
    createdAt: "2026-10-18T16:20:00.000Z",
  },
  {
    _id: "cli-6",
    name: "Aminata Sangaré",
    phone: "22373082453",
    email: "aminata.sangare@gmail.com",
    city: "Bamako",
    address: "Sébénikoro",
    ordersCount: 2,
    totalSpent: 26500,
    status: "Actif",
    notes: "Sacoche bandoulière cuir et montre chronographe.",
    createdAt: "2026-10-22T13:00:00.000Z",
  },
];

function readLocalClients() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    console.warn("Erreur lecture clients.json:", e.message);
  }
  // Initialise le fichier local avec les données de démo
  writeLocalClients(DEMO_CLIENTS);
  return DEMO_CLIENTS;
}

function writeLocalClients(clients) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(clients, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture clients.json:", e);
  }
}

export async function getClients() {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const list = await Client.find().sort({ createdAt: -1 }).lean();
      if (list && list.length > 0) return JSON.parse(JSON.stringify(list));
    } catch (e) {
      console.warn("MongoDB getClients fallback:", e.message);
    }
  }
  return readLocalClients();
}

export async function createClient(data) {
  const newClient = {
    _id: "cli-" + Date.now(),
    name: data.name?.trim(),
    phone: data.phone?.trim()?.replace(/\s+/g, ""),
    email: data.email?.trim() || "",
    city: data.city?.trim() || "Bamako",
    address: data.address?.trim() || "",
    ordersCount: Number(data.ordersCount) || 1,
    totalSpent: Number(data.totalSpent) || 0,
    status: data.status || "Actif",
    notes: data.notes?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  // 1. Sauvegarde locale
  const list = readLocalClients();
  list.unshift(newClient);
  writeLocalClients(list);

  // 2. Sauvegarde MongoDB si présent
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const created = await Client.create(data);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn("MongoDB createClient warning:", e.message);
    }
  }

  return newClient;
}

export async function deleteClient(id) {
  const list = readLocalClients().filter((c) => String(c._id) !== String(id));
  writeLocalClients(list);

  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      await Client.findByIdAndDelete(id);
    } catch (e) {}
  }
  return true;
}
