import fs from "fs";
import path from "path";
import { connectDB } from "./mongodb";
import Setting from "@/models/Setting";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_FILE = path.join(DATA_DIR, "admin-profile.json");

const DEFAULT_PROFILE = {
  firstName: "Mamadou",
  lastName: "Cissé",
  phone: "22362823995",
  email: process.env.ADMIN_EMAIL || "admin@cisse.ml",
  password: process.env.ADMIN_PASSWORD || "admin1234",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

export async function getAdminProfile() {
  // 1. Essayer depuis MongoDB si configuré
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      const doc = await Setting.findOne({ key: "admin_profile" }).lean();
      if (doc?.value) {
        return { ...DEFAULT_PROFILE, ...doc.value };
      }
    } catch (e) {
      console.warn("MongoDB getAdminProfile fallback vers fichier:", e.message);
    }
  }

  // 2. Essayer depuis le fichier JSON local
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const raw = fs.readFileSync(PROFILE_FILE, "utf-8");
      const data = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...data };
    }
  } catch (e) {
    console.warn("Erreur lecture admin-profile.json:", e.message);
  }

  // Initialiser le fichier par défaut
  saveAdminProfileLocal(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

function saveAdminProfileLocal(profile) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture admin-profile.json:", e);
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

  // 1. Sauvegarde locale
  saveAdminProfileLocal(updated);

  // 2. Sauvegarde MongoDB si présent
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      await Setting.findOneAndUpdate(
        { key: "admin_profile" },
        { key: "admin_profile", value: updated },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn("MongoDB save admin_profile warning:", e.message);
    }
  }

  return updated;
}
