import { createHash } from "crypto";

const sign = (params) =>
  createHash("sha1")
    .update(
      Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&") + process.env.CLOUDINARY_API_SECRET
    )
    .digest("hex");

const endpoint = (action) =>
  `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/${action}`;

export async function uploadImage(file) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "cisse-multi-service";
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", process.env.CLOUDINARY_API_KEY);
  body.append("timestamp", timestamp);
  body.append("folder", folder);
  body.append("signature", sign({ folder, timestamp }));
  const res = await fetch(endpoint("upload"), { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Échec de l'envoi de l'image");
  return { url: json.secure_url, publicId: json.public_id };
}

export async function deleteImage(publicId) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    signature: sign({ public_id: publicId, timestamp }),
  });
  await fetch(endpoint("destroy"), { method: "POST", body });
}
