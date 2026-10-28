import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    city: { type: String, default: "Bamako", trim: true },
    address: { type: String, default: "", trim: true },
    ordersCount: { type: Number, default: 1, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 }, // en FCFA
    status: { type: String, enum: ["Actif", "Régulier", "VIP", "Nouveau"], default: "Actif" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
