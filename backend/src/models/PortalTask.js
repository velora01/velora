import mongoose from "mongoose";

const portalTaskSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    done: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedModel",
    },
    assignedModel: {
      type: String,
      enum: ["User", "Customer"],
      default: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PortalTask", portalTaskSchema);
