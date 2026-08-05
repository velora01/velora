import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userRole: { type: String, default: "Admin" },
    action: {
      type: String,
      enum: ["Created", "Updated", "Deleted", "Approved", "Rejected", "Exported", "Login"],
      required: true
    },
    module: { type: String, required: true }, // e.g., "Leads", "BOQ", "Projects"
    description: { type: String, required: true },
    targetId: { type: String, default: "" },
    ipAddress: { type: String, default: "127.0.0.1" }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
