import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    clientName: { type: String, required: true },
    clientEmail: { type: String, default: "" },
    clientPhone: { type: String, default: "" },
    clientAddress: { type: String, default: "" },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        gstPercent: { type: Number, default: 18 },
        total: Number
      }
    ],
    subtotal: { type: Number, required: true },
    gstTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Draft", "Issued", "Paid", "Partially Paid", "Overdue", "Cancelled"],
      default: "Issued"
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
