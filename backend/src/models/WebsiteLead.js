import mongoose from "mongoose";

const websiteLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, default: "Pune" },
    propertyType: { type: String, default: "Residential Villa" },
    budget: { type: String, default: "₹25L - ₹50L" },
    message: { type: String, default: "" },
    preferredMeetingDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["New", "Contacted", "Converted to Lead", "Converted to Client", "Archived"],
      default: "New",
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    convertedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("WebsiteLead", websiteLeadSchema);
