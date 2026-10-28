import mongoose from "mongoose";
import "./Category"; // enregistre le modèle pour populate()

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // en FCFA
    stock: { type: Number, default: 0, min: 0 },
    images: [{ url: String, publicId: String }], // Cloudinary
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
