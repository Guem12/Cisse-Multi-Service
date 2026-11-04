import { isAdmin } from "@/lib/guard";

import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!(isAdmin(req))) return Response.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const file = (await req.formData()).get("file");
    if (!file || typeof file === "string") return Response.json({ error: "Aucun fichier" }, { status: 400 });
    if (!file.type.startsWith("image/")) return Response.json({ error: "Seules les images sont acceptées" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Image trop lourde (5 Mo maximum)" }, { status: 400 });

    // Fallback stockage local dans public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name ? path.extname(file.name) : ".jpg";      const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext || ".jpg"}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error("Erreur upload route:", e);
    return Response.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
