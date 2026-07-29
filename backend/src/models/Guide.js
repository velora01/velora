import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      overview: { type: String, default: "" },
      keyTips: { type: [String], default: [] },
      recommendedMaterials: { type: [String], default: [] },
      estimatedBudget: { type: String, default: "" },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Guide", guideSchema);
