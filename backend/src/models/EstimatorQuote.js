import mongoose from "mongoose";

const estimatorQuoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    homeType: {
      type: String,
      required: true,
    },
    sqft: {
      type: Number,
      required: true,
    },
    packageTier: {
      type: String,
      required: true,
    },
    selectedFurniture: {
      type: [String],
      default: [],
    },
    estimatedPriceMin: {
      type: Number,
      required: true,
    },
    estimatedPriceMax: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Contacted", "Completed"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EstimatorQuote", estimatorQuoteSchema);
