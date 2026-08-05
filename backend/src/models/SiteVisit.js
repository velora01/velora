import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema(
  {
    visitCode: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String, default: "" },
    address: { type: String, required: true },
    assignedDesigner: { type: String, default: "Senior Designer" },
    assignedSales: { type: String, default: "Sales Manager" },
    scheduledDate: { type: Date, default: Date.now },
    gpsCoordinates: { type: String, default: "18.5204, 73.8567" },
    visitNotes: { type: String, default: "" },
    siteImages: [{ type: String }],
    customerSignature: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "En Route", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  { timestamps: true }
);

export default mongoose.model("SiteVisit", siteVisitSchema);
