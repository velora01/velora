import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    hsnSac: { type: String, default: "HSN/SAC" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "1" },
    rate: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: true }
);

const partyDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    gstin: { type: String, default: "" },
    address: { type: String, default: "" }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    projectName: { type: String, default: "" },
    projectNumber: { type: String, default: "" },
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
    taxPercent: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    
    // Additional info
    termsAndConditions: {
      type: String,
      default:
        "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance payment upon signing the work contract.\n2. 40% on material delivery at site or production clearance.\n3. Balance 10% on completion and final snag handover."
    },
    bankDetails: {
      type: String,
      default:
        "Account Holder: NETTLE CREEK INTERIORS\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
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

invoiceSchema.index({ invoiceNumber: 1, clientName: 1, projectName: 1 });

export default mongoose.model("Invoice", invoiceSchema);
