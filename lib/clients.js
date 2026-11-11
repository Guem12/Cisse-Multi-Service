import fs from "fs";
import path from "path";
import { initDb, prisma } from "./postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");
const CLIENT_IMPORT_KEY = "clients-json-import-v1";

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
  if (prisma) {
    await ensureLegacyClientsImported();
    const rows = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapClient);
  }

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

function mapClient(row) {
  return {
    _id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    address: row.address || "",
    city: row.city || "",
    ordersCount: row.ordersCount,
    totalSpent: Number(row.totalSpent || 0),
    status: row.status,
    notes: row.notes || "",
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

async function ensureLegacyClientsImported() {
  await initDb();
  const marker = await prisma.setting.findUnique({ where: { key: CLIENT_IMPORT_KEY } });
  if (marker) return;

  let legacyClients = [];
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CLIENTS_FILE, "utf-8"));
      if (Array.isArray(parsed)) legacyClients = parsed;
    }
  } catch (error) {
    console.warn("Lecture clients.json échouée pendant la migration:", error.message);
    throw new Error("Les anciennes fiches clients n’ont pas pu être lues.");
  }

  const rows = legacyClients
    .filter((client) => client?.name && client?.phone)
    .map((client, index) => {
      const createdAt = new Date(client.createdAt || Date.now());
      const validCreatedAt = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
      return {
        id: String(client._id || `legacy-client-${index + 1}`),
        name: String(client.name).trim(),
        phone: String(client.phone).trim(),
        email: client.email || null,
        address: client.address || null,
        city: client.city || null,
        ordersCount: Math.max(0, Number(client.ordersCount) || 0),
        totalSpent: Number(client.totalSpent) || 0,
        status: client.status || "Nouveau",
        notes: client.notes || null,
        createdAt: validCreatedAt,
        updatedAt: validCreatedAt,
      };
    });

  if (rows.length) await prisma.client.createMany({ data: rows, skipDuplicates: true });
  await prisma.setting.upsert({
    where: { key: CLIENT_IMPORT_KEY },
    update: { value: "complete" },
    create: { key: CLIENT_IMPORT_KEY, value: "complete" },
  });
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
  if (prisma) {
    await ensureLegacyClientsImported();
    const row = await prisma.client.findUnique({ where: { id } });
    return row ? mapClient(row) : null;
  }

  const clients = await getClients();
  return clients.find((c) => c._id === id) || null;
}

export async function createClient(data) {
  if (prisma) {
    await ensureLegacyClientsImported();
    const row = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        ordersCount: Math.max(0, Number(data.ordersCount) || 0),
        totalSpent: Number(data.totalSpent) || 0,
        status: data.status || "Nouveau",
        notes: data.notes || null,
      },
    });
    return mapClient(row);
  }

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
  if (prisma) {
    await ensureLegacyClientsImported();
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return { error: "Client non trouvé" };
    const row = await prisma.client.update({
      where: { id },
      data: {
        name: data.name || existing.name,
        phone: data.phone || existing.phone,
        email: data.email !== undefined ? data.email || null : existing.email,
        address: data.address !== undefined ? data.address || null : existing.address,
        city: data.city !== undefined ? data.city || null : existing.city,
        ordersCount: data.ordersCount !== undefined ? Math.max(0, Number(data.ordersCount) || 0) : existing.ordersCount,
        totalSpent: data.totalSpent !== undefined ? Number(data.totalSpent) || 0 : existing.totalSpent,
        status: data.status !== undefined ? data.status : existing.status,
        notes: data.notes !== undefined ? data.notes || null : existing.notes,
      },
    });
    return mapClient(row);
  }

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
  if (prisma) {
    await ensureLegacyClientsImported();
    try {
      await prisma.client.delete({ where: { id } });
      return { ok: true };
    } catch (error) {
      if (error.code === "P2025") return { error: "Client non trouvé" };
      throw error;
    }
  }

  const clients = await getClients();
  const filtered = clients.filter((c) => c._id !== id);
  if (filtered.length === clients.length) {
    return { error: "Client non trouvé" };
  }
  saveClients(filtered);
  return { ok: true };
}
