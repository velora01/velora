import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    visibility: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

spaceSchema.index({ name: "text", description: "text" });

export default mongoose.model("Space", spaceSchema);
