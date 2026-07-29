import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    style: {
      type: String,
      default: "Modern",
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    estimatedCost: {
      type: String,
      default: "",
    },
    dimensions: {
      type: String,
      default: "",
    },
    materialSpecs: {
      type: [String],
      default: [],
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

export default mongoose.model("Gallery", gallerySchema);
