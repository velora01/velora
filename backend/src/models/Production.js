import mongoose from "mongoose";

const productionSchema = new mongoose.Schema(
  {
    productionCode: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, required: true },
    factoryLocation: { type: String, default: "Main Plant - Chakan, Pune" },
    assignedFactoryManager: { type: String, default: "Factory Manager" },
    status: {
      type: String,
      enum: ["Queued", "Cutting", "Polishing", "Painting", "Assembly", "Packaging", "Dispatch", "Completed"],
      default: "Queued"
    },
    estimatedCompletion: { type: Date },
    stagesLog: [
      {
        stageName: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Production", productionSchema);
