import { isAdmin } from "@/lib/guard";
import { randomUUID } from "node:crypto";
import { uploadObject } from "@/lib/neon-storage.js";

export const dynamic = "force-dynamic";
const imageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function POST(req) {
  const requestId = randomUUID();
  try {
    if (!isAdmin(req)) return Response.json({ error: "Non autorisé" }, { status: 401 });
    const file = (await req.formData()).get("file");
    if (!file || typeof file === "string") return Response.json({ error: "Aucun fichier" }, { status: 400 });
    const extension = imageTypes.get(file.type);
    if (!extension) return Response.json({ error: "Formats acceptés : JPEG, PNG et WebP." }, { status: 400 });
    if (file.size === 0) return Response.json({ error: "Le fichier est vide." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Image trop lourde (5 Mo maximum)" }, { status: 400 });

    const key = `uploads/${randomUUID()}${extension}`;
    const url = await uploadObject(key, Buffer.from(await file.arrayBuffer()), file.type);
    return Response.json({ url });
  } catch (e) {
    console.error(JSON.stringify({
      event: "admin-avatar-upload-error",
      requestId,
      errorName: e?.name,
      errorCode: e?.code,
      errorMessage: e?.message,
      stack: e?.stack,
    }));
    return Response.json(
      { error: "Échec de l'envoi vers Neon Object Storage.", requestId },
      { status: 500 },
    );
  }
}
