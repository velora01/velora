import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    clientName: { type: String, default: "" },
    boqRef: { type: mongoose.Schema.Types.ObjectId, ref: "BOQ" },
    amount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    netTotal: { type: Number, required: true },
    validUntil: { type: Date },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Declined", "Expired"],
      default: "Draft"
    },
    notes: { type: String, default: "" },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Quotation", quotationSchema);
