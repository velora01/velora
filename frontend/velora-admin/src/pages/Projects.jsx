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
  Info
} from "lucide-react";
import { downloadBOQPdf, downloadInvoicePdf } from "../utils/downloadHelper";

export default function Projects() {
  const navigate = useNavigate();

  // Primary data states
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [boqs, setBoqs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // Residential | Commercial | Renovation | Hospital
  const [statusFilter, setStatusFilter] = useState(""); // Enquiry | Ongoing | Completed

  // Client Workspace Drawer State
  const [selectedClientWorkspace, setSelectedClientWorkspace] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("overview"); // overview | documents | boq | status | payments

  // Client Files State (persisted per client in state/localStorage)
  const [clientDocuments, setClientDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("velora_client_documents");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // File Upload Form in Workspace
  const [uploadDocTitle, setUploadDocTitle] = useState("");
  const [uploadDocCategory, setUploadDocCategory] = useState("Site Photos");
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  // Work Log / Timeline Update Form in Workspace
  const [workLogNote, setWorkLogNote] = useState("");
  const [workLogStage, setWorkLogStage] = useState("Consultation");

  // Project Initialize / Edit Modal
  const [isInitProjectModalOpen, setIsInitProjectModalOpen] = useState(false);
  const [initProjectForm, setInitProjectForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    address: "",
    category: "Residential",
    projectNumber: "",
    heading: "",
    budget: 2500000,
    stage: "Consultation",
    progressPercent: 15,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    projectManager: "Admin",
    siteSupervisor: "Site Engineer",
    priority: "High",
    description: ""
  });

  // Toast notification
  const [toastMsg, setToastMsg] = useState("");

  const PROJECT_CATEGORIES = ["Residential", "Commercial", "Renovation", "Hospital"];

  const WORK_PIPELINE_STAGES = [
    { id: "Enquiry", label: "Enquiry Received", color: "bg-blue-500 text-white" },
    { id: "Consultation", label: "Initial Consultation", color: "bg-indigo-500 text-white" },
    { id: "Site Visit", label: "Site Layout & Measurement", color: "bg-purple-500 text-white" },
    { id: "3D Design", label: "3D Design & CAD", color: "bg-cyan-600 text-white" },
    { id: "BOQ Approval", label: "BOQ & Commercials", color: "bg-amber-500 text-stone-950" },
    { id: "Production", label: "Factory Joinery", color: "bg-orange-500 text-white" },
    { id: "Installation", label: "Site Installation", color: "bg-teal-600 text-white" },
    { id: "Handover", label: "Snag Handover", color: "bg-emerald-600 text-white" },
    { id: "Completed", label: "Project Completed", color: "bg-stone-900 text-white" }
  ];

  // Load all required modules
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [leadsRes, projRes, clientsRes, boqsRes, invsRes] = await Promise.allSettled([
        erpApi.getLeads({ limit: 100 }),
        erpApi.getProjects({ limit: 100 }),
        erpApi.getClients({ limit: 100 }),
        erpApi.getBOQs({ limit: 100 }),
        erpApi.getInvoices({ limit: 100 })
      ]);

      if (leadsRes.status === "fulfilled" && leadsRes.value?.data) {
        setEnquiries(leadsRes.value.data);
      }
      if (projRes.status === "fulfilled" && projRes.value?.data) {
        setProjects(projRes.value.data);
      }
      if (clientsRes.status === "fulfilled" && clientsRes.value?.data) {
        setClients(clientsRes.value.data);
      }
      if (boqsRes.status === "fulfilled" && boqsRes.value?.data) {
        setBoqs(boqsRes.value.data);
      }
      if (invsRes.status === "fulfilled" && invsRes.value?.data) {
        setInvoices(invsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading project workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync client documents to localStorage
  const saveClientDocuments = (updatedDocs) => {
    setClientDocuments(updatedDocs);
    try {
      localStorage.setItem("velora_client_documents", JSON.stringify(updatedDocs));
    } catch (e) {
      console.error("Error saving client documents:", e);
    }
  };

  // Build Unified Client Workspaces List
  const buildUnifiedClientWorkspaces = () => {
    // Map existing enquiries into workspaces
    const workspaceMap = new Map();

    // 1. Process Enquiries
    enquiries.forEach((enq) => {
      const key = (enq.phone || enq.name || String(enq._id)).trim().toLowerCase();
      
      // Match active project
      const matchedProject = projects.find(
        (p) =>
          (p.clientPhone && enq.phone && p.clientPhone.replace(/\D/g, "") === enq.phone.replace(/\D/g, "")) ||
          (p.clientName && enq.name && p.clientName.toLowerCase() === enq.name.toLowerCase())
      );

      // Match BOQs
      const matchedBOQs = boqs.filter(
        (b) =>
          (b.clientPhone && enq.phone && b.clientPhone.replace(/\D/g, "") === enq.phone.replace(/\D/g, "")) ||
          (b.clientName && enq.name && b.clientName.toLowerCase() === enq.name.toLowerCase()) ||
          b.enquiryNo === enq.enquiryNo
      );

      // Match Invoices
      const matchedInvoices = invoices.filter(
        (i) =>
          (i.clientPhone && enq.phone && i.clientPhone.replace(/\D/g, "") === enq.phone.replace(/\D/g, "")) ||
          (i.clientName && enq.name && i.clientName.toLowerCase() === enq.name.toLowerCase())
      );

      // Clean category to 4 valid types
      let category = enq.projectType || "Residential";
      if (!PROJECT_CATEGORIES.includes(category)) {
        if (category.toLowerCase().includes("commercial") || category.toLowerCase().includes("office") || category.toLowerCase().includes("retail")) {
          category = "Commercial";
        } else if (category.toLowerCase().includes("renovation")) {
          category = "Renovation";
        } else if (category.toLowerCase().includes("hospital") || category.toLowerCase().includes("clinic") || category.toLowerCase().includes("health")) {
          category = "Hospital";
        } else {
          category = "Residential";
        }
      }

      // Calculations
      const totalInvoiced = matchedInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
      const totalPaid = matchedInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
      const totalBalance = matchedInvoices.reduce((acc, inv) => acc + (inv.balanceDue || inv.grandTotal || 0), 0);

      // Total Estimated Budget
      const estBudget =
        matchedProject?.budget ||
        (matchedBOQs[0]?.grandTotal) ||
        enq.estimatedValue ||
        2500000;

      // Status
      const isOngoing = Boolean(matchedProject && matchedProject.stage && matchedProject.stage !== "Completed");
      const currentStage = matchedProject ? matchedProject.stage : (enq.status === "Won" ? "Consultation" : "Enquiry");
      const progress = matchedProject?.progressPercent || (isOngoing ? 30 : 0);

      workspaceMap.set(key, {
        id: enq._id,
        enquiryId: enq._id,
        projectId: matchedProject?._id || null,
        clientName: enq.name,
        salutation: enq.salutation || "Mr",
        phone: enq.phone,
        email: enq.email,
        siteLocation: enq.siteLocation || enq.address || enq.city || "Pune",
        category,
        projectSubtype: enq.projectSubtype || "Turnkey Project",
        siteStatus: enq.siteStatus || "Ready to Move",
        enquiryNo: enq.enquiryNo || `ENQ-${String(enq._id).slice(-4)}`,
        enquiryDate: enq.enquiryDate || enq.createdAt || new Date(),
        budget: estBudget,
        budgetFormatted: enq.budget || `₹${(estBudget).toLocaleString("en-IN")}`,
        prospectStatus: enq.prospectStatus || "Warm",
        status: isOngoing ? "Ongoing" : (matchedProject?.stage === "Completed" ? "Completed" : "Enquiry"),
        stage: currentStage,
        progressPercent: progress,
        hasOngoingWork: Boolean(matchedProject),
        project: matchedProject || null,
        boqs: matchedBOQs,
        invoices: matchedInvoices,
        financials: {
          budget: estBudget,
          invoiced: totalInvoiced,
          paid: totalPaid,
          balance: totalBalance,
          paymentStatus: totalPaid >= totalInvoiced && totalInvoiced > 0 ? "Paid" : (totalPaid > 0 ? "Partially Paid" : "Pending")
        },
        notes: enq.notes || enq.remarks || ""
      });
    });

    // 2. Also incorporate any Standalone Projects without existing Enquiries
    projects.forEach((proj) => {
      const key = (proj.clientPhone || proj.clientName || String(proj._id)).trim().toLowerCase();
      if (!workspaceMap.has(key)) {
        const matchedBOQs = boqs.filter(
          (b) => b.clientName && proj.clientName && b.clientName.toLowerCase() === proj.clientName.toLowerCase()
        );
        const matchedInvoices = invoices.filter(
          (i) => i.clientName && proj.clientName && i.clientName.toLowerCase() === proj.clientName.toLowerCase()
        );

        let category = "Residential";
        if (proj.tag?.toLowerCase().includes("commercial") || proj.heading?.toLowerCase().includes("commercial")) {
          category = "Commercial";
        } else if (proj.tag?.toLowerCase().includes("renovation") || proj.heading?.toLowerCase().includes("renovation")) {
          category = "Renovation";
        } else if (proj.tag?.toLowerCase().includes("hospital") || proj.heading?.toLowerCase().includes("clinic")) {
          category = "Hospital";
        }

        const totalInvoiced = matchedInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
        const totalPaid = matchedInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
        const totalBalance = matchedInvoices.reduce((acc, inv) => acc + (inv.balanceDue || inv.grandTotal || 0), 0);

        workspaceMap.set(key, {
          id: proj._id,
          enquiryId: null,
          projectId: proj._id,
          clientName: proj.clientName,
          salutation: "Mr",
          phone: proj.clientPhone || "",
          email: proj.clientEmail || "",
          siteLocation: proj.address || "Pune",
          category,
          projectSubtype: proj.tag || "Turnkey Project",
          siteStatus: "Ready to Move",
          enquiryNo: proj.projectNumber || `PRJ-${String(proj._id).slice(-4)}`,
          enquiryDate: proj.createdAt || new Date(),
          budget: proj.budget || 2500000,
          budgetFormatted: `₹${(proj.budget || 2500000).toLocaleString("en-IN")}`,
          prospectStatus: "Won",
          status: proj.stage === "Completed" ? "Completed" : "Ongoing",
          stage: proj.stage || "Consultation",
          progressPercent: proj.progressPercent || 25,
          hasOngoingWork: true,
          project: proj,
          boqs: matchedBOQs,
          invoices: matchedInvoices,
          financials: {
            budget: proj.budget || 2500000,
            invoiced: totalInvoiced,
            paid: totalPaid,
            balance: totalBalance,
            paymentStatus: totalPaid >= totalInvoiced && totalInvoiced > 0 ? "Paid" : (totalPaid > 0 ? "Partially Paid" : "Pending")
          },
          notes: proj.description || ""
        });
      }
    });

    return Array.from(workspaceMap.values());
  };

  const allWorkspaces = buildUnifiedClientWorkspaces();

  // Filtered List
  const filteredWorkspaces = allWorkspaces.filter((w) => {
    // Search
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchSearch =
        w.clientName?.toLowerCase().includes(term) ||
        w.phone?.toLowerCase().includes(term) ||
        w.email?.toLowerCase().includes(term) ||
        w.siteLocation?.toLowerCase().includes(term) ||
        w.enquiryNo?.toLowerCase().includes(term) ||
        w.category?.toLowerCase().includes(term);
      if (!matchSearch) return false;
    }

    // Category Filter
    if (categoryFilter && w.category !== categoryFilter) {
      return false;
    }

    // Status Filter
    if (statusFilter) {
      if (statusFilter === "Enquiry" && w.hasOngoingWork) return false;
      if (statusFilter === "Ongoing" && (!w.hasOngoingWork || w.stage === "Completed")) return false;
      if (statusFilter === "Completed" && w.stage !== "Completed") return false;
    }

    return true;
  });

  // Open Workspace Drawer for a selected client
  const handleOpenWorkspace = (workspace) => {
    setSelectedClientWorkspace(workspace);
    setActiveWorkspaceTab("overview");
  };

  // Open Project Initialization / Start Modal
  const handleOpenInitProject = (workspace) => {
    setInitProjectForm({
      clientName: workspace.clientName || "",
      clientPhone: workspace.phone || "",
      clientEmail: workspace.email || "",
      address: workspace.siteLocation || "",
      category: workspace.category || "Residential",
      projectNumber: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      heading: `${workspace.clientName} ${workspace.category} Project`,
      budget: workspace.budget || 2500000,
      stage: "Consultation",
      progressPercent: 15,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      projectManager: "Admin Project Lead",
      siteSupervisor: "Senior Site Supervisor",
      priority: "High",
      description: `Turnkey execution for ${workspace.clientName}. Site located at ${workspace.siteLocation || "Pune"}.`
    });
    setIsInitProjectModalOpen(true);
  };

  // Save Project Initialization
  const handleSaveInitProject = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...initProjectForm,
        tag: `${initProjectForm.category} Interior`
      };

      const res = await erpApi.createProject(payload);
      setToastMsg(`Project initialized successfully for ${initProjectForm.clientName}!`);
      setIsInitProjectModalOpen(false);
      await loadAllData();

      // Update active workspace if open
      if (selectedClientWorkspace && selectedClientWorkspace.clientName === initProjectForm.clientName) {
        setSelectedClientWorkspace((prev) => ({
          ...prev,
          hasOngoingWork: true,
          status: "Ongoing",
          stage: initProjectForm.stage,
          progressPercent: initProjectForm.progressPercent,
          project: res?.data || payload
        }));
      }
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to initialize project: " + (err.response?.data?.message || err.message));
    }
  };

  // Quick Stage Update from Workspace or Pipeline
  const handleUpdateProjectStage = async (newStage, newProgress) => {
    if (!selectedClientWorkspace) return;
    try {
      const prog = newProgress !== undefined ? newProgress : getStageDefaultProgress(newStage);

      if (selectedClientWorkspace.projectId) {
        await erpApi.updateProjectStage(selectedClientWorkspace.projectId, {
          stage: newStage,
          progressPercent: prog
        });
      } else {
        // Create project record on the fly if advancing from enquiry
        const newProj = await erpApi.createProject({
          clientName: selectedClientWorkspace.clientName,
          clientPhone: selectedClientWorkspace.phone,
          clientEmail: selectedClientWorkspace.email,
          address: selectedClientWorkspace.siteLocation,
          heading: `${selectedClientWorkspace.clientName} ${selectedClientWorkspace.category} Project`,
          tag: `${selectedClientWorkspace.category} Interior`,
          budget: selectedClientWorkspace.budget,
          stage: newStage,
          progressPercent: prog,
          startDate: new Date().toISOString().split("T")[0]
        });
        selectedClientWorkspace.projectId = newProj?.data?._id;
      }

      setToastMsg(`Work status updated to "${newStage}" (${prog}%)`);
      setSelectedClientWorkspace((prev) => ({
        ...prev,
        hasOngoingWork: true,
        status: newStage === "Completed" ? "Completed" : "Ongoing",
        stage: newStage,
        progressPercent: prog
      }));
      loadAllData();
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.error("Error updating stage:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  const getStageDefaultProgress = (stage) => {
    switch (stage) {
      case "Enquiry": return 5;
      case "Consultation": return 15;
      case "Site Visit": return 25;
      case "3D Design": return 40;
      case "BOQ Approval": return 55;
      case "Production": return 70;
      case "Installation": return 85;
      case "Handover": return 95;
      case "Completed": return 100;
      default: return 50;
    }
  };

  // Handle File Upload for Client
  const handleUploadDocument = (e) => {
    e.preventDefault();
    if (!selectedClientWorkspace || !uploadDocTitle.trim()) {
      alert("Please provide a Document Title.");
      return;
    }

    const clientKey = selectedClientWorkspace.phone || selectedClientWorkspace.clientName || String(selectedClientWorkspace.id);
    const existingList = clientDocuments[clientKey] || [];

    const newDoc = {
      id: "doc_" + Date.now(),
      title: uploadDocTitle.trim(),
      category: uploadDocCategory,
      fileName: selectedFileObj ? selectedFileObj.name : `${uploadDocTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: selectedFileObj ? `${(selectedFileObj.size / 1024).toFixed(1)} KB` : "1.2 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      url: selectedFileObj ? URL.createObjectURL(selectedFileObj) : "#"
    };

    const updated = {
      ...clientDocuments,
      [clientKey]: [newDoc, ...existingList]
    };

    saveClientDocuments(updated);
    setUploadDocTitle("");
    setSelectedFileObj(null);
    setToastMsg(`File "${newDoc.title}" uploaded successfully!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Delete Document
  const handleDeleteDocument = (docId) => {
    if (!selectedClientWorkspace || !window.confirm("Delete this document?")) return;
    const clientKey = selectedClientWorkspace.phone || selectedClientWorkspace.clientName || String(selectedClientWorkspace.id);
    const existingList = clientDocuments[clientKey] || [];
    const updated = {
      ...clientDocuments,
      [clientKey]: existingList.filter((d) => d.id !== docId)
    };
    saveClientDocuments(updated);
    setToastMsg("Document deleted.");
    setTimeout(() => setToastMsg(""), 2500);
  };

  // Helper to get client files
  const getSelectedClientFiles = () => {
    if (!selectedClientWorkspace) return [];
    const clientKey = selectedClientWorkspace.phone || selectedClientWorkspace.clientName || String(selectedClientWorkspace.id);
    const customDocs = clientDocuments[clientKey] || [];

    // Provide default samples if brand new
    if (customDocs.length === 0) {
      return [
        {
          id: "def_1",
          title: "Site Measurement & Initial Floor Plan",
          category: "Floor Plans",
          fileName: `${selectedClientWorkspace.clientName.replace(/\s+/g, "_")}_FloorPlan_2D.pdf`,
          fileSize: "2.4 MB",
          uploadDate: new Date().toISOString().split("T")[0],
          isSample: true
        },
        {
          id: "def_2",
          title: "3D Perspective Visualizations & Moodboard",
          category: "3D Renders",
          fileName: `${selectedClientWorkspace.clientName.replace(/\s+/g, "_")}_Render_Moodboard.jpg`,
          fileSize: "4.8 MB",
          uploadDate: new Date().toISOString().split("T")[0],
          isSample: true
        }
      ];
    }
    return customDocs;
  };

  // Stats Counters
  const totalWorkspacesCount = allWorkspaces.length;
  const ongoingProjectsCount = allWorkspaces.filter((w) => w.hasOngoingWork && w.stage !== "Completed").length;
  const inquiryPhaseCount = allWorkspaces.filter((w) => !w.hasOngoingWork).length;
  const completedProjectsCount = allWorkspaces.filter((w) => w.stage === "Completed").length;

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 p-6 rounded-3xl text-white shadow-md border border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase tracking-wider">
              Single Source of Truth
            </span>
            <span className="text-xs text-stone-400 font-semibold">• Client Workspaces & Execution</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Project & Client Management</span>
          </h1>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl font-medium">
            Unified view of all client enquiries, ongoing turnkey projects, BOQ estimates, stage pipelines, files, and payment statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/enquiry")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Enquiry</span>
          </button>
          <button
            onClick={() => {
              if (allWorkspaces.length > 0) handleOpenInitProject(allWorkspaces[0]);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Zap size={14} className="fill-stone-950" />
            <span>Initialize Project</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <User size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Client Enquiries
            </span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {totalWorkspacesCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Ongoing Projects
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {ongoingProjectsCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Inquiry / Design Stage
            </span>
            <span className="text-xl font-black text-cyan-700 font-mono">
              {inquiryPhaseCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Completed Projects
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              {completedProjectsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Client Name, Phone, Site Location, Enquiry / Project No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
          />
        </div>

        {/* Category Filters (Residential, Commercial, Renovation, Hospital) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              categoryFilter === "" ? "bg-stone-900 text-white shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Categories
          </button>
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "" : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">All Work Statuses</option>
            <option value="Enquiry">Enquiry Phase (No Active Project)</option>
            <option value="Ongoing">Ongoing Projects</option>
            <option value="Completed">Completed Handover</option>
          </select>
        </div>
      </div>

      {/* Main Unified Client Project List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 text-stone-600 font-bold border-b border-stone-200 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">Client & Site Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Enquiry / Ref ID</th>
                <th className="py-3.5 px-4">Work / Project Status</th>
                <th className="py-3.5 px-4 text-right">Estimated Budget</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FolderOpen size={36} className="text-stone-300" />
                      <span className="font-extrabold text-stone-700 text-sm">No Client Records Found</span>
                      <p className="text-xs text-stone-400 max-w-sm">
                        No clients matched your current filter criteria. Create a new enquiry to begin.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((clientItem) => {
                  const stageObj = WORK_PIPELINE_STAGES.find((s) => s.id === clientItem.stage) || WORK_PIPELINE_STAGES[0];

                  return (
                    <tr
                      key={clientItem.id}
                      onClick={() => handleOpenWorkspace(clientItem)}
                      className="hover:bg-stone-50/70 transition cursor-pointer group"
                    >
                      {/* Client Name & Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shadow-2xs ${
                            clientItem.hasOngoingWork ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}>
                            {clientItem.clientName ? clientItem.clientName.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div>
                            <span className="font-extrabold text-stone-900 text-sm group-hover:text-blue-600 transition block">
                              {clientItem.salutation ? `${clientItem.salutation} ` : ""}{clientItem.clientName}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium mt-0.5">
                              {clientItem.phone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone size={10} className="text-stone-400" />
                                  {clientItem.phone}
                                </span>
                              )}
                              {clientItem.siteLocation && (
                                <span className="flex items-center gap-1 truncate max-w-[160px]">
                                  <MapPin size={10} className="text-stone-400" />
                                  {clientItem.siteLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold inline-flex items-center gap-1.5 ${
                          clientItem.category === "Residential"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : clientItem.category === "Commercial"
                            ? "bg-purple-50 text-purple-800 border border-purple-200"
                            : clientItem.category === "Renovation"
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}>
                          <Building size={11} />
                          <span>{clientItem.category}</span>
                        </span>
                      </td>

                      {/* Enquiry / Ref ID */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-stone-700 text-xs block">
                          {clientItem.enquiryNo}
                        </span>
                        <span className="text-[10.5px] text-stone-400">
                          {new Date(clientItem.enquiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>

                      {/* Work / Project Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 min-w-[150px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              clientItem.hasOngoingWork ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
                            }`}>
                              {clientItem.hasOngoingWork ? clientItem.stage : "Inquiry Phase"}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-stone-500">
                              {clientItem.progressPercent}%
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                clientItem.hasOngoingWork ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-stone-300"
                              }`}
                              style={{ width: `${clientItem.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Estimated Budget */}
                      <td className="py-4 px-4 text-right font-mono font-bold text-stone-900">
                        ₹{(clientItem.budget || 2500000).toLocaleString("en-IN")}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                          clientItem.financials.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : clientItem.financials.paymentStatus === "Partially Paid"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-stone-100 text-stone-600"
                        }`}>
                          {clientItem.financials.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenWorkspace(clientItem)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <span>Open Workspace</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLIENT WORKSPACE & PROFILE DRAWER (4 CORE STRUCTURED TABS) */}
      {/* ========================================================================= */}
      {selectedClientWorkspace && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/70 backdrop-blur-xs animate-in fade-in select-none">
          <div className="w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-stone-200">
            {/* Drawer Top Header */}
            <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between border-b border-stone-800 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38E2D] text-stone-950 flex items-center justify-center font-black text-lg shadow-md">
                  {selectedClientWorkspace.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">
                      {selectedClientWorkspace.salutation ? `${selectedClientWorkspace.salutation} ` : ""}{selectedClientWorkspace.clientName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                      {selectedClientWorkspace.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                      selectedClientWorkspace.hasOngoingWork ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-stone-700 text-stone-300"
                    }`}>
                      {selectedClientWorkspace.hasOngoingWork ? `Stage: ${selectedClientWorkspace.stage}` : "Inquiry Stage"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-400 mt-1 font-medium">
                    <span>Ref: {selectedClientWorkspace.enquiryNo}</span>
                    <span>•</span>
                    <span>{selectedClientWorkspace.phone || "No phone"}</span>
                    <span>•</span>
                    <span>{selectedClientWorkspace.siteLocation}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!selectedClientWorkspace.hasOngoingWork ? (
                  <button
                    onClick={() => handleOpenInitProject(selectedClientWorkspace)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-black text-xs rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer"
                  >
                    <Zap size={13} className="fill-stone-950" />
                    <span>Initialize Project</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveWorkspaceTab("status")}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Activity size={13} />
                    <span>Change Status</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedClientWorkspace(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Structured Tab Navigation Bar */}
            <div className="px-6 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveWorkspaceTab("overview")}
                className={`px-4 py-3 font-extrabold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeWorkspaceTab === "overview"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <User size={14} />
                <span>1. Basic Details (Profile)</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("documents")}
                className={`px-4 py-3 font-extrabold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeWorkspaceTab === "documents"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <FolderOpen size={14} />
                <span>2. Files & Documents</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700">
                  {getSelectedClientFiles().length}
                </span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("boq")}
                className={`px-4 py-3 font-extrabold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeWorkspaceTab === "boq"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>3. BOQ & Quotations</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900">
                  {selectedClientWorkspace.boqs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("status")}
                className={`px-4 py-3 font-extrabold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeWorkspaceTab === "status"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Activity size={14} />
                <span>4. Project Status & Pipeline</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("payments")}
                className={`px-4 py-3 font-extrabold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeWorkspaceTab === "payments"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
              >
                <Receipt size={14} />
                <span>Payments ({selectedClientWorkspace.invoices.length})</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50 space-y-6">
              {/* ========================================================================= */}
              {/* TAB 1: BASIC DETAILS (PROFILE & ENQUIRY OVERVIEW) */}
              {/* ========================================================================= */}
              {activeWorkspaceTab === "overview" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Status Banner */}
                  {!selectedClientWorkspace.hasOngoingWork ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-xl">
                          <Info size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-blue-950">
                            Client is currently in Enquiry Stage
                          </h4>
                          <p className="text-xs text-blue-700 mt-0.5">
                            Showing original basic details captured during enquiry. Click "Initialize Project" to convert this lead into an active turnkey project.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenInitProject(selectedClientWorkspace)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                      >
                        Initialize Project Now
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37] text-stone-950 rounded-xl">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-amber-950">
                            Active Project: {selectedClientWorkspace.project?.heading || `${selectedClientWorkspace.clientName} Project`}
                          </h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Stage: <span className="font-bold">{selectedClientWorkspace.stage}</span> ({selectedClientWorkspace.progressPercent}% Completed)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveWorkspaceTab("status")}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Update Stage
                      </button>
                    </div>
                  )}

                  {/* 2-Column Profile Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Card: Personal & Contact Profile */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                      <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} className="text-blue-600" />
                        <span>Client Information</span>
                      </h3>

                      <div className="space-y-3 text-xs text-stone-700">
                        <div>
                          <span className="text-stone-400 font-semibold block text-[11px]">Full Name</span>
                          <span className="font-extrabold text-stone-900 text-sm">
                            {selectedClientWorkspace.salutation ? `${selectedClientWorkspace.salutation} ` : ""}{selectedClientWorkspace.clientName}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Phone Number</span>
                            <span className="font-mono font-bold text-stone-900">{selectedClientWorkspace.phone || "-"}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Email Address</span>
                            <span className="text-stone-700">{selectedClientWorkspace.email || "-"}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-400 font-semibold block text-[11px]">Site Address & Location</span>
                          <span className="font-medium text-stone-800">{selectedClientWorkspace.siteLocation}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Lead Source</span>
                            <span className="font-bold text-stone-700">Velora Inbound Lead</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Prospect Status</span>
                            <span className="font-bold text-rose-600">{selectedClientWorkspace.prospectStatus} Lead</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Property & Execution Scope */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                      <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} className="text-[#9E7B1D]" />
                        <span>Project & Property Details</span>
                      </h3>

                      <div className="space-y-3 text-xs text-stone-700">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Category</span>
                            <span className="font-extrabold text-blue-700 text-sm">{selectedClientWorkspace.category}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Site Status</span>
                            <span className="font-bold text-stone-900">{selectedClientWorkspace.siteStatus}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Project Subtype / Scope</span>
                            <span className="font-bold text-stone-800">{selectedClientWorkspace.projectSubtype}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 font-semibold block text-[11px]">Target Budget</span>
                            <span className="font-mono font-bold text-amber-700">
                              ₹{(selectedClientWorkspace.budget || 2500000).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {selectedClientWorkspace.notes && (
                          <div className="pt-2 border-t border-stone-100">
                            <span className="text-stone-400 font-semibold block text-[11px]">Initial Enquiry Notes</span>
                            <p className="text-stone-600 mt-0.5 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                              {selectedClientWorkspace.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Commercial Summary Card */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <IndianRupee size={14} className="text-emerald-600" />
                      <span>Payment Status & Commercial Summary</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-[10.5px] text-stone-400 font-bold block">TOTAL PROJECT BUDGET</span>
                        <span className="text-base font-black font-mono text-stone-900 mt-1 block">
                          ₹{(selectedClientWorkspace.financials.budget || 2500000).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                        <span className="text-[10.5px] text-blue-600 font-bold block">TOTAL INVOICED</span>
                        <span className="text-base font-black font-mono text-blue-900 mt-1 block">
                          ₹{(selectedClientWorkspace.financials.invoiced || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                        <span className="text-[10.5px] text-emerald-600 font-bold block">AMOUNT PAID</span>
                        <span className="text-base font-black font-mono text-emerald-900 mt-1 block">
                          ₹{(selectedClientWorkspace.financials.paid || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                        <span className="text-[10.5px] text-amber-700 font-bold block">BALANCE DUE</span>
                        <span className="text-base font-black font-mono text-amber-900 mt-1 block">
                          ₹{(selectedClientWorkspace.financials.balance || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: FILES & DOCUMENTS */}
              {/* ========================================================================= */}
              {activeWorkspaceTab === "documents" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Upload New Document Box */}
                  <form onSubmit={handleUploadDocument} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <UploadCloud size={15} className="text-blue-600" />
                      <span>Upload Files & Documents for {selectedClientWorkspace.clientName}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Document Title<span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Master Bedroom 3D Render / Site Measurement"
                          value={uploadDocTitle}
                          onChange={(e) => setUploadDocTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Document Category
                        </label>
                        <select
                          value={uploadDocCategory}
                          onChange={(e) => setUploadDocCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Site Photos">Site Photos & Progress</option>
                          <option value="Floor Plans">Floor Plans & 2D CAD</option>
                          <option value="3D Renders">3D Perspective Renders</option>
                          <option value="Legal & Contracts">Contracts & Work Orders</option>
                          <option value="Snag Lists">Snags & Handover Signoff</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 flex items-end">
                        <button
                          type="submit"
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Add Document</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* List of Files */}
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="px-4 py-3 bg-stone-100 border-b border-stone-200 font-bold text-xs text-stone-800 flex justify-between items-center">
                      <span>Client Documents Archive ({getSelectedClientFiles().length})</span>
                      <span className="text-[11px] text-stone-400 font-normal">All drawings, renders and legal docs</span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {getSelectedClientFiles().map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 hover:bg-stone-50/70 transition flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-xs text-stone-900">{doc.title}</h4>
                              <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-semibold">{doc.category}</span>
                                <span>{doc.fileName}</span>
                                <span>•</span>
                                <span>{doc.fileSize}</span>
                                <span>•</span>
                                <span>{doc.uploadDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url || "#"}
                              download={doc.fileName}
                              className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 transition cursor-pointer"
                              title="Download File"
                            >
                              <Download size={13} />
                            </a>
                            {!doc.isSample && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: BOQ & QUOTATIONS */}
              {/* ========================================================================= */}
              {activeWorkspaceTab === "boq" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-stone-900">
                        BOQ Estimates & Quotations
                      </h3>
                      <p className="text-xs text-stone-500">
                        Line-by-line spaces, joinery components, materials & turnkey commercials
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClientWorkspace(null);
                        navigate("/boq", {
                          state: {
                            clientName: selectedClientWorkspace.clientName,
                            clientPhone: selectedClientWorkspace.phone
                          }
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={3} />
                      <span>Create New BOQ for Client</span>
                    </button>
                  </div>

                  {selectedClientWorkspace.boqs.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-3">
                      <FileSpreadsheet size={36} className="text-[#9E7B1D] mx-auto" />
                      <h4 className="font-extrabold text-sm text-stone-800">
                        No BOQ Estimate Created Yet
                      </h4>
                      <p className="text-xs text-stone-500 max-w-md mx-auto">
                        You can build a bespoke room-by-room BOQ with modular joinery, furniture, and finishes directly for {selectedClientWorkspace.clientName}.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedClientWorkspace(null);
                          navigate("/boq", {
                            state: {
                              clientName: selectedClientWorkspace.clientName,
                              clientPhone: selectedClientWorkspace.phone
                            }
                          });
                        }}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition cursor-pointer mt-2"
                      >
                        Launch BOQ Builder
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedClientWorkspace.boqs.map((boq) => (
                        <div
                          key={boq._id || boq.boqNumber}
                          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-mono font-bold text-xs">
                                {boq.boqNumber}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-stone-900">
                                  Package: {boq.activePackage || "Standard"} Luxury Execution
                                </h4>
                                <span className="text-[11px] text-stone-400">
                                  Spaces: {boq.numberOfSpaces || (boq.spaces?.length || 0)} Rooms • Ref: {boq.enquiryNo || "-"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => downloadBOQPdf(boq)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-[10px] text-stone-400 font-bold block">SUBTOTAL</span>
                              <span className="font-mono font-bold text-stone-900 block mt-0.5">
                                ₹{(boq.subtotal || Math.round((boq.grandTotal || 0) / 1.18)).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-[10px] text-stone-400 font-bold block">GST TOTAL</span>
                              <span className="font-mono font-bold text-stone-900 block mt-0.5">
                                ₹{(boq.gstTotal || Math.round((boq.grandTotal || 0) * 0.18)).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 sm:col-span-2">
                              <span className="text-[10px] text-amber-800 font-bold block">GRAND TOTAL COMMERCIALS</span>
                              <span className="font-mono font-black text-sm text-stone-950 block mt-0.5">
                                ₹{(boq.grandTotal || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: PROJECT STATUS & WORK TIMELINE PIPELINE */}
              {/* ========================================================================= */}
              {activeWorkspaceTab === "status" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Visual Stage Tracker */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-blue-600" />
                        <span>Interactive Work Pipeline Stages</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-600">
                        {selectedClientWorkspace.progressPercent}% Overall Progress
                      </span>
                    </h3>

                    <p className="text-xs text-stone-500">
                      Click on any stage below to advance or update this project's execution status:
                    </p>

                    {/* Stage Buttons Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {WORK_PIPELINE_STAGES.map((st, idx) => {
                        const isCurrent = selectedClientWorkspace.stage === st.id;
                        const currentStageIdx = WORK_PIPELINE_STAGES.findIndex((s) => s.id === selectedClientWorkspace.stage);
                        const isPassed = currentStageIdx >= idx;

                        return (
                          <button
                            key={st.id}
                            onClick={() => handleUpdateProjectStage(st.id)}
                            className={`p-3 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                              isCurrent
                                ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                                : isPassed
                                ? "bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold opacity-70 block">STAGE {idx + 1}</span>
                              <span className="font-extrabold text-xs block">{st.label}</span>
                            </div>
                            {isPassed && <Check size={14} className={isCurrent ? "text-white" : "text-blue-600"} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milestone & Execution Details */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                      Progress Percentage Adjustment
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                        <span>Current Work Completion:</span>
                        <span className="font-mono text-sm text-blue-600">{selectedClientWorkspace.progressPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClientWorkspace.progressPercent}
                        onChange={(e) =>
                          handleUpdateProjectStage(
                            selectedClientWorkspace.stage,
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: PAYMENTS & INVOICES */}
              {/* ========================================================================= */}
              {activeWorkspaceTab === "payments" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-stone-900">
                        Client Invoices & Dues
                      </h3>
                      <p className="text-xs text-stone-500">
                        Official GST tax invoices, billing history and milestone dues
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClientWorkspace(null);
                        navigate("/invoices");
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Issue Tax Invoice</span>
                    </button>
                  </div>

                  {selectedClientWorkspace.invoices.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-3">
                      <Receipt size={36} className="text-blue-600 mx-auto" />
                      <h4 className="font-extrabold text-sm text-stone-800">No Invoices Issued Yet</h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        You can issue milestone tax invoices linked to this client directly from the Invoices module.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 text-[11px]">
                              <th className="py-3 px-4">Invoice No</th>
                              <th className="py-3 px-4">Issue Date</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Total Amount</th>
                              <th className="py-3 px-4 text-right">Due Amount</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-700">
                            {selectedClientWorkspace.invoices.map((inv) => (
                              <tr key={inv._id || inv.invoiceNumber} className="hover:bg-stone-50/70">
                                <td className="py-3 px-4 font-bold text-stone-900 font-mono">
                                  {inv.invoiceNumber}
                                </td>
                                <td className="py-3 px-4 text-stone-600">
                                  {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                    {inv.status || "Issued"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                                  ₹{(inv.grandTotal || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                                  ₹{(inv.balanceDue || inv.grandTotal || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => downloadInvoicePdf(inv)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-300 transition cursor-pointer"
                                    title="Download Tax Invoice PDF"
                                  >
                                    <Download size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">
                Client Workspace ID: {selectedClientWorkspace.id}
              </span>
              <button
                onClick={() => setSelectedClientWorkspace(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INITIALIZE / CREATE PROJECT MODAL */}
      {/* ========================================================================= */}
      {isInitProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap size={18} className="text-amber-400 fill-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  Initialize Turnkey Project
                </h3>
              </div>
              <button
                onClick={() => setIsInitProjectModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInitProject} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Client Name<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={initProjectForm.clientName}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Project Category<span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={initProjectForm.category}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Hospital">Hospital</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Project Title</label>
                  <input
                    type="text"
                    value={initProjectForm.heading}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, heading: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Target Budget (₹)</label>
                  <input
                    type="number"
                    value={initProjectForm.budget}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Initial Stage</label>
                  <select
                    value={initProjectForm.stage}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Site Visit">Site Layout & Measurement</option>
                    <option value="3D Design">3D Design & CAD</option>
                    <option value="BOQ Approval">BOQ & Commercials</option>
                    <option value="Production">Factory Joinery</option>
                    <option value="Installation">Site Installation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Site Location</label>
                  <input
                    type="text"
                    value={initProjectForm.address}
                    onChange={(e) => setInitProjectForm({ ...initProjectForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInitProjectModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm & Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
