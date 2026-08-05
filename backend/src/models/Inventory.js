import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Hardware", "Plywood", "Laminates", "Marble", "Veneer", "Fittings", "Lighting", "Fabrics", "Glass", "Paint"],
      default: "Hardware"
    },
    brand: { type: String, default: "Hettich" },
    unit: { type: String, default: "sq.ft" },
    unitPrice: { type: Number, default: 0 },
    stockQty: { type: Number, default: 100 },
    reorderLevel: { type: Number, default: 20 },
    vendorName: { type: String, default: "Prime Materials Supplier" },
    images: [{ type: String }],
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Material", materialSchema);
