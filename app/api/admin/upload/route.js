import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/guard";
import { uploadImage } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const file = (await req.formData()).get("file");
    if (!file || typeof file === "string") return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Seules les images sont acceptées" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image trop lourde (5 Mo maximum)" }, { status: 400 });

    // Si Cloudinary est configuré, on l'utilise
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const cloudResult = await uploadImage(file);
        return NextResponse.json(cloudResult);
      } catch (cloudErr) {
        console.warn("Échec Cloudinary, basculement vers stockage local:", cloudErr.message);
      }
    }

    // Fallback stockage local dans public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name ? path.extname(file.name) : ".jpg";
    const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext || ".jpg"}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error("Erreur upload route:", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
