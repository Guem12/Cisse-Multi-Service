import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");

const DEFAULT_CLIENTS = [
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
    totalSpent: 41000,
    status: "Régulier",
    notes: "Commande supplémentaire en cours.",
    createdAt: "2026-09-15T14:30:00.000Z",
  },
  {
    _id: "cli-3",
    name: "Ibrahim Diallo",
    phone: "22360123456",
    email: "ibrahim.diallo@email.com",
    city: "Bamako",
    address: "Nobelville",
    ordersCount: 1,
    totalSpent: 18000,
    status: "Nouveau",
    notes: "",
    createdAt: "2026-10-01T09:15:00.000Z",
  },
];

export async function getClients() {
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      const raw = fs.readFileSync(CLIENTS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Lecture clients.json échouée:", e.message);
  }
  return DEFAULT_CLIENTS;
}

export async function saveClients(clients) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), "utf-8");
    return clients;
  } catch (e) {
    console.error("Écriture clients.json échouée:", e.message);
    throw e;
  }
}

export async function getClientById(id) {
  const clients = await getClients();
  return clients.find((c) => c._id === id) || null;
}

export async function createClient(data) {
  const clients = await getClients();
  const newClient = {
    _id: `cli-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    email: data.email || "",
    address: data.address || "",
    city: data.city || "",
    ordersCount: 0,
    totalSpent: 0,
    status: "Nouveau",
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
  };
  clients.unshift(newClient);
  saveClients(clients);
  return newClient;
}

export async function updateClient(id, data) {
  const clients = await getClients();
  const index = clients.findIndex((c) => c._id === id);
  if (index === -1) {
    return { error: "Client non trouvé" };
  }
  clients[index] = {
    ...clients[index],
    ...data,
    name: data.name || clients[index].name,
    phone: data.phone || clients[index].phone,
    email: data.email !== undefined ? data.email : clients[index].email,
    address: data.address !== undefined ? data.address : clients[index].address,
    city: data.city !== undefined ? data.city : clients[index].city,
    notes: data.notes !== undefined ? data.notes : clients[index].notes,
  };
  saveClients(clients);
  return clients[index];
}

export async function deleteClient(id) {
  const clients = await getClients();
  const filtered = clients.filter((c) => c._id !== id);
  if (filtered.length === clients.length) {
    return { error: "Client non trouvé" };
  }
  saveClients(filtered);
  return { ok: true };
}
