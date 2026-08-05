import mongoose from "mongoose";

const boqItemSchema = new mongoose.Schema({
  roomCategory: {
    type: String,
    enum: ["Kitchen", "Bedroom", "Living", "Wardrobe", "TV Unit", "False Ceiling", "Bathroom", "Custom"],
    default: "Living"
  },
  itemName: { type: String, required: true },
  material: { type: String, default: "Commercial Plywood / Italian Marble" },
  brand: { type: String, default: "Hettich / Hafele" },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: "sq.ft" },
  price: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 18 },
  total: { type: Number, default: 0 }
});

const boqSchema = new mongoose.Schema(
  {
    boqNumber: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    clientName: { type: String, default: "Client" },
    rooms: [
      {
        name: { type: String, required: true }, // e.g. Master Bedroom, Kitchen
        items: [boqItemSchema],
        roomSubtotal: { type: Number, default: 0 }
      }
    ],
    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, enum: ["Draft", "Pending Approval", "Approved", "Rejected"], default: "Draft" },
    preparedBy: { type: String, default: "Design Team" },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("BOQ", boqSchema);
