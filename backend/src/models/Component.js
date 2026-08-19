import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relevantSpace: {
      type: String,
      default: "General",
      trim: true
    },
    variant: {
      type: String,
      default: "Box",
      trim: true
    },
    description: {
      type: String,
      default: "Used in BOQ when a variant has no description"
    },
    visibility: {
      type: Boolean,
      default: true
    },
    elite: {
      type: { type: String, default: "Box" },
      rate: { type: Number, default: 2200 }
    },
    premium: {
      type: { type: String, default: "Box" },
      rate: { type: Number, default: 1800 }
    },
    standard: {
      type: { type: String, default: "Box" },
      rate: { type: Number, default: 1500 }
    },
    unit: {
      type: String,
      default: "sq.ft"
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

componentSchema.index({ name: "text", relevantSpace: "text", variant: "text" });

export default mongoose.model("Component", componentSchema);
