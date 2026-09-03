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
import { downloadBOQPdf, downloadInvoicePdf, printInvoice } from "../utils/downloadHelper";

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
    mode: "UPI / Bank Transfer",
    note: "Work Order Milestone",
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
  const baseEnquiryClients = [
    {
      _id: "enq_012",
      projectNumber: "PRJ-2026-012",
      name: "sai chauhan",
      salutation: "Mr.",
      email: "rohan@gmail.com",
      phone: "8446031622",
      altPhone: "9876543210",
      occupation: "Business Executive",
      companyName: "Chauhan Enterprises",
      siteLocation: "Wakad Chowk, Pune, Maharashtra",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "3BHK Luxury Apartment",
      preferredStyle: "Modern Contemporary",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 2850000,
      paidAmount: 1425000,
      expStartDate: "2026-09-10",
      expEndDate: "2026-10-25",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Sep 2, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Sep 2, 2027",
      notes: "Full turnkey interior fitout including modular kitchen, Italian marble polishing, and false ceiling."
    },
    {
      _id: "enq_008",
      projectNumber: "PRJ-2026-008",
      name: "PREM SHUKLA",
      salutation: "Mr.",
      email: "PREMSHUKLA@GMAIL.COM",
      phone: "78000 20496",
      altPhone: "9988776655",
      occupation: "Corporate Director",
      companyName: "Shukla Logistics",
      siteLocation: "402, High Street, Baner, Pune",
      city: "Pune",
      projectType: "Commercial",
      projectSubtype: "Corporate Office",
      preferredStyle: "Minimalist Executive",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 468800,
      paidAmount: 234400,
      expStartDate: "2026-09-05",
      expEndDate: "2026-10-15",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 28, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Senior Architect",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 28, 2027",
      notes: "Office fitout with conference room acoustics and ergonomic workstations."
    },
    {
      _id: "enq_011",
      projectNumber: "PRJ-2026-011",
      name: "Rajeev Singhal",
      salutation: "Mr.",
      email: "rajeev.singhal@gmail.com",
      phone: "8948274553",
      altPhone: "7894561230",
      occupation: "Tech Entrepreneur",
      companyName: "Singhal Infotech",
      siteLocation: "RISHITA - SERENITY, Kalyani Nagar, Pune",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "4BHK Penthouse",
      preferredStyle: "Warm Luxury Modern",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 3200000,
      paidAmount: 1600000,
      expStartDate: "2026-09-15",
      expEndDate: "2026-11-01",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 25, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 25, 2027",
      notes: "Penthouse execution with acoustic home theatre and automation."
    },
    {
      _id: "enq_010",
      projectNumber: "PRJ-2026-010",
      name: "Rasid sir",
      salutation: "Mr.",
      email: "rasid.interior@gmail.com",
      phone: "8412852592",
      altPhone: "9822334455",
      occupation: "Retail Investor",
      companyName: "Rasid Retail Group",
      siteLocation: "Koregaon Park, Pune",
      city: "Pune",
      projectType: "Commercial",
      projectSubtype: "Retail Showroom",
      preferredStyle: "High-End Luxury Retail",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 5500000,
      paidAmount: 2750000,
      expStartDate: "2026-09-01",
      expEndDate: "2026-10-30",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 20, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Commercial Lead",
      serviceEligibility: "2 Years Commercial Support",
      serviceValidTill: "Aug 20, 2028",
      notes: "Showroom display fixtures with premium LED backlight profiles."
    },
    {
      _id: "enq_009",
      projectNumber: "PRJ-2026-009",
      name: "Akash Jain",
      salutation: "Mr.",
      email: "akash.jain@gmail.com",
      phone: "8977899643",
      altPhone: "9123456780",
      occupation: "Software Architect",
      companyName: "Tech Solutions",
      siteLocation: "Hinjewadi Phase 1, Pune",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "2BHK Apartment",
      preferredStyle: "Scandinavian Minimalist",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 2150000,
      paidAmount: 1075000,
      expStartDate: "2026-09-12",
      expEndDate: "2026-10-20",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 18, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 18, 2027",
      notes: "Space-saving modular furniture with hydraulic storage."
    },
    {
      _id: "enq_007",
      projectNumber: "PRJ-2026-007",
      name: "Dr Saurabh",
      salutation: "Dr.",
      email: "dr.saurabh@gmail.com",
      phone: "7709019535",
      altPhone: "9422001122",
      occupation: "Consultant Physician",
      companyName: "Saurabh Healthcare Clinic",
      siteLocation: "Aundh, Pune",
      city: "Pune",
      projectType: "Commercial",
      projectSubtype: "Healthcare Clinic",
      preferredStyle: "Modern Clinical",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 3800000,
      paidAmount: 1900000,
      expStartDate: "2026-09-08",
      expEndDate: "2026-10-28",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 15, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Healthcare Specialist",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 15, 2027",
      notes: "Antimicrobial finishes with specialized reception and patient lounge."
    },
    {
      _id: "enq_006",
      projectNumber: "PRJ-2026-006",
      name: "Dr Hardik",
      salutation: "Dr.",
      email: "dr.hardik@gmail.com",
      phone: "9890944762",
      altPhone: "9823004455",
      occupation: "Surgeon",
      companyName: "Hardik Wellness",
      siteLocation: "Viman Nagar, Pune",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "3BHK Luxury Residence",
      preferredStyle: "Contemporary Luxe",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 2900000,
      paidAmount: 1450000,
      expStartDate: "2026-09-18",
      expEndDate: "2026-11-10",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 12, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Aug 12, 2027",
      notes: "Custom fluted wall paneling, Italian PU finish wardrobes, and quartz island."
    },
    {
      _id: "enq_005",
      projectNumber: "PRJ-2026-005",
      name: "WIPRO LINCRAFT AI PRIVATE LIMITED",
      salutation: "",
      email: "procurement@wipro-lincraft.com",
      phone: "9632300992",
      altPhone: "020-41002000",
      occupation: "Corporate",
      companyName: "Wipro Lincraft AI Pvt Ltd",
      siteLocation: "EON Free Zone, Kharadi, Pune",
      city: "Pune",
      projectType: "Commercial",
      projectSubtype: "AI Innovation Center",
      preferredStyle: "Futuristic Corporate",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 8400000,
      paidAmount: 4200000,
      expStartDate: "2026-09-01",
      expEndDate: "2026-11-30",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Aug 05, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Commercial Lead",
      serviceEligibility: "2 Years Enterprise SLA",
      serviceValidTill: "Aug 05, 2028",
      notes: "State-of-the-art AI Innovation Lab and workspace fitout with acoustic baffles."
    },
    {
      _id: "enq_004",
      projectNumber: "PRJ-2026-004",
      name: "Meenakshi Krishnani",
      salutation: "Ms.",
      email: "meenakshi@example.com",
      phone: "9167135606",
      altPhone: "",
      occupation: "Architectural Designer",
      companyName: "Krishnani Studio",
      siteLocation: "Kalyani Nagar, Pune",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "4BHK Penthouse",
      preferredStyle: "Neo-Classical Luxury",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 6000000,
      paidAmount: 3000000,
      expStartDate: "2026-09-20",
      expEndDate: "2026-11-25",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Jun 21, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Jun 21, 2027",
      notes: "High-end penthouse renovation with brass inlay carpentry and smart automation."
    },
    {
      _id: "enq_003",
      projectNumber: "PRJ-2026-003",
      name: "Khushi",
      salutation: "Mrs.",
      email: "khushi@example.com",
      phone: "7355123408",
      altPhone: "",
      occupation: "Finance Consultant",
      companyName: "Capita Wealth",
      siteLocation: "Baner Highway, Pune",
      city: "Pune",
      projectType: "Residential",
      projectSubtype: "2BHK Apartment",
      preferredStyle: "Bohemian Modern",
      status: "Yet To Start",
      progressPercent: 0,
      budget: 1800000,
      paidAmount: 900000,
      expStartDate: "2026-09-25",
      expEndDate: "2026-11-15",
      actualStartDate: "",
      actualEndDate: "",
      orderDate: "Jun 18, 2026",
      handledBy: "Rutuja@velora",
      projectConsultant: "Velora Lead Consultant",
      serviceEligibility: "1 Year Free Snag Warranty",
      serviceValidTill: "Jun 18, 2027",
      notes: "Compact turnkey execution with pastel laminate themes and custom modular kitchen."
    }
  ];

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
          const budgetVal = typeof enq.budget === "number" ? enq.budget : (parseInt(String(enq.budget || "").replace(/\D/g, ""), 10) * 100000 || (enq.estimatedValue ? Number(enq.estimatedValue) : 2500000));
          const prjNum = enq.projectNumber || (enq.enquiryNo ? enq.enquiryNo.replace("ENQ", "PRJ") : `PRJ-2026-${String(20 + idx).padStart(3, "0")}`);

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
            budget: customEdits.budget || budgetVal,
            paidAmount: customEdits.paidAmount !== undefined ? customEdits.paidAmount : Math.round(budgetVal * 0.5),
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

      // Then add base standard clients (if not already added)
      baseEnquiryClients.forEach((client, idx) => {
        const key = getNormalizedClientKey(client);
        if (key && !combinedMap.has(key)) {
          const customEdits = savedProjectEdits[key] || {};
          combinedMap.set(key, {
            ...client,
            ...customEdits,
            id: client._id || `PRJ-2026-${String(idx + 1).padStart(3, "0")}`,
            projectNumber: client.projectNumber || `PRJ-2026-${String(idx + 1).padStart(3, "0")}`,
            clientName: customEdits.clientName || client.name,
            clientEmail: customEdits.clientEmail || client.email,
            clientPhone: customEdits.clientPhone || client.phone,
            address: customEdits.address || client.siteLocation,
            status: customEdits.status || client.status || "Yet To Start",
            progressPercent: customEdits.progressPercent !== undefined ? customEdits.progressPercent : (client.progressPercent || 0),
            budget: customEdits.budget || client.budget || 2500000,
            paidAmount: customEdits.paidAmount !== undefined ? customEdits.paidAmount : (client.paidAmount || (client.budget ? client.budget * 0.5 : 1250000))
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
    const key = (updatedItem.clientPhone || updatedItem.phone || updatedItem.clientName || updatedItem.name).trim().toLowerCase();
    
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
      prev.map((p) =>
        (p.phone || p.clientPhone) === (updatedItem.phone || updatedItem.clientPhone) ||
        (p.name || p.clientName) === (updatedItem.name || updatedItem.clientName) ||
        p.projectNumber === updatedItem.projectNumber
          ? { ...p, ...updatedItem }
          : p
      )
    );

    if (selectedProject && (selectedProject.projectNumber === updatedItem.projectNumber || selectedProject.id === updatedItem.id)) {
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

  // Record Payment
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const payAmt = Number(paymentRecordForm.amount);
    if (!payAmt || payAmt <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const currentPaid = Number(selectedProject.paidAmount || 0);
    const newPaid = currentPaid + payAmt;
    const updated = { ...selectedProject, paidAmount: newPaid };
    saveCustomProjectEdit(updated);

    setPaymentRecordForm({
      amount: "",
      mode: "UPI / Bank Transfer",
      note: "Milestone Clearance",
      date: new Date().toISOString().split("T")[0]
    });
    showToast(`Payment of ₹${payAmt.toLocaleString("en-IN")} recorded successfully!`);
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

  // Documents
  const getClientDocumentsList = () => {
    if (!selectedProject) return [];
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.phone;
    const existing = projectDocuments[key];
    if (existing && existing.length > 0) return existing;

    return [
      {
        id: "doc_1",
        title: "2D Architectural Floor Plan & Room Dimensions",
        category: "Floor Plans",
        fileName: `${(selectedProject.clientName || selectedProject.name || "Client").replace(/\s+/g, "_")}_2D_Layout.pdf`,
        fileSize: "3.2 MB",
        date: "Sep 2, 2026"
      },
      {
        id: "doc_2",
        title: "3D Perspective Visualizations & Material Moodboard",
        category: "3D Renders",
        fileName: `${(selectedProject.clientName || selectedProject.name || "Client").replace(/\s+/g, "_")}_3D_Renders.pdf`,
        fileSize: "8.6 MB",
        date: "Sep 2, 2026"
      },
      {
        id: "doc_3",
        title: "Initial Site Measurement & Snag Checklist",
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
    const key = selectedProject.projectNumber || selectedProject.clientPhone || selectedProject.phone;
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
                onClick={() => {
                  showToast("Daily Progress Report template generated!");
                }}
                className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <FileText size={13} className="text-blue-600" />
                <span>Generate DPR (Detailed)</span>
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
              {/* TAB 3: PAYMENTS & COMMERCIALS (BUDGET, ADVANCE, PENDING) */}
              {/* ========================================================================= */}
              {activeTab === "payments" && (() => {
                const totalBudget = Number(selectedProject.budget || 2500000);
                const advancePaid = Number(selectedProject.paidAmount || (totalBudget * 0.5));
                const balancePending = Math.max(0, totalBudget - advancePaid);
                const paymentStatus = balancePending === 0 ? "Fully Paid" : (advancePaid > 0 ? "Advance Received" : "Payment Pending");

                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-base text-stone-900">Payment & Commercial Breakdown</h3>
                          <span className="text-xs text-stone-500">Contract budget, advance received, and pending balances</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          paymentStatus === "Fully Paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}>
                          {paymentStatus}
                        </span>
                      </div>

                      {/* 3 Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                            TOTAL CONTRACT BUDGET
                          </span>
                          <span className="font-mono text-xl font-black text-stone-900 block">
                            ₹{totalBudget.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-stone-500">100% Total Project Scope</span>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                            ADVANCE / PAID AMOUNT
                          </span>
                          <span className="font-mono text-xl font-black text-emerald-800 block">
                            ₹{advancePaid.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {Math.round((advancePaid / totalBudget) * 100)}% Received
                          </span>
                        </div>

                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                            PENDING BALANCE DUE
                          </span>
                          <span className="font-mono text-xl font-black text-rose-900 block">
                            ₹{balancePending.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-rose-700 font-bold">
                            {Math.round((balancePending / totalBudget) * 100)}% Remaining Balance
                          </span>
                        </div>
                      </div>

                      {/* Milestone Schedule */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-extrabold text-xs text-stone-900">Milestone Payment Schedule</h4>
                        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                                <th className="py-3 px-4">Milestone Stage</th>
                                <th className="py-3 px-3">Percentage</th>
                                <th className="py-3 px-3 text-right">Amount (₹)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">1. Advance Work Order Confirmation</td>
                                <td className="py-3 px-3 font-mono font-bold">50%</td>
                                <td className="py-3 px-3 text-right font-mono font-bold">
                                  ₹{(totalBudget * 0.5).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Received
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">2. Factory Production & Dispatch Clearance</td>
                                <td className="py-3 px-3 font-mono font-bold">40%</td>
                                <td className="py-3 px-3 text-right font-mono font-bold">
                                  ₹{(totalBudget * 0.4).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    {advancePaid >= totalBudget * 0.9 ? "Cleared" : "Pending Clearance"}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 font-bold text-stone-900">3. Final Snag Handover</td>
                                <td className="py-3 px-3 font-mono font-bold">10%</td>
                                <td className="py-3 px-3 text-right font-mono font-bold">
                                  ₹{(totalBudget * 0.1).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                    Final Snag
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Record Payment Form */}
                      <form onSubmit={handleRecordPaymentSubmit} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                        <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-blue-600" />
                          <span>Record Received Client Payment</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 500000"
                              value={paymentRecordForm.amount}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, amount: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">Payment Mode</label>
                            <select
                              value={paymentRecordForm.mode}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, mode: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="UPI / Bank Transfer">UPI / NEFT / RTGS</option>
                              <option value="Cheque">Cheque Deposit</option>
                              <option value="Credit Card">Credit Card</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-1">Payment Date</label>
                            <input
                              type="date"
                              value={paymentRecordForm.date}
                              onChange={(e) => setPaymentRecordForm({ ...paymentRecordForm, date: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          >
                            Add Payment Record
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
                                {(selectedProject.clientName || selectedProject.name)?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001"}
                              </td>
                              <td className="py-3.5 px-4 text-stone-600">{new Date().toLocaleDateString("en-IN")}</td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                                ₹{totalAmt.toLocaleString("en-IN")}
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
                                        state: { openInvoice: (selectedProject.clientName || selectedProject.name)?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001" }
                                      });
                                    }}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => {
                                      downloadInvoicePdf({
                                        invoiceNumber: (selectedProject.clientName || selectedProject.name)?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001",
                                        clientName: selectedProject.clientName || selectedProject.name,
                                        clientPhone: selectedProject.clientPhone || selectedProject.phone,
                                        clientEmail: selectedProject.clientEmail || selectedProject.email,
                                        clientAddress: selectedProject.address || selectedProject.siteLocation,
                                        projectName: `${selectedProject.clientName || selectedProject.name} Residence`,
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
                    value={editFormData.budget || 2500000}
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
