import React, { useState, useEffect } from "react";
import {
  Settings,
  QrCode,
  Building2,
  Mail,
  FileText,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  DollarSign,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import erpApi from "../services/erpService";
import {
  getActiveCompanySettings,
  saveActiveCompanySettings,
  DEFAULT_COMPANY_SETTINGS
} from "../constants/companySettings";
import {
  DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE,
  getActiveTermsTemplate,
  saveActiveTermsTemplate
} from "../constants/termsAndConditionsTemplates";

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState("payment_qr"); // 'payment_qr' | 'terms_conditions' | 'smtp_email' | 'company_profile'
  const [settings, setSettings] = useState(getActiveCompanySettings());
  const [tcTemplate, setTcTemplate] = useState(getActiveTermsTemplate());
  const [saving, setSaving] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Load from backend if available, fallback to localStorage
    erpApi.getSettings?.().then((res) => {
      if (res?.data) {
        setSettings({ ...DEFAULT_COMPANY_SETTINGS, ...res.data });
        if (res.data.termsAndConditions) {
          setTcTemplate({ ...DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE, ...res.data.termsAndConditions });
        }
      }
    }).catch(() => {
      // Fallback already in initial state
    });
  }, []);

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, or SVG)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setSettings((prev) => ({
        ...prev,
        qrCodeUrl: base64Data
      }));
      showToast("Payment QR Code loaded successfully. Click 'Save All Settings' to persist.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        termsAndConditions: tcTemplate
      };

      // 1. Save locally for instant offline/print availability
      saveActiveCompanySettings(payload);
      saveActiveTermsTemplate(tcTemplate);

      // 2. Persist to backend database
      await erpApi.updateSettings(payload);

      showToast("All Settings & Universal Payment QR successfully saved!", "success");
    } catch (err) {
      console.error("Failed to sync settings with backend:", err);
      // Still saved locally
      showToast("Settings saved locally! (Backend sync optional)", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      showToast("Please enter a valid test recipient email address", "error");
      return;
    }

    setTestEmailLoading(true);
    try {
      const res = await erpApi.testEmail({
        recipientEmail: testEmailRecipient,
        smtpConfig: {
          host: settings.smtpHost,
          port: settings.smtpPort,
          secure: settings.smtpSecure,
          user: settings.smtpUser,
          pass: settings.smtpPass,
          fromName: settings.smtpFromName
        }
      });

      if (res?.success) {
        showToast(res.message || "Test email sent successfully! Please check your inbox.", "success");
      } else {
        showToast(res?.message || "Failed to send test email. Verify SMTP credentials.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error sending test email. Check SMTP credentials.", "error");
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Payment Plan Milestone Helpers
  const handleMilestoneChange = (idx, field, val) => {
    const updated = [...tcTemplate.paymentPlan];
    updated[idx] = { ...updated[idx], [field]: val };
    setTcTemplate({ ...tcTemplate, paymentPlan: updated });
  };

  const addMilestone = () => {
    setTcTemplate({
      ...tcTemplate,
      paymentPlan: [...tcTemplate.paymentPlan, { milestone: "New Milestone", percent: 10, description: "Milestone completion" }]
    });
  };

  const removeMilestone = (idx) => {
    const updated = tcTemplate.paymentPlan.filter((_, i) => i !== idx);
    setTcTemplate({ ...tcTemplate, paymentPlan: updated });
  };

  // Terms List Item Helpers
  const handleTermChange = (idx, field, val) => {
    const updated = [...tcTemplate.termsList];
    updated[idx] = { ...updated[idx], [field]: val };
    setTcTemplate({ ...tcTemplate, termsList: updated });
  };

  const addTermClause = () => {
    setTcTemplate({
      ...tcTemplate,
      termsList: [...tcTemplate.termsList, { title: "Additional Clause", text: "Details of terms and conditions clause." }]
    });
  };

  const removeTermClause = (idx) => {
    const updated = tcTemplate.termsList.filter((_, i) => i !== idx);
    setTcTemplate({ ...tcTemplate, termsList: updated });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-slate-900 border-[#D4AF37]/50 text-amber-300"
              : "bg-red-900 border-red-500/50 text-red-200"
          }`}
        >
          {notification.type === "success" ? <CheckCircle size={20} className="text-[#D4AF37]" /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-[#9E7B1D]/30 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9E7B1D] flex items-center justify-center text-slate-950 font-black shadow-inner">
              <Settings size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#FAF9F5]">Platform & Business Settings</h1>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Universal Payment QR, Bank Accounts, Terms & Conditions, SMTP Email Alerts & Company Profile
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#DFBE5B] hover:to-[#D4AF37] text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {[
          { id: "payment_qr", label: "Payment QR & Bank Details", icon: QrCode, badge: "BOQ & Invoices" },
          { id: "terms_conditions", label: "Terms & Conditions Templates", icon: FileText, badge: "16 Clauses" },
          { id: "smtp_email", label: "SMTP Email Server & Alerts", icon: Mail, badge: "Automated" },
          { id: "company_profile", label: "Company Profile & Tax Info", icon: Building2, badge: "Branding" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#9E7B1D] to-[#7A5E14] text-white shadow-md"
                  : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              <Icon size={16} className={isActive ? "text-amber-200" : "text-[#9E7B1D]"} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-amber-50 text-[#9E7B1D] border border-amber-200"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Payment QR & Bank Details */}
      {activeTab === "payment_qr" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bank Account Details Form */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <DollarSign size={20} className="text-[#9E7B1D]" />
                Official Bank Account Details
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                These bank details will automatically display on all generated BOQs, Estimations, Quotations, and Tax Invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={settings.accountHolderName}
                  onChange={(e) => setSettings({ ...settings, accountHolderName: e.target.value })}
                  placeholder="e.g. VELORA INTERIORS PRIVATE LIMITED"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="e.g. 50200073374185"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={settings.ifscCode}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0000282"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={settings.branch}
                  onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                  placeholder="e.g. Wakad, Pune"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Account Type</label>
                <select
                  value={settings.accountType}
                  onChange={(e) => setSettings({ ...settings, accountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-semibold"
                >
                  <option value="Current Account">Current Account</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Escrow Account">Escrow Account</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-bold mb-1">UPI ID (VPA) for Direct Payments</label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. velora.interiors@hdfcbank"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#9E7B1D] text-stone-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Universal QR Upload & Live Preview */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <QrCode size={18} className="text-[#9E7B1D]" />
                  Universal Payment QR Code
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Upload once here; it automatically attaches to all BOQ prints, Estimations, and Invoices.
                </p>
              </div>

              {/* QR Preview Area */}
              <div className="mt-4 flex flex-col items-center justify-center p-6 bg-stone-50 border-2 border-dashed border-[#D4AF37]/50 rounded-2xl text-center">
                {settings.qrCodeUrl ? (
                  <div className="space-y-3">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-44 h-44 object-contain mx-auto bg-white p-2 rounded-xl shadow-md border border-stone-200"
                    />
                    <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Active QR Code Attached
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <QrCode size={48} className="mx-auto text-stone-300" />
                    <p className="text-xs font-semibold text-stone-500">No QR code uploaded yet</p>
                    <p className="text-[10px] text-stone-400">Upload PhonePe, GPay, Paytm, or BHIM QR image</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="mt-4">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-850 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-all">
                  <Upload size={14} className="text-[#D4AF37]" />
                  <span>{settings.qrCodeUrl ? "Change QR Image" : "Upload QR Code Image"}</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-[#7A5E14] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Live Print Synchronization
              </p>
              <p>
                When any designer or sales staff prints a BOQ or Tax Invoice, this QR code will render at top clarity next to the bank details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Terms & Conditions Templates */}
      {activeTab === "terms_conditions" && (
        <div className="space-y-6">
          {/* Section 1: Payment Plan Milestones */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <DollarSign size={18} className="text-[#9E7B1D]" />
                  Payment Plan Milestones (Auto-calculated on BOQ & Invoices)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">Customize default milestone split percentage and milestone text.</p>
              </div>

              <button
                onClick={addMilestone}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all"
              >
                <Plus size={14} />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {tcTemplate.paymentPlan.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#9E7B1D]/10 text-[#9E7B1D] font-black flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={m.milestone}
                      onChange={(e) => handleMilestoneChange(idx, "milestone", e.target.value)}
                      placeholder="Milestone description"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-medium text-stone-900"
                    />
                  </div>
                  <div className="w-28 flex items-center gap-1">
                    <input
                      type="number"
                      value={m.percent}
                      onChange={(e) => handleMilestoneChange(idx, "percent", Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-900 text-right"
                    />
                    <span className="font-bold text-stone-600">%</span>
                  </div>
                  <button
                    onClick={() => removeMilestone(idx)}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 16 Standard Terms and Conditions */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <FileText size={18} className="text-[#9E7B1D]" />
                  Standard Terms and Conditions Clauses (Matching Official PDF)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">Edit, add, or customize clauses appearing on the Quotation / BOQ T&C pages.</p>
              </div>

              <button
                onClick={addTermClause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all"
              >
                <Plus size={14} />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {tcTemplate.termsList.map((clause, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-stone-700">Clause {idx + 1}</span>
                    <button
                      onClick={() => removeTermClause(idx)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={clause.title || ""}
                    onChange={(e) => handleTermChange(idx, "title", e.target.value)}
                    placeholder="Clause Title (e.g. Scope of Work)"
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                  />
                  <textarea
                    rows={2}
                    value={clause.text}
                    onChange={(e) => handleTermChange(idx, "text", e.target.value)}
                    placeholder="Clause details..."
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-normal text-stone-800"
                  />
                </div>
              ))}
            </div>

            {/* Special Note Box */}
            <div className="pt-2">
              <label className="block text-stone-700 font-bold mb-1 text-xs">Special Disclaimer Note</label>
              <input
                type="text"
                value={tcTemplate.note || ""}
                onChange={(e) => setTcTemplate({ ...tcTemplate, note: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMTP Email Configuration & Live Test */}
      {activeTab === "smtp_email" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: SMTP Configuration Form */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Mail size={20} className="text-[#9E7B1D]" />
                SMTP Mailer Server Configuration
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure your company SMTP server (Gmail, Outlook, Zoho, or Custom CPanel SMTP) for automated staff assignments and admin audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  placeholder="465 or 587"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">SMTP Username / Email</label>
                <input
                  type="email"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  placeholder="alerts@velora.family"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">SMTP App Password</label>
                <input
                  type="password"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Sender From Name</label>
                <input
                  type="text"
                  value={settings.smtpFromName}
                  onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                  placeholder="VELORA ERP System"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Admin Notification Recipient Email</label>
                <input
                  type="email"
                  value={settings.adminNotificationEmail}
                  onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                  placeholder="admin@velora.family"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                    className="w-4 h-4 accent-[#9E7B1D] rounded"
                  />
                  <span>Use SSL / TLS Secure Connection (Default: Port 465)</span>
                </label>
              </div>
            </div>

            {/* Notification Triggers Configuration */}
            <div className="border-t border-stone-100 pt-4 space-y-3">
              <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider">Automated Notification Triggers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "emailOnAssignment", label: "Email Staff when assigned to a Client / Enquiry" },
                  { key: "emailAdminOnLogin", label: "Email Admin when any Staff logs in" },
                  { key: "emailAdminOnEnquiry", label: "Email Admin when a new Enquiry is generated" },
                  { key: "emailAdminOnBOQ", label: "Email Admin when BOQ is created or printed" },
                  { key: "emailAdminOnInvoice", label: "Email Admin when Tax Invoice is created" }
                ].map((trigger) => (
                  <label key={trigger.key} className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[trigger.key] !== false}
                      onChange={(e) => setSettings({ ...settings, [trigger.key]: e.target.checked })}
                      className="w-4 h-4 accent-[#9E7B1D] rounded"
                    />
                    <span className="font-semibold text-stone-700 text-[11.5px]">{trigger.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live SMTP Test Mail Tool */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Send size={18} className="text-[#9E7B1D]" />
                  Live SMTP Connection Test
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Send a test email to verify your SMTP server credentials and connectivity.
                </p>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Test Recipient Email</label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium"
                  />
                </div>

                <button
                  onClick={handleTestEmail}
                  disabled={testEmailLoading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#9E7B1D] to-[#7A5E14] text-white rounded-xl font-bold text-xs shadow hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {testEmailLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{testEmailLoading ? "Testing SMTP Connection..." : "Send Live Test Email"}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1.5">
              <p className="font-bold text-stone-800">💡 Quick SMTP Setup Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>For <strong>Gmail</strong>: Use App Password from Google Account Security.</li>
                <li>For <strong>Hostinger / CPanel</strong>: Use mail.yourdomain.com on Port 465 with SSL.</li>
                <li>If live SMTP is not set, system seamlessly falls back to local logging.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Company Profile & Tax Info */}
      {activeTab === "company_profile" && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Building2 size={20} className="text-[#9E7B1D]" />
              Velora Antaraal Official Business Identity
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Configure company address, GSTIN, contact numbers, and website info that appears in document headers & footers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Company Trade Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Primary Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Secondary / WhatsApp Phone</label>
              <input
                type="text"
                value={settings.altPhone}
                onChange={(e) => setSettings({ ...settings, altPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Website URL</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold uppercase text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">PAN Number</label>
              <input
                type="text"
                value={settings.pan}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold uppercase text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">State & State Code</label>
              <input
                type="text"
                value={settings.stateCode || "Maharashtra (27)"}
                onChange={(e) => setSettings({ ...settings, stateCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-stone-700 font-bold mb-1">Official Registered Address</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
