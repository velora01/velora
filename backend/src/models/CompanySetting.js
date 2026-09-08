import mongoose from "mongoose";

const companySettingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "VELORA LUXURY INTERIORS" },
    tagline: { type: String, default: "SPACES WITHIN, DESIGNED BEAUTIFULLY" },
    phone: { type: String, default: "+91 86055 26603" },
    altPhone: { type: String, default: "+91 80555 26603" },
    email: { type: String, default: "info@velora.family" },
    website: { type: String, default: "https://velora.family" },
    address: { type: String, default: "Shop No. 4, Antaraal Plaza, Wakad, Pune, Maharashtra 411057" },
    gstNumber: { type: String, default: "27AAACV1234F1Z5" },
    panNumber: { type: String, default: "AAACV1234F" },

    // Bank Account Details
    bankName: { type: String, default: "HDFC Bank Ltd" },
    accountHolderName: { type: String, default: "VELORA INTERIORS PRIVATE LIMITED" },
    accountNumber: { type: String, default: "50200067891234" },
    ifscCode: { type: String, default: "HDFC0001234" },
    branch: { type: String, default: "Wakad, Pune" },
    accountType: { type: String, default: "Current Account" },
    upiId: { type: String, default: "velora.interiors@hdfcbank" },
    qrCodeUrl: { type: String, default: "" }, // Base64 data URL or hosted image URL

    // SMTP Email Configuration
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    smtpFrom: { type: String, default: "Velora CRM <crm@veloradesigns.com>" },
    adminNotificationEmail: { type: String, default: "admin@veloradesign.com" },
    enableEmailNotifications: { type: Boolean, default: true },

    // Terms & Conditions Templates (Stored as JSON string or structured object)
    termsAndConditions: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("CompanySetting", companySettingSchema);
