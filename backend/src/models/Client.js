import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientCode: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, default: "Pune" },
    address: { type: String, default: "" },
    gstin: { type: String, default: "" },
    assignedDesigner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedSales: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Lead", "Active", "Completed", "Archived"], default: "Active" },
    notes: { type: String, default: "" },
    communicationHistory: [
      {
        channel: { type: String, enum: ["Call", "Email", "Meeting", "WhatsApp"] },
        summary: String,
        performedBy: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    documents: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
    gallery: [{ title: String, url: String, uploadedAt: { type: Date, default: Date.now } }]
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
