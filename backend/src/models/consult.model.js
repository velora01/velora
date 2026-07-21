import mongoose from "mongoose";

const consultSchema = new mongoose.Schema(
  {
    propertyType: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Consult", consultSchema);