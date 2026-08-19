import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    // Contact Information (Step 1)
    salutation: { type: String, default: "Mr" },
    name: { type: String, required: true, trim: true },
    enquiryNo: { type: String, default: "" },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    enquiryDate: { type: Date, default: Date.now },
    address: { type: String, default: "" },
    occupation: { type: String, default: "" },
    landlineSTD: { type: String, default: "" },
    landlineNumber: { type: String, default: "" },
    companyName: { type: String, default: "" },

    // Alternate Contact Information (Step 1)
    altSalutation: { type: String, default: "Mr" },
    altName: { type: String, default: "" },
    altPhone: { type: String, default: "" },
    altEmail: { type: String, default: "" },

    // Project Details (Step 2)
    projectType: { type: String, default: "Residential" },
    projectSubtype: { type: String, default: "" },
    siteStatus: { type: String, default: "Possession Handed Over" },
    siteSize: { type: String, default: "" },
    siteLocation: { type: String, default: "" },
    siteAddress: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    source: { type: String, default: "Website" },

    // Enquiry Details (Step 2)
    handledBy: { type: String, default: "Admin" },
    designedBy: { type: String, default: "" },
    prospectStatus: { type: String, default: "Warm" },
    budget: { type: String, default: "" },
    timeline: { type: String, default: "" },
    expectedOn: { type: Date, default: null },
    financialStatus: { type: String, default: "Self Funded" },
    priorityStatus: { type: String, default: "Medium" },
    remarks: { type: String, default: "" },

    // Visit Checkpoints (Step 2)
    officeVisited: { type: Boolean, default: false },
    siteVisited: { type: Boolean, default: false },
    referenceSiteVisited: { type: Boolean, default: false },

    // Additional Detail & Preferences (Step 3)
    scopeOfWork: {
      type: [String],
      default: [],
    },
    stylePreference: {
      type: String,
      default: "Modern",
    },
    notes: { type: String, default: "" },
    estimatedValue: { type: Number, default: 0 },
    attachments: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],

    // Lifecycle & Legacy compatibility
    status: {
      type: String,
      default: "Inquiry",
    },
    city: { type: String, default: "Pune" },
    siteArea: { type: Number, default: 0 },
    nextMeetingDate: { type: Date, default: null },
    followUpReminder: { type: Date, default: null },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    timeline: [
      {
        stage: String,
        note: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    isDuplicate: { type: Boolean, default: false }
  },
  { timestamps: true }
);

leadSchema.index({ phone: 1, email: 1 });
leadSchema.index({ name: "text", siteLocation: "text", companyName: "text" });

export default mongoose.model("Lead", leadSchema);

