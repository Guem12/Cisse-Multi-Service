import mongoose from "mongoose";

// Connexion mise en cache : indispensable en serverless (Netlify/Vercel)
let cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquant dans .env.local");
  if (cached.conn) return cached.conn;

  cached.promise ||= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 3000, // Timeout rapide (3s max au lieu de 30s) pour éviter de bloquer la page
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null; // Réinitialise pour permettre une nouvelle tentative
    throw err;
  }
}
