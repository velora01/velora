import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  Trash2,
  DollarSign,
  ShieldCheck,
  Check
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
  const [activeTab, setActiveTab] = useState("payment_qr"); // 'payment_qr' | 'terms_conditions' | 'company_profile'
  const [settings, setSettings] = useState(getActiveCompanySettings());
  const [tcTemplate, setTcTemplate] = useState(getActiveTermsTemplate());
  const [initialSettings, setInitialSettings] = useState(getActiveCompanySettings());
  const [initialTcTemplate, setInitialTcTemplate] = useState(getActiveTermsTemplate());
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Load from backend if available, fallback to localStorage
    erpApi.getSettings?.().then((res) => {
      if (res?.data) {
        const loadedSettings = { ...DEFAULT_COMPANY_SETTINGS, ...res.data };
        setSettings(loadedSettings);
        setInitialSettings(loadedSettings);
        if (res.data.termsAndConditions) {
          const loadedTc = { ...DEFAULT_TERMS_AND_CONDITIONS_TEMPLATE, ...res.data.termsAndConditions };
          setTcTemplate(loadedTc);
          setInitialTcTemplate(loadedTc);
        }
      }
    }).catch(() => {
      // Fallback already in initial state
    });
  }, []);

  // Compute dirty state
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(settings) !== JSON.stringify(initialSettings) ||
      JSON.stringify(tcTemplate) !== JSON.stringify(initialTcTemplate)
    );
  }, [settings, tcTemplate, initialSettings, initialTcTemplate]);

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
      const updatedSettings = {
        ...settings,
        qrCodeUrl: base64Data
      };
      setSettings(updatedSettings);
      // Auto-persist immediately so QR is never lost on refresh
      saveActiveCompanySettings(updatedSettings);
      showToast("Payment QR Code loaded & saved. It will remain active until you remove it.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    const updatedSettings = {
      ...settings,
      qrCodeUrl: ""
    };
    setSettings(updatedSettings);
    saveActiveCompanySettings(updatedSettings);
    showToast("QR Code removed successfully.", "success");
  };

  const handleSaveSettings = async () => {
    if (!isDirty && !saving) return;

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

      // 3. Update initial state so isDirty returns to false
      setInitialSettings(JSON.parse(JSON.stringify(settings)));
      setInitialTcTemplate(JSON.parse(JSON.stringify(tcTemplate)));

      showToast("All settings saved successfully!", "success");
    } catch (err) {
      console.error("Failed to sync settings with backend:", err);
      // Still saved locally
      setInitialSettings(JSON.parse(JSON.stringify(settings)));
      setInitialTcTemplate(JSON.parse(JSON.stringify(tcTemplate)));
      showToast("Settings saved locally!", "success");
    } finally {
      setSaving(false);
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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-slate-900 border-blue-500/50 text-blue-200"
              : "bg-red-900 border-red-500/50 text-red-200"
          }`}
        >
          {notification.type === "success" ? <CheckCircle size={20} className="text-blue-400" /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Clean Modern Page Header with Dynamic Reactive Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black shadow-2xs">
            <Settings size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Platform & Business Settings</h1>
              {isDirty ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Check size={12} className="text-emerald-600" />
                  All saved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage Universal Payment QR, Bank Accounts, Terms & Conditions Templates, & Company Profile
            </p>
          </div>
        </div>

        {/* Dynamic Save Button - Enabled when isDirty, faded/disabled when clean */}
        <button
          onClick={handleSaveSettings}
          disabled={!isDirty || saving}
          title={isDirty ? "Click to save your changes" : "No unsaved changes"}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            isDirty
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer ring-2 ring-blue-400/30"
              : "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200 select-none"
          }`}
        >
          {saving ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>{isDirty ? "Save Changes" : "Saved"}</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "payment_qr", label: "Payment QR & Bank Details", icon: QrCode, badge: "BOQ & Invoices" },
          { id: "terms_conditions", label: "Terms & Conditions Templates", icon: FileText, badge: "16 Clauses" },
          { id: "company_profile", label: "Company Profile & Tax Info", icon: Building2, badge: "Branding" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
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
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" />
                Official Bank Account Details
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                These bank details will automatically display on all generated BOQs, Estimations, Quotations, and Tax Invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName || ""}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={settings.accountHolderName || ""}
                  onChange={(e) => setSettings({ ...settings, accountHolderName: e.target.value })}
                  placeholder="e.g. VELORA INTERIORS PRIVATE LIMITED"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.accountNumber || ""}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="e.g. 50200073374185"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={settings.ifscCode || ""}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0000282"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={settings.branch || ""}
                  onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                  placeholder="e.g. Wakad, Pune"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Type</label>
                <select
                  value={settings.accountType || "Current Account"}
                  onChange={(e) => setSettings({ ...settings, accountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-semibold"
                >
                  <option value="Current Account">Current Account</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Escrow Account">Escrow Account</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">UPI ID (VPA) for Direct Payments</label>
                <input
                  type="text"
                  value={settings.upiId || ""}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. velora.interiors@hdfcbank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Universal QR Upload, Persistence & Live Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <QrCode size={18} className="text-blue-600" />
                  Universal Payment QR Code
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Uploaded once; automatically persists across all BOQ prints, Estimations, and Invoices until you replace or remove it.
                </p>
              </div>

              {/* QR Preview Area */}
              <div className="mt-4 flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                {settings.qrCodeUrl ? (
                  <div className="space-y-3">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-44 h-44 object-contain mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle size={13} />
                      <span>Active QR Code Attached</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <QrCode size={48} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No QR code uploaded yet</p>
                    <p className="text-[10px] text-slate-400">Upload PhonePe, GPay, Paytm, or BHIM QR image</p>
                  </div>
                )}
              </div>

              {/* Upload / Replace / Remove Buttons */}
              <div className="mt-4 space-y-2">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all">
                  <Upload size={14} />
                  <span>{settings.qrCodeUrl ? "Replace QR Image" : "Upload QR Code Image"}</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>

                {settings.qrCodeUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveQr}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs cursor-pointer transition-all"
                  >
                    <Trash2 size={14} />
                    <span>Remove QR Code</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/60 text-[11px] text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-700">
                <ShieldCheck size={14} />
                Live Print Synchronization
              </p>
              <p className="text-slate-600">
                When any designer or sales staff prints a BOQ or Tax Invoice, this QR code will render at crystal clarity next to the bank details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Terms & Conditions Templates */}
      {activeTab === "terms_conditions" && (
        <div className="space-y-6">
          {/* Section 1: Payment Plan Milestones */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-600" />
                  Payment Plan Milestones (Auto-calculated on BOQ & Invoices)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize default milestone split percentage and milestone text.</p>
              </div>

              <button
                onClick={addMilestone}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {tcTemplate.paymentPlan.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={m.milestone}
                      onChange={(e) => handleMilestoneChange(idx, "milestone", e.target.value)}
                      placeholder="Milestone description"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-28 flex items-center gap-1">
                    <input
                      type="number"
                      value={m.percent}
                      onChange={(e) => handleMilestoneChange(idx, "percent", Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-right focus:outline-none focus:border-blue-500"
                    />
                    <span className="font-bold text-slate-600">%</span>
                  </div>
                  <button
                    onClick={() => removeMilestone(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Standard Terms and Conditions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Standard Terms and Conditions Clauses (Matching Official PDF)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Edit, add, or customize clauses appearing on the Quotation / BOQ T&C pages.</p>
              </div>

              <button
                onClick={addTermClause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {tcTemplate.termsList.map((clause, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-700">Clause {idx + 1}</span>
                    <button
                      onClick={() => removeTermClause(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={clause.title || ""}
                    onChange={(e) => handleTermChange(idx, "title", e.target.value)}
                    placeholder="Clause Title (e.g. Scope of Work)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    rows={2}
                    value={clause.text}
                    onChange={(e) => handleTermChange(idx, "text", e.target.value)}
                    placeholder="Clause details..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Special Note Box */}
            <div className="pt-2">
              <label className="block text-slate-700 font-bold mb-1 text-xs">Special Disclaimer Note</label>
              <input
                type="text"
                value={tcTemplate.note || ""}
                onChange={(e) => setTcTemplate({ ...tcTemplate, note: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Company Profile & Tax Info */}
      {activeTab === "company_profile" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              Velora Antaraal Official Business Identity
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Configure company address, GSTIN, contact numbers, and website info that appears in document headers & footers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Trade Name</label>
              <input
                type="text"
                value={settings.companyName || ""}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Primary Phone</label>
              <input
                type="text"
                value={settings.phone || ""}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Secondary / WhatsApp Phone</label>
              <input
                type="text"
                value={settings.altPhone || ""}
                onChange={(e) => setSettings({ ...settings, altPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Website URL</label>
              <input
                type="text"
                value={settings.website || ""}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin || ""}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">PAN Number</label>
              <input
                type="text"
                value={settings.pan || ""}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">State & State Code</label>
              <input
                type="text"
                value={settings.stateCode || "Maharashtra (27)"}
                onChange={(e) => setSettings({ ...settings, stateCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-slate-700 font-bold mb-1">Official Registered Address</label>
              <textarea
                rows={2}
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
