import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: { type: String, unique: true, sparse: true },
    clientCode: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    salutation: { type: String, default: "Mr" },
    phone: { type: String, required: true, trim: true },
    altPhone: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    altEmail: { type: String, default: "" },
    city: { type: String, default: "Pune" },
    state: { type: String, default: "Maharashtra" },
    pincode: { type: String, default: "" },
    address: { type: String, default: "" },
    siteAddress: { type: String, default: "" },
    gstin: { type: String, default: "" },
    companyName: { type: String, default: "" },

    // Project & Enquiry details
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    enquiryNo: { type: String, default: "" },
    enquiryDate: { type: Date, default: Date.now },
    enquirySource: { type: String, default: "Direct / Website" },
    projectType: { type: String, default: "3BHK Luxury Apartment" },
    projectSubtype: { type: String, default: "" },
    projectLocation: { type: String, default: "Pune" },
    propertyType: { type: String, default: "Residential" },
    preferredStyle: { type: String, default: "Modern Contemporary" },
    budgetRange: { type: String, default: "₹25L - ₹40L" },
    approximateBudget: { type: Number, default: 2500000 },
    spaceRequirements: [{ type: String }],
    targetHandoverDate: { type: Date },
    specialInstructions: { type: String, default: "" },
    assignedEmployee: { type: String, default: "Admin" },
    assignedDesigner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedSales: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Lead", "Active", "Inquiry", "Proposal", "Under Execution", "Completed", "Archived"], default: "Active" },

    // Financial & Commercial Summary synchronized from BOQ
    commercialSummary: {
      subtotal: { type: Number, default: 0 },
      discountTotal: { type: Number, default: 0 },
      additionalCharges: {
        installation: { type: Number, default: 0 },
        transportation: { type: Number, default: 0 },
        design: { type: Number, default: 0 },
        labour: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
        totalCharges: { type: Number, default: 0 }
      },
      taxGst: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      balanceDue: { type: Number, default: 0 }
    },

    // Linked BOQs & Invoices
    boqs: [{ type: mongoose.Schema.Types.ObjectId, ref: "BOQ" }],
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }],

    notes: { type: String, default: "" },
    communicationHistory: [
      {
        channel: { type: String, enum: ["Call", "Email", "Meeting", "WhatsApp"], default: "Call" },
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

clientSchema.index({ phone: 1, email: 1, clientCode: 1, clientId: 1 });

export default mongoose.model("Client", clientSchema);
