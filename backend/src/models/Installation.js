import mongoose from "mongoose";

const installationSchema = new mongoose.Schema(
  {
    installationCode: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, required: true },
    assignedTeam: { type: String, default: "Team Alpha" },
    scheduledDate: { type: Date, default: Date.now },
    checklist: [
      {
        taskName: String,
        isCompleted: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Quality Check", "Customer Handover", "Completed"],
      default: "Scheduled"
    },
    customerSignature: { type: String, default: "" }, // Base64 or URL
    siteImages: [{ type: String }],
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Installation", installationSchema);
