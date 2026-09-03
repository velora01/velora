import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import erpApi from "../services/erpService";
import {
  Download,
  Plus,
  FileText,
  Receipt,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Printer,
  Calendar,
  Building,
  Info,
  ArrowLeft,
  User,
  ShieldCheck,
  Check,
  Phone,
  Mail,
  MapPin,
  Upload,
  QrCode,
  CreditCard,
  Image as ImageIcon,
  Sparkles,
  Users,
  IndianRupee,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { downloadInvoicePdf, printInvoice } from "../utils/downloadHelper";

export default function QuotationInvoiceManager() {
  const location = useLocation();
  const navigate = useNavigate();

  // View Mode: "list" | "edit"
  const [viewMode, setViewMode] = useState("list");

  // Invoices data list
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Enquiries list (from Enquiry section)
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [isSelectEnquiryModalOpen, setIsSelectEnquiryModalOpen] = useState(false);
  const [enquirySearchQuery, setEnquirySearchQuery] = useState("");

  // PDF Viewer Modal State (Screenshot 4)
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);
  const [activePdfPage, setActivePdfPage] = useState(1);

  // PhonePe / UPI QR Code state (Persisted in localStorage)
  const [paymentQrCode, setPaymentQrCode] = useState(() => {
    try {
      return localStorage.getItem("velora_payment_qr_code") || "";
    } catch {
      return "";
    }
  });
  const fileInputRef = useRef(null);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Base sample invoices matching exact screenshot reference
  const defaultSampleInvoices = [
    {
      _id: "inv_006",
      invoiceNumber: "NCI006",
      projectName: "sai chauhan",
      projectNumber: "PRJ-2026-012",
      invoiceType: "Service",
      invoiceDate: "2026-09-02",
      formattedDate: "Sep 2, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 65000,
      subTotal: 65000,
      taxAmount: 0,
      totalAmount: 65000,
      status: "Issued",
      billTo: {
        name: "sai chauhan",
        email: "rohan@gmail.com",
        phone: "84460 31622",
        gstin: "",
        address: "Wakad Chowk, Pune, Maharashtra"
      },
      shipTo: {
        name: "sai chauhan",
        email: "rohan@gmail.com",
        phone: "84460 31622",
        gstin: "",
        address: "Wakad Chowk, Pune, Maharashtra"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "sofa",
          hsnSac: "HSN/SAC",
          quantity: 1,
          unit: "1",
          rate: 65000,
          gstPercent: 0,
          gstAmount: 0,
          total: 65000
        }
      ],
      notes: "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.",
      termsAndConditions: "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance payment upon signing the work order.\n2. 40% before factory production and dispatch.\n3. 10% upon final snag clearance and handover.\n4. All carpentry materials are tested BWP Grade.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_003a",
      invoiceNumber: "NCIA003",
      projectName: "PREM SHUKLA",
      projectNumber: "PRJ-2026-008",
      invoiceType: "Service",
      invoiceDate: "2026-08-13",
      formattedDate: "Aug 13, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 468800,
      subTotal: 468800,
      taxAmount: 0,
      totalAmount: 468800,
      status: "Issued",
      billTo: {
        name: "PREM SHUKLA",
        email: "premshukla@gmail.com",
        phone: "78000 20496",
        gstin: "",
        address: "402, High Street, Baner, Pune"
      },
      shipTo: {
        name: "PREM SHUKLA",
        email: "premshukla@gmail.com",
        phone: "78000 20496",
        gstin: "",
        address: "402, High Street, Baner, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Modular Kitchen Acrylic Joinery & Quartz Counter",
          hsnSac: "9954",
          quantity: 1,
          unit: "Set",
          rate: 268800,
          gstPercent: 0,
          gstAmount: 0,
          total: 268800
        },
        {
          serviceDescription: "Master Bedroom Full Height Wardrobes with Hettich Sliding",
          hsnSac: "9954",
          quantity: 1,
          unit: "Set",
          rate: 200000,
          gstPercent: 0,
          gstAmount: 0,
          total: 200000
        }
      ],
      notes: "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.",
      termsAndConditions: "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance payment upon signing the work order.\n2. 40% before factory dispatch.\n3. 10% upon final snag clearance.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_005",
      invoiceNumber: "NCI005",
      projectName: "Rashid sir",
      projectNumber: "PRJ-2026-010",
      invoiceType: "Service",
      invoiceDate: "2026-07-11",
      formattedDate: "Jul 11, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 23364,
      subTotal: 23364,
      taxAmount: 0,
      totalAmount: 23364,
      status: "Issued",
      billTo: {
        name: "Rashid sir",
        email: "rasid@example.com",
        phone: "84128 52592",
        gstin: "",
        address: "Koregaon Park, Pune"
      },
      shipTo: {
        name: "Rashid sir",
        email: "rasid@example.com",
        phone: "84128 52592",
        gstin: "",
        address: "Koregaon Park, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Design & 3D Visualization Consultation",
          hsnSac: "9983",
          quantity: 1,
          unit: "Job",
          rate: 23364,
          gstPercent: 0,
          gstAmount: 0,
          total: 23364
        }
      ],
      notes: "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.",
      termsAndConditions: "Standard Velora Antaraal Terms Apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_004",
      invoiceNumber: "NCI004",
      projectName: "Dr Hardik",
      projectNumber: "PRJ-2026-006",
      invoiceType: "Service",
      invoiceDate: "2026-06-05",
      formattedDate: "Jun 5, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 194000,
      subTotal: 194000,
      taxAmount: 0,
      totalAmount: 194000,
      status: "Issued",
      billTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      shipTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Living Room Wall Paneling with Acrylic Fluted Profiles",
          hsnSac: "9954",
          quantity: 1,
          unit: "Job",
          rate: 194000,
          gstPercent: 0,
          gstAmount: 0,
          total: 194000
        }
      ],
      notes: "Registered under Composition Taxable scheme.",
      termsAndConditions: "Standard terms apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_003b",
      invoiceNumber: "NCI003",
      projectName: "Dr Hardik",
      projectNumber: "PRJ-2026-006",
      invoiceType: "Service",
      invoiceDate: "2026-06-05",
      formattedDate: "Jun 5, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 211000,
      subTotal: 211000,
      taxAmount: 0,
      totalAmount: 211000,
      status: "Issued",
      billTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      shipTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Modular Kitchen Base and Overhead Cabinets",
          hsnSac: "9954",
          quantity: 1,
          unit: "Unit",
          rate: 211000,
          gstPercent: 0,
          gstAmount: 0,
          total: 211000
        }
      ],
      notes: "Registered under Composition Taxable scheme.",
      termsAndConditions: "Standard terms apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_002",
      invoiceNumber: "NCI002",
      projectName: "Akash Jain",
      projectNumber: "PRJ-2026-009",
      invoiceType: "Service",
      invoiceDate: "2026-05-26",
      formattedDate: "May 26, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 0,
      subTotal: 150000,
      taxAmount: 0,
      totalAmount: 150000,
      status: "Paid",
      billTo: {
        name: "Akash Jain",
        email: "akash.jain@example.com",
        phone: "89778 99643",
        gstin: "",
        address: "Hinjewadi Phase 1, Pune"
      },
      shipTo: {
        name: "Akash Jain",
        email: "akash.jain@example.com",
        phone: "89778 99643",
        gstin: "",
        address: "Hinjewadi Phase 1, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "2BHK Design Consultation and Layout Signoff",
          hsnSac: "9983",
          quantity: 1,
          unit: "Job",
          rate: 150000,
          gstPercent: 0,
          gstAmount: 0,
          total: 150000
        }
      ],
      notes: "Payment received in full.",
      termsAndConditions: "Standard terms apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_001",
      invoiceNumber: "NCI001",
      projectName: "Dr Saurabh",
      projectNumber: "PRJ-2026-007",
      invoiceType: "Service",
      invoiceDate: "2026-05-19",
      formattedDate: "May 19, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 324950,
      subTotal: 324950,
      taxAmount: 0,
      totalAmount: 324950,
      status: "Issued",
      billTo: {
        name: "Dr Saurabh",
        email: "saurabh.clinic@example.com",
        phone: "77090 19535",
        gstin: "",
        address: "shop no 84, vj happiness street, Hinjewadi phase 2, Pune"
      },
      shipTo: {
        name: "Dr Saurabh",
        email: "saurabh.clinic@example.com",
        phone: "77090 19535",
        gstin: "",
        address: "shop no 84, vj happiness street, Hinjewadi phase 2, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Dental Clinic Custom Acoustic Partitioning and Counters",
          hsnSac: "9954",
          quantity: 1,
          unit: "Job",
          rate: 324950,
          gstPercent: 0,
          gstAmount: 0,
          total: 324950
        }
      ],
      notes: "Registered under Composition Taxable scheme.",
      termsAndConditions: "Standard terms apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    },
    {
      _id: "inv_002a",
      invoiceNumber: "NCIA002",
      projectName: "Dr Hardik",
      projectNumber: "PRJ-2026-006",
      invoiceType: "Service",
      invoiceDate: "2026-05-03",
      formattedDate: "May 3, 2026",
      dueDate: "",
      taxPercent: 0,
      dueAmount: 0,
      subTotal: 85000,
      taxAmount: 0,
      totalAmount: 85000,
      status: "Paid",
      billTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      shipTo: {
        name: "Dr Hardik",
        email: "drhardik@example.com",
        phone: "98909 44762",
        gstin: "",
        address: "Viman Nagar, Pune"
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: "Initial Site Survey, AutoCAD Layout and 3D Elevation",
          hsnSac: "9983",
          quantity: 1,
          unit: "Job",
          rate: 85000,
          gstPercent: 0,
          gstAmount: 0,
          total: 85000
        }
      ],
      notes: "Payment received in full.",
      termsAndConditions: "Standard terms apply.",
      bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
    }
  ];

  // Base list of enquiries from Enquiry section
  const baseEnquiriesList = [
    {
      _id: "enq_012",
      name: "sai chauhan",
      phone: "8446031622",
      email: "rohan@gmail.com",
      siteLocation: "Wakad Chowk, Pune, Maharashtra",
      projectType: "Residential",
      projectSubtype: "3BHK Luxury Apartment",
      budget: 2850000,
      enquiryNo: "ENQ-2026-012"
    },
    {
      _id: "enq_008",
      name: "PREM SHUKLA",
      phone: "7800020496",
      email: "PREMSHUKLA@GMAIL.COM",
      siteLocation: "402, High Street, Baner, Pune",
      projectType: "Commercial",
      projectSubtype: "Corporate Office",
      budget: 468800,
      enquiryNo: "ENQ-2026-008"
    },
    {
      _id: "enq_011",
      name: "Rajeev Singhal",
      phone: "8948274553",
      email: "rajeev.singhal@gmail.com",
      siteLocation: "RISHITA - SERENITY, Kalyani Nagar, Pune",
      projectType: "Residential",
      projectSubtype: "4BHK Penthouse",
      budget: 3200000,
      enquiryNo: "ENQ-2026-011"
    },
    {
      _id: "enq_010",
      name: "Rasid sir",
      phone: "8412852592",
      email: "rasid.interior@gmail.com",
      siteLocation: "Koregaon Park, Pune",
      projectType: "Commercial",
      projectSubtype: "Retail Showroom",
      budget: 5500000,
      enquiryNo: "ENQ-2026-010"
    },
    {
      _id: "enq_009",
      name: "Akash Jain",
      phone: "8977899643",
      email: "akash.jain@gmail.com",
      siteLocation: "Hinjewadi Phase 1, Pune",
      projectType: "Residential",
      projectSubtype: "2BHK Apartment",
      budget: 2150000,
      enquiryNo: "ENQ-2026-009"
    },
    {
      _id: "enq_007",
      name: "Dr Saurabh",
      phone: "7709019535",
      email: "dr.saurabh@gmail.com",
      siteLocation: "Aundh, Pune",
      projectType: "Commercial",
      projectSubtype: "Healthcare Clinic",
      budget: 3800000,
      enquiryNo: "ENQ-2026-007"
    },
    {
      _id: "enq_006",
      name: "Dr Hardik",
      phone: "9890944762",
      email: "dr.hardik@gmail.com",
      siteLocation: "Viman Nagar, Pune",
      projectType: "Residential",
      projectSubtype: "3BHK Luxury Residence",
      budget: 2900000,
      enquiryNo: "ENQ-2026-006"
    },
    {
      _id: "enq_005",
      name: "WIPRO LINCRAFT AI PRIVATE LIMITED",
      phone: "9632300992",
      email: "procurement@wipro-lincraft.com",
      siteLocation: "EON Free Zone, Kharadi, Pune",
      projectType: "Commercial",
      projectSubtype: "AI Innovation Center",
      budget: 8400000,
      enquiryNo: "ENQ-2026-005"
    },
    {
      _id: "enq_004",
      name: "Meenakshi Krishnani",
      phone: "9167135606",
      email: "meenakshi@example.com",
      siteLocation: "Kalyani Nagar, Pune",
      projectType: "Residential",
      projectSubtype: "4BHK Penthouse",
      budget: 6000000,
      enquiryNo: "ENQ-2026-004"
    },
    {
      _id: "enq_003",
      name: "Khushi",
      phone: "7355123408",
      email: "khushi@example.com",
      siteLocation: "Baner Highway, Pune",
      projectType: "Residential",
      projectSubtype: "2BHK Apartment",
      budget: 1800000,
      enquiryNo: "ENQ-2026-003"
    }
  ];

  // Invoice Form State
  const initialInvoiceForm = {
    _id: null,
    invoiceNumber: "NCI007",
    projectName: "",
    projectNumber: "PRJ-2026-013",
    invoiceType: "Service",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    billTo: {
      name: "",
      email: "",
      phone: "",
      gstin: "",
      address: ""
    },
    shipTo: {
      name: "",
      email: "",
      phone: "",
      gstin: "",
      address: ""
    },
    sameAsBillTo: true,
    items: [
      {
        serviceDescription: "sofa",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "1",
        rate: 65000,
        gstPercent: 0,
        gstAmount: 0,
        total: 65000
      }
    ],
    notes: "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.",
    termsAndConditions: "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance payment upon signing the work order.\n2. 40% before factory production and dispatch.\n3. 10% upon final snag clearance and handover.\n4. All carpentry materials are tested BWP Grade.",
    bankDetails: "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nIFSC: HDFC0000282\nBank: HDFC Bank, Wakad Branch"
  };

  const [formData, setFormData] = useState(initialInvoiceForm);

  // Load All Invoices and Enquiries
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Read local storage invoices
      let localInvs = [];
      try {
        const saved = localStorage.getItem("velora_local_invoices");
        if (saved) localInvs = JSON.parse(saved);
      } catch (e) {}

      // 2. Read backend invoices
      let apiInvs = [];
      try {
        const res = await erpApi.getInvoices({ limit: 100 });
        if (res?.data) apiInvs = res.data;
      } catch (e) {}

      // Merge invoices uniquely
      const invMap = new Map();
      [...localInvs, ...apiInvs, ...defaultSampleInvoices].forEach((inv) => {
        const key = (inv.invoiceNumber || String(inv._id)).trim().toUpperCase();
        if (key && !invMap.has(key)) {
          invMap.set(key, {
            ...inv,
            _id: inv._id || key,
            invoiceNumber: inv.invoiceNumber || key,
            formattedDate: inv.formattedDate || (inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Sep 2, 2026"),
            billedTo: inv.billTo?.name || inv.clientName || inv.projectName || "Client",
            dueAmount: inv.dueAmount !== undefined ? inv.dueAmount : (inv.totalAmount || inv.grandTotal || 65000),
            taxPercent: inv.taxPercent !== undefined ? inv.taxPercent : 0
          });
        }
      });

      const mergedInvoices = Array.from(invMap.values());
      setInvoices(mergedInvoices);

      // 3. Load all enquiries from local storage, backend API & base dataset
      let localEnqs = [];
      try {
        const savedEnqs = localStorage.getItem("velora_custom_enquiries");
        if (savedEnqs) localEnqs = JSON.parse(savedEnqs);
      } catch (e) {}

      let apiEnqs = [];
      try {
        const resLeads = await erpApi.getLeads({ limit: 100 });
        if (resLeads?.data) apiEnqs = resLeads.data;
      } catch (e) {}

      const enqMap = new Map();
      [...localEnqs, ...apiEnqs, ...baseEnquiriesList].forEach((enq) => {
        const cleanPhone = (enq.phone || enq.clientPhone || "").replace(/\D/g, "").slice(-10);
        const cleanName = (enq.name || enq.clientName || "").trim().toLowerCase();
        const key = cleanPhone ? `p_${cleanPhone}` : `n_${cleanName}`;
        if (key && !enqMap.has(key)) {
          enqMap.set(key, enq);
        }
      });
      setEnquiriesList(Array.from(enqMap.values()));

      // Check if opened from another page (e.g. from Projects)
      if (location.state?.createFromClient && location.state?.client) {
        const cl = location.state.client;
        setFormData({
          ...initialInvoiceForm,
          projectName: cl.name || "",
          billTo: {
            name: cl.name || "",
            email: cl.email || "",
            phone: cl.phone || "",
            gstin: cl.gstNumber || "",
            address: cl.address || cl.siteLocation || ""
          },
          shipTo: {
            name: cl.name || "",
            email: cl.email || "",
            phone: cl.phone || "",
            gstin: cl.gstNumber || "",
            address: cl.address || cl.siteLocation || ""
          }
        });
        setViewMode("edit");
      } else if (location.state?.openInvoice) {
        const targetInv = mergedInvoices.find((i) => i.invoiceNumber === location.state.openInvoice);
        if (targetInv) {
          setPreviewInvoiceData(targetInv);
          setIsPdfViewerOpen(true);
        }
      }

    } catch (err) {
      console.error("Error loading invoices & enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-sync when tab gains focus or storage updates
    const handleSync = () => loadData();
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [location.state]);

  // Check if an enquiry already has an invoice created
  const isEnquiryInvoiced = (enq) => {
    const enqPhone = (enq.phone || enq.clientPhone || "").replace(/\D/g, "").slice(-10);
    const enqName = (enq.name || enq.clientName || "").trim().toLowerCase();

    return invoices.some((inv) => {
      const invPhone = (inv.billTo?.phone || inv.clientPhone || "").replace(/\D/g, "").slice(-10);
      const invName = (inv.billedTo || inv.billTo?.name || inv.clientName || inv.projectName || "").trim().toLowerCase();
      
      const phoneMatch = Boolean(enqPhone && invPhone && enqPhone === invPhone);
      const nameMatch = Boolean(enqName && invName && enqName === invName);
      return phoneMatch || nameMatch;
    });
  };

  // Filter available enquiries that don't have an invoice yet
  const availableEnquiriesForInvoicing = enquiriesList.filter((enq) => {
    // Check if already invoiced
    if (isEnquiryInvoiced(enq)) return false;

    // Search query filter
    if (enquirySearchQuery.trim()) {
      const q = enquirySearchQuery.toLowerCase();
      const match =
        (enq.name || "").toLowerCase().includes(q) ||
        (enq.phone || "").toLowerCase().includes(q) ||
        (enq.email || "").toLowerCase().includes(q) ||
        (enq.projectType || "").toLowerCase().includes(q) ||
        (enq.siteLocation || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle saving QR code upload
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Str = uploadEvent.target?.result;
      if (base64Str) {
        setPaymentQrCode(base64Str);
        try {
          localStorage.setItem("velora_payment_qr_code", base64Str);
        } catch (err) {}
        showToast("PhonePe Payment QR code uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove QR code
  const handleRemoveQr = () => {
    setPaymentQrCode("");
    try {
      localStorage.removeItem("velora_payment_qr_code");
    } catch (err) {}
    showToast("QR code removed.");
  };

  // Filtered Invoices for Table
  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const invNo = (inv.invoiceNumber || "").toLowerCase();
    const bName = (inv.billedTo || inv.billTo?.name || inv.clientName || inv.projectName || "").toLowerCase();
    const phone = (inv.billTo?.phone || inv.clientPhone || "").toLowerCase();
    const email = (inv.billTo?.email || inv.clientEmail || "").toLowerCase();

    return invNo.includes(term) || bName.includes(term) || phone.includes(term) || email.includes(term);
  });

  // Calculate SubTotal, Tax, and Total
  const calculateTotals = () => {
    let subTotal = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const rowBase = qty * rate;
      const gstRate = Number(item.gstPercent) || 0;
      const gstAmt = rowBase * (gstRate / 100);

      subTotal += rowBase;
      totalTax += gstAmt;
    });

    const grandTotal = subTotal + totalTax;
    return {
      subTotal,
      totalTax,
      grandTotal
    };
  };

  const { subTotal, totalTax, grandTotal } = calculateTotals();

  // Invoice Items Manipulators
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          serviceDescription: "",
          hsnSac: "HSN/SAC",
          quantity: 1,
          unit: "1",
          rate: 0,
          gstPercent: 0,
          gstAmount: 0,
          total: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[idx], [field]: value };

      const qty = Number(field === "quantity" ? value : item.quantity) || 0;
      const rate = Number(field === "rate" ? value : item.rate) || 0;
      const gstPercent = Number(field === "gstPercent" ? value : item.gstPercent) || 0;

      const base = qty * rate;
      const gstAmt = base * (gstPercent / 100);
      item.gstAmount = gstAmt;
      item.total = base + gstAmt;

      updatedItems[idx] = item;
      return { ...prev, items: updatedItems };
    });
  };

  // Start Creating New Invoice (Opens Enquiry Picker Modal)
  const handleStartNewInvoice = () => {
    setEnquirySearchQuery("");
    setIsSelectEnquiryModalOpen(true);
  };

  // Select Enquiry Client and Open Invoice Editor
  const handleSelectEnquiryClient = (enq) => {
    const nextInvNum = `NCI${String(100 + invoices.length + 1).slice(-3)}`;
    const budgetVal = typeof enq.budget === "number" ? enq.budget : (parseInt(String(enq.budget || "").replace(/\D/g, ""), 10) * 100000 || (enq.estimatedValue ? Number(enq.estimatedValue) : 65000));
    const prjNum = enq.projectNumber || (enq.enquiryNo ? enq.enquiryNo.replace("ENQ", "PRJ") : "PRJ-2026-015");

    setFormData({
      ...initialInvoiceForm,
      invoiceNumber: nextInvNum,
      projectName: enq.name || "Client Project",
      projectNumber: prjNum,
      invoiceType: "Service",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billTo: {
        name: enq.name || "",
        email: enq.email || "",
        phone: enq.phone || "",
        gstin: enq.gstNumber || "",
        address: enq.siteLocation || enq.address || ""
      },
      shipTo: {
        name: enq.name || "",
        email: enq.email || "",
        phone: enq.phone || "",
        gstin: enq.gstNumber || "",
        address: enq.siteLocation || enq.address || ""
      },
      sameAsBillTo: true,
      items: [
        {
          serviceDescription: `${enq.projectSubtype || enq.projectType || "Interior Execution"} - Work Order Confirmation`,
          hsnSac: "9954",
          quantity: 1,
          unit: "Job",
          rate: budgetVal,
          gstPercent: 0,
          gstAmount: 0,
          total: budgetVal
        }
      ]
    });

    setIsSelectEnquiryModalOpen(false);
    setViewMode("edit");
    showToast(`Loaded details for ${enq.name}. Now finalize and save invoice.`);
  };

  // Create Custom Blank Invoice (Skipping Enquiry Selection)
  const handleCreateBlankInvoice = () => {
    const nextInvNum = `NCI${String(100 + invoices.length + 1).slice(-3)}`;
    setFormData({
      ...initialInvoiceForm,
      invoiceNumber: nextInvNum
    });
    setIsSelectEnquiryModalOpen(false);
    setViewMode("edit");
  };

  // Open Edit Mode for an existing invoice
  const handleEditInvoice = (inv) => {
    setFormData({
      ...initialInvoiceForm,
      ...inv,
      billTo: { ...initialInvoiceForm.billTo, ...(inv.billTo || { name: inv.billedTo || inv.clientName, phone: inv.clientPhone, email: inv.clientEmail, address: inv.clientAddress }) },
      shipTo: { ...initialInvoiceForm.shipTo, ...(inv.shipTo || inv.billTo || { name: inv.billedTo || inv.clientName, phone: inv.clientPhone, email: inv.clientEmail, address: inv.clientAddress }) },
      items: inv.items && inv.items.length > 0 ? inv.items : initialInvoiceForm.items
    });
    setViewMode("edit");
    setActiveDropdownId(null);
  };

  // Save Invoice (Persists and Shows on Invoice List Tab)
  const handleSaveInvoice = (e) => {
    if (e) e.preventDefault();
    if (!formData.billTo.name) {
      alert("Please enter a Client / Billed To name.");
      return;
    }

    const { subTotal, totalTax, grandTotal } = calculateTotals();
    const invoiceRecord = {
      ...formData,
      _id: formData._id || `inv_${Date.now()}`,
      invoiceNumber: formData.invoiceNumber || `NCI${String(100 + invoices.length)}`,
      formattedDate: new Date(formData.invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      billedTo: formData.billTo.name,
      subTotal,
      taxAmount: totalTax,
      totalAmount: grandTotal,
      dueAmount: grandTotal,
      status: "Issued"
    };

    const updated = [invoiceRecord, ...invoices.filter((i) => i.invoiceNumber !== invoiceRecord.invoiceNumber && i._id !== invoiceRecord._id)];
    setInvoices(updated);

    try {
      localStorage.setItem("velora_local_invoices", JSON.stringify(updated));
    } catch (err) {}

    showToast(`Invoice ${invoiceRecord.invoiceNumber} created and added to list!`);
    setViewMode("list");
  };

  // Delete Invoice
  const handleDeleteInvoice = (inv) => {
    if (!window.confirm(`Are you sure you want to delete Invoice ${inv.invoiceNumber}?`)) return;
    const updated = invoices.filter((i) => i.invoiceNumber !== inv.invoiceNumber && i._id !== inv._id);
    setInvoices(updated);
    try {
      localStorage.setItem("velora_local_invoices", JSON.stringify(updated));
    } catch (err) {}
    setActiveDropdownId(null);
    showToast(`Invoice ${inv.invoiceNumber} deleted.`);
  };

  // Open PDF Viewer Modal
  const handleOpenPdfPreview = (invData) => {
    setPreviewInvoiceData(invData || { ...formData, subTotal, taxAmount: totalTax, totalAmount: grandTotal, dueAmount: grandTotal });
    setIsPdfViewerOpen(true);
    setActiveDropdownId(null);
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
      {/* SELECT PROJECT TO CONTINUE MODAL (EXACT MATCH TO REFERENCE SCREENSHOT) */}
      {/* ========================================================================= */}
      {isSelectEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            {/* Top Search Input (Pill Shaped Search Bar) */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by Name, Phone, Email"
                value={enquirySearchQuery}
                onChange={(e) => setEnquirySearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Subtitle */}
            <div className="text-center">
              <span className="text-xs font-bold text-stone-600">Select Project to continue</span>
            </div>

            {/* Scrollable Project Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[420px]">
              {availableEnquiriesForInvoicing.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-xs text-stone-700">
                    {enquirySearchQuery ? "No matching clients found." : "All clients have invoices created!"}
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    You can still create a custom invoice by clicking below.
                  </p>
                  <button
                    onClick={handleCreateBlankInvoice}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    + Create Blank Invoice
                  </button>
                </div>
              ) : (
                availableEnquiriesForInvoicing.map((enq) => (
                  <div
                    key={enq._id || enq.enquiryNo || enq.phone}
                    onClick={() => handleSelectEnquiryClient(enq)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer group shadow-2xs bg-white"
                  >
                    {/* Circle Avatar with Initial */}
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">
                      {(enq.name || "C").charAt(0).toUpperCase()}
                    </div>

                    {/* Client Name & Project No */}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-stone-900 group-hover:text-blue-700 transition block truncate">
                        {enq.name}
                      </span>
                      <span className="font-mono text-[11px] text-stone-400 block font-medium">
                        {enq.projectNumber || (enq.enquiryNo ? enq.enquiryNo.replace("ENQ", "PRJ") : "PRJ-2026-012")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions with Close Button */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={handleCreateBlankInvoice}
                className="text-[11px] font-bold text-stone-500 hover:text-blue-600 cursor-pointer"
              >
                + Create Custom / Blank Invoice
              </button>

              <button
                type="button"
                onClick={() => setIsSelectEnquiryModalOpen(false)}
                className="px-6 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE / EDIT INVOICE VIEW (SCREENSHOT 2 & 3 EXACT UI) */}
      {/* ========================================================================= */}
      {viewMode === "edit" ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setViewMode("list")}
                className="font-bold text-stone-500 hover:text-stone-900 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Invoice</span>
              </button>
              <span className="text-stone-300">/</span>
              <span className="font-extrabold text-stone-900">
                {formData._id ? `Edit Invoice (${formData.invoiceNumber})` : `New Invoice (${formData.invoiceNumber})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Back to Invoices
              </button>
              <button
                onClick={() => handleOpenPdfPreview()}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Eye size={13} />
                <span>Preview PDF</span>
              </button>
            </div>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Cards (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Invoice Header Meta */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">Invoice Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-500 mb-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. sai chauhan"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-500 mb-1">Project Number</label>
                    <input
                      type="text"
                      placeholder="PRJ-2026-012"
                      value={formData.projectNumber}
                      onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-500 mb-1">Invoice Type</label>
                    <select
                      value={formData.invoiceType}
                      onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Service">Service</option>
                      <option value="Supply">Supply</option>
                      <option value="Turnkey Fitout">Turnkey Fitout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-500 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Bill To (User Details) */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-extrabold text-sm text-stone-900">Bill To (User Details)</h3>
                  <button
                    type="button"
                    onClick={() => setIsSelectEnquiryModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <User size={12} />
                    <span>Change / Pick from Enquiry</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Name<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Client Name"
                      value={formData.billTo.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          billTo: { ...prev.billTo, name: val },
                          shipTo: prev.sameAsBillTo ? { ...prev.shipTo, name: val } : prev.shipTo
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={formData.billTo.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          billTo: { ...prev.billTo, email: val },
                          shipTo: prev.sameAsBillTo ? { ...prev.shipTo, email: val } : prev.shipTo
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Phone<span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl">
                      <span className="text-stone-400 font-mono text-xs">+91</span>
                      <input
                        type="text"
                        placeholder="84460 31622"
                        value={formData.billTo.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            billTo: { ...prev.billTo, phone: val },
                            shipTo: prev.sameAsBillTo ? { ...prev.shipTo, phone: val } : prev.shipTo
                          }));
                        }}
                        className="flex-1 font-mono text-stone-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">GST number</label>
                    <input
                      type="text"
                      placeholder="Enter GST number"
                      value={formData.billTo.gstin}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          billTo: { ...prev.billTo, gstin: val },
                          shipTo: prev.sameAsBillTo ? { ...prev.shipTo, gstin: val } : prev.shipTo
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={formData.billTo.address}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          billTo: { ...prev.billTo, address: val },
                          shipTo: prev.sameAsBillTo ? { ...prev.shipTo, address: val } : prev.shipTo
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBillTo}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          sameAsBillTo: checked,
                          shipTo: checked ? { ...prev.billTo } : prev.shipTo
                        }));
                      }}
                      className="rounded accent-blue-600 cursor-pointer"
                    />
                    <span>Apply same details to ship to</span>
                  </label>
                </div>
              </div>

              {/* Card 3: Ship To (User Details) */}
              {!formData.sameAsBillTo && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4 animate-in fade-in">
                  <h3 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">Ship To (User Details)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Enter name"
                        value={formData.shipTo.name}
                        onChange={(e) => setFormData({ ...formData, shipTo: { ...formData.shipTo, name: e.target.value } })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        value={formData.shipTo.email}
                        onChange={(e) => setFormData({ ...formData, shipTo: { ...formData.shipTo, email: e.target.value } })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="Enter phone"
                        value={formData.shipTo.phone}
                        onChange={(e) => setFormData({ ...formData, shipTo: { ...formData.shipTo, phone: e.target.value } })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">GST number</label>
                      <input
                        type="text"
                        placeholder="Enter GST number"
                        value={formData.shipTo.gstin}
                        onChange={(e) => setFormData({ ...formData, shipTo: { ...formData.shipTo, gstin: e.target.value } })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Address</label>
                      <input
                        type="text"
                        placeholder="Enter address"
                        value={formData.shipTo.address}
                        onChange={(e) => setFormData({ ...formData, shipTo: { ...formData.shipTo, address: e.target.value } })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Card 4: Invoice Items */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="font-extrabold text-sm text-stone-900">Invoice Items</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Service
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 text-[11px]">
                        <th className="py-2.5 px-3">Service Description</th>
                        <th className="py-2.5 px-2">HSN/SAC</th>
                        <th className="py-2.5 px-2 text-center">Quantity</th>
                        <th className="py-2.5 px-2 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-2 text-center">GST (%)</th>
                        <th className="py-2.5 px-3 text-right">GST (₹)</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        <th className="py-2.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              placeholder="e.g. sofa or Modular Kitchen"
                              value={item.serviceDescription}
                              onChange={(e) => handleItemChange(idx, "serviceDescription", e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              placeholder="HSN/SAC"
                              value={item.hsnSac}
                              onChange={(e) => handleItemChange(idx, "hsnSac", e.target.value)}
                              className="w-20 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px] text-stone-700 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                              className="w-14 text-center px-1.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-bold text-xs text-stone-900 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-12 text-center px-1.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                              className="w-24 text-right px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-xs text-stone-900 focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(idx, "gstPercent", e.target.value)}
                              className="px-1.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-stone-700 focus:bg-white focus:outline-none cursor-pointer"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-500 font-medium">
                            ₹{(item.gstAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-stone-900">
                            ₹{(item.total || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-blue-600 font-bold text-xs rounded-xl border border-dashed border-blue-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>+ Add Item</span>
                </button>
              </div>

              {/* Card 5: Other Details & Payment QR Code Upload Section */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">Other Details</h3>
                
                <div>
                  <label className="block font-semibold text-stone-600 mb-1 text-xs">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* File Upload Section for PhonePe Payment QR Code */}
                <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode size={18} className="text-blue-600" />
                      <div>
                        <h4 className="font-extrabold text-xs text-stone-900">PhonePe / UPI Payment QR Code</h4>
                        <span className="text-[11px] text-stone-500">Upload your QR code image to display on tax invoices</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={13} />
                      <span>{paymentQrCode ? "Replace QR Code" : "Upload QR Code"}</span>
                    </button>
                  </div>

                  {paymentQrCode ? (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-blue-200">
                      <img
                        src={paymentQrCode}
                        alt="PhonePe QR Code"
                        className="w-20 h-20 object-contain border border-stone-200 rounded-lg p-1 bg-white shadow-2xs"
                      />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>QR Code Active & Ready</span>
                        </span>
                        <p className="text-[11px] text-stone-500">
                          This QR code will be automatically attached to PDF invoices and printable receipts.
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveQr}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove QR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/70 border border-dashed border-blue-300 rounded-xl text-center">
                      <span className="text-xs text-stone-500 block">
                        No custom QR code uploaded. Click "Upload QR Code" above to attach your PhonePe/GPay QR image.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Cards (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Invoice Details (Dates) */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">Invoice Details</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Invoice Date<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Amount Details */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-stone-900 border-b border-stone-100 pb-2">Invoice Amount Details</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">Sub Total</span>
                    <span className="font-mono font-bold text-stone-900">₹{subTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">GST Amount</span>
                    <span className="font-mono font-bold text-stone-900">₹{totalTax.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Highlighted Total Amount Bar (Screenshot 2 exact deep blue) */}
                  <div className="p-3 bg-[#0B1437] text-white rounded-xl flex items-center justify-between font-bold">
                    <span>Total Amount</span>
                    <span className="font-mono text-base font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">Terms & Conditions</h3>
                <textarea
                  rows={4}
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Bank Details & Payment Instructions */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">Bank Details & Payment Instructions</h3>
                <textarea
                  rows={4}
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="w-1/3 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview()}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveInvoice}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Save Invoice</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. MAIN INVOICE TABLE VIEW (SCREENSHOT 1 & 5 EXACT UI) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Top Search, Count & New Invoice Button (Screenshot 1 Exact UI) */}
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

            {/* Right Group: Count & Action */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-700">
                {filteredInvoices.length} Invoice
              </span>

              <button
                onClick={handleStartNewInvoice}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>New Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoice Table (Screenshot 1 & 5 Exact Columns) */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/60 text-stone-600 font-bold border-b border-stone-200 text-[11px]">
                    <th className="py-3.5 px-5 font-bold">Invoice No</th>
                    <th className="py-3.5 px-4 font-bold">Billed To</th>
                    <th className="py-3.5 px-4 font-bold">Invoice Date</th>
                    <th className="py-3.5 px-4 font-bold">Due Date</th>
                    <th className="py-3.5 px-4 font-bold text-center">Tax (%)</th>
                    <th className="py-3.5 px-5 font-bold text-right">Due Amount</th>
                    <th className="py-3.5 px-5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                        No invoices found. Click "New Invoice" to select a client and create one.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((inv) => (
                      <tr
                        key={inv._id || inv.invoiceNumber}
                        className="hover:bg-stone-50/70 transition cursor-pointer group"
                        onClick={() => handleOpenPdfPreview(inv)}
                      >
                        {/* Invoice No */}
                        <td className="py-3.5 px-5 font-mono font-bold text-stone-900">
                          {inv.invoiceNumber}
                        </td>

                        {/* Billed To */}
                        <td className="py-3.5 px-4 font-bold text-stone-900 group-hover:text-blue-600 transition">
                          {inv.billedTo || inv.billTo?.name || inv.clientName || inv.projectName}
                        </td>

                        {/* Invoice Date */}
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {inv.formattedDate || inv.invoiceDate || "Sep 2, 2026"}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-stone-400 font-medium">
                          {inv.dueDate || "--"}
                        </td>

                        {/* Tax (%) */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-700">
                          {inv.taxPercent || 0}%
                        </td>

                        {/* Due Amount */}
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-stone-900">
                          ₹{(inv.dueAmount || inv.totalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Actions (Pencil Edit & 3-dots Menu as in Screenshot 1 & 5) */}
                        <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative flex items-center justify-center gap-1.5 text-stone-400">
                            <button
                              onClick={() => handleEditInvoice(inv)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Invoice"
                            >
                              <Edit2 size={14} className="text-blue-600" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdownId(activeDropdownId === inv._id ? null : inv._id)}
                                className="p-1.5 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {/* Dropdown Menu (Screenshot 5) */}
                              {activeDropdownId === inv._id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in text-left">
                                  <button
                                    onClick={() => handleOpenPdfPreview(inv)}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-stone-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye size={13} className="text-blue-600" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      downloadInvoicePdf({
                                        invoiceNumber: inv.invoiceNumber,
                                        clientName: inv.billedTo || inv.billTo?.name || inv.clientName,
                                        clientPhone: inv.billTo?.phone || inv.clientPhone,
                                        clientEmail: inv.billTo?.email || inv.clientEmail,
                                        clientAddress: inv.billTo?.address || inv.clientAddress,
                                        projectName: inv.projectName,
                                        grandTotal: inv.totalAmount || inv.dueAmount || 65000,
                                        items: inv.items,
                                        paymentQrCode: paymentQrCode
                                      });
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Download size={13} className="text-stone-500" />
                                    <span>Download</span>
                                  </button>
                                  <button
                                    onClick={() => handleEditInvoice(inv)}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 size={13} className="text-stone-500" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvoice(inv)}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-stone-100"
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Bar (Screenshot 1 Exact UI) */}
            <div className="p-4 bg-white border-t border-stone-100 flex flex-wrap items-center justify-end gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <span>
                {filteredInvoices.length === 0
                  ? "0 of 0"
                  : `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of ${filteredInvoices.length}`}
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage * itemsPerPage >= filteredInvoices.length}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1 rounded hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ELEVATED HIGH-RESOLUTION PDF VIEWER / PRINTABLE MODAL */}
      {/* ========================================================================= */}
      {isPdfViewerOpen && previewInvoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
          <div className="bg-stone-950 text-white rounded-3xl shadow-2xl border border-stone-800 w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Top Control Bar */}
            <div className="px-6 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">Invoice Preview</h3>
                    <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-full font-mono text-[10px] font-bold">
                      {previewInvoiceData.invoiceNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Billed to {previewInvoiceData.billTo?.name || previewInvoiceData.billedTo || "Client"}
                  </span>
                </div>
              </div>

              {/* Center Quick Page Selector */}
              <div className="hidden md:flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => setActivePdfPage(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePdfPage === 1 ? "bg-blue-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  Page 1: Invoice
                </button>
                <button
                  onClick={() => setActivePdfPage(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePdfPage === 2 ? "bg-blue-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  Page 2: Terms
                </button>
                <button
                  onClick={() => setActivePdfPage(3)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activePdfPage === 3 ? "bg-blue-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                >
                  Page 3: Contract & Sign
                </button>
              </div>

              {/* Right Action Icons & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    printInvoice({
                      invoiceNumber: previewInvoiceData.invoiceNumber,
                      clientName: previewInvoiceData.billTo?.name || previewInvoiceData.billedTo || previewInvoiceData.clientName,
                      clientPhone: previewInvoiceData.billTo?.phone || previewInvoiceData.clientPhone,
                      clientEmail: previewInvoiceData.billTo?.email || previewInvoiceData.clientEmail,
                      clientAddress: previewInvoiceData.billTo?.address || previewInvoiceData.clientAddress,
                      projectName: previewInvoiceData.projectName,
                      grandTotal: previewInvoiceData.totalAmount || previewInvoiceData.dueAmount || 65000,
                      items: previewInvoiceData.items,
                      paymentQrCode: paymentQrCode
                    });
                  }}
                  className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition cursor-pointer flex items-center gap-1.5"
                  title="Print Invoice"
                >
                  <Printer size={13} />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => {
                    downloadInvoicePdf({
                      invoiceNumber: previewInvoiceData.invoiceNumber,
                      clientName: previewInvoiceData.billTo?.name || previewInvoiceData.billedTo || previewInvoiceData.clientName,
                      clientPhone: previewInvoiceData.billTo?.phone || previewInvoiceData.clientPhone,
                      clientEmail: previewInvoiceData.billTo?.email || previewInvoiceData.clientEmail,
                      clientAddress: previewInvoiceData.billTo?.address || previewInvoiceData.clientAddress,
                      projectName: previewInvoiceData.projectName,
                      grandTotal: previewInvoiceData.totalAmount || previewInvoiceData.dueAmount || 65000,
                      items: previewInvoiceData.items,
                      paymentQrCode: paymentQrCode
                    });
                    showToast(`Downloading ${previewInvoiceData.invoiceNumber}.pdf...`);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>

                <button
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewer Body: Left Thumbnails + Center Printable Document Sheet */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side: Page Thumbnails */}
              <div className="w-52 bg-stone-950 border-r border-stone-800 p-4 space-y-3 overflow-y-auto hidden sm:block shrink-0">
                <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider mb-2">
                  Document Pages
                </div>

                <button
                  onClick={() => setActivePdfPage(1)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    activePdfPage === 1
                      ? "border-blue-500 bg-blue-500/10 shadow-lg"
                      : "border-stone-800 hover:border-stone-700 bg-stone-900/50"
                  }`}
                >
                  <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-md p-2 flex flex-col justify-between text-[6px] text-stone-900 overflow-hidden pointer-events-none mb-1.5 border border-stone-300">
                    <div className="flex justify-between items-center mb-1">
                      <div className="w-12 h-2 bg-amber-500/40 rounded-xs" />
                      <div className="w-8 h-2 bg-blue-600 rounded-xs" />
                    </div>
                    <div className="h-3 bg-blue-600 rounded-xs my-1" />
                    <div className="grid grid-cols-2 gap-1 my-1">
                      <div className="h-3 bg-stone-100 rounded-xs" />
                      <div className="h-3 bg-stone-100 rounded-xs" />
                    </div>
                    <div className="space-y-0.5 flex-1 mt-1">
                      <div className="h-1.5 bg-blue-600 rounded-xs" />
                      <div className="h-1 bg-stone-100 rounded-xs" />
                    </div>
                    <div className="h-3 bg-stone-100 rounded-xs border border-stone-200 mt-1" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Page 1</span>
                    <span className="text-[10px] text-stone-400">Invoice</span>
                  </div>
                </button>

                <button
                  onClick={() => setActivePdfPage(2)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    activePdfPage === 2
                      ? "border-blue-500 bg-blue-500/10 shadow-lg"
                      : "border-stone-800 hover:border-stone-700 bg-stone-900/50"
                  }`}
                >
                  <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-md p-2 flex flex-col justify-between text-[6px] text-stone-900 overflow-hidden pointer-events-none mb-1.5 border border-stone-300">
                    <div className="w-16 h-2 bg-stone-800 rounded-xs mb-1" />
                    <div className="space-y-1 my-1">
                      <div className="h-1 bg-stone-300 rounded-xs w-full" />
                      <div className="h-1 bg-stone-200 rounded-xs w-full" />
                      <div className="h-1 bg-stone-200 rounded-xs w-3/4" />
                    </div>
                    <div className="h-8 bg-stone-100 rounded-xs border border-stone-200 my-1" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Page 2</span>
                    <span className="text-[10px] text-stone-400">Terms P1</span>
                  </div>
                </button>

                <button
                  onClick={() => setActivePdfPage(3)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    activePdfPage === 3
                      ? "border-blue-500 bg-blue-500/10 shadow-lg"
                      : "border-stone-800 hover:border-stone-700 bg-stone-900/50"
                  }`}
                >
                  <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-md p-2 flex flex-col justify-between text-[6px] text-stone-900 overflow-hidden pointer-events-none mb-1.5 border border-stone-300">
                    <div className="space-y-1 my-1">
                      <div className="h-1 bg-stone-300 rounded-xs w-full" />
                      <div className="h-1 bg-stone-200 rounded-xs w-full" />
                      <div className="h-1 bg-stone-200 rounded-xs w-3/4" />
                    </div>
                    <div className="flex justify-between items-end mt-4 pt-2 border-t border-stone-200">
                      <div className="w-8 h-1 bg-stone-400" />
                      <div className="w-10 h-1 bg-stone-800" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Page 3</span>
                    <span className="text-[10px] text-stone-400">Terms P2</span>
                  </div>
                </button>
              </div>

              {/* Main Document Preview (Crisp White High-Res Sheet) */}
              <div className="flex-1 bg-stone-900/80 p-4 sm:p-8 overflow-y-auto flex justify-center">
                <div className="w-full max-w-3xl bg-white text-stone-900 rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6 text-xs min-h-[850px] border border-stone-300 font-sans">
                  {/* Page 1: Tax Invoice (Exact Screenshot 1) */}
                  {activePdfPage === 1 && (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Top Header */}
                      <div className="flex items-start justify-between border-b border-stone-200 pb-5">
                        <div className="space-y-1.5">
                          {/* Velora Antaraal Luxury Logo Badge */}
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300 rounded-xl text-[#9E7B1D] font-black text-sm tracking-wider shadow-2xs">
                            <Building size={16} />
                            <span>VELORA ANTARAAL</span>
                          </div>
                          <p className="font-bold text-stone-800 text-xs leading-relaxed max-w-[320px]">
                            BAFANA NIWAS, AUNDH HINJEWADI WAKAD CHOWK, WAKAD, SR NO 242/2/B1, Hinjawadi, Pune, Maharashtra, 411057
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-stone-600 text-xs font-medium">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={12} className="text-stone-400" />
                              <span>(+91) 80555 26603</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-stone-400" />
                              <span>velora.family@gmail.com</span>
                            </span>
                          </div>
                          <p className="text-stone-800 font-bold font-mono text-xs">
                            GST No: <span className="text-blue-700">27CHCPS9945R1Z4</span>
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <h1 className="text-3xl font-black text-blue-600 tracking-tight">INVOICE</h1>
                        </div>
                      </div>

                      {/* Blue Info Banner (Screenshot 1 exact layout) */}
                      <div className="flex justify-end">
                        <div className="w-full sm:w-80 space-y-2">
                          <div className="bg-blue-600 text-white rounded-xl p-3.5 flex items-center justify-between shadow-md">
                            <span className="text-xs font-medium text-blue-100">Total Value:</span>
                            <span className="font-mono text-xl font-black">
                              ₹{(previewInvoiceData.totalAmount || previewInvoiceData.dueAmount || 65000).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="space-y-1 text-right text-xs text-stone-600 pr-1">
                            <div>
                              <span className="text-stone-400 font-medium">Invoice Number: </span>
                              <span className="font-mono font-bold text-stone-900">{previewInvoiceData.invoiceNumber}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 font-medium">Invoice Date: </span>
                              <span className="font-bold text-stone-900">{previewInvoiceData.formattedDate || previewInvoiceData.invoiceDate}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 font-medium">Due Date: </span>
                              <span className="font-bold text-stone-900">{previewInvoiceData.dueDate || "--"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Two Column Bill To & Ship To */}
                      <div className="grid grid-cols-2 gap-8 text-xs">
                        <div className="space-y-1">
                          <span className="font-black text-stone-900 text-xs uppercase tracking-wider block">BILL TO</span>
                          <span className="font-bold text-sm text-stone-900 block">
                            {previewInvoiceData.billTo?.name || previewInvoiceData.billedTo || previewInvoiceData.clientName}
                          </span>
                          <span className="font-mono text-stone-700 block font-medium">
                            (+91) {previewInvoiceData.billTo?.phone || previewInvoiceData.clientPhone || "--"}
                          </span>
                          <span className="text-stone-600 block">
                            {previewInvoiceData.billTo?.email || previewInvoiceData.clientEmail || "--"}
                          </span>
                          <span className="text-stone-600 block text-xs leading-relaxed">
                            {previewInvoiceData.billTo?.address || previewInvoiceData.clientAddress || "--"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="font-black text-stone-900 text-xs uppercase tracking-wider block">SHIP TO</span>
                          <span className="font-bold text-sm text-stone-900 block">
                            {previewInvoiceData.shipTo?.name || previewInvoiceData.billTo?.name || previewInvoiceData.billedTo}
                          </span>
                          <span className="font-mono text-stone-700 block font-medium">
                            (+91) {previewInvoiceData.shipTo?.phone || previewInvoiceData.billTo?.phone || "--"}
                          </span>
                          <span className="text-stone-600 block">
                            {previewInvoiceData.shipTo?.email || previewInvoiceData.billTo?.email || "--"}
                          </span>
                          <span className="text-stone-600 block text-xs leading-relaxed">
                            {previewInvoiceData.shipTo?.address || previewInvoiceData.billTo?.address || "--"}
                          </span>
                        </div>
                      </div>

                      {/* Service Items Table (Screenshot 1 Blue header) */}
                      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-blue-600 text-white font-bold text-[11px]">
                              <th className="py-2.5 px-3">Service Description</th>
                              <th className="py-2.5 px-2">HSN/SAC</th>
                              <th className="py-2.5 px-2 text-center">Qty</th>
                              <th className="py-2.5 px-2 text-center">Unit</th>
                              <th className="py-2.5 px-3 text-right">Rate</th>
                              <th className="py-2.5 px-2 text-center">GST (%)</th>
                              <th className="py-2.5 px-2 text-right">GST (₹)</th>
                              <th className="py-2.5 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-700">
                            {(previewInvoiceData.items || []).map((it, idx) => (
                              <tr key={idx} className="hover:bg-stone-50/50">
                                <td className="py-2.5 px-3 font-bold text-stone-900">
                                  {it.serviceDescription || it.productName || "sofa"}
                                </td>
                                <td className="py-2.5 px-2 font-mono text-stone-400">{it.hsnSac || ""}</td>
                                <td className="py-2.5 px-2 text-center font-bold text-stone-900">{it.quantity || 1}</td>
                                <td className="py-2.5 px-2 text-center text-stone-600">{it.unit || "1"}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                                  ₹{(it.rate || 65000).toLocaleString("en-IN")}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono text-stone-700">{it.gstPercent || 0} %</td>
                                <td className="py-2.5 px-2 text-right font-mono text-stone-500">
                                  ₹{(it.gstAmount || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-black text-stone-900">
                                  ₹{(it.total || it.rate || 65000).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals & Summary Box */}
                      <div className="flex justify-end pt-1">
                        <div className="w-64 space-y-2 text-xs">
                          <div className="flex justify-between text-stone-600">
                            <span>Sub Total</span>
                            <span className="font-mono font-bold text-stone-900">
                              ₹{(previewInvoiceData.subTotal || 65000).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>Tax Amount</span>
                            <span className="font-mono font-bold text-stone-900">
                              ₹{(previewInvoiceData.taxAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-stone-900 text-sm">
                            <span>Total Value</span>
                            <span className="font-mono font-black text-stone-900">
                              ₹{(previewInvoiceData.totalAmount || previewInvoiceData.dueAmount || 65000).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details & Scan to Pay (Screenshot 1 Layout) */}
                      <div className="space-y-4 pt-2 border-t border-stone-100">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 text-xs block">
                            Bank Details & Payment Instructions
                          </span>
                          <p className="font-mono text-[11px] text-stone-700 leading-relaxed">
                            Account Holder: VELORA ANTARAAL<br />
                            Account Number: 50200073374185<br />
                            IFSC: HDFC0000282<br />
                            Branch: WAKAD<br />
                            Account Type: Current Account
                          </p>
                        </div>

                        {/* Scan to pay */}
                        <div className="space-y-2">
                          <span className="font-bold text-stone-900 text-xs block">Scan to pay</span>
                          <div className="inline-block p-2 bg-white border border-stone-200 rounded-xl shadow-2xs">
                            {paymentQrCode ? (
                              <img
                                src={paymentQrCode}
                                alt="PhonePe QR Code"
                                className="w-24 h-24 object-contain rounded-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-stone-50 rounded-lg flex flex-col items-center justify-center p-2 text-center border border-dashed border-stone-300">
                                <QrCode size={36} className="text-blue-600 mb-1" />
                                <span className="text-[8px] font-black text-stone-600">PhonePe / UPI</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1 pt-2">
                          <span className="font-bold text-stone-900 text-xs block">Notes</span>
                          <p className="text-stone-600 text-xs">
                            {previewInvoiceData.notes || "Registered under Composition Taxable scheme. Not eligible to collect tax on supplies."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Page 2: Terms & Conditions Part 1 (Exact Screenshot 2) */}
                  {activePdfPage === 2 && (
                    <div className="space-y-5 animate-in fade-in pt-2">
                      <div className="space-y-1 pb-3 border-b border-stone-200">
                        <span className="font-bold text-stone-900 text-xs block">Notes</span>
                        <p className="text-stone-600 text-xs">
                          Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-stone-900 text-xs block">Terms & Conditions</span>
                        <h2 className="text-sm font-black text-stone-900 uppercase">TERMS & CONDITIONS</h2>
                        <span className="text-xs text-stone-600 block">For Interior Design & Turnkey Execution Services</span>
                        <div className="pt-2 text-xs">
                          <span className="font-bold text-stone-900 block">Company Name: VELORA ANTARAAL</span>
                          <span className="text-stone-600 block">Tagline: Designing Elevated Living</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs text-stone-700 leading-relaxed pt-2">
                        <div>
                          <p className="font-bold text-stone-900 mb-1">1. Scope of Work</p>
                          <p className="text-stone-600">
                            The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, furniture design, civil work, electrical work, false ceiling, modular furniture, décor assistance, site supervision, and turnkey execution as mutually agreed in the final quotation/work order.
                          </p>
                          <p className="text-stone-600 mt-1">
                            Any work outside the approved quotation shall be treated as additional work and billed separately.
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-stone-900 mb-1">2. Design Process</p>
                          <p className="text-stone-600">
                            1. Initial consultation and requirement discussion<br />
                            2. Concept design and layout planning
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Page 3: Terms & Conditions Part 2 & Signatures (Exact Screenshot 3) */}
                  {activePdfPage === 3 && (
                    <div className="space-y-4 animate-in fade-in pt-2 text-xs text-stone-700 leading-relaxed">
                      <div>
                        <p className="text-stone-600">
                          3. Material and finish selection<br />
                          4. Final design approval<br />
                          5. Execution and site coordination<br />
                          6. Project handover
                        </p>
                        <p className="text-stone-600 mt-1 italic">
                          Design revisions beyond the agreed number of revisions may attract additional charges.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">3. Quotation & Pricing</p>
                        <p className="text-stone-600">
                          - All quotations are valid for 15 days from the date of issue.<br />
                          - Prices are based on current market rates of materials and labour.<br />
                          - Any increase in material cost, taxes, transport, or vendor pricing after quotation approval may lead to revised costing.<br />
                          - Customizations requested after final approval will be charged additionally.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">4. Payment Terms</p>
                        <p className="text-stone-600 mb-1">Payment schedule shall generally be as follows:</p>
                        <p className="text-stone-600 font-medium">
                          - 10% Advance – Booking & Design Initiation<br />
                          - 40% – Before Production/Execution<br />
                          - 40% – During Execution Stage<br />
                          - 10% – Before Final Handover
                        </p>
                        <p className="text-stone-600 mt-1">
                          All payments must be made as per agreed timelines. Delay in payment may lead to work suspension and revised delivery timelines.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">5. Project Timeline</p>
                        <p className="text-stone-600">
                          - Timelines are estimated based on project scope and site conditions.<br />
                          - Delays caused due to civil issues, approvals, client-side delays, vendor delays, material shortages, force majeure events, or changes in design shall not be considered the company's liability.<br />
                          - Working days exclude Sundays and public holidays unless otherwise specified.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">6. Client Responsibilities</p>
                        <p className="text-stone-600">
                          The client shall:<br />
                          - Provide timely approvals and decisions.<br />
                          - Ensure site accessibility and basic utilities like electricity and water.<br />
                          - Clear all dues as per payment schedule.<br />
                          - Coordinate with society management/building authorities for permissions if required.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">7. Material & Finishes</p>
                        <p className="text-stone-600">
                          - Natural variations in wood, veneer, marble, laminates, fabric, stone, and other materials are normal and not considered defects.<br />
                          - Shade differences may occur due to lighting and batch variation.<br />
                          - Availability of selected materials is subject to market conditions.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">8. Warranty</p>
                        <p className="text-stone-600">
                          Modular Furniture & Interior Work Warranty<br />
                          - Warranty period: 5 years for modular furniture manufacturing defects.<br />
                          - Hardware warranty shall be as per respective brand manufacturer policy.<br />
                          - Electrical appliances/accessories carry manufacturer warranty only.<br />
                          - Polish, paint touch-ups, fabric wear, glass breakage, seepage, plumbing leakage from existing structure, mishandling, moisture damage, termite issues due to site conditions, or unauthorized modifications are not covered under warranty.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">9. Cancellation Policy</p>
                        <p className="text-stone-600">
                          - Booking amount/design fees are non-refundable.<br />
                          - In case of project cancellation after production/execution initiation, charges for completed work, materials procured, labour, and applicable damages shall be recoverable from the client.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">10. Ownership of Designs</p>
                        <p className="text-stone-600">
                          All drawings, concepts, renders, and designs remain intellectual property of VELORA ANTARAAL unless otherwise agreed in writing. Unauthorized copying or execution through third parties is prohibited.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">11. Photography & Portfolio Rights</p>
                        <p className="text-stone-600">
                          The company reserves the right to photograph completed projects for portfolio, social media, website, and marketing purposes unless the client specifically requests confidentiality in writing.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">12. Limitation of Liability</p>
                        <p className="text-stone-600">
                          The company shall not be liable for: Structural defects of the property; Existing site issues; Delays due to external agencies/vendors; Damages caused after handover due to misuse or negligence.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">13. Force Majeure</p>
                        <p className="text-stone-600">
                          The company shall not be responsible for delays or non-performance caused by events beyond reasonable control including natural disasters, strikes, government restrictions, pandemics, transport disruptions, or supply chain interruptions.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">14. Dispute Resolution</p>
                        <p className="text-stone-600">
                          Any disputes arising shall be subject to the jurisdiction of Pune, Maharashtra courts only.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 mb-1">15. Acceptance</p>
                        <p className="text-stone-600">
                          Approval of quotation/work order and payment of advance shall be considered acceptance of these Terms & Conditions.
                        </p>
                      </div>

                      {/* Signatures Block (Screenshot 3) */}
                      <div className="pt-8 space-y-4 border-t border-stone-200">
                        <div>
                          <p className="text-stone-800">Client Signature: _______________________</p>
                        </div>
                        <div>
                          <p className="text-stone-800">Date: _______________________</p>
                        </div>
                        <div className="pt-2">
                          <p className="font-bold text-stone-900">Authorized Signatory</p>
                          <p className="font-black text-stone-900">VELORA ANTARAAL</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-stone-400">
                Viewing Page <span className="font-bold text-white">{activePdfPage}</span> of 3
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadInvoicePdf({
                      invoiceNumber: previewInvoiceData.invoiceNumber,
                      clientName: previewInvoiceData.billTo?.name || previewInvoiceData.billedTo || previewInvoiceData.clientName,
                      clientPhone: previewInvoiceData.billTo?.phone || previewInvoiceData.clientPhone,
                      clientEmail: previewInvoiceData.billTo?.email || previewInvoiceData.clientEmail,
                      clientAddress: previewInvoiceData.billTo?.address || previewInvoiceData.clientAddress,
                      projectName: previewInvoiceData.projectName,
                      grandTotal: previewInvoiceData.totalAmount || previewInvoiceData.dueAmount || 65000,
                      items: previewInvoiceData.items,
                      paymentQrCode: paymentQrCode
                    });
                    showToast(`Downloading ${previewInvoiceData.invoiceNumber}.pdf...`);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
