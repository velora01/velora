import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    tag: { type: String, default: "Luxury Interior" },
    slug: { type: String, default: "" },
    description: { type: String, default: "" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    clientName: { type: String, default: "Bespoke Client" },
    address: { type: String, default: "Pune, Maharashtra" },
    designer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    budget: { type: Number, default: 2500000 },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    stage: {
      type: String,
      enum: [
        "Lead",
        "Consultation",
        "Site Visit",
        "Quotation",
        "BOQ",
        "Design",
        "Approval",
        "Production",
        "Dispatch",
        "Installation",
        "Handover",
        "Completed"
      ],
      default: "Consultation",
    },
    progressPercent: { type: Number, default: 15 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    image: { type: String, default: "" },
    images: [{ type: String }],
    video: { type: String, default: "" },
    comments: [
      {
        user: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    milestones: [
      {
        title: String,
        targetDate: Date,
        completed: { type: Boolean, default: false }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
