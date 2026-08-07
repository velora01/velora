import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, default: "Pune" },
    propertyType: { type: String, default: "3BHK Apartment" },
    address: { type: String, default: "" },
    siteArea: { type: Number, default: 0 },
    possessionStatus: {
      type: String,
      enum: ["Possession Handed Over", "Under Construction", "Ready to Move", "N/A"],
      default: "N/A",
    },
    stylePreference: {
      type: String,
      enum: ["Modern", "Minimalist", "Traditional", "Mid-Century", "Scandinavian", "Bohemian", "Transitional", "Other"],
      default: "Modern",
    },
    scopeOfWork: {
      type: [String],
      default: [],
    },
    nextMeetingDate: { type: Date, default: null },
    budget: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Booking", "Design Phase", "Product Work Started", "Production Completed", "Under Installation", "Delivered", "Lost"],
      default: "Booking",
    },
    source: {
      type: String,
      enum: ["Instagram", "Google", "Website", "Facebook", "Reference", "WhatsApp"],
      default: "Website",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    followUpReminder: { type: Date, default: null },
    notes: { type: String, default: "" },
    attachments: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
    timeline: [
      {
        stage: String,
        note: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    isDuplicate: { type: Boolean, default: false }
  },
  { timestamps: true }
);

leadSchema.index({ phone: 1, email: 1 });

export default mongoose.model("Lead", leadSchema);
