import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    permissions: [
      {
        module: { type: String, required: true }, // e.g. "Leads", "Projects", "BOQ", "Invoices", "Factory", "Users"
        actions: [{ type: String, enum: ["create", "read", "update", "delete", "export", "approve"] }]
      }
    ],
    isSystemDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
