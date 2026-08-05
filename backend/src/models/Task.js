import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigneeName: { type: String, default: "Unassigned" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    status: { type: String, enum: ["Todo", "In Progress", "Review", "Completed"], default: "Todo" },
    deadline: { type: Date },
    checklist: [
      {
        item: String,
        completed: { type: Boolean, default: false }
      }
    ],
    comments: [
      {
        user: String,
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    attachments: [{ name: String, url: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
