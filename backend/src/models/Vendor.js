import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    category: { type: String, default: "Interior Hardware & Materials" },
    gstin: { type: String, default: "" },
    address: { type: String, default: "" },
    rating: { type: Number, default: 4.5 }
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
