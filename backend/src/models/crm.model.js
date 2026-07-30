import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const crmSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    projectCategory: {
      type: String,
      required: true,
      enum: [

        "Modular Kitchen",
        "Wardrobes",
        "Living Room",
        "Bedroom",
        "Bathroom",
        "Dining Room",
        "Commercial Office",
        "Full Home Interior",
        "Other",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Inquiry",
        "Consultation",
        "Proposal",
        "Booked",
        "Designing",
        "Production",
        "Installation",
        "Completed",
        "Cancelled",
      ],
      default: "Inquiry",
    },
    propertyAddress: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedBudget: {
      type: String,
      default: "Not Specified",
    },
    notes: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    source: {
      type: String,
      default: "Manual Entry",
    },
    consultRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consult",
    },
    contactRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to add status history if status changes or on creation
crmSchema.pre("save", function (next) {
  if (this.isModified("status") || this.isNew) {
    // Check if status is already in history, if not, append it
    const lastHistory = this.statusHistory[this.statusHistory.length - 1];
    if (!lastHistory || lastHistory.status !== this.status) {
      this.statusHistory.push({
        status: this.status,
        updatedAt: new Date(),
        comment: this.isNew ? "Lead registered in CRM." : "Status updated.",
      });
    }
  }
  next();
});

export default mongoose.model("CRMLead", crmSchema);
