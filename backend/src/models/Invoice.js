import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    productName: { type: String, required: true },
    category: { type: String, default: "Supply" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    hsnSac: { type: String, default: "HSN/SAC" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "Unit" },
    rate: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: "" }
  },
  { _id: true }
);

const partyDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    gstin: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "Pune" },
    state: { type: String, default: "Maharashtra" },
    pincode: { type: String, default: "" }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    clientId: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    projectName: { type: String, default: "" },
    projectNumber: { type: String, default: "" },
    boq: { type: mongoose.Schema.Types.ObjectId, ref: "BOQ", default: null },
    boqNumber: { type: String, default: "" },
    invoiceType: { type: String, enum: ["Supply", "Service", "Turnkey Execution", "Civil Work"], default: "Supply" },
    
    // Parties
    clientName: { type: String, required: true },
    clientEmail: { type: String, default: "" },
    clientPhone: { type: String, default: "" },
    clientAddress: { type: String, default: "" },
    
    billTo: { type: partyDetailsSchema, default: () => ({}) },
    shipTo: { type: partyDetailsSchema, default: () => ({}) },
    sameAsBillTo: { type: Boolean, default: true },

    // Line items
    items: [invoiceItemSchema],

    // Calculations
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    additionalCharges: {
      installation: { type: Number, default: 0 },
      transportation: { type: Number, default: 0 },
      design: { type: Number, default: 0 },
      labour: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      totalCharges: { type: Number, default: 0 }
    },
    taxPercent: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    
    // Additional info
    termsAndConditions: {
      type: String,
      default:
        "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance along with work order confirmation.\n2. 40% on material delivery or production clearance.\n3. Balance 10% on completion and final snag handover."
    },
    bankDetails: {
      type: String,
      default:
        "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
    },

    status: {
      type: String,
      enum: ["Draft", "Issued", "Paid", "Partially Paid", "Overdue", "Cancelled"],
      default: "Issued"
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 1, clientName: 1, projectName: 1, client: 1 });

export default mongoose.model("Invoice", invoiceSchema);
