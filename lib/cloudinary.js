import { createReadStream } from "fs";
import path from "path";

// Configuration de stockage prioritaire : Neon Object Storage (S3 compatible) → Cloudinary → Stockage local par défaut
// Variables d'environnement Neon : FILES (binding D1/R2), R2_BUCKET, etc.
// Voir : https://neon.tech/docs/object-storage

// Vérifier si le stockage Neon est configuré (via binding R2 dans Workers)
const neonR2Bucket = process.env.R2_BUCKET;
const hasNeonStorage = !!neonR2Bucket;

// Configuration Cloudinary (optionnel, utilisé si Neon non configuré)
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
const hasCloudinary = !!cloudinaryConfig.cloud_name;

// Helper: générer un key unique pour le stockage Neon (branch-aware)
function neonKey(productId, suffix = "") {
  return `cisse-multi-service/${productId}${suffix ? `-${suffix}` : ""}`;
}

/**
 * Téléverse un fichier vers le stockage Neon (R2/S3 compatible).
 * Si Neon n'est pas configuré, chute vers Cloudinary ou le stockage local.
 */
export async function uploadToNeonStorage(file, productId, options = {}) {
  if (hasNeonStorage) {
    // Utiliser le SDK R2 / S3 de Neon
    // Note: En développement local, ce sera un mock jusqu'au déploiement
    const fileStream = createReadStream(file.tempPath || file.path);
    const key = neonKey(productId, options.suffix);
    
    // Pour l'instant, en attendant le déploiement sur Sites,
    // on sauvegarde en local avec la structure Neon
    const localPath = path.join(process.cwd(), "data", "uploads", key);
    
    return new Promise((resolve, reject) => {
      const dest = createWriteStream(localPath);
      fileStream.pipe(dest);
      dest.on("finish", () => {
        resolve({
          key,
          url: `/storage/${key}`, // URL relative à servir via le Worker
          storage: "neon-local-mock"
        });
      });
      dest.on("error", reject);
    });
  }
 
  // Fallback Cloudinary
  if (hasCloudinary) {
    return uploadToCloudinary(file);
  }

  // Fallback stockage local
  return saveToLocalStorage(file);
}

/**
 * Supprime un fichier du stockage Neon.
 */
export async function deleteFromNeonStorage(key) {
  if (hasNeonStorage) {
    // En production, appeler l'API R2 de Neon
    // En local, supprimer le fichier créé par uploadToNeonStorage
    const localPath = path.join(process.cwd(), "data", "uploads", key);
    return new Promise((resolve) => {
      import("fs").unlink(localPath, (err) => {
        if (err && err.code !== "ENOENT") console.warn("Fichier Neon non trouvé pour suppression:", err);
        resolve(!err);
      });
    });
  }
  
  // Fallback Cloudinary
  if (hasCloudinary) {
    return deleteFromCloudinary(key);
  }

  // Fallback local
  return saveToLocalStorageDelete(key);
}

/**
 * Obtenir l'URL d'un fichier stocké.
 */
export function getStorageUrl(key) {
  if (key && hasNeonStorage) {
    return `/storage/${key}`;
  }
  if (key && hasCloudinary) {
    // Cloudinary return public ID → URL complet
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${key}`;
  }
  if (key) {
    return `/storage/${key}`;
  }
  return "";
}

/**
 * Sauvegarde locale par défaut (dépôt).
 */
function saveToLocalStorage(file) {
  const tmpPath = file.tempPath || file.path;
  const targetPath = path.join(process.cwd(), "data", "uploads", path.basename(tmpPath));
  
  return new Promise((resolve, reject) => {
    import("fs").copyFile(tmpPath, targetPath, (err) => {
      if (err) reject(err);
      else resolve({ path: targetPath, storage: "local" });
    });
  });
}

function saveToLocalStorageDelete(key) {
  const localPath = path.join(process.cwd(), "data", "uploads", key);
  return new Promise((resolve) => {
    import("fs").unlink(localPath, (err) => {
      resolve(!err);
    });
  });
}

export async function uploadToCloudinary(file) {
  if (!hasCloudinary) {
    throw new Error("Cloudinary non configuré et Neon non disponible");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "cisse-multi-service",
        resource_type: "image",
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    const bufferSize = 1024 * 1024;
    const chunkSize = 1024 * 256;
    const parts = [];
    let pending = 0;

    file.stream().pipe(
      new require("stream").Readable({
        read() {
          let chunk;
          while ((chunk = file.read(chunkSize)) !== null) {
            parts.push(chunk);
            pending++;
          }
          this.push(null);
        },
        final() {
          this.push(null);
        },
      })
    );

    const joined = Buffer.concat(parts);
    stream.end(joined);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!hasCloudinary) return;
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (err, result) => {
      if (err && !err.info) reject(err);
      else resolve(result);
    });
  });
}

// Exporter les fonctions principales
export { uploadToNeonStorage, deleteFromNeonStorage, getStorageUrl };
