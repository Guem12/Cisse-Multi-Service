import fs from "fs";
import path from "path";
import { initDb, prisma } from "./postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_FILE = path.join(DATA_DIR, "admin-profile.json");
const PROFILE_SETTING_KEY = "admin-profile";

const DEFAULT_PROFILE = {
  firstName: "Mamadou",
  lastName: "Cissé",
  phone: "22362823995",
  email: "admin@cisse.ml",
  password: process.env.ADMIN_PASSWORD || "",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

export async function getAdminProfile() {
  if (prisma) {
    await initDb();
    const setting = await prisma.setting.findUnique({ where: { key: PROFILE_SETTING_KEY } });
    if (setting) return { ...DEFAULT_PROFILE, ...JSON.parse(setting.value) };

    const profile = readLocalProfile() || { ...DEFAULT_PROFILE };
    await prisma.setting.create({
      data: { key: PROFILE_SETTING_KEY, value: JSON.stringify(profile) },
    });
    return profile;
  }

  const profile = readLocalProfile();
  if (profile) return profile;

  const defaultProfile = { ...DEFAULT_PROFILE };
  await saveAdminProfile(defaultProfile);
  return defaultProfile;
}

function readLocalProfile() {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const raw = fs.readFileSync(PROFILE_FILE, "utf-8");
      const data = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...data };
    }
  } catch (e) {
    console.warn("Lecture admin-profile.json échouée:", e.message);
  }
  return null;
}

async function saveAdminProfile(profile) {
  if (prisma) {
    await initDb();
    await prisma.setting.upsert({
      where: { key: PROFILE_SETTING_KEY },
      update: { value: JSON.stringify(profile) },
      create: { key: PROFILE_SETTING_KEY, value: JSON.stringify(profile) },
    });
    return;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), "utf-8");
  } catch (e) {
    console.error("Écriture admin-profile.json échouée:", e.message);
    throw e;
  }
}

export async function updateAdminProfile(data) {
  const current = await getAdminProfile();
  const updated = {
    firstName: data.firstName !== undefined ? String(data.firstName).trim() : current.firstName,
    lastName: data.lastName !== undefined ? String(data.lastName).trim() : current.lastName,
    phone: data.phone !== undefined ? String(data.phone).trim() : current.phone,
    email: data.email !== undefined ? String(data.email).trim() : current.email,
    password: data.password && String(data.password).trim().length > 0 ? String(data.password).trim() : current.password,
    avatar: data.avatar || current.avatar,
  };
  await saveAdminProfile(updated);
  return updated;
}
