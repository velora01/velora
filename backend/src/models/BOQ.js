import mongoose from "mongoose";

const boqComponentItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    typeVariant: { type: String, default: "Box Standard" },
    lengthFt: { type: Number, default: 0 },
    lengthIn: { type: Number, default: 0 },
    heightFt: { type: Number, default: 0 },
    heightIn: { type: Number, default: 0 },
    depthFt: { type: Number, default: 0 },
    depthIn: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    description: { type: String, default: "" },
    sqft: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    photos: [{ url: String, caption: String }]
  },
  { _id: true }
);

const boqSpaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Entrance", "Living Room", "Modular Kitchen"
    roomTotal: { type: Number, default: 0 },
    items: [boqComponentItemSchema]
  },
  { _id: true }
);

const boqSchema = new mongoose.Schema(
  {
    boqNumber: { type: String, required: true, unique: true },
    enquiryNo: { type: String, default: "" },
    enquiryDate: { type: Date, default: Date.now },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, default: "" },
    clientPhone: { type: String, default: "" },
    numberOfSpaces: { type: Number, default: 1 },
    activePackage: {
      type: String,
      enum: ["Standard", "Premium", "Elite"],
      default: "Standard"
    },
    activeCategory: {
      type: String,
      enum: ["Component", "Accessories", "Appliances", "Other Services"],
      default: "Component"
    },
    spaces: [boqSpaceSchema],
    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected"],
      default: "Draft"
    },
    preparedBy: { type: String, default: "Velora Design Team" },
    autoSave: { type: Boolean, default: true },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

boqSchema.index({ boqNumber: 1, enquiryNo: 1, clientName: 1 });

export default mongoose.model("BOQ", boqSchema);
