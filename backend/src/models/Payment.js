import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    clientName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "UPI", "Cheque", "Credit Card", "Cash"],
      default: "Bank Transfer"
    },
    transactionId: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Completed", "Failed", "Refunded"], default: "Completed" },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
