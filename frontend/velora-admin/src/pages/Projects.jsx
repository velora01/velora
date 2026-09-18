import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import erpApi from "../services/erpService";
import {
  FolderOpen,
  X,
  Download,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Search,
  SlidersHorizontal,
  UploadCloud,
  FileText,
  File,
  Eye,
  Check,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Building,
  ShieldCheck,
  Activity,
  Zap,
  Info,
  ArrowLeft,
  Users,
  Briefcase,
  CheckSquare,
  Clock3,
  CalendarDays,
  Percent,
  Printer,
  DollarSign,
  CreditCard,
  FileCheck2,
  Save
} from "lucide-react";
import { downloadBOQPdf, downloadInvoicePdf, printInvoice, downloadPaymentHistoryPdf } from "../utils/downloadHelper";

export default function Projects() {
  const navigate = useNavigate();

  // Primary data states
  const [enquiries, setEnquiries] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [boqs, setBoqs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Status Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Yet To Start | In Progress | Under Design | Execution | Completed
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Selected Project (Full-Page Workspace)
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("clientInfo"); // clientInfo | projectInfo | payments | boq | files | invoices

  // Edit Project / Client Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Payment Record Form in Payments Tab
  const [paymentRecordForm, setPaymentRecordForm] = useState({
    amount: "",
    mode: "UPI / NEFT / RTGS",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });

  // Client Documents / Files
  const [projectDocuments, setProjectDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("velora_project_documents");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Floor Plans");
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Base All Enquiries / Clients list (as present in Enquiry section)
  const baseEnquiryClients = [];

  // Load all data from API & Local Storage
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Read custom enquiries from localStorage (added in Enquiry Management)
      let localEnqs = [];
      try {
        const savedEnqs = localStorage.getItem("velora_custom_enquiries");
        if (savedEnqs) localEnqs = JSON.parse(savedEnqs);
      } catch (e) {}

      // 2. Read API leads
      let apiEnqs = [];
      try {
        const res = await erpApi.getLeads({ limit: 100 });
        if (res?.data) apiEnqs = res.data;
      } catch (e) {}

      // 3. Read saved project edits
      let savedProjectEdits = {};
      try {
        const pEdits = localStorage.getItem("velora_project_custom_edits");
        if (pEdits) savedProjectEdits = JSON.parse(pEdits);
      } catch (e) {}

      // Helper to normalize unique key for a client
      const getNormalizedClientKey = (item) => {
        const cleanPhone = (item.phone || item.clientPhone || "").replace(/\D/g, "").slice(-10);
        if (cleanPhone) return `phone_${cleanPhone}`;
        const cleanName = (item.name || item.clientName || "").trim().toLowerCase();
        if (cleanName) return `name_${cleanName}`;
        return `id_${item._id || item.id || item.projectNumber || item.enquiryNo}`;
      };

      // 4. Combine all into master client list (Custom/Newly created enquiries FIRST at top!)
      const combinedMap = new Map();

      // First add custom/newly added leads from Enquiry section so they appear at top
      [...localEnqs, ...apiEnqs].forEach((enq, idx) => {
        const key = getNormalizedClientKey(enq);
        if (key && !combinedMap.has(key)) {
          const customEdits = savedProjectEdits[key] || {};
          const rawBudget = enq.budget || enq.approximateBudget || enq.estimatedValue || 0;
          const budgetVal = typeof rawBudget === "number" ? rawBudget : (parseInt(String(rawBudget).replace(/\D/g, ""), 10) || 0);
          const prjNum = enq.projectNumber || (enq.enquiryNo ? enq.enquiryNo.replace("ENQ", "PRJ") : `PRJ-2026-${String(20 + idx).padStart(3, "0")}`);
          const existingPayments = Array.isArray(customEdits.payments) ? customEdits.payments : [];
          const calculatedPaid = existingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

          combinedMap.set(key, {
            id: enq._id || prjNum,
            projectNumber: prjNum,
            name: enq.name || enq.clientName || "New Client",
            clientName: enq.name || enq.clientName || "New Client",
            salutation: enq.salutation || "Mr.",
            email: enq.email || enq.clientEmail || "client@example.com",
            clientEmail: enq.email || enq.clientEmail || "client@example.com",
            phone: enq.phone || enq.clientPhone || "",
            clientPhone: enq.phone || enq.clientPhone || "",
            altPhone: enq.altPhone || "",
            occupation: enq.occupation || "Executive",
            companyName: enq.companyName || "",
            siteLocation: enq.siteLocation || enq.address || enq.siteAddress || "Pune, Maharashtra",
            address: enq.siteLocation || enq.address || enq.siteAddress || "Pune, Maharashtra",
            city: enq.city || "Pune",
            projectType: enq.projectType || "Residential",
            projectSubtype: enq.projectSubtype || "Turnkey Fitout",
            preferredStyle: enq.preferredStyle || enq.stylePreference || "Modern Contemporary",
            status: customEdits.status || "Yet To Start",
            progressPercent: customEdits.progressPercent !== undefined ? customEdits.progressPercent : 0,
            budget: customEdits.budget !== undefined ? customEdits.budget : budgetVal,
            paidAmount: customEdits.paidAmount !== undefined ? customEdits.paidAmount : calculatedPaid,
            payments: existingPayments,
            expStartDate: enq.enquiryDate || new Date().toISOString().split("T")[0],
            expEndDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
            actualStartDate: "",
            actualEndDate: "",
            orderDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            handledBy: enq.handledBy || "Rutuja@velora",
            projectConsultant: "Velora Lead Consultant",
            serviceEligibility: "1 Year Free Snag Warranty",
            serviceValidTill: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
            notes: enq.notes || enq.remarks || "Enquiry registered in CRM.",
            ...customEdits
          });
        }
      });

      const finalProjects = Array.from(combinedMap.values());
      setProjectsList(finalProjects);

      // Load BOQs and Invoices
      try {
        const [boqsRes, invsRes] = await Promise.allSettled([
          erpApi.getBOQs({ limit: 100 }),
          erpApi.getInvoices({ limit: 100 })
        ]);
        if (boqsRes.status === "fulfilled" && boqsRes.value?.data) setBoqs(boqsRes.value.data);
        if (invsRes.status === "fulfilled" && invsRes.value?.data) setInvoices(invsRes.value.data);
      } catch (e) {}

    } catch (err) {
      console.error("Error loading project client records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Auto-refresh when tab gains focus or localStorage updates
    const handleSync = () => loadAllData();
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Save project custom edits to localStorage & update list
  const saveCustomProjectEdit = (updatedItem) => {
    const cleanPhone = (updatedItem.clientPhone || updatedItem.phone || "").replace(/\D/g, "").slice(-10);
    const cleanName = (updatedItem.clientName || updatedItem.name || "").trim().toLowerCase();
    const key = cleanPhone ? `phone_${cleanPhone}` : (cleanName ? `name_${cleanName}` : `id_${updatedItem.id || updatedItem._id || updatedItem.projectNumber}`);
    
    let savedEdits = {};
    try {
      const pEdits = localStorage.getItem("velora_project_custom_edits");
      if (pEdits) savedEdits = JSON.parse(pEdits);
    } catch (e) {}

    savedEdits[key] = { ...updatedItem };
    try {
      localStorage.setItem("velora_project_custom_edits", JSON.stringify(savedEdits));
    } catch (e) {}

    // Update in state
    setProjectsList((prev) =>
      prev.map((p) => {
        const pCleanPhone = (p.clientPhone || p.phone || "").replace(/\D/g, "").slice(-10);
        const pCleanName = (p.clientName || p.name || "").trim().toLowerCase();
        const matches = (cleanPhone && pCleanPhone === cleanPhone) ||
          (cleanName && pCleanName === cleanName) ||
          p.projectNumber === updatedItem.projectNumber ||
          p.id === updatedItem.id;
        return matches ? { ...p, ...updatedItem } : p;
      })
    );

    if (selectedProject && (
      (cleanPhone && (selectedProject.clientPhone || selectedProject.phone || "").replace(/\D/g, "").slice(-10) === cleanPhone) ||
      (cleanName && (selectedProject.clientName || selectedProject.name || "").trim().toLowerCase() === cleanName) ||
      selectedProject.projectNumber === updatedItem.projectNumber ||
      selectedProject.id === updatedItem.id
    )) {
      setSelectedProject((prev) => ({ ...prev, ...updatedItem }));
    }
  };

  // Filtered List
  const filteredProjects = projectsList.filter((proj) => {
    const name = proj.clientName || proj.name || "";
    const email = proj.clientEmail || proj.email || "";
    const phone = proj.clientPhone || proj.phone || "";
    const pNum = proj.projectNumber || "";

    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        pNum.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (statusFilter && proj.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Open Edit Modal
  const handleOpenEditModal = (proj) => {
    setEditFormData({
      ...proj,
      clientName: proj.clientName || proj.name,
      clientPhone: proj.clientPhone || proj.phone,
      clientEmail: proj.clientEmail || proj.email,
      address: proj.address || proj.siteLocation
    });
    setIsEditModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModalForm = (e) => {
    e.preventDefault();
    saveCustomProjectEdit(editFormData);
    setIsEditModalOpen(false);
    showToast("Client and project data saved successfully!");
  };

  // Quick Status change from Project Info tab
  const handleQuickStatusChange = (newStatus) => {
    if (!selectedProject) return;
    let newProg = selectedProject.progressPercent;
    if (newStatus === "Yet To Start") newProg = 0;
    else if (newStatus === "Under Design") newProg = 25;
    else if (newStatus === "Execution" || newStatus === "In Progress") newProg = 60;
    else if (newStatus === "Snagging") newProg = 85;
    else if (newStatus === "Completed") newProg = 100;

    const updated = { ...selectedProject, status: newStatus, progressPercent: newProg };
    saveCustomProjectEdit(updated);
    showToast(`Status updated to "${newStatus}" (${newProg}%)`);
  };

  // Quick Progress change from slider
  const handleQuickProgressChange = (newProg) => {
    if (!selectedProject) return;
    const progVal = Number(newProg);
    const updated = { ...selectedProject, progressPercent: progVal };
    if (progVal === 100) updated.status = "Completed";
    else if (progVal > 0 && updated.status === "Yet To Start") updated.status = "In Progress";
    saveCustomProjectEdit(updated);
  };

  // Update Total Estimate / Contract Budget
  const handleUpdateEstimateBudget = (newBudget) => {
    if (!selectedProject) return;
    const budgetVal = Number(newBudget) || 0;
    const updated = {
      ...selectedProject,
      budget: budgetVal
    };
    saveCustomProjectEdit(updated);
    showToast(`Total Contract Estimate updated to ₹${budgetVal.toLocaleString("en-IN")}`);
  };

  // Record Received Client Payment
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const payAmt = Number(paymentRecordForm.amount);
    if (!payAmt || payAmt <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const existingPayments = Array.isArray(selectedProject.payments) ? selectedProject.payments : [];
    const newRecord = {
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: payAmt,
      mode: paymentRecordForm.mode || "UPI / NEFT / RTGS",
      date: paymentRecordForm.date || new Date().toISOString().split("T")[0],
      note: paymentRecordForm.note?.trim() || "Client Payment",
      recordedAt: new Date().toISOString()
    };

    const updatedPayments = [newRecord, ...existingPayments];
    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const updated = {
      ...selectedProject,
      payments: updatedPayments,
      paidAmount: newTotalPaid
    };
    saveCustomProjectEdit(updated);

    setPaymentRecordForm({
      amount: "",
      mode: "UPI / NEFT / RTGS",
      note: "",
      date: new Date().toISOString().split("T")[0]
    });
    showToast(`Payment of ₹${payAmt.toLocaleString("en-IN")} via ${newRecord.mode} recorded successfully!`);
  };

  // Delete Payment Record
  const handleDeletePaymentRecord = (payId) => {
    if (!selectedProject || !window.confirm("Are you sure you want to delete this payment record?")) return;
    const existingPayments = Array.isArray(selectedProject.payments) ? selectedProject.payments : [];
    const updatedPayments = existingPayments.filter((p) => p.id !== payId);
    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const updated = {
      ...selectedProject,
      payments: updatedPayments,
      paidAmount: newTotalPaid
    };
    saveCustomProjectEdit(updated);
    showToast("Payment record removed.");
  };

  // Delete Project / Client from list
  const handleDeleteProject = (proj) => {
    if (!window.confirm(`Are you sure you want to remove ${proj.clientName || proj.name} from projects?`)) return;
    setProjectsList((prev) => prev.filter((p) => p.projectNumber !== proj.projectNumber && p.id !== proj.id));
    if (selectedProject && (selectedProject.projectNumber === proj.projectNumber || selectedProject.id === proj.id)) {
      setSelectedProject(null);
    }
    showToast("Project record removed.");
  };

  // Documents (Real uploaded files only - no dummy fallback)
  const getClientDocumentsList = () => {
    if (!selectedProject) return [];
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.phone || selectedProject._id;
    return projectDocuments[key] || [];
  };

  const handleUploadProjectDoc = async (e) => {
    e.preventDefault();
    if (!selectedProject || !newDocTitle.trim()) return;
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.phone || selectedProject._id;
    const existing = getClientDocumentsList();

    let fileUrl = "";
    if (selectedFileObj) {
      try {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(selectedFileObj);
        });
      } catch (e) {}
    }

    const newDoc = {
      id: "doc_" + Date.now(),
      title: newDocTitle.trim(),
      category: newDocCategory,
      fileName: selectedFileObj ? selectedFileObj.name : `${newDocTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: selectedFileObj ? `${(selectedFileObj.size / (1024 * 1024)).toFixed(2)} MB` : "1.8 MB",
      url: fileUrl,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    const updated = { ...projectDocuments, [key]: [newDoc, ...existing] };
    setProjectDocuments(updated);
    try {
      localStorage.setItem("velora_project_documents", JSON.stringify(updated));
    } catch (err) {}
    setNewDocTitle("");
    setSelectedFileObj(null);
    showToast(`Document "${newDoc.title}" uploaded!`);
  };

  const handleDeleteProjectDoc = (docId) => {
    if (!selectedProject) return;
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.phone || selectedProject._id;
    const existing = getClientDocumentsList();
    const updatedDocs = existing.filter((d) => d.id !== docId);
    const updated = { ...projectDocuments, [key]: updatedDocs };
    setProjectDocuments(updated);
    try {
      localStorage.setItem("velora_project_documents", JSON.stringify(updated));
    } catch (err) {}
    showToast("Document deleted");
  };

  const handleDownloadProjectFile = (doc) => {
    if (doc.url && (doc.url.startsWith("data:") || doc.url.startsWith("blob:"))) {
      const a = document.createElement("a");
      a.href = doc.url;
      a.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded ${doc.fileName || doc.title}`);
      return;
    }
    if (doc.url && (doc.url.startsWith("http://") || doc.url.startsWith("https://"))) {
      window.open(doc.url, "_blank");
      showToast(`Opened ${doc.fileName || doc.title}`);
      return;
    }
    const blob = new Blob([`Velora Interior Project Document: ${doc.title}\nCategory: ${doc.category}\nDate: ${doc.date}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName || `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${doc.fileName || doc.title}`);
  };

  // Find linked BOQ
  const getLinkedBOQ = () => {
    if (!selectedProject) return null;
    const pName = (selectedProject.clientName || selectedProject.name || "").toLowerCase();
    const pPhone = (selectedProject.clientPhone || selectedProject.phone || "").replace(/\D/g, "");
    return (
      boqs.find(
        (b) =>
          (b.clientName && b.clientName.toLowerCase() === pName) ||
          (b.clientPhone && b.clientPhone.replace(/\D/g, "") === pPhone)
      ) || null
    );
  };

  // Find linked Invoices
  const getLinkedInvoices = () => {
    if (!selectedProject) return [];
    const pName = (selectedProject.clientName || selectedProject.name || "").toLowerCase();
    const pPhone = (selectedProject.clientPhone || selectedProject.phone || "").replace(/\D/g, "");
    return invoices.filter(
      (inv) =>
        (inv.clientName && inv.clientName.toLowerCase() === pName) ||
        (inv.clientPhone && inv.clientPhone.replace(/\D/g, "") === pPhone)
    );
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 border border-stone-700">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FULL-PAGE CLIENT & PROJECT DETAIL WORKSPACE (STRUCTURED TABS) */}
      {/* ========================================================================= */}
      {selectedProject ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer border border-stone-200"
                title="Return to Projects List"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="flex items-center gap-3.5">
                {/* Avatar Initial Circle */}
                <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-300 text-stone-900 flex items-center justify-center font-black text-lg shadow-2xs">
                  {(selectedProject.clientName || selectedProject.name || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-black text-stone-900 tracking-tight">
                    {selectedProject.salutation ? `${selectedProject.salutation} ` : ""}{selectedProject.clientName || selectedProject.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-stone-500 font-semibold">
                      {selectedProject.projectNumber}
                    </span>
                    <span className="px-2 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                      {selectedProject.projectType || "Residential"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenEditModal(selectedProject)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 size={13} />
                <span>Edit Client & Project</span>
              </button>

              <button
                onClick={() => handleDeleteProject(selectedProject)}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-stone-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete Project</span>
              </button>
            </div>
          </div>

          {/* 2-Column Full-Page Layout with User's Requested Structured Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar Navigation Tags / Tabs */}
            <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="px-3 py-1.5 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                Client Workspace
              </div>
              {[
                { id: "clientInfo", label: "1. Client Information", icon: User },
                { id: "projectInfo", label: "2. Project Info & Status", icon: Building },
                { id: "payments", label: "3. Payments & Commercials", icon: IndianRupee },
                { id: "boq", label: "4. BOQ & Specifications", icon: FileSpreadsheet },
                { id: "files", label: "5. Files & Uploads", icon: FolderOpen },
                { id: "invoices", label: "6. Invoices & Billing", icon: Receipt }
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition cursor-pointer text-left ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-extrabold"
                        : "text-stone-700 hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-blue-600" : "text-stone-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Main Content Area */}
            <div className="lg:col-span-9 space-y-6">
              {/* ========================================================================= */}
              {/* TAB 1: CLIENT INFORMATION */}
              {/* ========================================================================= */}
              {activeTab === "clientInfo" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        <h3 className="font-extrabold text-base text-stone-900">Client Master Profile & Contact Information</h3>
                      </div>
                      <button
                        onClick={() => handleOpenEditModal(selectedProject)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 size={12} />
                        <span>Edit Client Data</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Client Full Name</span>
                        <span className="font-bold text-sm text-stone-900 block">
                          {selectedProject.salutation ? `${selectedProject.salutation} ` : ""}{selectedProject.clientName || selectedProject.name}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Primary Phone Number</span>
                        <span className="font-mono font-bold text-stone-900 block">
                          (+91) {selectedProject.clientPhone || selectedProject.phone || "--"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Alternate Phone</span>
                        <span className="font-mono text-stone-700 block">
                          {selectedProject.altPhone || "--"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Email Address</span>
                        <span className="font-medium text-stone-800 block">
                          {selectedProject.clientEmail || selectedProject.email || "--"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Occupation / Profession</span>
                        <span className="font-medium text-stone-800 block">
                          {selectedProject.occupation || "Business / Corporate Executive"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">Company Name</span>
                        <span className="font-medium text-stone-800 block">
                          {selectedProject.companyName || "--"}
                        </span>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <span className="block text-stone-400 font-semibold">Site Address / Project Location</span>
                        <span className="font-medium text-stone-900 block">
                          {selectedProject.address || selectedProject.siteLocation || "Pune, Maharashtra"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-stone-400 font-semibold">City & State</span>
                        <span className="font-medium text-stone-900 block">
                          {selectedProject.city || "Pune"}, Maharashtra
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: PROJECT INFORMATION & STATUS CHECK */}
              {/* ========================================================================= */}
              {activeTab === "projectInfo" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Information Card */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                        <Building size={16} className="text-blue-600" />
                        <h3 className="font-extrabold text-sm text-stone-900">Project Information</h3>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Project Status</span>
                          <select
                            value={selectedProject.status}
                            onChange={(e) => handleQuickStatusChange(e.target.value)}
                            className="px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="Yet To Start">Yet To Start</option>
                            <option value="Under Design">Under Design</option>
                            <option value="Execution">Execution</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Snagging">Snagging</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Project Type</span>
                          <span className="font-bold text-stone-900">{selectedProject.projectType || "Residential"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Progress %</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedProject.progressPercent || 0}
                              onChange={(e) => handleQuickProgressChange(e.target.value)}
                              className="w-24 accent-blue-600 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-stone-700 text-xs min-w-[32px]">
                              {selectedProject.progressPercent || 0}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Exp. Start Date</span>
                          <span className="font-mono text-stone-700">{selectedProject.expStartDate || "--"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Exp. End Date</span>
                          <span className="font-mono text-stone-700">{selectedProject.expEndDate || "--"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Actual Start Date</span>
                          <span className="font-mono text-stone-700">{selectedProject.actualStartDate || "--"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Order Value</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            ₹{(selectedProject.budget || 2500000).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Order Date</span>
                          <span className="text-stone-800 font-medium">{selectedProject.orderDate || "Sep 2, 2026"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Service Eligibility</span>
                          <span className="text-stone-800 font-medium">{selectedProject.serviceEligibility || "1 Year Free Snag Warranty"}</span>
                        </div>

                        <div className="flex items-start justify-between pt-1">
                          <span className="text-stone-500 font-medium">Site Address</span>
                          <span className="text-stone-800 font-medium text-right max-w-[200px]">
                            {selectedProject.address || selectedProject.siteLocation || "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Members & Stage Checklist Card */}
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                          <Users size={16} className="text-blue-600" />
                          <h3 className="font-extrabold text-sm text-stone-900">Project Members & Assigned Team</h3>
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Handled By</span>
                            <span className="font-bold text-stone-800">{selectedProject.handledBy || "Rutuja@velora"}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Project Consultant</span>
                            <span className="font-bold text-stone-800">{selectedProject.projectConsultant || "Velora Lead Consultant"}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Design Style</span>
                            <span className="font-bold text-stone-800">{selectedProject.preferredStyle || "Modern Contemporary"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Submit / Save Status Box */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5 rounded-2xl border border-blue-200 space-y-3">
                        <h4 className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-blue-600" />
                          <span>Status Check & Update Confirmation</span>
                        </h4>
                        <p className="text-[11px] text-stone-600 font-medium">
                          Current status is marked as <b>{selectedProject.status}</b> with <b>{selectedProject.progressPercent}%</b> execution progress.
                        </p>
                        <button
                          onClick={() => {
                            saveCustomProjectEdit(selectedProject);
                            showToast("Project status and progress submitted!");
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save size={13} />
                          <span>Submit & Confirm Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: PAYMENTS & COMMERCIALS (REAL LEDGER, ESTIMATE INPUT, PAYMENT RECORDS) */}
              {/* ========================================================================= */}
              {activeTab === "payments" && (() => {
                const currentEstimate = Number(selectedProject.budget || 0);
                const paymentList = Array.isArray(selectedProject.payments) ? selectedProject.payments : [];
                const totalReceived = paymentList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                const pendingBalance = Math.max(0, currentEstimate - totalReceived);
                const percentReceived = currentEstimate > 0 ? Math.min(100, Math.round((totalReceived / currentEstimate) * 100)) : 0;
                const paymentStatus = (currentEstimate > 0 && pendingBalance === 0) ? "Fully Paid" : (totalReceived > 0 ? "Partially Paid" : "Payment Pending");

                // Matching BOQ if any
                const matchedBOQ = boqs.find(b => 
                  (b.clientPhone && selectedProject.clientPhone && b.clientPhone.replace(/\D/g, '') === selectedProject.clientPhone.replace(/\D/g, '')) ||
                  (b.clientName && selectedProject.clientName && b.clientName.trim().toLowerCase() === selectedProject.clientName.trim().toLowerCase()) ||
                  (b.enquiryNo && selectedProject.enquiryNo && b.enquiryNo === selectedProject.enquiryNo)
                );

                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      
                      {/* Header & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-lg text-stone-900">Payment & Commercial Breakdown</h3>
                          <span className="text-xs text-stone-500">Track client estimate, real-time received payment transactions, and remaining balance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              downloadPaymentHistoryPdf(selectedProject);
                              showToast(`Downloading payment statement PDF for ${selectedProject.clientName || selectedProject.name}...`);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                            title="Download Payment Statement & Ledger PDF"
                          >
                            <Download size={13} />
                            <span>Download Payment PDF</span>
                          </button>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            paymentStatus === "Fully Paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : paymentStatus === "Partially Paid"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            {paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* 3 Interactive Commercial Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Card 1: Total Contract Estimate with Editable Input Box */}
                        <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                              TOTAL CONTRACT ESTIMATE
                            </span>
                            {matchedBOQ?.grandTotal > 0 && matchedBOQ.grandTotal !== currentEstimate && (
                              <button
                                type="button"
                                onClick={() => handleUpdateEstimateBudget(matchedBOQ.grandTotal)}
                                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer transition"
                                title="Copy Grand Total from linked BOQ"
                              >
                                Sync BOQ: ₹{matchedBOQ.grandTotal.toLocaleString("en-IN")}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">₹</span>
                              <input
                                type="number"
                                placeholder="Enter total estimate..."
                                value={selectedProject.budget !== undefined && selectedProject.budget !== null ? selectedProject.budget : ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSelectedProject((prev) => ({ ...prev, budget: val }));
                                }}
                                onBlur={(e) => {
                                  handleUpdateEstimateBudget(Number(e.target.value));
                                }}
                                className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl font-mono text-base font-black text-stone-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateEstimateBudget(selectedProject.budget || 0)}
                              className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
                            >
                              Set
                            </button>
                          </div>
                          <span className="text-[10px] text-stone-500 block">Total project scope value agreed with client</span>
                        </div>

                        {/* Card 2: Advance / Total Paid Amount */}
                        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                            TOTAL RECEIVED AMOUNT
                          </span>
                          <span className="font-mono text-2xl font-black text-emerald-800 block">
                            ₹{totalReceived.toLocaleString("en-IN")}
                          </span>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-700 font-bold">{percentReceived}% Received</span>
                            <span className="text-emerald-600 font-medium">{paymentList.length} Payment(s)</span>
                          </div>
                        </div>

                        {/* Card 3: Pending Balance Due */}
                        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                            PENDING BALANCE DUE
                          </span>
                          <span className="font-mono text-2xl font-black text-rose-900 block">
                            ₹{pendingBalance.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-rose-700 font-bold block">
                            {currentEstimate > 0 ? `${100 - percentReceived}% Remaining Balance` : "No estimate set yet"}
                          </span>
                        </div>
                      </div>

                      {/* Real Payment Records Table (Replaces Milestone Schedule) */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-sm text-stone-900">Payment Transaction Records</h4>
                            <p className="text-[11px] text-stone-500">Every payment installment received from the client with payment mode & date</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                downloadPaymentHistoryPdf(selectedProject);
                                showToast(`Downloading payment statement PDF for ${selectedProject.clientName || selectedProject.name}...`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition cursor-pointer"
                              title="Export PDF Statement"
                            >
                              <FileText size={12} className="text-blue-600" />
                              <span>Export Statement PDF</span>
                            </button>
                            <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                              Total Entries: {paymentList.length}
                            </span>
                          </div>
                        </div>

                        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-stone-50/90 text-stone-700 font-extrabold border-b border-stone-200">
                                <th className="py-3 px-4 w-12 text-center">#</th>
                                <th className="py-3 px-4">Payment Date</th>
                                <th className="py-3 px-4 font-mono">Amount Paid (₹)</th>
                                <th className="py-3 px-4">Payment Mode</th>
                                <th className="py-3 px-4 min-w-[180px]">Note / Reference</th>
                                <th className="py-3 px-4 text-right font-mono">Pending Balance (₹)</th>
                                <th className="py-3 px-4 text-center w-20">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                              {paymentList.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="py-10 text-center text-stone-400 font-medium">
                                    <CreditCard size={28} className="mx-auto mb-2 text-stone-300" />
                                    No payments recorded yet. Add the first payment below.
                                  </td>
                                </tr>
                              ) : (
                                paymentList.map((pay, pIdx) => {
                                  return (
                                    <tr key={pay.id || pIdx} className="hover:bg-stone-50/60 transition">
                                      <td className="py-3 px-4 text-center font-bold text-stone-400">
                                        {pIdx + 1}
                                      </td>
                                      <td className="py-3 px-4 font-semibold text-stone-900">
                                        {pay.date || new Date().toLocaleDateString("en-IN")}
                                      </td>
                                      <td className="py-3 px-4 font-mono font-black text-emerald-700 text-sm">
                                        ₹{Number(pay.amount || 0).toLocaleString("en-IN")}
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                          {pay.mode || "UPI / NEFT / RTGS"}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-stone-600 font-medium">
                                        {pay.note || "Client Payment"}
                                      </td>
                                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-800">
                                        ₹{pendingBalance.toLocaleString("en-IN")}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePaymentRecord(pay.id)}
                                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                          title="Delete Payment Entry"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Record Received Client Payment Form */}
                      <form onSubmit={handleRecordPaymentSubmit} className="p-5 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                          <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-2">
                            <CreditCard size={15} className="text-blue-600" />
                            <span>Record Received Client Payment</span>
                          </h4>
                          <span className="text-[11px] text-stone-500 font-medium">Auto-calculates new paid total and pending balance</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Amount (₹) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="e.g. 500000"
                              value={paymentRecordForm.amount}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, amount: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Payment Mode *</label>
                            <select
                              value={paymentRecordForm.mode}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, mode: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                            >
                              <option value="UPI / NEFT / RTGS">UPI / NEFT / RTGS</option>
                              <option value="Bank Transfer">Direct Bank Transfer</option>
                              <option value="Cheque">Cheque Deposit</option>
                              <option value="Cash">Cash Payment</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Debit Card">Debit Card</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Payment Date *</label>
                            <input
                              type="date"
                              required
                              value={paymentRecordForm.date}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, date: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Note / Reference (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Booking Advance, UTR 9823..."
                              value={paymentRecordForm.note || ""}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, note: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={14} />
                            <span>Add Payment Record</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================================= */}
              {/* TAB 4: BOQ & SPECIFICATIONS */}
              {/* ========================================================================= */}
              {activeTab === "boq" && (() => {
                const linkedBOQ = getLinkedBOQ();
                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900">
                            {linkedBOQ ? `BOQ Estimate ${linkedBOQ.boqNumber || "BOQ-2026-018"}` : "Bill of Quantities (BOQ) & Scope"}
                          </h3>
                          <span className="text-xs text-stone-500">
                            Itemized spaces, materials, dimensions, and rates
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {linkedBOQ && (
                            <button
                              onClick={() => downloadBOQPdf(linkedBOQ)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Download size={12} />
                              <span>BOQ PDF</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigate("/boq", {
                                state: {
                                  clientName: selectedProject.clientName || selectedProject.name,
                                  clientPhone: selectedProject.clientPhone || selectedProject.phone
                                }
                              });
                            }}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <FileSpreadsheet size={13} />
                            <span>Open in BOQ Editor</span>
                          </button>
                        </div>
                      </div>

                      {/* Items / Spaces Breakdown */}
                      {linkedBOQ && linkedBOQ.spaces && linkedBOQ.spaces.length > 0 ? (
                        <div className="space-y-4">
                          {linkedBOQ.spaces.map((sp, sIdx) => (
                            <div key={sIdx} className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                              <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between font-bold text-xs text-stone-900">
                                <span>{sp.name}</span>
                                <span className="font-mono text-blue-700">₹{(sp.roomTotal || 0).toLocaleString("en-IN")}</span>
                              </div>
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-stone-50/50 text-stone-500 font-bold border-b border-stone-100 text-[11px]">
                                    <th className="py-2.5 px-4">Item Name</th>
                                    <th className="py-2.5 px-3">Variant / Material</th>
                                    <th className="py-2.5 px-3 text-center">Dimensions</th>
                                    <th className="py-2.5 px-3 text-center">Qty</th>
                                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                  {(sp.items || []).map((it, iIdx) => (
                                    <tr key={iIdx}>
                                      <td className="py-2.5 px-4 font-bold text-stone-900">{it.name}</td>
                                      <td className="py-2.5 px-3 text-stone-500">{it.packageVariant || "Standard"}</td>
                                      <td className="py-2.5 px-3 text-center font-mono text-[11px]">{it.lengthFt ? `${it.lengthFt}ft × ${it.heightFt || 1}ft` : "Custom"}</td>
                                      <td className="py-2.5 px-3 text-center font-bold">{it.qty || 1}</td>
                                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                                        ₹{(it.amount || ((it.rate || 0) * (it.qty || 1))).toLocaleString("en-IN")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                                <th className="py-3 px-4">Space / Scope Item</th>
                                <th className="py-3 px-3">Specification</th>
                                <th className="py-3 px-3 text-center">Quantity</th>
                                <th className="py-3 px-4 text-right">Estimated Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">Living Room Full Paneling & TV Unit</td>
                                <td className="py-3 px-3 text-stone-500">HDMR + Acrylic Fluted Louvers + LED Profile</td>
                                <td className="py-3 px-3 text-center font-bold">1 Set</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">₹4,85,000</td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">Modular Kitchen Turnkey Joinery</td>
                                <td className="py-3 px-3 text-stone-500">BWP Marine Ply + Anti-Fingerprint Acrylic + Quartz</td>
                                <td className="py-3 px-3 text-center font-bold">1 Unit</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">₹8,50,000</td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">Master Bedroom Floor-to-Ceiling Wardrobes</td>
                                <td className="py-3 px-3 text-stone-500">Soft-close Hettich Slider + Tinted Glass Profiles</td>
                                <td className="py-3 px-3 text-center font-bold">2 Units</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">₹6,20,000</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================================= */}
              {/* TAB 5: FILES & UPLOADS */}
              {/* ========================================================================= */}
              {activeTab === "files" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">Project Files & Drawings</h3>
                        <span className="text-xs text-stone-500">Upload 2D CAD Layouts, 3D Renders, and Site Measurement Photos</span>
                      </div>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleUploadProjectDoc} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-stone-800">Upload New File</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Document Title (e.g. Master Bed 3D)"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-500"
                        />
                        <select
                          value={newDocCategory}
                          onChange={(e) => setNewDocCategory(e.target.value)}
                          className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Floor Plans">Floor Plans (2D Layout)</option>
                          <option value="3D Renders">3D Visualizations</option>
                          <option value="Site Photos">Site Photos & Measurements</option>
                          <option value="Contracts">Signed Contracts</option>
                        </select>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFileObj(e.target.files?.[0] || null)}
                          className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-stone-200 file:text-stone-800 hover:file:bg-stone-300 cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Upload File
                        </button>
                      </div>
                    </form>

                    {/* Files List */}
                    {getClientDocumentsList().length > 0 ? (
                      <div className="divide-y divide-stone-100">
                        {getClientDocumentsList().map((doc) => (
                          <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-blue-600 shrink-0" />
                              <div>
                                <span className="font-bold text-xs text-stone-900 block">{doc.title}</span>
                                <span className="text-[11px] text-stone-400">
                                  {doc.category} • {doc.fileName} • {doc.fileSize} • {doc.date}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadProjectFile(doc)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition cursor-pointer flex items-center gap-1.5"
                                title="Download File"
                              >
                                <Download size={12} />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProjectDoc(doc.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                        <FolderOpen size={30} className="mx-auto text-stone-300" />
                        <p className="text-xs font-bold text-stone-600">No project files uploaded yet</p>
                        <p className="text-[11px] text-stone-400">Select a file and click "Upload File" to attach floor plans, 3D renders, or contracts.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: INVOICES & BILLING */}
              {/* ========================================================================= */}
              {activeTab === "invoices" && (() => {
                const projectInvs = getLinkedInvoices();
                const totalAmt = Number(selectedProject.budget || 2500000);

                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900">Issued Tax Invoices</h3>
                          <span className="text-xs text-stone-500">Official GST Legal Billing records</span>
                        </div>
                        <button
                          onClick={() => {
                            navigate("/invoices", {
                              state: {
                                createFromClient: true,
                                client: {
                                  name: selectedProject.clientName || selectedProject.name,
                                  phone: selectedProject.clientPhone || selectedProject.phone,
                                  email: selectedProject.clientEmail || selectedProject.email,
                                  address: selectedProject.address || selectedProject.siteLocation
                                }
                              }
                            });
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus size={13} />
                          <span>Create Tax Invoice</span>
                        </button>
                      </div>

                      <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                              <th className="py-3 px-4">Invoice No</th>
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4 text-right">Grand Total</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-700">
                            <tr className="hover:bg-stone-50/50">
                              <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                                {selectedProject.invoiceNumber || (selectedProject.code ? `VLA-INV-${selectedProject.code}` : `VLA-INV-${String(selectedProject._id || "").slice(-4)}`)}
                              </td>
                              <td className="py-3.5 px-4 text-stone-600">{new Date().toLocaleDateString("en-IN")}</td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                                ₹{(totalAmt || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full">
                                  Issued
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      navigate("/invoices", {
                                        state: { openInvoice: selectedProject.invoiceNumber || `VLA-INV-${selectedProject.code || "001"}` }
                                      });
                                    }}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => {
                                      downloadInvoicePdf({
                                        invoiceNumber: selectedProject.invoiceNumber || `VLA-INV-${selectedProject.code || "001"}`,
                                        clientName: selectedProject.clientName || selectedProject.name,
                                        clientPhone: selectedProject.clientPhone || selectedProject.phone,
                                        clientEmail: selectedProject.clientEmail || selectedProject.email,
                                        clientAddress: selectedProject.address || selectedProject.siteLocation,
                                        projectName: `${selectedProject.clientName || selectedProject.name} Project`,
                                        grandTotal: totalAmt
                                      });
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-300 transition cursor-pointer"
                                  >
                                    Download
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MAIN PROJECTS TABLE VIEW (SHOWING ALL ENQUIRY CLIENTS AS IN SCREENSHOT 1) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Top Search, Count & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[300px] max-w-md">
              <input
                type="text"
                placeholder="Search by Name, Phone, Email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
              />
            </div>

            {/* Right Group: Count & Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-stone-700">
                {filteredProjects.length} Projects
              </span>

              <button
                onClick={() => {
                  showToast("Daily Progress Report template ready!");
                  if (filteredProjects.length > 0) setSelectedProject(filteredProjects[0]);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 text-blue-600 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer shadow-2xs"
              >
                <FileText size={14} className="text-blue-600" />
                <span>Generate DPR (Daily)</span>
              </button>

              {/* Status Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
                    statusFilter
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span>{statusFilter || "Filter"}</span>
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-1 z-30 animate-in fade-in">
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setIsFilterDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 font-bold cursor-pointer"
                    >
                      All Statuses
                    </button>
                    {["Yet To Start", "In Progress", "Under Design", "Execution", "Completed"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs hover:bg-stone-50 cursor-pointer ${
                          statusFilter === st ? "font-black text-blue-600 bg-blue-50/50" : "text-stone-700 font-medium"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project List Table (Exact Columns as in Screenshot 1) */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/60 text-stone-600 font-bold border-b border-stone-200 text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Project No</th>
                    <th className="py-3.5 px-4 font-bold">Name</th>
                    <th className="py-3.5 px-4 font-bold">Email</th>
                    <th className="py-3.5 px-4 font-bold">Phone</th>
                    <th className="py-3.5 px-4 font-bold text-center">Project Status</th>
                    <th className="py-3.5 px-4 font-bold">Progress %</th>
                    <th className="py-3.5 px-5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                        No clients found in enquiries.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((proj) => (
                      <tr
                        key={proj.projectNumber || proj.id}
                        onClick={() => {
                          setSelectedProject(proj);
                          setActiveTab("clientInfo");
                        }}
                        className="hover:bg-stone-50/70 transition cursor-pointer group"
                      >
                        {/* Project No */}
                        <td className="py-3.5 px-5 font-mono font-bold text-stone-900">
                          {proj.projectNumber}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-stone-900 group-hover:text-blue-600 transition">
                          {proj.clientName || proj.name}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {proj.clientEmail || proj.email || "--"}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-stone-700 font-medium">
                          {proj.clientPhone || proj.phone || "--"}
                        </td>

                        {/* Project Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 bg-stone-100 text-stone-700 font-bold text-[11px] rounded-lg border border-stone-200">
                            {proj.status || "Yet To Start"}
                          </span>
                        </td>

                        {/* Progress % (Visual bar + percentage) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5 max-w-[140px]">
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${proj.progressPercent || 0}%` }}
                              />
                            </div>
                            <span className="font-mono text-stone-500 text-[11px] font-bold min-w-[24px]">
                              {proj.progressPercent || 0}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2 text-stone-400">
                            <button
                              onClick={() => {
                                setSelectedProject(proj);
                                setActiveTab("clientInfo");
                              }}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="View Client & Project Detail"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(proj)}
                              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                              title="Edit Client & Project"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj)}
                              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT CLIENT & PROJECT DATA MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Edit2 size={16} className="text-blue-600" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  Edit Client & Project Data ({editFormData.projectNumber})
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.clientName || editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.clientPhone || editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientPhone: e.target.value, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.clientEmail || editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientEmail: e.target.value, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Project Status</label>
                  <select
                    value={editFormData.status || "Yet To Start"}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Yet To Start">Yet To Start</option>
                    <option value="Under Design">Under Design</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Execution">Execution</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Contract Budget (₹)</label>
                  <input
                    type="number"
                    value={editFormData.budget !== undefined && editFormData.budget !== null ? editFormData.budget : ""}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Advance / Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={editFormData.paidAmount || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Site Address</label>
                <input
                  type="text"
                  value={editFormData.address || editFormData.siteLocation || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value, siteLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Handled By</label>
                  <input
                    type="text"
                    value={editFormData.handledBy || "Rutuja@velora"}
                    onChange={(e) => setEditFormData({ ...editFormData, handledBy: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Project Consultant</label>
                  <input
                    type="text"
                    value={editFormData.projectConsultant || "Velora Lead Consultant"}
                    onChange={(e) => setEditFormData({ ...editFormData, projectConsultant: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
