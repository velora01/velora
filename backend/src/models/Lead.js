import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      enum: [
        "Website Inquiry",
        "Walk-in Customer",
        "Phone Inquiry",
        "Instagram Inquiry",
        "Facebook Inquiry",
        "Reference",
        "Google"
      ],
      default: "Website Inquiry",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Site Visit",
        "Quotation Sent",
        "Negotiation",
        "Won",
        "Lost"
      ],
      default: "New",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    projectCategory: {
      type: String,
      default: "",
    },
    budget: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lead", leadSchema);
