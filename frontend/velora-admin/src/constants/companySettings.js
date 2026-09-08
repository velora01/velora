import { DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE } from "./termsAndConditionsTemplates";

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: "VELORA LUXURY INTERIORS",
  tagline: "SPACES WITHIN, DESIGNED BEAUTIFULLY",
  phone: "+91 86055 26603",
  altPhone: "+91 80555 26603",
  email: "info@velora.family",
  website: "https://velora.family",
  address: "Shop No. 4, Antaraal Plaza, Wakad, Pune, Maharashtra 411057",
  gstNumber: "27AAACV1234F1Z5",
  panNumber: "AAACV1234F",

  // Bank & Payment QR Code
  bankName: "HDFC Bank Ltd",
  accountHolderName: "VELORA INTERIORS PRIVATE LIMITED",
  accountNumber: "50200067891234",
  ifscCode: "HDFC0001234",
  branch: "Wakad, Pune",
  accountType: "Current Account",
  upiId: "velora.interiors@hdfcbank",
  qrCodeUrl: "", // Base64 data URL or hosted image URL

  // SMTP Settings
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "Velora CRM <crm@veloradesigns.com>",
  adminNotificationEmail: "admin@veloradesign.com",
  enableEmailNotifications: true,

  // Terms & Conditions Templates
  termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE
};

/**
 * Loads the active company & payment settings from localStorage or defaults
 */
export const getActiveCompanySettings = () => {
  try {
    const saved = localStorage.getItem("velora_payment_settings") || localStorage.getItem("velora_company_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_COMPANY_SETTINGS, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_COMPANY_SETTINGS;
};

/**
 * Persists updated company settings to localStorage
 */
export const saveCompanySettingsToStorage = (settings) => {
  try {
    localStorage.setItem("velora_payment_settings", JSON.stringify(settings));
    localStorage.setItem("velora_company_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {}
};

export const saveActiveCompanySettings = saveCompanySettingsToStorage;

