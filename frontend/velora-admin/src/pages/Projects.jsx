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
  MoreVertical,
  ArrowLeft,
  Users,
  Briefcase,
  CheckSquare,
  Clock3,
  CalendarDays,
  Percent,
  Printer
} from "lucide-react";
import { downloadBOQPdf, downloadInvoicePdf, printInvoice } from "../utils/downloadHelper";

export default function Projects() {
  const navigate = useNavigate();

  // Primary data states
  const [enquiries, setEnquiries] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [boqs, setBoqs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Yet To Start | In Progress | Under Design | Execution | Completed
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Selected Project (Full-Page Workspace)
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("detail"); // detail | files | scope | ordersheet | planning | schedule | payments | tracker | invoice

  // Edit Project / Client Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Create Project Modal (From Enquiry Selection)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [createFormData, setCreateFormData] = useState({
    projectNumber: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    address: "",
    projectType: "Residential",
    status: "Yet To Start",
    progressPercent: 0,
    orderValue: 2500000,
    orderDate: new Date().toISOString().split("T")[0],
    expStartDate: "",
    expEndDate: "",
    actualStartDate: "",
    actualEndDate: "",
    handledBy: "Rutuja@velora",
    projectConsultant: "Velora Lead Consultant",
    serviceEligibility: "1 Year Free Snag Warranty",
    serviceValidTill: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    description: ""
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

  // DPR / Tracker Note
  const [dprNote, setDprNote] = useState("");
  const [dprStage, setDprStage] = useState("Site Execution");

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Base default projects (matching exact reference screenshot)
  const defaultSampleProjects = [
    {
      id: "PRJ-2026-012",
      projectNumber: "PRJ-2026-012",
      clientName: "sai chauhan",
      salutation: "Mr.",
      clientEmail: "rohan@gmail.com",
      clientPhone: "8446031622",
      address: "Wakad Chowk, Pune, Maharashtra",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 2850000,
      orderDate: "Sep 2, 2026",
      expStartDate: "2026-09-10",
      expEndDate: "2026-10-25",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Sep 2, 2027",
      description: "Complete 3BHK Turnkey Interior Execution with Italian Marble, Modular Kitchen, and Custom Wardrobes."
    },
    {
      id: "PRJ-2026-008",
      projectNumber: "PRJ-2026-008",
      clientName: "PREM SHUKLA",
      salutation: "Mr.",
      clientEmail: "PREMSHUKLA@GMAIL.COM",
      clientPhone: "78000 20496",
      address: "402, High Street, Baner, Pune",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 468800,
      orderDate: "Aug 28, 2026",
      expStartDate: "2026-09-05",
      expEndDate: "2026-10-15",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Senior Architect",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 28, 2027",
      description: "Premium interior fitout with bespoke furniture and acrylic modular kitchen."
    },
    {
      id: "PRJ-2026-011",
      projectNumber: "PRJ-2026-011",
      clientName: "Rajeev Singhal",
      salutation: "Mr.",
      clientEmail: "rajeev.singhal@gmail.com",
      clientPhone: "8948274553",
      address: "Kalyani Nagar, Pune",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 3200000,
      orderDate: "Aug 25, 2026",
      expStartDate: "2026-09-15",
      expEndDate: "2026-11-01",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 25, 2027",
      description: "Luxury 4BHK Penthouse execution with acoustic home theatre and automation."
    },
    {
      id: "PRJ-2026-010",
      projectNumber: "PRJ-2026-010",
      clientName: "Rasid sir",
      salutation: "Mr.",
      clientEmail: "rasid.interior@gmail.com",
      clientPhone: "8412852592",
      address: "Koregaon Park, Pune",
      projectType: "Commercial",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 5500000,
      orderDate: "Aug 20, 2026",
      expStartDate: "2026-09-01",
      expEndDate: "2026-10-30",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Commercial Lead",
      serviceEligibility: "2 Years Commercial Support",
      serviceValidTill: "Aug 20, 2028",
      description: "Turnkey Corporate Office interior with 45 workstations, conference suite, and lounge."
    },
    {
      id: "PRJ-2026-009",
      projectNumber: "PRJ-2026-009",
      clientName: "Akash Jain",
      salutation: "Mr.",
      clientEmail: "akash.jain@gmail.com",
      clientPhone: "89778 99643",
      address: "Hinjewadi Phase 1, Pune",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 2150000,
      orderDate: "Aug 18, 2026",
      expStartDate: "2026-09-12",
      expEndDate: "2026-10-20",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 18, 2027",
      description: "Modern minimalist 2BHK execution with space-saving modular systems."
    },
    {
      id: "PRJ-2026-007",
      projectNumber: "PRJ-2026-007",
      clientName: "Dr Saurabh",
      salutation: "Dr.",
      clientEmail: "dr.saurabh@gmail.com",
      clientPhone: "77090 19535",
      address: "Aundh, Pune",
      projectType: "Commercial",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 3800000,
      orderDate: "Aug 15, 2026",
      expStartDate: "2026-09-08",
      expEndDate: "2026-10-28",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Healthcare Specialist",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 15, 2027",
      description: "Super-specialty medical clinic interior with hygienic antimicrobial surfaces."
    },
    {
      id: "PRJ-2026-006",
      projectNumber: "PRJ-2026-006",
      clientName: "Dr Hardik",
      salutation: "Dr.",
      clientEmail: "dr.hardik@gmail.com",
      clientPhone: "98909 44762",
      address: "Viman Nagar, Pune",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 2900000,
      orderDate: "Aug 12, 2026",
      expStartDate: "2026-09-18",
      expEndDate: "2026-11-10",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 12, 2027",
      description: "Contemporary 3BHK interior with custom fluted wall paneling and quartz countertops."
    },
    {
      id: "PRJ-2026-005",
      projectNumber: "PRJ-2026-005",
      clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
      salutation: "",
      clientEmail: "procurement@wipro-lincraft.com",
      clientPhone: "96323 00992",
      address: "EON Free Zone, Kharadi, Pune",
      projectType: "Commercial",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 8400000,
      orderDate: "Aug 05, 2026",
      expStartDate: "2026-09-01",
      expEndDate: "2026-11-30",
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Commercial Lead",
      serviceEligibility: "2 Years Enterprise SLA",
      serviceValidTill: "Aug 05, 2028",
      description: "State-of-the-art AI Innovation Lab and workspace fitout with acoustic baffles."
    }
  ];

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Load enquiries
      let localEnqs = [];
      try {
        const savedEnqs = localStorage.getItem("velora_custom_enquiries");
        if (savedEnqs) localEnqs = JSON.parse(savedEnqs);
      } catch (e) {
        console.warn("Could not read local enquiries:", e);
      }

      let apiEnqs = [];
      try {
        const res = await erpApi.getLeads({ limit: 100 });
        if (res?.data) apiEnqs = res.data;
      } catch (e) {
        console.warn("API leads fallback:", e);
      }

      // Merge unique enquiries
      const enqMap = new Map();
      [...localEnqs, ...apiEnqs].forEach((enq) => {
        const key = (enq.phone || enq.name || String(enq._id || enq.enquiryNo)).trim().toLowerCase();
        if (key && !enqMap.has(key)) {
          enqMap.set(key, enq);
        }
      });
      const mergedEnqs = Array.from(enqMap.values());
      setEnquiries(mergedEnqs);

      // 2. Load BOQs & Invoices
      try {
        const [boqsRes, invsRes] = await Promise.allSettled([
          erpApi.getBOQs({ limit: 100 }),
          erpApi.getInvoices({ limit: 100 })
        ]);
        if (boqsRes.status === "fulfilled" && boqsRes.value?.data) setBoqs(boqsRes.value.data);
        if (invsRes.status === "fulfilled" && invsRes.value?.data) setInvoices(invsRes.value.data);
      } catch (e) {
        console.warn("Error loading BOQs/Invoices:", e);
      }

      // 3. Load Projects
      let localProjects = [];
      try {
        const savedProj = localStorage.getItem("velora_local_projects");
        if (savedProj) localProjects = JSON.parse(savedProj);
      } catch (e) {
        console.warn("Could not read local projects:", e);
      }

      let apiProjects = [];
      try {
        const res = await erpApi.getProjects({ limit: 100 });
        if (res?.data) apiProjects = res.data;
      } catch (e) {
        console.warn("API projects fallback:", e);
      }

      // Merge projects with sample data ensuring reference items exist
      const projectMap = new Map();
      [...defaultSampleProjects, ...localProjects, ...apiProjects].forEach((p) => {
        const key = (p.projectNumber || p.clientPhone || p.clientName || String(p._id || p.id)).trim().toLowerCase();
        if (key && !projectMap.has(key)) {
          projectMap.set(key, {
            ...p,
            id: p._id || p.id || p.projectNumber,
            projectNumber: p.projectNumber || `PRJ-2026-${String(p._id || p.id).slice(-3)}`,
            status: p.status || p.stage || "Yet To Start",
            progressPercent: p.progressPercent !== undefined ? p.progressPercent : (p.status === "Completed" ? 100 : 0)
          });
        }
      });

      // Also ensure enquiries are mapped if user creates project from them
      setProjectsList(Array.from(projectMap.values()));
    } catch (err) {
      console.error("Error loading project data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save projects to localStorage
  const saveProjectsToStorage = (updated) => {
    setProjectsList(updated);
    try {
      localStorage.setItem("velora_local_projects", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving projects:", e);
    }
  };

  // Filtered Projects list
  const filteredProjects = projectsList.filter((proj) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        proj.projectNumber?.toLowerCase().includes(term) ||
        proj.clientName?.toLowerCase().includes(term) ||
        proj.clientEmail?.toLowerCase().includes(term) ||
        proj.clientPhone?.toLowerCase().includes(term) ||
        proj.status?.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (statusFilter && proj.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Open Create Project Modal
  const handleOpenCreateModal = () => {
    // Generate next project ID
    const nextNum = 12 + projectsList.length;
    const nextId = `PRJ-2026-${String(nextNum).padStart(3, "0")}`;

    setSelectedEnquiryId("");
    setCreateFormData({
      projectNumber: nextId,
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      address: "Pune, Maharashtra",
      projectType: "Residential",
      status: "Yet To Start",
      progressPercent: 0,
      orderValue: 2500000,
      orderDate: new Date().toISOString().split("T")[0],
      expStartDate: new Date().toISOString().split("T")[0],
      expEndDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
      actualStartDate: "",
      actualEndDate: "",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      description: ""
    });
    setIsCreateModalOpen(true);
  };

  // When an enquiry is chosen in the Create Project Modal
  const handleSelectEnquiryForProject = (enqId) => {
    setSelectedEnquiryId(enqId);
    if (!enqId) return;

    const enq = enquiries.find(
      (e) => String(e._id || e.enquiryNo || e.id) === String(enqId)
    );
    if (enq) {
      setCreateFormData((prev) => ({
        ...prev,
        clientName: enq.name || prev.clientName,
        clientPhone: enq.phone || prev.clientPhone,
        clientEmail: enq.email || prev.clientEmail,
        address: enq.siteLocation || enq.address || enq.city || prev.address,
        projectType: enq.projectType || prev.projectType,
        orderValue: enq.estimatedValue || enq.budget || prev.orderValue,
        description: `Turnkey execution for ${enq.name}. Enquiry reference: ${enq.enquiryNo || enq._id}.`
      }));
    }
  };

  // Save New Project
  const handleSaveNewProject = async (e) => {
    e.preventDefault();
    if (!createFormData.clientName.trim()) {
      alert("Please enter or select a client name.");
      return;
    }

    const newProjectItem = {
      ...createFormData,
      id: createFormData.projectNumber || `PRJ-${Date.now()}`,
      orderDate: createFormData.orderDate || new Date().toISOString().split("T")[0]
    };

    try {
      await erpApi.createProject(newProjectItem);
    } catch (err) {
      console.warn("Backend create fallback:", err);
    }

    const updated = [newProjectItem, ...projectsList];
    saveProjectsToStorage(updated);
    setIsCreateModalOpen(false);
    showToast(`Project ${newProjectItem.projectNumber} created successfully!`);
    setSelectedProject(newProjectItem);
  };

  // Open Edit Project Modal
  const handleOpenEditModal = (proj) => {
    setEditFormData({ ...proj });
    setIsEditModalOpen(true);
  };

  // Save Edited Project
  const handleSaveEditedProject = async (e) => {
    e.preventDefault();
    const updated = projectsList.map((p) =>
      p.id === editFormData.id || p.projectNumber === editFormData.projectNumber ? { ...editFormData } : p
    );
    saveProjectsToStorage(updated);

    if (selectedProject && (selectedProject.id === editFormData.id || selectedProject.projectNumber === editFormData.projectNumber)) {
      setSelectedProject({ ...editFormData });
    }

    try {
      if (editFormData._id) {
        await erpApi.updateProject(editFormData._id, editFormData);
      }
    } catch (err) {
      console.warn("Backend update fallback:", err);
    }

    setIsEditModalOpen(false);
    showToast("Project details updated successfully!");
  };

  // Quick Status change in Project Detail
  const handleQuickStatusChange = (newStatus) => {
    if (!selectedProject) return;
    let newProg = selectedProject.progressPercent;
    if (newStatus === "Yet To Start") newProg = 0;
    else if (newStatus === "Under Design") newProg = 25;
    else if (newStatus === "Execution" || newStatus === "In Progress") newProg = 60;
    else if (newStatus === "Snagging") newProg = 85;
    else if (newStatus === "Completed") newProg = 100;

    const updatedProj = { ...selectedProject, status: newStatus, progressPercent: newProg };
    setSelectedProject(updatedProj);

    const updatedList = projectsList.map((p) =>
      p.id === selectedProject.id || p.projectNumber === selectedProject.projectNumber ? updatedProj : p
    );
    saveProjectsToStorage(updatedList);
    showToast(`Status updated to "${newStatus}" (${newProg}%)`);
  };

  // Quick Progress change in Project Detail
  const handleQuickProgressChange = (newProg) => {
    if (!selectedProject) return;
    const progVal = Number(newProg);
    const updatedProj = { ...selectedProject, progressPercent: progVal };
    if (progVal === 100) updatedProj.status = "Completed";
    else if (progVal > 0 && updatedProj.status === "Yet To Start") updatedProj.status = "In Progress";

    setSelectedProject(updatedProj);
    const updatedList = projectsList.map((p) =>
      p.id === selectedProject.id || p.projectNumber === selectedProject.projectNumber ? updatedProj : p
    );
    saveProjectsToStorage(updatedList);
  };

  // Delete Project
  const handleDeleteProject = (projId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const updated = projectsList.filter((p) => p.id !== projId && p.projectNumber !== projId);
    saveProjectsToStorage(updated);
    if (selectedProject && (selectedProject.id === projId || selectedProject.projectNumber === projId)) {
      setSelectedProject(null);
    }
    showToast("Project deleted.");
  };

  // Document Management
  const getClientDocumentsList = () => {
    if (!selectedProject) return [];
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.clientName;
    const existing = projectDocuments[key];
    if (existing && existing.length > 0) return existing;

    return [
      {
        id: "doc_1",
        title: "2D Architectural Floor Plan",
        category: "Floor Plans",
        fileName: `${selectedProject.clientName?.replace(/\s+/g, "_")}_2D_Layout.pdf`,
        fileSize: "3.2 MB",
        date: "Sep 2, 2026"
      },
      {
        id: "doc_2",
        title: "3D Visualizations & Perspective Renders",
        category: "3D Renders",
        fileName: `${selectedProject.clientName?.replace(/\s+/g, "_")}_3D_Renders.pdf`,
        fileSize: "8.6 MB",
        date: "Sep 2, 2026"
      },
      {
        id: "doc_3",
        title: "Site Measurement & Snag Checklist",
        category: "Site Photos",
        fileName: "Initial_Site_Measurement_Checklist.pdf",
        fileSize: "1.4 MB",
        date: "Sep 1, 2026"
      }
    ];
  };

  const handleUploadProjectDoc = (e) => {
    e.preventDefault();
    if (!selectedProject || !newDocTitle.trim()) return;
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.clientName;
    const existing = getClientDocumentsList();
    const newDoc = {
      id: "doc_" + Date.now(),
      title: newDocTitle.trim(),
      category: newDocCategory,
      fileName: selectedFileObj ? selectedFileObj.name : `${newDocTitle.replace(/\s+/g, "_")}.pdf`,
      fileSize: selectedFileObj ? `${(selectedFileObj.size / 1024).toFixed(1)} KB` : "1.8 MB",
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

  // Find linked BOQ
  const getLinkedBOQ = () => {
    if (!selectedProject) return null;
    return (
      boqs.find(
        (b) =>
          b.clientName?.toLowerCase() === selectedProject.clientName?.toLowerCase() ||
          (b.clientPhone && selectedProject.clientPhone && b.clientPhone.replace(/\D/g, "") === selectedProject.clientPhone.replace(/\D/g, ""))
      ) || null
    );
  };

  // Find linked Invoices
  const getLinkedInvoices = () => {
    if (!selectedProject) return [];
    return invoices.filter(
      (inv) =>
        inv.clientName?.toLowerCase() === selectedProject.clientName?.toLowerCase() ||
        (inv.clientPhone && selectedProject.clientPhone && inv.clientPhone.replace(/\D/g, "") === selectedProject.clientPhone.replace(/\D/g, ""))
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
      {/* 1. FULL-PAGE PROJECT DETAIL WORKSPACE (IMAGE 2 REFERENCE) */}
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
                  {selectedProject.clientName ? selectedProject.clientName.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h1 className="text-xl font-black text-stone-900 tracking-tight">
                    {selectedProject.salutation ? `${selectedProject.salutation} ` : ""}{selectedProject.clientName}
                  </h1>
                  <span className="font-mono text-xs text-stone-500 font-semibold">
                    {selectedProject.projectNumber}
                  </span>
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
                <span>Edit Project</span>
              </button>

              <button
                onClick={() => {
                  showToast("DPR Report generated for today!");
                  setActiveTab("tracker");
                }}
                className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <FileText size={13} className="text-blue-600" />
                <span>Generate DPR (Detailed)</span>
              </button>

              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-stone-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete Project</span>
              </button>
            </div>
          </div>

          {/* 2-Column Full-Page Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar Navigation Tags / Tabs (as in screenshot 2) */}
            <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              {[
                { id: "detail", label: "Project Detail", icon: Info },
                { id: "files", label: "Files", icon: FolderOpen },
                { id: "scope", label: "Scope of Work", icon: Layers },
                { id: "ordersheet", label: "Order Sheet", icon: FileSpreadsheet },
                { id: "planning", label: "Project Planning", icon: Briefcase },
                { id: "schedule", label: "Schedule", icon: CalendarDays },
                { id: "payments", label: "Payment Schedule", icon: IndianRupee },
                { id: "tracker", label: "Tracker", icon: TrendingUp },
                { id: "invoice", label: "Invoice", icon: Receipt }
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
              {/* ========================================== */}
              {/* 1. PROJECT DETAIL TAB (SCREENSHOT 2 EXACT UI) */}
              {/* ========================================== */}
              {activeTab === "detail" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Card: Project Information */}
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
                            className="px-2.5 py-1 bg-stone-50 border border-stone-200 text-stone-800 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
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
                          <span className="text-stone-500 font-medium">Progress</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${selectedProject.progressPercent || 0}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-stone-700 text-[11px]">
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
                          <span className="text-stone-500 font-medium">Actual End Date</span>
                          <span className="font-mono text-stone-700">{selectedProject.actualEndDate || "--"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Order Value</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            ₹{(selectedProject.orderValue || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Order Date</span>
                          <span className="text-stone-800 font-medium">{selectedProject.orderDate || "Sep 2, 2026"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Service Eligibility</span>
                          <span className="text-stone-800 font-medium">{selectedProject.serviceEligibility || "--"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">Service Valid Till</span>
                          <span className="text-stone-800 font-medium">{selectedProject.serviceValidTill || "--"}</span>
                        </div>

                        <div className="flex items-start justify-between pt-1">
                          <span className="text-stone-500 font-medium">Site Address</span>
                          <span className="text-stone-800 font-medium text-right max-w-[200px]">
                            {selectedProject.address || "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Client Info & Project Members */}
                    <div className="space-y-6">
                      {/* Client Information Card */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            <h3 className="font-extrabold text-sm text-stone-900">Client Information</h3>
                          </div>
                          <button
                            onClick={() => handleOpenEditModal(selectedProject)}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Name</span>
                            <span className="font-bold text-stone-900">
                              {selectedProject.salutation ? `${selectedProject.salutation} ` : ""}{selectedProject.clientName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Phone</span>
                            <span className="font-mono text-stone-800 font-medium">
                              (+91) {selectedProject.clientPhone || "--"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium">Email</span>
                            <span className="text-stone-800 font-medium">{selectedProject.clientEmail || "--"}</span>
                          </div>

                          <div className="flex items-start justify-between">
                            <span className="text-stone-500 font-medium">Address</span>
                            <span className="text-stone-800 font-medium text-right max-w-[200px]">
                              {selectedProject.address || "--"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Project Members Card */}
                      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                          <Users size={16} className="text-blue-600" />
                          <h3 className="font-extrabold text-sm text-stone-900">Project Members</h3>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 2. FILES TAB */}
              {/* ========================================== */}
              {activeTab === "files" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">Project Files & Architectural Drawings</h3>
                        <span className="text-xs text-stone-500">2D Plans, 3D Perspective Visualizations, Site Snags</span>
                      </div>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleUploadProjectDoc} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-stone-800">Upload New Project Document</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Document Title (e.g. Master Bedroom 3D)"
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

                    {/* Document List */}
                    <div className="divide-y divide-stone-100">
                      {getClientDocumentsList().map((doc) => (
                        <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-blue-600" />
                            <div>
                              <span className="font-bold text-xs text-stone-900 block">{doc.title}</span>
                              <span className="text-[11px] text-stone-400">
                                {doc.category} • {doc.fileSize} • {doc.date}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => showToast(`Downloading ${doc.fileName}...`)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 3. SCOPE OF WORK (BOQ & SPACES) */}
              {/* ========================================== */}
              {activeTab === "scope" && (() => {
                const linkedBOQ = getLinkedBOQ();
                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900">
                            {linkedBOQ ? `BOQ Estimate ${linkedBOQ.boqNumber || "BOQ-2026-018"}` : "Scope of Work & Line Items"}
                          </h3>
                          <span className="text-xs text-stone-500">Itemized components, joinery, materials and pricing</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {linkedBOQ && (
                            <button
                              onClick={() => downloadBOQPdf(linkedBOQ)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Download size={12} />
                              <span>BOQ PDF</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              navigate("/boq", {
                                state: {
                                  clientName: selectedProject.clientName,
                                  clientPhone: selectedProject.clientPhone
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
                                    <th className="py-2.5 px-3">Variant / Finish</th>
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
                        <div className="border border-stone-200 rounded-2xl overflow-hidden">
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

              {/* ========================================== */}
              {/* 4. PAYMENT SCHEDULE TAB */}
              {/* ========================================== */}
              {activeTab === "payments" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">Payment Schedule & Commercials</h3>
                        <span className="text-xs text-stone-500">Contract milestone billing and payment tracking</span>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/invoices", {
                            state: { createFromClient: true, client: { name: selectedProject.clientName, phone: selectedProject.clientPhone, email: selectedProject.clientEmail, address: selectedProject.address } }
                          });
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Receipt size={13} />
                        <span>Generate Invoice</span>
                      </button>
                    </div>

                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="text-[11px] font-bold text-stone-400 block mb-1">TOTAL CONTRACT VALUE</span>
                        <span className="font-mono text-xl font-black text-stone-900">
                          ₹{(selectedProject.orderValue || 2500000).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                        <span className="text-[11px] font-bold text-emerald-700 block mb-1">AMOUNT PAID (ADVANCE)</span>
                        <span className="font-mono text-xl font-black text-emerald-800">
                          ₹{((selectedProject.orderValue || 2500000) * 0.5).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                        <span className="text-[11px] font-bold text-blue-700 block mb-1">BALANCE DUE</span>
                        <span className="font-mono text-xl font-black text-blue-900">
                          ₹{((selectedProject.orderValue || 2500000) * 0.5).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Milestones Table */}
                    <div className="border border-stone-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                            <th className="py-3 px-4">Payment Milestone</th>
                            <th className="py-3 px-3">Percentage</th>
                            <th className="py-3 px-3 text-right">Amount (₹)</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                          <tr>
                            <td className="py-3.5 px-4 font-bold text-stone-900">1. Advance Work Order Confirmation</td>
                            <td className="py-3.5 px-3 font-mono font-bold">50%</td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold">
                              ₹{((selectedProject.orderValue || 2500000) * 0.5).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Received
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-bold text-stone-900">2. Material Delivery & Factory Dispatch</td>
                            <td className="py-3.5 px-3 font-mono font-bold">40%</td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold">
                              ₹{((selectedProject.orderValue || 2500000) * 0.4).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Pending Dispatch
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-bold text-stone-900">3. Final Snag Clearance & Handover</td>
                            <td className="py-3.5 px-3 font-mono font-bold">10%</td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold">
                              ₹{((selectedProject.orderValue || 2500000) * 0.1).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                Final Snag
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 5. INVOICE TAB */}
              {/* ========================================== */}
              {activeTab === "invoice" && (() => {
                const projectInvs = getLinkedInvoices();
                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900">Issued Invoices</h3>
                          <span className="text-xs text-stone-500">Official GST Legal Billing records</span>
                        </div>
                        <button
                          onClick={() => {
                            navigate("/invoices", {
                              state: { createFromClient: true, client: { name: selectedProject.clientName, phone: selectedProject.clientPhone, email: selectedProject.clientEmail, address: selectedProject.address } }
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
                                {selectedProject.clientName?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001"}
                              </td>
                              <td className="py-3.5 px-4 text-stone-600">{new Date().toLocaleDateString("en-IN")}</td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                                ₹{(selectedProject.orderValue || 2500000).toLocaleString("en-IN")}
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
                                        state: { openInvoice: selectedProject.clientName?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001" }
                                      });
                                    }}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => {
                                      downloadInvoicePdf({
                                        invoiceNumber: selectedProject.clientName?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001",
                                        clientName: selectedProject.clientName,
                                        clientPhone: selectedProject.clientPhone,
                                        clientEmail: selectedProject.clientEmail,
                                        clientAddress: selectedProject.address,
                                        projectName: `${selectedProject.clientName} Residence`,
                                        grandTotal: selectedProject.orderValue || 2500000
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

              {/* ========================================== */}
              {/* 6. TRACKER & DPR TAB */}
              {/* ========================================== */}
              {activeTab === "tracker" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">Daily Progress Report (DPR) & Site Tracker</h3>
                        <span className="text-xs text-stone-500">Live progress notes and supervisor records</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Log daily progress note (e.g. False ceiling framing completed in Living Room)..."
                        value={dprNote}
                        onChange={(e) => setDprNote(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (!dprNote.trim()) return;
                          showToast("DPR Note logged successfully!");
                          setDprNote("");
                        }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Record DPR
                      </button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Modular carcass assembly started in factory.", time: "Today, 11:30 AM", user: "Factory Supervisor" },
                        { title: "Electrical conduits and AC copper piping pressure test passed.", time: "Yesterday, 4:15 PM", user: "Site Engineer" },
                        { title: "3D Perspective design sign-off received from client.", time: "Aug 30, 2026", user: "Lead Architect" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                          <p className="font-bold text-xs text-stone-800">{item.title}</p>
                          <span className="text-[10px] text-stone-400 block font-medium">
                            {item.time} • Recorded by {item.user}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 7. OTHER TABS (ORDER SHEET, PLANNING, SCHEDULE) */}
              {/* ========================================== */}
              {(activeTab === "ordersheet" || activeTab === "planning" || activeTab === "schedule") && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                    <h3 className="font-extrabold text-base text-stone-900 border-b border-stone-100 pb-3 capitalize">
                      {activeTab === "ordersheet" ? "Factory Order Sheet & Material Specs" : activeTab === "planning" ? "Execution Planning & Milestones" : "Project Timeline Schedule"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <span className="font-bold text-stone-900 block">Core Board Material</span>
                        <span className="text-stone-600">Greenply HDMR / BWP Marine Ply Grade 710</span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <span className="font-bold text-stone-900 block">Hardware & Runners</span>
                        <span className="text-stone-600">Hettich Sensys Soft-close hinges & InnoTech Quadro channels</span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <span className="font-bold text-stone-900 block">Laminate / Finish</span>
                        <span className="text-stone-600">Merino 1.25mm Matt Laminate + Anti-Fingerprint Acrylic</span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <span className="font-bold text-stone-900 block">Edge Banding</span>
                        <span className="text-stone-600">Rehau 2mm seamless hot-air edge banding</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MAIN PROJECTS TABLE VIEW (IMAGE 1 REFERENCE EXACT UI) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Top Search, Count & Action Bar (Screenshot 1 Exact UI) */}
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

              {/* Create Project Button */}
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Project</span>
              </button>
            </div>
          </div>

          {/* Project List Table (Screenshot 1 Exact Columns) */}
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
                        No projects found matching your search. Click "Create Project" to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((proj) => (
                      <tr
                        key={proj.id || proj.projectNumber}
                        onClick={() => setSelectedProject(proj)}
                        className="hover:bg-stone-50/70 transition cursor-pointer group"
                      >
                        {/* Project No */}
                        <td className="py-3.5 px-5 font-mono font-bold text-stone-900">
                          {proj.projectNumber}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-stone-900 group-hover:text-blue-600 transition">
                          {proj.clientName}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {proj.clientEmail || "--"}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-stone-700 font-medium">
                          {proj.clientPhone || "--"}
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
                              onClick={() => setSelectedProject(proj)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="View Project Detail"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(proj)}
                              className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
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
      {/* CREATE PROJECT MODAL (SELECT FROM ENQUIRY SECTION) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-blue-600" />
                <h3 className="font-extrabold text-sm text-stone-900">Create New Project</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewProject} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Pick From Enquiry */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                <label className="block font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                  <User size={13} className="text-blue-600" />
                  <span>Select Client from Enquiry Section</span>
                </label>
                <select
                  value={selectedEnquiryId}
                  onChange={(e) => handleSelectEnquiryForProject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="">-- Or Select Existing Enquiry --</option>
                  {enquiries.map((enq) => (
                    <option key={enq._id || enq.enquiryNo} value={enq._id || enq.enquiryNo}>
                      {enq.name} ({enq.phone || "No phone"}) • {enq.projectSubtype || enq.projectType || "Enquiry"}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-blue-700/80 block">
                  Selecting an enquiry automatically fills client contact, site location, and budget details.
                </span>
              </div>

              {/* Project & Client Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Project Number<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.projectNumber}
                    onChange={(e) => setCreateFormData({ ...createFormData, projectNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Client Name<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sai chauhan"
                    value={createFormData.clientName}
                    onChange={(e) => setCreateFormData({ ...createFormData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={createFormData.clientEmail}
                    onChange={(e) => setCreateFormData({ ...createFormData, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 8446031622"
                    value={createFormData.clientPhone}
                    onChange={(e) => setCreateFormData({ ...createFormData, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Project Type</label>
                  <select
                    value={createFormData.projectType}
                    onChange={(e) => setCreateFormData({ ...createFormData, projectType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="3BHK Luxury Apartment">3BHK Luxury Apartment</option>
                    <option value="Villa Turnkey">Villa Turnkey</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Status</label>
                  <select
                    value={createFormData.status}
                    onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
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

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Site Address</label>
                <input
                  type="text"
                  placeholder="e.g. Wakad Chowk, Pune, Maharashtra"
                  value={createFormData.address}
                  onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Order Value (₹)</label>
                  <input
                    type="number"
                    value={createFormData.orderValue}
                    onChange={(e) => setCreateFormData({ ...createFormData, orderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Handled By</label>
                  <input
                    type="text"
                    value={createFormData.handledBy}
                    onChange={(e) => setCreateFormData({ ...createFormData, handledBy: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROJECT & CLIENT DATA MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Edit2 size={16} className="text-blue-600" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  Edit Project Details ({editFormData.projectNumber})
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProject} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.clientName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.clientPhone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.clientEmail || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientEmail: e.target.value })}
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
                  <label className="block font-semibold text-stone-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.progressPercent || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, progressPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Order Value (₹)</label>
                  <input
                    type="number"
                    value={editFormData.orderValue || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, orderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Site Address</label>
                <input
                  type="text"
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
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
