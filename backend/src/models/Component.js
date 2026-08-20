import mongoose from "mongoose";

const variantDetailSchema = {
  type: { type: String, default: "Box" },
  rate: { type: Number, default: 0 },
  unit: {
    lengthFt: { type: Number, default: 0 },
    lengthIn: { type: Number, default: 0 },
    heightFt: { type: Number, default: 0 },
    heightIn: { type: Number, default: 0 },
    depthFt: { type: Number, default: 0 },
    depthIn: { type: Number, default: 0 },
    rate: { type: Number, default: 0 }
  },
  images: [
    {
      url: { type: String, required: true },
      name: { type: String, default: "" },
      publicId: { type: String, default: "" }
    }
  ],
  description: { type: String, default: "" }
};

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
    selectedVariants: {
      type: [String],
      default: ["Elite", "Premium", "Standard"]
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
      rate: { type: Number, default: 2200 },
      unit: {
        lengthFt: { type: Number, default: 0 },
        lengthIn: { type: Number, default: 0 },
        heightFt: { type: Number, default: 0 },
        heightIn: { type: Number, default: 0 },
        depthFt: { type: Number, default: 0 },
        depthIn: { type: Number, default: 0 },
        rate: { type: Number, default: 2200 }
      },
      images: [
        {
          url: { type: String, required: true },
          name: { type: String, default: "" },
          publicId: { type: String, default: "" }
        }
      ],
      description: { type: String, default: "" }
    },
    premium: {
      type: { type: String, default: "Box" },
      rate: { type: Number, default: 1800 },
      unit: {
        lengthFt: { type: Number, default: 0 },
        lengthIn: { type: Number, default: 0 },
        heightFt: { type: Number, default: 0 },
        heightIn: { type: Number, default: 0 },
        depthFt: { type: Number, default: 0 },
        depthIn: { type: Number, default: 0 },
        rate: { type: Number, default: 1800 }
      },
      images: [
        {
          url: { type: String, required: true },
          name: { type: String, default: "" },
          publicId: { type: String, default: "" }
        }
      ],
      description: { type: String, default: "" }
    },
    standard: {
      type: { type: String, default: "Box" },
      rate: { type: Number, default: 1500 },
      unit: {
        lengthFt: { type: Number, default: 0 },
        lengthIn: { type: Number, default: 0 },
        heightFt: { type: Number, default: 0 },
        heightIn: { type: Number, default: 0 },
        depthFt: { type: Number, default: 0 },
        depthIn: { type: Number, default: 0 },
        rate: { type: Number, default: 1500 }
      },
      images: [
        {
          url: { type: String, required: true },
          name: { type: String, default: "" },
          publicId: { type: String, default: "" }
        }
      ],
      description: { type: String, default: "" }
    },
    images: [
      {
        url: { type: String, required: true },
        name: { type: String, default: "" },
        publicId: { type: String, default: "" }
      }
    ],
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
