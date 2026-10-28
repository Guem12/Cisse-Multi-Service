// Remplit la base avec les catégories et quelques produits de démonstration.
// Ne fait rien si des catégories existent déjà. Lancer avec : npm run seed
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
const categories = db.collection("categories");

if (await categories.countDocuments()) {
  console.log("La base contient déjà des catégories : rien à faire.");
  process.exit(0);
}

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const now = new Date();

const names = ["Sacs à dos", "Écouteurs sans fil", "Bandoulières", "Montres", "Cagoules", "Bracelets & bijouterie"];
const { insertedIds } = await categories.insertMany(
  names.map((name) => ({ name, slug: slugify(name), createdAt: now, updatedAt: now }))
);

const demo = [
  [0, "Sac à dos urbain", 12500, 10],
  [1, "Écouteurs sans fil", 8000, 25],
  [2, "Sac bandoulière", 6500, 15],
  [3, "Montre classique", 15000, 8],
  [4, "Cagoule polaire", 2500, 30],
  [5, "Bracelet fantaisie", 3000, 40],
];
await db.collection("products").insertMany(
  demo.map(([i, name, price, stock]) => ({
    name, slug: slugify(name), description: "Produit de démonstration", price, stock,
    images: [], category: insertedIds[i], active: true, createdAt: now, updatedAt: now, __v: 0,
  }))
);

console.log("Base initialisée : 6 catégories et 6 produits de démonstration.");
process.exit(0);
