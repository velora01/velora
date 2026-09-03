import React, { useState, useEffect } from "react";
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
  Layers,
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Sparkles,
  Zap,
  Home,
  ExternalLink,
  Copy,
  MapPin,
  Phone,
  Mail,
  SlidersHorizontal,
  CheckCircle
} from "lucide-react";
import { downloadInvoicePdf, printInvoice, downloadBOQPdf, exportInvoiceCsv, exportAllInvoicesCsv } from "../utils/downloadHelper";

export default function QuotationInvoiceManager() {
  const location = useLocation();
  const navigate = useNavigate();

  // Primary active tabs: "invoices" | "estimates" | "clients"
  const [activeTab, setActiveTab] = useState("invoices");

  // Invoice view modes: "list" | "edit"
  const [invoiceViewMode, setInvoiceViewMode] = useState("list");

  // Invoices list state
  const [invoices, setInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Enquiries list state (loaded from Enquiry section)
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [isSelectEnquiryModalOpen, setIsSelectEnquiryModalOpen] = useState(false);
  const [enquirySearchQuery, setEnquirySearchQuery] = useState("");

  // Invoice Details View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // BOQ Estimates / Quotations state
  const [boqEstimates, setBoqEstimates] = useState([]);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [estimateSearch, setEstimateSearch] = useState("");
  const [selectedDetailBOQ, setSelectedDetailBOQ] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailSpaceIdx, setActiveDetailSpaceIdx] = useState(0);
  const [clientsList, setClientsList] = useState([]);

  // PDF Viewer Modal State (Screenshot 2)
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState(null);
  const [pdfDocumentMode, setPdfDocumentMode] = useState("tax"); // "tax" | "boq"
  const [activePdfPage, setActivePdfPage] = useState(1);

  // Quotations state
  const [quotations, setQuotations] = useState([]);
  const [quotationSearch, setQuotationSearch] = useState("");

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");

  // Clean initial invoice template
  const defaultInvoiceForm = {
    _id: null,
    invoiceNumber: "",
    projectName: "",
    projectNumber: "",
    clientId: "",
    invoiceType: "Supply",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
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
        productName: "",
        category: "Interior Execution",
        dimensions: "Standard",
        hsnSac: "995476",
        quantity: 1,
        unit: "Unit",
        rate: 0,
        discount: 0,
        gstPercent: 18,
        gstAmount: 0,
        total: 0
      }
    ],
    subtotal: 0,
    discountTotal: 0,
    additionalCharges: {
      installation: 0,
      transportation: 0,
      design: 0,
      labour: 0,
      other: 0,
      totalCharges: 0
    },
    taxPercent: 18,
    gstTotal: 0,
    grandTotal: 0,
    paidAmount: 0,
    balanceDue: 0,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    termsAndConditions:
      "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance along with work order confirmation.\n2. 40% on material delivery or production clearance.\n3. Balance 10% on completion and final snag handover.",
    bankDetails:
      "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
  };

  const [editingInvoice, setEditingInvoice] = useState(defaultInvoiceForm);

  // Load Invoices from Backend & Local Storage (No dummy fallback)
  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await erpApi.getInvoices({ search: invoiceSearch });
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setInvoices(res.data);
        localStorage.setItem("velora_local_invoices", JSON.stringify(res.data));
      } else {
        const stored = localStorage.getItem("velora_local_invoices");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (invoiceSearch) {
            const term = invoiceSearch.toLowerCase();
            setInvoices(
              parsed.filter(
                (inv) =>
                  inv.invoiceNumber?.toLowerCase().includes(term) ||
                  inv.clientName?.toLowerCase().includes(term) ||
                  inv.clientPhone?.toLowerCase().includes(term) ||
                  inv.projectName?.toLowerCase().includes(term)
              )
            );
          } else {
            setInvoices(parsed);
          }
        } else {
          setInvoices([]);
        }
      }
    } catch (err) {
      console.warn("Backend invoices fallback:", err);
      const stored = localStorage.getItem("velora_local_invoices");
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        setInvoices([]);
      }
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Load Enquiries from Backend & Enquiry Section
  const loadEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const customEnquiries = JSON.parse(localStorage.getItem("velora_custom_enquiries") || "[]");
      const res = await erpApi.getLeads({ limit: 100 });
      let combined = [];

      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        combined = [...customEnquiries, ...res.data];
      } else {
        const defaultEnqs = [
          { _id: "enq1", enquiryNo: "ENQ-2026-001", salutation: "Mr", name: "PREM SHUKLA", phone: "78000 20496", email: "prem.shukla@example.com", address: "402, Wakad Chowk, Pune", siteLocation: "PHASE 2", projectType: "Commercial", projectSubtype: "Corporate Office", budget: "₹45 Lakhs", estimatedValue: 4500000, status: "Inquiry", prospectStatus: "Hot" },
          { _id: "enq2", enquiryNo: "ENQ-2026-002", salutation: "Mr", name: "Rajeev Singhal", phone: "89482 74553", email: "rajeev.s@example.com", address: "Rishita Serenity, Sector-6, Pune", siteLocation: "Koregaon Park, Pune", projectType: "Renovation", projectSubtype: "3BHK Flat", budget: "₹30 Lakhs", estimatedValue: 3964567, status: "Booking", prospectStatus: "Warm" },
          { _id: "enq3", enquiryNo: "ENQ-2026-003", salutation: "Mr", name: "Rasid sir", phone: "84128 52592", email: "rasid@example.com", address: "Bafana Complex, Wakad, Pune", siteLocation: "Wakad, Pune", projectType: "Commercial", projectSubtype: "Retail Showroom", budget: "₹25 Lakhs", estimatedValue: 185000, status: "Inquiry", prospectStatus: "Warm" },
          { _id: "enq4", enquiryNo: "ENQ-2026-004", salutation: "Ms", name: "Meenakshi Krishnani", phone: "91671 35606", email: "meenakshi@example.com", address: "Bandra West, Mumbai", siteLocation: "Kalyani Nagar, Pune", projectType: "Residential", projectSubtype: "4BHK Penthouse", budget: "₹60 Lakhs", estimatedValue: 1450000, status: "Design Phase", prospectStatus: "Hot" },
          { _id: "enq5", enquiryNo: "ENQ-2026-005", salutation: "Mr", name: "Akash Jain", phone: "89778 99643", email: "akash.jain@example.com", address: "Kalyani Nagar, Pune", siteLocation: "Kalyani Nagar", projectType: "Residential", projectSubtype: "Luxury Villa", budget: "₹35 Lakhs", estimatedValue: 2200000, status: "Inquiry", prospectStatus: "Hot" },
          { _id: "enq6", enquiryNo: "ENQ-2026-006", salutation: "Dr", name: "Dr Saurabh", phone: "77090 19535", email: "dr.saurabh@example.com", address: "Aundh, Pune", siteLocation: "Aundh", projectType: "Residential", projectSubtype: "3BHK Luxury", budget: "₹20 Lakhs", estimatedValue: 850000, status: "Inquiry", prospectStatus: "Warm" },
          { _id: "enq7", enquiryNo: "ENQ-2026-007", salutation: "Mr", name: "WIPRO LINCRAFT AI PRIVATE LIMITED", phone: "96323 00992", email: "contact@wiprolincraft.com", address: "Electronic City, Bengaluru", siteLocation: "Electronic City", projectType: "Commercial", projectSubtype: "IT Park Office", budget: "₹1.2 Cr", estimatedValue: 12000000, status: "Proposal", prospectStatus: "Hot" }
        ];
        combined = [...customEnquiries, ...defaultEnqs];
      }

      // De-duplicate by _id or enquiryNo
      const seen = new Set();
      const deduped = combined.filter((item) => {
        const key = item._id || item.enquiryNo || item.phone;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setEnquiriesList(deduped);
    } catch (err) {
      console.warn("Error loading enquiries:", err);
      const customEnquiries = JSON.parse(localStorage.getItem("velora_custom_enquiries") || "[]");
      setEnquiriesList(customEnquiries);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  // Load Quotations
  // Load BOQ Estimates & Quotations
  const loadBOQEstimates = async () => {
    setLoadingEstimates(true);
    try {
      const res = await erpApi.getBOQs({ limit: 100 });
      if (res?.data && res.data.length > 0) {
        setBoqEstimates(res.data);
      } else {
        // Fallback standard BOQ list
        setBoqEstimates([
          {
            _id: "boq18",
            boqNumber: "BOQ-2026-018",
            enquiryNo: "ENQ-2026-018",
            enquiryDate: "2026-08-08",
            clientName: "Rajeev Singhal",
            clientEmail: "rajeev.s@example.com",
            clientPhone: "89482 74553",
            clientAddress: "Koregaon Park, Pune",
            activePackage: "Standard",
            numberOfSpaces: 10,
            grandTotal: 3964567,
            status: "Draft",
            spaces: [
              {
                name: "Entrance",
                roomTotal: 75813,
                items: [
                  { name: "Shoe Rack", packageVariant: "Standard", typeVariant: "Box Standard", lengthFt: 1, lengthIn: 6, heightFt: 9, heightIn: 3, qty: 1, sqft: 13.875, rate: 1500, amount: 20813, description: "Providing of size (4ft x 3ft) shoe rack" },
                  { name: "Entrance Safety Door", packageVariant: "Standard", typeVariant: "Frame Standard", lengthFt: 1, lengthIn: 0, heightFt: 1, heightIn: 0, qty: 1, sqft: 1, rate: 40000, amount: 40000, description: "Entrance safety grill door" },
                  { name: "Smart Lock", packageVariant: "Standard", typeVariant: "Box Standard", lengthFt: 1, lengthIn: 0, heightFt: 1, heightIn: 0, qty: 1, sqft: 1, rate: 15000, amount: 15000, description: "Digital biometric lock" }
                ]
              },
              { name: "PUJA ROOM", roomTotal: 85000, items: [] },
              { name: "Living Room", roomTotal: 420000, items: [] },
              { name: "Modular Kitchen", roomTotal: 650000, items: [] },
              { name: "Dining Area", roomTotal: 120000, items: [] },
              { name: "Master Bedroom", roomTotal: 580000, items: [] },
              { name: "Kids Bedroom", roomTotal: 340000, items: [] },
              { name: "Parents Bedroom", roomTotal: 310000, items: [] },
              { name: "Guest Bedroom", roomTotal: 250000, items: [] }
            ]
          },
          {
            _id: "boq17",
            boqNumber: "BOQ-2026-017",
            enquiryNo: "ENQ-2026-017",
            enquiryDate: "2026-07-11",
            clientName: "Rasid sir",
            clientEmail: "rasid@example.com",
            clientPhone: "84128 52592",
            clientAddress: "Bafana Complex, Wakad, Pune",
            activePackage: "Standard",
            numberOfSpaces: 1,
            grandTotal: 185000,
            status: "Draft",
            spaces: [{ name: "Showroom Front", roomTotal: 185000, items: [{ name: "Display Counters", qty: 1, sqft: 1, rate: 185000, amount: 185000 }] }]
          },
          {
            _id: "boq16",
            boqNumber: "BOQ-2026-016",
            enquiryNo: "ENQ-2026-016",
            enquiryDate: "2026-06-21",
            clientName: "Meenakshi Krishnani",
            clientEmail: "meenakshi@example.com",
            clientPhone: "91671 35606",
            clientAddress: "Bandra West, Mumbai",
            activePackage: "Premium",
            numberOfSpaces: 5,
            grandTotal: 1450000,
            status: "Approved",
            spaces: []
          },
          {
            _id: "boq13",
            boqNumber: "BOQ-2026-013",
            enquiryNo: "ENQ-2026-013",
            enquiryDate: "2026-08-13",
            clientName: "PREM SHUKLA",
            clientEmail: "PREMSHUKLA@GMAIL.COM",
            clientPhone: "78000 20496",
            clientAddress: "Baner, Pune",
            activePackage: "Elite",
            numberOfSpaces: 1,
            grandTotal: 4500000,
            status: "Invoiced",
            spaces: []
          },
          {
            _id: "boq14",
            boqNumber: "BOQ-2026-014",
            enquiryNo: "ENQ-2026-014",
            enquiryDate: "2026-05-25",
            clientName: "Akash Jain",
            clientEmail: "akash.jain@example.com",
            clientPhone: "89778 99643",
            clientAddress: "Kalyani Nagar, Pune",
            activePackage: "Elite",
            numberOfSpaces: 8,
            grandTotal: 2200000,
            status: "Draft",
            spaces: []
          },
          {
            _id: "boq12",
            boqNumber: "BOQ-2026-012",
            enquiryNo: "ENQ-2026-012",
            enquiryDate: "2026-05-19",
            clientName: "Dr Saurabh",
            clientEmail: "dr.saurabh@example.com",
            clientPhone: "77090 19535",
            clientAddress: "Aundh, Pune",
            activePackage: "Standard",
            numberOfSpaces: 2,
            grandTotal: 850000,
            status: "Draft",
            spaces: []
          },
          {
            _id: "boq11",
            boqNumber: "BOQ-2026-011",
            enquiryNo: "ENQ-2026-011",
            enquiryDate: "2026-04-28",
            clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
            clientEmail: "contact@wiprolincraft.com",
            clientPhone: "96323 00992",
            clientAddress: "Electronic City, Bengaluru",
            activePackage: "Elite",
            numberOfSpaces: 1,
            grandTotal: 12000000,
            status: "Draft",
            spaces: []
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading BOQ estimates:", err);
    } finally {
      setLoadingEstimates(false);
    }
  };

  // Load Clients
  const loadClients = async () => {
    try {
      const res = await erpApi.getClients({ limit: 100 });
      if (res?.data && res.data.length > 0) {
        setClientsList(res.data);
      } else {
        setClientsList([
          { _id: "cl1", clientCode: "VLA-CL-1001", name: "PREM SHUKLA", email: "PREMSHUKLA@GMAIL.COM", phone: "78000 20496", city: "Wakad, Pune", address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, PUNE, MAHARASHTRA, 411057" },
          { _id: "cl2", clientCode: "VLA-CL-1002", name: "Rajeev Singhal", email: "rajeev@singhal.com", phone: "89482 74553", city: "Baner, Pune", address: "Singhal Penthouse, Baner, Pune" },
          { _id: "cl3", clientCode: "VLA-CL-1003", name: "Meenakshi Krishnani", email: "meenakshi@krishnani.com", phone: "91671 35606", city: "Koregaon Park, Pune", address: "Krishnani Residence, Koregaon Park, Pune" },
          { _id: "cl4", clientCode: "VLA-CL-1004", name: "WIPRO LINCRAFT AI PRIVATE LIMITED", email: "contact@wiprolincraft.com", phone: "96323 00992", city: "Electronic City, Bengaluru", address: "Electronic City, Bengaluru" }
        ]);
      }
    } catch (err) {
      console.error("Error loading clients:", err);
      setClientsList([
        { _id: "cl1", clientCode: "VLA-CL-1001", name: "PREM SHUKLA", email: "PREMSHUKLA@GMAIL.COM", phone: "78000 20496", city: "Wakad, Pune", address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, PUNE, MAHARASHTRA, 411057" },
        { _id: "cl2", clientCode: "VLA-CL-1002", name: "Rajeev Singhal", email: "rajeev@singhal.com", phone: "89482 74553", city: "Baner, Pune", address: "Singhal Penthouse, Baner, Pune" },
        { _id: "cl3", clientCode: "VLA-CL-1003", name: "Meenakshi Krishnani", email: "meenakshi@krishnani.com", phone: "91671 35606", city: "Koregaon Park, Pune", address: "Krishnani Residence, Koregaon Park, Pune" },
        { _id: "cl4", clientCode: "VLA-CL-1004", name: "WIPRO LINCRAFT AI PRIVATE LIMITED", email: "contact@wiprolincraft.com", phone: "96323 00992", city: "Electronic City, Bengaluru", address: "Electronic City, Bengaluru" }
      ]);
    }
  };

  // Load Quotations
  const loadQuotations = async () => {
    try {
      const res = await erpApi.getQuotations({ search: quotationSearch });
      if (res?.data) setQuotations(res.data);
    } catch (err) {
      console.error("Error loading quotations:", err);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadBOQEstimates();
    loadClients();
    loadQuotations();
    loadEnquiries();
  }, [invoiceSearch, quotationSearch]);

  // Open Full Detail Modal for any BOQ / Client estimate
  const handleOpenEstimateDetail = (boq) => {
    setSelectedDetailBOQ(boq);
    setActiveDetailSpaceIdx(0);
    setIsDetailModalOpen(true);
  };

  // 1-Click Auto-Create Standard Tax Invoice from BOQ
  const handleAutoCreateInvoiceFromBOQ = async (boq) => {
    if (!boq) return;

    // Extract line items from all spaces
    const invoiceItems = [];
    if (boq.spaces && boq.spaces.length > 0) {
      boq.spaces.forEach((sp) => {
        if (sp.items && sp.items.length > 0) {
          sp.items.forEach((it) => {
            const lStr = it.lengthFt ? `${it.lengthFt}ft ${it.lengthIn || 0}in` : "";
            const hStr = it.heightFt ? `${it.heightFt}ft` : "";
            const dims = lStr && hStr ? `${lStr} × ${hStr}` : it.customDimensions || "Standard";
            invoiceItems.push({
              productName: it.name || "Interior Component",
              category: sp.name || "Interior",
              dimensions: dims,
              hsnSac: "995476",
              quantity: Number(it.qty) || 1,
              unit: String(it.sqft || "1"),
              rate: Number(it.rate) || 0,
              discount: 0,
              gstPercent: 0,
              gstAmount: 0,
              total: it.amount || (Number(it.rate || 0) * Number(it.qty || 1))
            });
          });
        } else if (sp.roomTotal > 0) {
          invoiceItems.push({
            productName: `${sp.name} Turnkey Scope & Fitout`,
            category: sp.name,
            dimensions: "Turnkey Scope",
            hsnSac: "995476",
            quantity: 1,
            unit: "1",
            rate: sp.roomTotal,
            discount: 0,
            gstPercent: 0,
            gstAmount: 0,
            total: sp.roomTotal
          });
        }
      });
    }

    if (invoiceItems.length === 0) {
      invoiceItems.push({
        productName: `${boq.clientName} Turnkey Interior Execution`,
        category: "Turnkey",
        dimensions: "As per BOQ",
        hsnSac: "995476",
        quantity: 1,
        unit: "1",
        rate: boq.grandTotal || 100000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: boq.grandTotal || 100000
      });
    }

    const sub = boq.subtotal || Math.round((boq.grandTotal || 0) / 1.18);
    const gst = boq.gstTotal || Math.round((boq.grandTotal || 0) - sub);
    const grand = boq.grandTotal || 0;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const invNum = `NCIA${randomSuffix}`;

    const newInvoice = {
      ...defaultInvoiceForm,
      _id: null,
      invoiceNumber: invNum,
      projectName: `${boq.clientName} Residence`,
      projectNumber: `PRJ-2026-${randomSuffix}`,
      clientId: boq.clientId || `VEL-CL-${randomSuffix}`,
      invoiceType: "Supply & Turnkey",
      clientName: boq.clientName,
      clientEmail: boq.clientEmail || "",
      clientPhone: boq.clientPhone || "",
      clientAddress: boq.clientAddress || "Baner, Pune, Maharashtra",
      billTo: {
        name: boq.clientName,
        email: boq.clientEmail || "",
        phone: boq.clientPhone || "",
        gstin: "",
        address: boq.clientAddress || "Baner, Pune, Maharashtra"
      },
      shipTo: {
        name: boq.clientName,
        email: boq.clientEmail || "",
        phone: boq.clientPhone || "",
        gstin: "",
        address: boq.clientAddress || "Baner, Pune, Maharashtra"
      },
      sameAsBillTo: true,
      items: invoiceItems,
      subtotal: sub,
      discountTotal: 0,
      additionalCharges: {
        installation: 0,
        transportation: 0,
        design: 0,
        labour: 0,
        other: 0,
        totalCharges: 0
      },
      taxPercent: 0,
      gstTotal: gst,
      grandTotal: grand,
      paidAmount: 0,
      balanceDue: grand,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      termsAndConditions:
        "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance along with work order confirmation.\n2. 40% on material delivery or production clearance.\n3. Balance 10% on completion and final snag handover.",
      bankDetails:
        "Account Holder: VELORA ANTARAAL\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
    };

    try {
      const res = await erpApi.createInvoice(newInvoice);
      if (res?.data) {
        newInvoice._id = res.data._id;
      }
    } catch (err) {
      console.warn("Backend create invoice fallback:", err);
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    setEditingInvoice(newInvoice);
    setInvoiceViewMode("edit");
    setActiveTab("invoices");
    setIsDetailModalOpen(false);
    setToastMsg(`Standard Tax Invoice ${invNum} automatically created for ${boq.clientName}!`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Handle incoming routing from Client module or BOQ module
  useEffect(() => {
    if (location.state?.openInvoice) {
      const invNumStr = String(location.state.openInvoice);
      const found = invoices.find((inv) => inv.invoiceNumber === invNumStr || inv._id === invNumStr);
      setPdfInvoice(found || { ...defaultInvoiceForm, invoiceNumber: invNumStr });
      setIsPdfViewerOpen(true);
      setActiveTab("invoices");
    } else if (location.state?.createFromClient && location.state?.client) {
      const c = location.state.client;
      const invNum = `VLA-INV-2026-${String(Math.floor(100 + Math.random() * 900))}`;
      setEditingInvoice({
        ...defaultInvoiceForm,
        _id: null,
        invoiceNumber: invNum,
        clientId: c.clientId || c.clientCode,
        clientName: c.name,
        clientEmail: c.email || "",
        clientPhone: c.phone || "",
        clientAddress: c.address || "",
        projectName: c.name,
        projectNumber: `PRJ-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        billTo: {
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          gstin: c.gstin || "",
          address: c.address || "Pune, Maharashtra"
        }
      });
      setInvoiceViewMode("edit");
      setActiveTab("invoices");
    } else if (location.state?.createFromBOQ && location.state?.boqData) {
      const bData = location.state.boqData;
      setEditingInvoice({
        ...defaultInvoiceForm,
        _id: null,
        invoiceNumber: "NCIA" + Math.floor(100 + Math.random() * 900),
        projectName: bData.projectName || bData.clientName,
        projectNumber: bData.projectNumber || "PRJ-2026-008",
        clientName: bData.clientName,
        clientEmail: bData.clientEmail || "",
        clientPhone: bData.clientPhone || "",
        billTo: {
          name: bData.clientName,
          email: bData.clientEmail || "",
          phone: bData.clientPhone || "",
          gstin: "",
          address: "Pune, Maharashtra"
        },
        items: bData.items || defaultInvoiceForm.items,
        subtotal: bData.subtotal || bData.grandTotal,
        grandTotal: bData.grandTotal
      });
      setInvoiceViewMode("edit");
      setActiveTab("invoices");
    } else if (location.state?.openInvoice) {
      const invNumStr = String(location.state.openInvoice);
      const target = invoices.find((i) => i.invoiceNumber === invNumStr || i._id === invNumStr) || defaultInvoiceForm;
      setPdfInvoice(target);
      setIsPdfViewerOpen(true);
      setActiveTab("invoices");
    }
  }, [location.state, invoices]);

  // Recalculate invoice totals when items, discounts, or additional charges change
  const recalculateItems = (items, discountTotal = 0, additionalCharges = {}) => {
    let sub = 0;
    let gst = 0;
    const updatedItems = items.map((it) => {
      const qty = Number(it.quantity) || 1;
      const rate = Number(it.rate) || 0;
      const disc = Number(it.discount) || 0;
      const gPct = Number(it.gstPercent) || 0;
      const taxable = Math.max(0, rate * qty - disc);
      const gAmt = Math.round(taxable * (gPct / 100));
      const tot = taxable + gAmt;
      sub += rate * qty;
      gst += gAmt;
      return {
        ...it,
        gstAmount: gAmt,
        total: tot
      };
    });

    const chargesTotal =
      (Number(additionalCharges?.installation) || 0) +
      (Number(additionalCharges?.transportation) || 0) +
      (Number(additionalCharges?.design) || 0) +
      (Number(additionalCharges?.labour) || 0) +
      (Number(additionalCharges?.other) || 0);

    const netSubtotal = Math.max(0, sub - Number(discountTotal));
    const grand = netSubtotal + chargesTotal + gst;

    return {
      items: updatedItems,
      subtotal: sub,
      discountTotal: Number(discountTotal),
      additionalCharges: {
        ...additionalCharges,
        totalCharges: chargesTotal
      },
      gstTotal: gst,
      grandTotal: grand,
      balanceDue: grand
    };
  };

  // Update specific item field
  const handleItemChange = (idx, field, val) => {
    const newItems = [...editingInvoice.items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    const calced = recalculateItems(newItems, editingInvoice.discountTotal, editingInvoice.additionalCharges);
    setEditingInvoice((prev) => ({
      ...prev,
      items: calced.items,
      subtotal: calced.subtotal,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      balanceDue: calced.grandTotal
    }));
  };

  // Add new item line
  const handleAddItem = () => {
    const newItems = [
      ...editingInvoice.items,
      {
        productName: "Modular Furniture Component",
        category: "Interior",
        dimensions: "Custom",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "Unit",
        rate: 25000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 25000
      }
    ];
    const calced = recalculateItems(newItems, editingInvoice.discountTotal, editingInvoice.additionalCharges);
    setEditingInvoice((prev) => ({
      ...prev,
      items: calced.items,
      subtotal: calced.subtotal,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      balanceDue: calced.grandTotal
    }));
  };

  // Delete item line
  const handleDeleteItem = (idx) => {
    if (editingInvoice.items.length <= 1) {
      alert("Invoice must contain at least one item line.");
      return;
    }
    const newItems = editingInvoice.items.filter((_, i) => i !== idx);
    const calced = recalculateItems(newItems, editingInvoice.discountTotal, editingInvoice.additionalCharges);
    setEditingInvoice((prev) => ({
      ...prev,
      items: calced.items,
      subtotal: calced.subtotal,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      balanceDue: calced.grandTotal
    }));
  };

  // Open Edit Mode
  const handleOpenEdit = (inv) => {
    const items = inv.items && inv.items.length > 0 ? inv.items : defaultInvoiceForm.items;
    const calced = recalculateItems(items, inv.discountTotal || 0, inv.additionalCharges);
    setEditingInvoice({
      ...defaultInvoiceForm,
      ...inv,
      billTo: {
        name: inv.billTo?.name || inv.clientName || "",
        email: inv.billTo?.email || inv.clientEmail || "",
        phone: inv.billTo?.phone || inv.clientPhone || "",
        gstin: inv.billTo?.gstin || "",
        address: inv.billTo?.address || inv.clientAddress || ""
      },
      shipTo: {
        name: inv.shipTo?.name || "",
        email: inv.shipTo?.email || "",
        phone: inv.shipTo?.phone || "74104 10123",
        gstin: inv.shipTo?.gstin || "",
        address: inv.shipTo?.address || ""
      },
      items: calced.items,
      subtotal: calced.subtotal,
      discountTotal: calced.discountTotal,
      additionalCharges: calced.additionalCharges,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      balanceDue: calced.grandTotal
    });
    setInvoiceViewMode("edit");
  };

  // Open View Invoice Details Modal
  const handleOpenViewModal = (inv) => {
    setViewingInvoice(inv);
    setIsViewModalOpen(true);
  };

  // Open Select Client / Enquiry Modal before creating Invoice
  const handleOpenNewInvoice = () => {
    loadEnquiries();
    setEnquirySearchQuery("");
    setIsSelectEnquiryModalOpen(true);
  };

  // Start with Blank Invoice
  const handleStartBlankInvoice = () => {
    const invNum = `VLA-INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setEditingInvoice({
      ...defaultInvoiceForm,
      _id: null,
      invoiceNumber: invNum,
      issueDate: new Date().toISOString().split("T")[0]
    });
    setIsSelectEnquiryModalOpen(false);
    setInvoiceViewMode("edit");
  };

  // Select Enquiry from Enquiry Section to create Invoice
  const handleSelectEnquiryForInvoice = (enq) => {
    if (!enq) return;
    const invNum = `VLA-INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const cleanAddr = enq.siteAddress || enq.address || enq.siteLocation || enq.city || "Pune, Maharashtra";
    const projName = enq.name ? `${enq.name} - ${enq.projectSubtype || enq.projectType || "Interior Execution"}` : "Interior Turnkey Project";
    const projNum = enq.enquiryNo || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const estRate = typeof enq.estimatedValue === "number" && enq.estimatedValue > 0 ? enq.estimatedValue : 0;
    const initialItem = {
      productName: enq.projectSubtype ? `${enquirySubtypeTitle(enq)} Fitout & Execution` : "Turnkey Interior Design & Execution",
      category: enq.projectType || "Interior",
      dimensions: "As per Site Layout",
      hsnSac: "995476",
      quantity: 1,
      unit: "Unit",
      rate: estRate,
      discount: 0,
      gstPercent: 18,
      gstAmount: Math.round(estRate * 0.18),
      total: Math.round(estRate * 1.18)
    };

    const calced = recalculateItems([initialItem]);

    setEditingInvoice({
      ...defaultInvoiceForm,
      _id: null,
      invoiceNumber: invNum,
      projectName: projName,
      projectNumber: projNum,
      clientId: enq._id || enq.enquiryNo || "",
      clientName: enq.name || "",
      clientEmail: enq.email || "",
      clientPhone: enq.phone || "",
      clientAddress: cleanAddr,
      billTo: {
        name: enq.name || "",
        email: enq.email || "",
        phone: enq.phone || "",
        gstin: enq.gstNumber || "",
        address: cleanAddr
      },
      shipTo: {
        name: enq.name || "",
        email: enq.email || "",
        phone: enq.phone || "",
        gstin: enq.gstNumber || "",
        address: cleanAddr
      },
      sameAsBillTo: true,
      items: calced.items,
      subtotal: calced.subtotal,
      discountTotal: 0,
      additionalCharges: {
        installation: 0,
        transportation: 0,
        design: 0,
        labour: 0,
        other: 0,
        totalCharges: 0
      },
      taxPercent: 18,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      paidAmount: 0,
      balanceDue: calced.grandTotal,
      issueDate: new Date().toISOString().split("T")[0]
    });

    setIsSelectEnquiryModalOpen(false);
    setInvoiceViewMode("edit");
    setToastMsg(`Auto-filled details from enquiry for ${enq.name}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const enquirySubtypeTitle = (enq) => {
    return enq.projectSubtype || enq.projectType || "Interior";
  };

  // Dynamic Auto-fill Invoice Form from selected Client or BOQ Estimate
  const handleSelectClientOrBOQForInvoice = (val) => {
    if (!val) return;

    // Check if selecting an enquiry directly prefixed with enq_
    if (val.startsWith("enq_")) {
      const enqId = val.replace("enq_", "");
      const foundEnq = enquiriesList.find((e) => String(e._id) === String(enqId) || e.enquiryNo === enqId);
      if (foundEnq) {
        handleSelectEnquiryForInvoice(foundEnq);
        return;
      }
    }

    // Check if matches enquiry directly
    const foundEnquiryDirect = enquiriesList.find((e) => String(e._id) === String(val) || e.name === val || e.enquiryNo === val);
    if (foundEnquiryDirect) {
      handleSelectEnquiryForInvoice(foundEnquiryDirect);
      return;
    }

    // 1. Check if it matches a BOQ Estimate
    const foundBOQ = boqEstimates.find((b) => String(b._id) === String(val) || b.boqNumber === val);
    if (foundBOQ) {
      let items = [];
      if (foundBOQ.spaces && foundBOQ.spaces.length > 0) {
        foundBOQ.spaces.forEach((sp) => {
          if (sp.items && sp.items.length > 0) {
            sp.items.forEach((it) => {
              const lStr = it.lengthFt ? `${it.lengthFt}ft ${it.lengthIn || 0}in` : "";
              const hStr = it.heightFt ? `${it.heightFt}ft` : "";
              const dims = lStr && hStr ? `${lStr} × ${hStr}` : it.customDimensions || "Standard";
              items.push({
                productName: it.name || "Interior Component",
                category: sp.name || "Interior",
                dimensions: dims,
                hsnSac: "995476",
                quantity: Number(it.qty) || 1,
                unit: String(it.sqft || "1"),
                rate: Number(it.rate) || 0,
                discount: 0,
                gstPercent: 18,
                gstAmount: 0,
                total: it.amount || (Number(it.rate || 0) * Number(it.qty || 1))
              });
            });
          }
        });
      }

      if (items.length === 0) {
        items = [
          {
            productName: `Turnkey Interior Execution (${foundBOQ.activePackage || "Standard"} Package)`,
            category: "Turnkey Execution",
            dimensions: "Full Site Scope",
            hsnSac: "995476",
            quantity: 1,
            unit: "LS",
            rate: foundBOQ.subtotal || Math.round((foundBOQ.grandTotal || 0) / 1.18),
            discount: 0,
            gstPercent: 18,
            gstAmount: 0,
            total: foundBOQ.grandTotal || 0
          }
        ];
      }

      const calced = recalculateItems(items);
      const invNum = editingInvoice.invoiceNumber || `VLA-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      setEditingInvoice((prev) => ({
        ...prev,
        invoiceNumber: invNum,
        projectName: foundBOQ.clientName,
        projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientId: foundBOQ._id || foundBOQ.boqNumber,
        clientName: foundBOQ.clientName,
        clientEmail: foundBOQ.clientEmail || "",
        clientPhone: foundBOQ.clientPhone || "",
        clientAddress: foundBOQ.clientAddress || "Pune, Maharashtra",
        billTo: {
          name: foundBOQ.clientName,
          email: foundBOQ.clientEmail || "",
          phone: foundBOQ.clientPhone || "",
          gstin: "",
          address: foundBOQ.clientAddress || "Pune, Maharashtra"
        },
        shipTo: {
          name: foundBOQ.clientName,
          email: foundBOQ.clientEmail || "",
          phone: foundBOQ.clientPhone || "",
          gstin: "",
          address: foundBOQ.clientAddress || "Pune, Maharashtra"
        },
        items: calced.items,
        subtotal: calced.subtotal,
        gstTotal: calced.gstTotal,
        grandTotal: calced.grandTotal,
        balanceDue: calced.grandTotal
      }));

      setToastMsg(`Loaded invoice details from BOQ ${foundBOQ.boqNumber} (${foundBOQ.clientName})`);
      setTimeout(() => setToastMsg(""), 3000);
      return;
    }

    // 2. Check if it matches a Registered Client
    const foundClient = clientsList.find((c) => String(c._id) === String(val) || c.name === val || c.clientCode === val);

    if (foundClient) {
      const invNum = editingInvoice.invoiceNumber || `VLA-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setEditingInvoice((prev) => ({
        ...prev,
        invoiceNumber: invNum,
        projectName: foundClient.name,
        projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientId: foundClient._id || foundClient.clientCode || "VLA-CL-1001",
        clientName: foundClient.name,
        clientEmail: foundClient.email || foundClient.clientEmail || "",
        clientPhone: foundClient.phone || foundClient.clientPhone || "",
        clientAddress: foundClient.address || foundClient.clientAddress || "Pune, Maharashtra",
        billTo: {
          name: foundClient.name,
          email: foundClient.email || foundClient.clientEmail || "",
          phone: foundClient.phone || foundClient.clientPhone || "",
          gstin: foundClient.gstin || "",
          address: foundClient.address || foundClient.clientAddress || "Pune, Maharashtra"
        },
        shipTo: {
          name: foundClient.name,
          email: foundClient.email || foundClient.clientEmail || "",
          phone: foundClient.phone || foundClient.clientPhone || "",
          gstin: foundClient.gstin || "",
          address: foundClient.address || foundClient.clientAddress || "Pune, Maharashtra"
        }
      }));

      setToastMsg(`Loaded client info for ${foundClient.name}`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  // Save Invoice
  const handleSaveInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!editingInvoice.clientName) {
      alert("Please specify a Client Name for this invoice.");
      return;
    }
    const invNum = editingInvoice.invoiceNumber || `VLA-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceToSave = {
      ...editingInvoice,
      invoiceNumber: invNum,
      _id: editingInvoice._id || `inv_${Date.now()}`
    };

    try {
      if (editingInvoice._id && !String(editingInvoice._id).startsWith("inv_")) {
        await erpApi.updateInvoice(editingInvoice._id, invoiceToSave);
      } else {
        const res = await erpApi.createInvoice(invoiceToSave);
        if (res?.data?._id) {
          invoiceToSave._id = res.data._id;
        }
      }
    } catch (err) {
      console.warn("Backend save fallback to local storage:", err);
    }

    setInvoices((prev) => {
      const idx = prev.findIndex(
        (i) => i.invoiceNumber === invNum || (invoiceToSave._id && i._id === invoiceToSave._id)
      );
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = invoiceToSave;
      } else {
        updated = [invoiceToSave, ...prev];
      }
      localStorage.setItem("velora_local_invoices", JSON.stringify(updated));
      return updated;
    });

    setToastMsg(`Invoice ${invNum} saved successfully!`);
    setInvoiceViewMode("list");
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id, invNum) => {
    if (!window.confirm(`Delete Invoice ${invNum}?`)) return;
    try {
      if (id && !String(id).startsWith("inv_")) {
        await erpApi.deleteInvoice(id);
      }
    } catch (err) {
      console.warn("Backend delete invoice fallback:", err);
    }
    setInvoices((prev) => {
      const updated = prev.filter((i) => i.invoiceNumber !== invNum && i._id !== id);
      localStorage.setItem("velora_local_invoices", JSON.stringify(updated));
      return updated;
    });
    setToastMsg(`Invoice ${invNum} deleted.`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Open PDF Viewer Modal with explicit Mode ("tax" | "boq")
  const handleOpenPdfViewer = (inv, mode = "tax") => {
    setPdfInvoice(inv || editingInvoice);
    setPdfDocumentMode(mode);
    setActivePdfPage(1);
    setIsPdfViewerOpen(true);
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Filtered invoices for search
  const filteredInvoices = invoices.filter((inv) => {
    if (!invoiceSearch.trim()) return true;
    const term = invoiceSearch.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(term) ||
      inv.clientName?.toLowerCase().includes(term) ||
      inv.clientPhone?.toLowerCase().includes(term) ||
      inv.clientEmail?.toLowerCase().includes(term) ||
      inv.projectName?.toLowerCase().includes(term) ||
      inv.projectNumber?.toLowerCase().includes(term)
    );
  });

  // Filtered estimates for search
  const filteredEstimates = boqEstimates.filter((est) => {
    if (!estimateSearch.trim()) return true;
    const term = estimateSearch.toLowerCase();
    return (
      est.boqNumber?.toLowerCase().includes(term) ||
      est.enquiryNo?.toLowerCase().includes(term) ||
      est.clientName?.toLowerCase().includes(term) ||
      est.clientPhone?.toLowerCase().includes(term) ||
      est.clientEmail?.toLowerCase().includes(term) ||
      est.activePackage?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Tab Switcher & Navigation Header */}
      {invoiceViewMode === "list" && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                activeTab === "invoices"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Receipt size={14} />
              <span>Tax Invoices</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "invoices" ? "bg-blue-800 text-white" : "bg-stone-200 text-stone-700"}`}>
                {invoices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("estimates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                activeTab === "estimates"
                  ? "bg-[#D4AF37] text-stone-950 shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Client Estimates & Quotations (BOQ)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "estimates" ? "bg-amber-800 text-white" : "bg-stone-200 text-stone-700"}`}>
                {boqEstimates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("clients")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                activeTab === "clients"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <User size={14} />
              <span>All Clients Commercials</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "clients" ? "bg-stone-700 text-white" : "bg-stone-200 text-stone-700"}`}>
                {clientsList.length || boqEstimates.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "estimates" && (
              <button
                onClick={() => navigate("/boq")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-amber-200 text-[#9E7B1D] hover:bg-amber-50 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>New BOQ Estimate</span>
              </button>
            )}
            {activeTab === "invoices" && (
              <button
                onClick={handleOpenNewInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus size={13} />
                <span>New Invoice</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. INVOICE LIST VIEW (SCREENSHOT 1) */}
      {/* ========================================================================= */}
      {activeTab === "invoices" && invoiceViewMode === "list" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Top Bar matching Screenshot 1 */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            {/* Search Input on Left */}
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search by Name, Phone, Email"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="w-full pl-4 pr-9 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Right: Counter and Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-800">
                {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? "s" : ""}
              </span>

              <button
                onClick={() => exportAllInvoicesCsv(invoices)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition cursor-pointer"
                title="Export all invoice records as CSV / Excel data"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Export Data (CSV)</span>
              </button>

              <button
                onClick={handleOpenNewInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                  <Plus size={12} strokeWidth={3} />
                </div>
                <span>New Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoices Data Table matching Screenshot 1 */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/75 text-stone-600 font-bold border-b border-stone-200">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Billed To</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Tax (%)</th>
                    <th className="py-3 px-4 text-right">Due Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-stone-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                            <Receipt size={24} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-stone-800">
                              {invoiceSearch ? `No invoices match "${invoiceSearch}"` : "No Tax Invoices Yet"}
                            </h4>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {invoiceSearch
                                ? "Try searching for a different name, phone, or invoice number."
                                : "Create your first invoice by selecting a client from the Enquiry Section."}
                            </p>
                          </div>
                          {!invoiceSearch && (
                            <button
                              onClick={handleOpenNewInvoice}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer mt-2"
                            >
                              <Plus size={14} />
                              <span>Create Invoice from Enquiry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.invoiceNumber || inv._id}
                        className="hover:bg-stone-50/70 transition"
                      >
                        {/* Invoice No */}
                        <td className="py-3.5 px-4 font-bold text-stone-900 font-mono">
                          {inv.invoiceNumber}
                        </td>

                        {/* Billed To */}
                        <td className="py-3.5 px-4 font-semibold text-stone-800">
                          <div>
                            <span>{inv.clientName || inv.billTo?.name || "Client"}</span>
                            {inv.projectName && (
                              <span className="block text-[10px] text-stone-400 font-normal">
                                {inv.projectName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Invoice Date */}
                        <td className="py-3.5 px-4 text-stone-600">
                          {inv.issueDate
                            ? new Date(inv.issueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "-"}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-stone-400">
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "-"}
                        </td>

                        {/* Tax % */}
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {inv.taxPercent !== undefined ? `${inv.taxPercent}%` : "18%"}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3.5 px-4 text-right font-bold text-stone-900 font-mono">
                          ₹{(inv.grandTotal || inv.balanceDue || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Action Column: View, Preview, Download + Options */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="relative inline-flex items-center justify-center gap-1.5 flex-wrap">
                            {/* View Details Button */}
                            <button
                              onClick={() => handleOpenViewModal(inv)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] rounded-xl border border-stone-300 transition cursor-pointer shadow-2xs"
                              title="View Full Invoice Breakdown"
                            >
                              <Eye size={12} className="text-stone-700" />
                              <span>View</span>
                            </button>

                            {/* Preview Tax Invoice Button */}
                            <button
                              onClick={() => handleOpenPdfViewer(inv, "tax")}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl border border-blue-200 transition cursor-pointer shadow-2xs"
                              title="Preview Official Tax Invoice PDF Layout"
                            >
                              <FileText size={12} className="text-blue-600" />
                              <span>Preview</span>
                            </button>

                            {/* Download PDF Button */}
                            <button
                              onClick={() => downloadInvoicePdf(inv)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl border border-emerald-300 transition cursor-pointer shadow-2xs"
                              title="Download Tax Invoice PDF"
                            >
                              <Download size={12} className="text-emerald-600" />
                              <span>Download</span>
                            </button>

                            {/* Pencil Edit Icon */}
                            <button
                              onClick={() => handleOpenEdit(inv)}
                              className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-xl border border-stone-200 transition cursor-pointer"
                              title="Edit Invoice Details"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* 3-dots Menu Button */}
                            <button
                              onClick={() =>
                                setActiveDropdownId(
                                  activeDropdownId === inv.invoiceNumber ? null : inv.invoiceNumber
                                )
                              }
                              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-xl border border-stone-200 transition cursor-pointer"
                              title="More Options"
                            >
                              <MoreVertical size={13} />
                            </button>

                            {/* Rich Dropdown Menu */}
                            {activeDropdownId === inv.invoiceNumber && (
                              <div
                                className="absolute right-0 top-9 z-30 w-56 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 text-left animate-in fade-in zoom-in-95"
                                onMouseLeave={() => setActiveDropdownId(null)}
                              >
                                <div className="px-3 py-1 bg-stone-50 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                                  Format & Viewing Options
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleOpenPdfViewer(inv, "tax");
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Receipt size={13} className="text-blue-600" />
                                    <span>Preview Tax Invoice</span>
                                  </div>
                                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">GST</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleOpenPdfViewer(inv, "boq");
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 transition cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet size={13} className="text-[#9E7B1D]" />
                                    <span>Preview BOQ Estimate</span>
                                  </div>
                                  <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono">SCOPE</span>
                                </button>

                                <div className="my-1 border-t border-stone-100" />

                                <div className="px-3 py-1 bg-stone-50 border-b border-stone-100 text-[10px] font-black text-stone-400 uppercase tracking-wider">
                                  Export & Downloads
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    downloadInvoicePdf(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Download size={13} className="text-blue-600" />
                                  <span>Download Tax Invoice PDF</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    downloadBOQPdf(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Download size={13} className="text-[#9E7B1D]" />
                                  <span>Download BOQ Estimate PDF</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    exportInvoiceCsv(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <FileSpreadsheet size={13} className="text-emerald-600" />
                                  <span>Export Data (CSV)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handlePrint();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Printer size={13} className="text-stone-600" />
                                  <span>Print Document</span>
                                </button>

                                <div className="my-1 border-t border-stone-100" />

                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleOpenEdit(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Edit2 size={13} className="text-stone-500" />
                                  <span>Edit Invoice Details</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleDeleteInvoice(inv._id, inv.invoiceNumber);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete Invoice</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="p-4 border-t border-stone-200 flex flex-wrap items-center justify-end gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select className="border border-stone-300 rounded px-1.5 py-0.5 bg-white text-stone-700 font-bold focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <span>1 - {filteredInvoices.length} of {filteredInvoices.length}</span>

              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="p-1 rounded text-stone-300 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled
                  className="p-1 rounded text-stone-300 hover:bg-stone-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT / CREATE INVOICE VIEW (SCREENSHOTS 3 & 4) */}
      {/* ========================================================================= */}
      {activeTab === "invoices" && invoiceViewMode === "edit" && (
        <form onSubmit={handleSaveInvoice} className="space-y-6 animate-in fade-in">
          {/* Executive Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInvoiceViewMode("list")}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl transition text-stone-700 cursor-pointer border border-stone-200"
                title="Back to Invoices"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  {editingInvoice._id ? `Edit Invoice (${editingInvoice.invoiceNumber})` : "Create New Tax Invoice"}
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  Velora Antaraal • Connected Enquiry &rarr; Client 360° &rarr; BOQ &rarr; Tax Invoice
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPdfViewer(editingInvoice, "tax")}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Preview Official Tax Invoice PDF Format"
              >
                <Receipt size={14} className="text-blue-600" />
                <span>Preview Invoice</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Save & Issue Invoice</span>
              </button>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 8 Cols on Desktop */}
            <div className="lg:col-span-8 space-y-6">
              {/* Invoice Metadata & Parties Card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <h3 className="font-extrabold text-base text-stone-900">Tax Invoice Master File</h3>
                  
                  {/* Clean Client Quick-Select Dropdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        loadEnquiries();
                        setIsSelectEnquiryModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer shadow-2xs"
                    >
                      <User size={13} />
                      <span>Select from Enquiry Section</span>
                    </button>

                    <select
                      value={editingInvoice.clientId || ""}
                      onChange={(e) => handleSelectClientOrBOQForInvoice(e.target.value)}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-900 cursor-pointer"
                    >
                      <option value="">-- Quick Pick Client / Lead --</option>
                      {enquiriesList.length > 0 && (
                        <optgroup label="📋 Enquiries (From Enquiry Section)">
                          {enquiriesList.map((enq) => (
                            <option key={enq._id || enq.enquiryNo} value={`enq_${enq._id || enq.enquiryNo}`}>
                              {enq.name} ({enq.phone || "No phone"}) • {enq.projectSubtype || enq.projectType || "Enquiry"}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="📐 Existing BOQ Estimates">
                        {boqEstimates.map((b) => (
                          <option key={b._id || b.boqNumber} value={b._id || b.boqNumber}>
                            {b.boqNumber} • {b.clientName} (₹{(b.grandTotal || 0).toLocaleString("en-IN")})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="👥 Registered Clients">
                        {clientsList.map((c, idx) => (
                          <option key={c._id || idx} value={c._id || c.name}>
                            {c.name} ({c.phone || c.clientPhone || "Registered Client"})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Top 4 Metadata Tags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <span className="block text-[11px] text-stone-400 font-semibold mb-1">
                      Project Name
                    </span>
                    <input
                      type="text"
                      value={editingInvoice.projectName}
                      onChange={(e) =>
                        setEditingInvoice({ ...editingInvoice, projectName: e.target.value })
                      }
                      className="w-full font-bold text-stone-900 text-xs bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-stone-400 font-semibold mb-1">
                      Project Number
                    </span>
                    <input
                      type="text"
                      value={editingInvoice.projectNumber}
                      onChange={(e) =>
                        setEditingInvoice({ ...editingInvoice, projectNumber: e.target.value })
                      }
                      className="w-full font-bold text-stone-900 text-xs bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-stone-400 font-semibold mb-1">
                      Invoice Type
                    </span>
                    <select
                      value={editingInvoice.invoiceType || "Supply"}
                      onChange={(e) =>
                        setEditingInvoice({ ...editingInvoice, invoiceType: e.target.value })
                      }
                      className="w-full font-bold text-stone-900 text-xs bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="Supply">Supply</option>
                      <option value="Service">Service</option>
                      <option value="Turnkey Execution">Turnkey Execution</option>
                      <option value="Civil Work">Civil Work</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] text-stone-400 font-semibold mb-1">
                      Invoice Number
                    </span>
                    <input
                      type="text"
                      value={editingInvoice.invoiceNumber}
                      onChange={(e) =>
                        setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })
                      }
                      className="w-full font-bold text-stone-900 text-xs bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bill To (User Details) */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-stone-900">
                    Bill To (User Details)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">
                        Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingInvoice.billTo.name}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            clientName: e.target.value,
                            billTo: { ...editingInvoice.billTo, name: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingInvoice.billTo.email}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            clientEmail: e.target.value,
                            billTo: { ...editingInvoice.billTo, email: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">
                        Phone<span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                        <div className="flex items-center gap-1 px-2.5 py-2 bg-stone-50 border-r border-stone-200 text-xs text-stone-700 font-bold">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={editingInvoice.billTo.phone}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              clientPhone: e.target.value,
                              billTo: { ...editingInvoice.billTo, phone: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-xs text-stone-900 focus:outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium mb-1">
                        <span>GST number</span>
                        <Info size={12} className="text-stone-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter GST number"
                        value={editingInvoice.billTo.gstin}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            billTo: { ...editingInvoice.billTo, gstin: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 font-medium mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editingInvoice.billTo.address}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            clientAddress: e.target.value,
                            billTo: { ...editingInvoice.billTo, address: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Apply same details checkbox */}
                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                      <input
                        type="checkbox"
                        checked={editingInvoice.sameAsBillTo}
                        onChange={(e) =>
                          setEditingInvoice({
                            ...editingInvoice,
                            sameAsBillTo: e.target.checked
                          })
                        }
                        className="rounded text-blue-500 focus:ring-blue-400 w-4 h-4 cursor-pointer"
                      />
                      <span>Apply same details to ship to</span>
                    </label>
                  </div>
                </div>

                {/* Ship To (User Details) */}
                {!editingInvoice.sameAsBillTo && (
                  <div className="space-y-4 pt-4 border-t border-stone-100 animate-in fade-in">
                    <h4 className="font-extrabold text-xs text-stone-900">
                      Ship To (User Details)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] text-stone-600 font-medium mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={editingInvoice.shipTo.name}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              shipTo: { ...editingInvoice.shipTo, name: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 font-medium mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="Enter email"
                          value={editingInvoice.shipTo.email}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              shipTo: { ...editingInvoice.shipTo, email: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 font-medium mb-1">
                          Phone
                        </label>
                        <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                          <div className="flex items-center gap-1 px-2.5 py-2 bg-stone-50 border-r border-stone-200 text-xs text-stone-700 font-bold">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="text"
                            value={editingInvoice.shipTo.phone}
                            onChange={(e) =>
                              setEditingInvoice({
                                ...editingInvoice,
                                shipTo: { ...editingInvoice.shipTo, phone: e.target.value }
                              })
                            }
                            className="w-full px-3 py-2 text-xs text-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium mb-1">
                          <span>GST number</span>
                          <Info size={12} className="text-stone-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter GST number"
                          value={editingInvoice.shipTo.gstin}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              shipTo: { ...editingInvoice.shipTo, gstin: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-600 font-medium mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          placeholder="Enter address"
                          value={editingInvoice.shipTo.address}
                          onChange={(e) =>
                            setEditingInvoice({
                              ...editingInvoice,
                              shipTo: { ...editingInvoice.shipTo, address: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Items Card (Screenshots 3 & 4) */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900">Invoice Items</h3>
                    <span className="text-xs font-bold text-stone-600 mt-1 block">
                      {editingInvoice.invoiceType || "Supply"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50/75 text-stone-600 font-bold border-b border-stone-200">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-2">HSN/SAC</th>
                        <th className="py-2.5 px-2 text-center">Quantity</th>
                        <th className="py-2.5 px-2 text-center">Unit</th>
                        <th className="py-2.5 px-2 text-right">Rate</th>
                        <th className="py-2.5 px-2 text-center">GST(%)</th>
                        <th className="py-2.5 px-2 text-right">GST(₹)</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {editingInvoice.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          {/* Product Name */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={it.productName}
                              onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                              className="w-full min-w-[170px] px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-900 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* HSN/SAC */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={it.hsnSac || "HSN/SAC"}
                              onChange={(e) => handleItemChange(idx, "hsnSac", e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, "quantity", Number(e.target.value))
                              }
                              className="w-14 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-center font-bold text-stone-900 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* Unit */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="text"
                              value={it.unit || "1"}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-14 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-center text-stone-700 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* Rate */}
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              value={it.rate}
                              onChange={(e) =>
                                handleItemChange(idx, "rate", Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-right font-mono font-bold text-stone-900 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* GST (%) */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={28}
                              value={it.gstPercent || 0}
                              onChange={(e) =>
                                handleItemChange(idx, "gstPercent", Number(e.target.value))
                              }
                              className="w-14 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-center text-stone-700 focus:outline-none focus:border-blue-400"
                            />
                          </td>

                          {/* GST (₹) */}
                          <td className="py-2 px-2 text-right font-mono text-stone-600">
                            ₹{(it.gstAmount || 0).toLocaleString("en-IN")}
                          </td>

                          {/* Total */}
                          <td className="py-2 px-3 text-right font-bold text-stone-900 font-mono">
                            ₹{(it.total || 0).toLocaleString("en-IN")}
                          </td>

                          {/* Delete Action */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Cols on Desktop (Screenshot 3) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Invoice Details Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-sm text-stone-900">Invoice Details</h4>

                <div>
                  <label className="block text-[11px] text-stone-600 font-medium mb-1">
                    Invoice Date<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editingInvoice.issueDate}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, issueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editingInvoice.dueDate}
                    onChange={(e) =>
                      setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Invoice Amount Details Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <h4 className="font-extrabold text-sm text-stone-900">
                  Invoice Amount Details
                </h4>

                <div className="flex justify-between text-xs text-stone-600 pt-1">
                  <span>Sub Total</span>
                  <span className="font-bold text-stone-900 font-mono">
                    ₹{(editingInvoice.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-stone-600">
                  <span>GST Amount</span>
                  <span className="font-bold text-stone-900 font-mono">
                    ₹{(editingInvoice.gstTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Dark Navy Total Amount Highlight Banner matching Screenshot 3 */}
                <div className="p-3 bg-[#0A1128] text-white rounded-xl flex items-center justify-between font-extrabold text-sm mt-2 shadow-xs">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">
                    ₹{(editingInvoice.grandTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions Card */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-xs text-stone-800">Terms & Conditions</h4>
                <textarea
                  rows={4}
                  value={editingInvoice.termsAndConditions}
                  onChange={(e) =>
                    setEditingInvoice({ ...editingInvoice, termsAndConditions: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Bank Details & Payment Instructions */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-xs text-stone-800">
                  Bank Details & Payment Instructions
                </h4>
                <textarea
                  rows={4}
                  value={editingInvoice.bankDetails}
                  onChange={(e) =>
                    setEditingInvoice({ ...editingInvoice, bankDetails: e.target.value })
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-700 font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Bottom Actions Card */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceViewMode("list")}
                  className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 transition cursor-pointer"
                >
                  Back to Invoices
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPdfViewer(editingInvoice, "tax")}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Receipt size={14} />
                  <span>Tax Invoice Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPdfViewer(editingInvoice, "boq")}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet size={14} />
                  <span>BOQ Scope Preview</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Invoice
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. PDF VIEWER MODAL WITH PROMINENT TAX VS BOQ OPTIONS */}
      {/* ========================================================================= */}
      {isPdfViewerOpen && pdfInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-6xl h-[92vh] bg-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-stone-700">
            {/* Modal Header with High Visibility Format Selector Bar */}
            <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-700 flex items-center justify-between text-white flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-blue-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm tracking-wide">Document PDF Viewer</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-amber-400 font-mono font-bold">
                      {pdfInvoice.invoiceNumber || pdfInvoice.boqNumber || "NCIA003"}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium block">
                    {pdfInvoice.clientName} • {pdfInvoice.projectName || "Residence Project"}
                  </span>
                </div>
              </div>

              {/* HIGHLY VISIBLE DUAL FORMAT SWITCHER BAR */}
              <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 shadow-inner">
                <span className="text-[10px] text-stone-400 font-bold px-2 uppercase tracking-wider hidden md:inline">Format Mode:</span>
                <button
                  type="button"
                  onClick={() => setPdfDocumentMode("tax")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    pdfDocumentMode === "tax"
                      ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  }`}
                >
                  <Receipt size={15} />
                  <span>📜 Tax Invoice (GST)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfDocumentMode("boq")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    pdfDocumentMode === "boq"
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 shadow-lg ring-2 ring-amber-300"
                      : "text-stone-400 hover:text-white hover:bg-stone-800"
                  }`}
                >
                  <FileSpreadsheet size={15} />
                  <span>📋 BOQ Estimate Scope</span>
                </button>
              </div>

              <button
                onClick={() => setIsPdfViewerOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Left Thumbnail Bar + Center Document Canvas */}
            <div className="flex-1 overflow-hidden flex bg-stone-900">
              {/* Left Sidebar Thumbnail Pane */}
              <div className="w-48 bg-stone-950 border-r border-stone-800 p-4 space-y-4 overflow-y-auto hidden sm:block select-none">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Document Preview ({pdfDocumentMode === "tax" ? "Tax Invoice" : "BOQ Scope"})
                </div>
                {[1, 2, 3].map((pageNum) => (
                  <div
                    key={pageNum}
                    onClick={() => setActivePdfPage(pageNum)}
                    className={`cursor-pointer transition rounded-xl p-1 text-center ${
                      activePdfPage === pageNum
                        ? "ring-2 ring-amber-500 bg-stone-800/80"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="w-full h-44 bg-white rounded-lg shadow-inner p-2.5 overflow-hidden text-[5px] text-stone-600 leading-tight">
                      <div className="border-b border-amber-500 pb-1 mb-1 font-bold text-[6px] text-amber-700">
                        {pdfDocumentMode === "tax" ? "TAX INVOICE - VELORA" : "BOQ ESTIMATE - VELORA"}
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-stone-300 rounded w-3/4" />
                        <div className="h-1 bg-stone-200 rounded w-1/2" />
                        <div className={`h-4 border rounded ${pdfDocumentMode === "tax" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`} />
                        <div className="space-y-0.5 pt-2">
                          <div className="h-1 bg-stone-200 rounded" />
                          <div className="h-1 bg-stone-200 rounded" />
                          <div className="h-1 bg-stone-200 rounded" />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 font-bold block mt-1.5">
                      Page {pageNum}
                    </span>
                  </div>
                ))}
              </div>

              {/* Main Document Canvas */}
              <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-stone-800">
                {pdfDocumentMode === "tax" ? (
                  /* ========================================================================= */
                  /* A. TAX INVOICE CANVAS LAYOUT (Composition Scheme / GST / Legal) */
                  /* ========================================================================= */
                  <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-8 space-y-6 text-stone-800 font-sans animate-in fade-in">
                    {/* Document Header */}
                    <div className="flex items-start justify-between gap-6 border-b border-stone-200 pb-4">
                      {/* Left: Brand Name & Logo */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-stone-950 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-black text-xs shadow-xs p-2 text-center leading-tight">
                          VELORA
                        </div>
                        <div>
                          <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                            <span>VELORA LUXURY INTERIORS</span>
                          </h1>
                          <span className="text-[10px] text-stone-500 font-medium block">
                            Bespoke Designs • Turnkey Interior Solutions
                          </span>
                        </div>
                      </div>

                      {/* Right: TAX INVOICE Title & E-Invoice Table */}
                      <div className="text-right space-y-2">
                        <h2 className="text-lg font-black text-amber-700 tracking-wide">
                          TAX INVOICE
                        </h2>

                        <div className="border border-stone-900 text-left text-[11px] rounded overflow-hidden">
                          <div className="bg-stone-900 text-amber-400 font-bold text-center py-0.5 text-[10px]">
                            Original For Recipient
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-stone-200 border-b border-stone-200">
                            <span className="px-2 py-1 text-stone-500 font-medium">
                              E-INVOICE NO
                            </span>
                            <span className="px-2 py-1 font-bold text-stone-900 font-mono">
                              {pdfInvoice.invoiceNumber || "NCIA003"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-stone-200">
                            <span className="px-2 py-1 text-stone-500 font-medium">
                              INVOICE DATE
                            </span>
                            <span className="px-2 py-1 font-bold text-stone-900">
                              {pdfInvoice.issueDate
                                ? new Date(pdfInvoice.issueDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })
                                : "13 Aug, 2026"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Info Table: INVOICE FROM vs PROJECT INFORMATION */}
                    <div className="grid grid-cols-2 border border-stone-900 rounded overflow-hidden text-[10.5px]">
                      {/* INVOICE FROM */}
                      <div className="border-r border-stone-900">
                        <div className="bg-stone-900 text-amber-400 font-bold px-3 py-1 text-[11px]">
                          INVOICE FROM
                        </div>
                        <div className="p-3 space-y-1 text-stone-700">
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">LEGAL NAME</span>
                            <span className="col-span-2 font-bold text-stone-900">
                              VELORA LUXURY INTERIORS
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">GST NO</span>
                            <span className="col-span-2 font-mono">27CHCPS9945R1Z4</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">PAN NO</span>
                            <span className="col-span-2 font-mono">CHCPS9945R</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">STATE</span>
                            <span className="col-span-2">Maharashtra (27)</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">EMAIL</span>
                            <span className="col-span-2 text-stone-900 font-medium">
                              info@veloraluxury.com
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">CONTACT NO</span>
                            <span className="col-span-2">8055526603</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">ADDRESS</span>
                            <span className="col-span-2">
                              Hinjawadi Wakad Chowk, Wakad, Pune, Maharashtra 411057
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* PROJECT INFORMATION */}
                      <div>
                        <div className="bg-stone-900 text-amber-400 font-bold px-3 py-1 text-[11px]">
                          PROJECT INFORMATION
                        </div>
                        <div className="p-3 space-y-1 text-stone-700">
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">PROJECT NAME</span>
                            <span className="col-span-2 font-bold text-stone-900">
                              {pdfInvoice.projectName || pdfInvoice.clientName || "PREM SHUKLA"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">PROJECT (PID)</span>
                            <span className="col-span-2 font-bold text-stone-900 font-mono">
                              {pdfInvoice.projectNumber || "PRJ-2026-008"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">INVOICE TYPE</span>
                            <span className="col-span-2">{pdfInvoice.invoiceType || "Supply & Turnkey"}</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">PLACE OF SUPPLY</span>
                            <span className="col-span-2">Maharashtra (27)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Parties Table: Details of Receiver vs Consignee */}
                    <div className="grid grid-cols-2 border border-stone-900 rounded overflow-hidden text-[10.5px]">
                      {/* Details of Receiver (Bill to) */}
                      <div className="border-r border-stone-900">
                        <div className="bg-stone-900 text-amber-400 font-bold px-3 py-1 text-[11px]">
                          Details of Receiver (Bill to)
                        </div>
                        <div className="p-3 space-y-1 text-stone-700">
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">CLIENT NAME</span>
                            <span className="col-span-2 font-bold text-stone-900">
                              {pdfInvoice.billTo?.name || pdfInvoice.clientName || "PREM SHUKLA"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">CONTACT NO</span>
                            <span className="col-span-2">
                              {pdfInvoice.billTo?.phone || pdfInvoice.clientPhone || "+91 78000 20496"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">ADDRESS</span>
                            <span className="col-span-2">
                              {pdfInvoice.billTo?.address || pdfInvoice.clientAddress || "402, WAKAD CHOWK, PUNE"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">EMAIL</span>
                            <span className="col-span-2">
                              {pdfInvoice.billTo?.email || pdfInvoice.clientEmail || "PREMSHUKLA@GMAIL.COM"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details of Consignee (Ship to) */}
                      <div>
                        <div className="bg-stone-900 text-amber-400 font-bold px-3 py-1 text-[11px]">
                          Details of Consignee (Ship to)
                        </div>
                        <div className="p-3 space-y-1 text-stone-700">
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">CLIENT NAME</span>
                            <span className="col-span-2 font-bold text-stone-900">
                              {pdfInvoice.shipTo?.name || (pdfInvoice.sameAsBillTo ? pdfInvoice.clientName : "-")}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">CONTACT NO</span>
                            <span className="col-span-2">
                              {pdfInvoice.shipTo?.phone || (pdfInvoice.sameAsBillTo ? pdfInvoice.clientPhone : "-")}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">ADDRESS</span>
                            <span className="col-span-2">
                              {pdfInvoice.shipTo?.address || (pdfInvoice.sameAsBillTo ? pdfInvoice.clientAddress : "-")}
                            </span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-semibold text-stone-500">EMAIL</span>
                            <span className="col-span-2">
                              {pdfInvoice.shipTo?.email || (pdfInvoice.sameAsBillTo ? pdfInvoice.clientEmail : "-")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items Table matching Tax Layout */}
                    <div className="border border-stone-900 rounded overflow-hidden">
                      <table className="w-full text-left text-[10.5px] border-collapse">
                        <thead>
                          <tr className="bg-blue-600 text-white font-bold">
                            <th className="py-1.5 px-2 text-center">SL.NO</th>
                            <th className="py-1.5 px-3">PRODUCT/SERVICE NAME</th>
                            <th className="py-1.5 px-2 text-center">HSN/SAC</th>
                            <th className="py-1.5 px-2 text-center">UOM</th>
                            <th className="py-1.5 px-2 text-center">QTY</th>
                            <th className="py-1.5 px-2 text-right">UNIT RATE</th>
                            <th className="py-1.5 px-2 text-center">TAX RATIO (%)</th>
                            <th className="py-1.5 px-3 text-right">TAXABLE AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-800">
                          {((pdfInvoice.items && pdfInvoice.items.length > 0) ? pdfInvoice.items : [
                            { productName: "Queen Size Bed, With Cushion", hsnSac: "995476", uom: "30", quantity: 1, rate: 36000, total: 36000 },
                            { productName: "King Size Bed Hydrolic", hsnSac: "995476", uom: "45.5", quantity: 1, rate: 64000, total: 64000 },
                            { productName: "Openable Wardrobe 1", hsnSac: "995476", uom: "42.5", quantity: 1, rate: 55000, total: 55000 },
                            { productName: "Openable Wardrobe 2, Study Table", hsnSac: "995476", uom: "59.5, 2'", quantity: 1, rate: 71400, total: 71400 },
                            { productName: "Openable Wardrobe 3, Study Table", hsnSac: "995476", uom: "34", quantity: 1, rate: 40800, total: 40800 },
                            { productName: "Study Table", hsnSac: "995476", uom: "56", quantity: 1, rate: 67200, total: 67200 },
                            { productName: "Side Table", hsnSac: "995476", uom: "1.96", quantity: 4, rate: 5500, total: 22000 },
                            { productName: "Dressing", hsnSac: "995476", uom: "-", quantity: 3, rate: 21000, total: 63000 },
                            { productName: "Shoe Rack , With Side Sitting", hsnSac: "995476", uom: "12", quantity: 1, rate: 14400, total: 14400 },
                            { productName: "Dinning Table", hsnSac: "995476", uom: "-", quantity: 1, rate: 35000, total: 35000 }
                          ]).map((it, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                              <td className="py-1.5 px-2 text-center text-stone-500 font-bold">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-semibold">{it.productName || it.description}</td>
                              <td className="py-1.5 px-2 text-center text-stone-500">{it.hsnSac || "995476"}</td>
                              <td className="py-1.5 px-2 text-center">{it.uom || it.unit || "-"}</td>
                              <td className="py-1.5 px-2 text-center font-bold">{it.quantity || 1}</td>
                              <td className="py-1.5 px-2 text-right font-mono">
                                ₹{(it.rate || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-1.5 px-2 text-center">{it.gstPercent || 0}%</td>
                              <td className="py-1.5 px-3 text-right font-bold font-mono">
                                ₹{(it.total || (it.rate * (it.quantity || 1))).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-stone-300 font-bold">
                            <td colSpan={7} className="py-1.5 px-3 text-right">Sub Total Amount</td>
                            <td className="py-1.5 px-3 text-right font-mono">
                              ₹{(pdfInvoice.subtotal || pdfInvoice.grandTotal || 468800).toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="font-bold">
                            <td colSpan={7} className="py-1.5 px-3 text-right">Total Tax</td>
                            <td className="py-1.5 px-3 text-right font-mono">
                              ₹{(pdfInvoice.gstTotal || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr className="bg-blue-600 text-white font-extrabold">
                            <td colSpan={7} className="py-2 px-3 text-right">Grand Total Amount</td>
                            <td className="py-2 px-3 text-right font-mono text-xs">
                              ₹{(pdfInvoice.grandTotal || 468800).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Total Invoice Amount In Words Row */}
                    <div className="grid grid-cols-3 border border-stone-300 text-[10.5px] rounded overflow-hidden">
                      <div className="bg-stone-200 text-stone-900 font-bold px-3 py-1.5">
                        Total Invoice Amount In Words
                      </div>
                      <div className="col-span-2 px-3 py-1.5 font-bold text-stone-900">
                        Four Lakh Sixty Eight Thousand Eight Hundred Rupees Only
                      </div>
                    </div>

                    {/* BANK DETAILS & PAYMENT INSTRUCTIONS */}
                    <div className="border border-stone-900 rounded overflow-hidden text-[10.5px]">
                      <div className="bg-blue-600 text-white font-bold px-3 py-1 text-[11px]">
                        BANK DETAILS & PAYMENT INSTRUCTIONS
                      </div>
                      <div className="p-3 space-y-1 text-stone-800">
                        <p><strong>Account Holder:</strong> VELORA LUXURY INTERIORS</p>
                        <p><strong>Account Number:</strong> 50200073374185</p>
                        <p><strong>IFSC:</strong> HDFC0000223 | <strong>Branch:</strong> WAKAD / PASHAN</p>
                        <p><strong>Account Type:</strong> Current Account</p>
                      </div>
                    </div>

                    {/* Notes Box */}
                    <div className="border border-stone-900 rounded overflow-hidden text-[10.5px]">
                      <div className="bg-blue-600 text-white font-bold px-3 py-1 text-[11px]">
                        Notes
                      </div>
                      <div className="p-2 text-stone-800 font-medium">
                        Registered under Composition Taxable scheme. Not eligible to collect tax on supplies.
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="border border-stone-900 rounded overflow-hidden text-[10px] space-y-2 p-3 text-stone-700 leading-relaxed">
                      <div className="bg-blue-600 text-white font-bold -mx-3 -mt-3 p-2 text-[11px]">
                        Terms & Conditions - For Interior Design & Turnkey Execution Services
                      </div>
                      <p><strong>1. Scope of Work:</strong> The scope of work includes interior design consultancy, space planning, material selection, 2D/3D drawings, furniture design, civil work, electrical work, false ceiling, modular furniture, décor assistance, site supervision, and turnkey execution as mutually agreed in the final quotation/work order. Any work outside the approved quotation shall be treated as additional work and billed separately.</p>
                      <p><strong>2. Design Process:</strong> 1. Initial consultation & requirement discussion. 2. Concept design and layout planning. 3. Material and finish selection. 4. Final design approval. 5. Execution and site coordination. 6. Project handover. Design revisions beyond agreed number may attract additional charges.</p>
                      <p><strong>3. Quotation & Pricing:</strong> All quotations are valid for 15 days from issue date. Prices based on current market rates. Any increase in material cost, taxes, transport or vendor pricing after quotation approval may lead to revised costing.</p>
                      <p><strong>4. Payment Terms:</strong> 10% Advance – Booking & Design Initiation; 40% – Before Production/Execution; 40% – During Execution Stage; 10% – Before Final Handover. All payments must be made as per agreed timelines.</p>
                    </div>

                    {/* Signatures & Seal Box */}
                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between text-xs text-stone-900 font-medium">
                        <span>Client Signature: _______________________</span>
                        <span>Date: _________________</span>
                      </div>

                      <div className="border border-stone-300 rounded-xl p-3 flex justify-between items-center bg-stone-50">
                        <div>
                          <span className="font-bold text-stone-900 text-xs block">Authorized Signatory</span>
                          <span className="font-black text-blue-900 text-sm block">VELORA LUXURY INTERIORS</span>
                          <span className="text-[10px] text-stone-500 italic block">Bespoke Designs • Turnkey Execution</span>
                        </div>
                        <div className="w-36 h-16 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center text-[10px] text-stone-400 font-bold text-center px-2">
                          Authorised Common seal
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-stone-400 border-t border-stone-200 pt-2 font-medium">
                        This is a computer generated invoice, Hence no signature is required.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========================================================================= */
                  /* B. BOQ ESTIMATE CANVAS LAYOUT (Space-by-Space / Scope Breakdown) */
                  /* ========================================================================= */
                  <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-8 space-y-6 text-stone-800 font-sans animate-in fade-in">
                    {/* BOQ Header */}
                    <div className="flex items-start justify-between gap-6 border-b border-amber-400 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-stone-950 border border-amber-500 rounded-xl flex items-center justify-center text-amber-400 font-black text-xs shadow-xs p-2 text-center leading-tight">
                          VELORA
                        </div>
                        <div>
                          <h1 className="text-xl font-black text-amber-900 tracking-tight flex items-center gap-2">
                            <span>VELORA LUXURY INTERIORS</span>
                          </h1>
                          <span className="text-[10px] text-stone-500 font-medium block">
                            Bespoke Designs • Premium Materials • Flawless Execution
                          </span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <h2 className="text-lg font-black text-[#9E7B1D] tracking-wide uppercase">
                          PROJECT ESTIMATE & QUOTATION
                        </h2>
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                          Ref: {pdfInvoice.boqNumber || pdfInvoice.invoiceNumber || "BOQ-2026-018"}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="grid grid-cols-2 bg-stone-50 border border-amber-200 rounded-xl p-4 text-[11px] gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Client Details</span>
                        <p className="font-bold text-stone-900 text-xs">{pdfInvoice.clientName || "VALUED CLIENT"}</p>
                        <p className="text-stone-600">{pdfInvoice.clientPhone || "+91 78000 20496"}</p>
                        <p className="text-stone-600">{pdfInvoice.clientEmail || "client@example.com"}</p>
                        <p className="text-stone-500 text-[10px]">{pdfInvoice.clientAddress || "Pune, Maharashtra"}</p>
                      </div>

                      <div className="space-y-1 text-right">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Commercial Scope Details</span>
                        <p><strong>Package Specification:</strong> <span className="font-bold text-amber-900">{pdfInvoice.activePackage || "Standard"} Tier</span></p>
                        <p><strong>Date of Issue:</strong> {new Date().toLocaleDateString("en-IN")}</p>
                        <p><strong>Prepared By:</strong> Senior Interior Architect</p>
                        <p><strong>Turnkey Status:</strong> Approved BOQ Estimate</p>
                      </div>
                    </div>

                    {/* Spaces & Items Scope Breakdown Table */}
                    <div className="space-y-4">
                      <div className="border-b border-stone-300 pb-1">
                        <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wide">
                          Space-by-Space Itemized Component Scope
                        </h3>
                      </div>

                      <div className="border border-stone-800 rounded-xl overflow-hidden text-[10.5px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-stone-900 text-amber-400 font-bold">
                              <th className="py-2 px-3">ITEM / COMPONENT NAME</th>
                              <th className="py-2 px-2">MATERIAL / SPEC</th>
                              <th className="py-2 px-2 text-center">SIZE / DIMENSIONS</th>
                              <th className="py-2 px-2 text-center">QTY</th>
                              <th className="py-2 px-2 text-right">RATE (₹)</th>
                              <th className="py-2 px-3 text-right">TOTAL AMOUNT (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 text-stone-800">
                            {((pdfInvoice.items && pdfInvoice.items.length > 0) ? pdfInvoice.items : [
                              { productName: "Master Bedroom Full Woodwork & Fitout", category: "Bedroom", dimensions: "6.5 × 6.5 ft", quantity: 1, rate: 195000, total: 195000 },
                              { productName: "Living Room TV Unit & Louver Panelling", category: "Living", dimensions: "10.0 × 8.0 ft", quantity: 1, rate: 125000, total: 125000 },
                              { productName: "Modular Kitchen Acrylic & Quartz Counter", category: "Kitchen", dimensions: "L-Shape 14ft", quantity: 1, rate: 148800, total: 148800 }
                            ]).map((it, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                                <td className="py-2 px-3 font-semibold text-stone-900">{it.productName || it.name}</td>
                                <td className="py-2 px-2 text-stone-600">{it.category || it.typeVariant || "Standard"}</td>
                                <td className="py-2 px-2 text-center font-mono text-[10px]">{it.dimensions || "-"}</td>
                                <td className="py-2 px-2 text-center font-bold">{it.quantity || it.qty || 1}</td>
                                <td className="py-2 px-2 text-right font-mono">₹{(it.rate || 0).toLocaleString("en-IN")}</td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">₹{(it.total || (it.rate * (it.quantity || 1))).toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Commercial Summary Box */}
                    <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <span className="font-extrabold text-[#9E7B1D] block">BOQ COMMERCIAL SUMMARY</span>
                        <p className="text-[11px] text-stone-600">Subtotal Excl. GST: ₹{Math.round((pdfInvoice.grandTotal || 468800) / 1.18).toLocaleString("en-IN")}</p>
                        <p className="text-[11px] text-stone-600">Estimated GST (18%): ₹{Math.round((pdfInvoice.grandTotal || 468800) - ((pdfInvoice.grandTotal || 468800) / 1.18)).toLocaleString("en-IN")}</p>
                      </div>

                      <div className="text-right bg-stone-950 text-white p-3 rounded-xl shadow-xs">
                        <span className="text-[10px] text-amber-300 font-bold block uppercase">Grand Total Estimate</span>
                        <span className="font-mono text-base font-black text-white">₹{(pdfInvoice.grandTotal || 468800).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Milestone Payment Schedule Terms */}
                    <div className="border border-stone-200 rounded-xl p-3 space-y-2 text-[10.5px]">
                      <span className="font-extrabold text-[#9E7B1D] block">Turnkey Payment Schedule Terms</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 font-bold block">1. BOOKING (50%)</span>
                          <span className="font-mono font-bold text-stone-900">₹{Math.round((pdfInvoice.grandTotal || 468800) * 0.5).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 font-bold block">2. PRODUCTION (40%)</span>
                          <span className="font-mono font-bold text-stone-900">₹{Math.round((pdfInvoice.grandTotal || 468800) * 0.4).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-400 font-bold block">3. HANDOVER (10%)</span>
                          <span className="font-mono font-bold text-stone-900">₹{Math.round((pdfInvoice.grandTotal || 468800) * 0.1).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Signature and Common Seal */}
                    <div className="border-t border-stone-200 pt-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-900 block">VELORA LUXURY INTERIORS</span>
                        <span className="text-[10px] text-stone-500 italic block">Authorised Design Signatory</span>
                      </div>
                      <div className="w-32 h-14 border border-dashed border-stone-300 rounded flex items-center justify-center text-[9px] text-stone-400 font-bold">
                        Authorised Common Seal
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with High Visibility Action Buttons */}
            <div className="p-4 bg-stone-900 border-t border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-xs font-medium">Viewing Format:</span>
                <span className={`px-2.5 py-1 rounded-lg font-extrabold text-xs ${pdfDocumentMode === "tax" ? "bg-blue-900/80 text-blue-300 border border-blue-700" : "bg-amber-950/80 text-amber-300 border border-amber-700"}`}>
                  {pdfDocumentMode === "tax" ? "📜 Tax Invoice (GST Legal Document)" : "📋 BOQ Estimate & Quotation Scope"}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold border border-stone-600 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportInvoiceCsv(pdfInvoice)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                  title="Download invoice item details as CSV data file"
                >
                  <FileSpreadsheet size={14} />
                  <span>Download CSV</span>
                </button>

                {/* Direct Button for Tax Invoice PDF */}
                <button
                  type="button"
                  onClick={() => downloadInvoicePdf(pdfInvoice)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition cursor-pointer"
                  title="Download Official Tax Invoice PDF with GST & Statutory Details"
                >
                  <Download size={14} />
                  <span>Download Tax Invoice PDF</span>
                </button>

                {/* Direct Button for BOQ Estimate PDF */}
                <button
                  type="button"
                  onClick={() => downloadBOQPdf(pdfInvoice)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black shadow-md transition cursor-pointer"
                  title="Download BOQ Project Estimate Quotation PDF"
                >
                  <Download size={14} />
                  <span>Download BOQ PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CLIENT ESTIMATES & QUOTATIONS (BOQ) VIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === "estimates" && invoiceViewMode === "list" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search estimates by Client, Phone, BOQ No..."
                value={estimateSearch}
                onChange={(e) => setEstimateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-800">
                {filteredEstimates.length} BOQ Estimates
              </span>
              <button
                onClick={() => navigate("/boq")}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Create in BOQ Builder</span>
              </button>
            </div>
          </div>

          {/* Estimates Data Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/75 text-stone-600 font-bold border-b border-stone-200">
                    <th className="py-3 px-4">BOQ / Enquiry No</th>
                    <th className="py-3 px-4">Client Name & Details</th>
                    <th className="py-3 px-4">Package Tier</th>
                    <th className="py-3 px-4">Spaces Scope</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Estimate Total</th>
                    <th className="py-3 px-4 text-center">Invoice Status</th>
                    <th className="py-3 px-4 text-center">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400 font-medium">
                        No estimates found matching "{estimateSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((est) => {
                      const isElite = est.activePackage === "Elite";
                      const isPrem = est.activePackage === "Premium";
                      return (
                        <tr
                          key={est._id || est.boqNumber}
                          className="hover:bg-amber-50/30 transition group"
                        >
                          {/* BOQ / Enquiry No */}
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            <div>
                              <span className="block text-[#9E7B1D]">{est.boqNumber}</span>
                              <span className="text-[10px] text-stone-400 font-normal">{est.enquiryNo}</span>
                            </div>
                          </td>

                          {/* Client Name & Contact */}
                          <td className="py-3 px-4">
                            <div
                              onClick={() => handleOpenEstimateDetail(est)}
                              className="cursor-pointer group-hover:text-blue-600 transition"
                            >
                              <span className="font-extrabold text-stone-900 block group-hover:underline flex items-center gap-1.5">
                                {est.clientName}
                                <Eye size={12} className="opacity-0 group-hover:opacity-100 text-blue-500 transition" />
                              </span>
                              <span className="text-[10px] text-stone-500 font-medium block">
                                {est.clientPhone} • {est.clientEmail || "Email N/A"}
                              </span>
                            </div>
                          </td>

                          {/* Package Tier Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isElite
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : isPrem
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}
                            >
                              {est.activePackage || "Standard"}
                            </span>
                          </td>

                          {/* Spaces Scope */}
                          <td className="py-3 px-4 font-medium text-stone-600">
                            <div className="flex items-center gap-1.5">
                              <Layers size={13} className="text-stone-400" />
                              <span>{est.numberOfSpaces || (est.spaces?.length || 1)} Spaces</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-stone-500 text-[11px]">
                            {est.enquiryDate
                              ? new Date(est.enquiryDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "13 Aug, 2026"}
                          </td>

                          {/* Grand Total Amount */}
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-stone-900 text-xs">
                            ₹{(est.grandTotal || 0).toLocaleString("en-IN")}
                          </td>

                          {/* Invoice Status */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                est.status === "Invoiced" || est.clientName?.includes("PREM")
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              }`}
                            >
                              {est.status === "Invoiced" || est.clientName?.includes("PREM") ? "Invoiced" : "Ready to Invoice"}
                            </span>
                          </td>

                          {/* Quick Actions with High Visibility Labels */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Open BOQ Scope Details Button */}
                              <button
                                onClick={() => handleOpenEstimateDetail(est)}
                                className="flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[10.5px] rounded-lg border border-stone-300 transition cursor-pointer"
                                title="View BOQ Scope Breakdown"
                              >
                                <Eye size={12} className="text-stone-700" />
                                <span>Details</span>
                              </button>

                              {/* Preview Tax Invoice Button */}
                              <button
                                onClick={() => handleOpenPdfViewer(est, "tax")}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10.5px] rounded-lg border border-blue-200 transition cursor-pointer"
                                title="Preview Tax Invoice Layout"
                              >
                                <Receipt size={12} className="text-blue-600" />
                                <span>Tax View</span>
                              </button>

                              {/* 1-Click Auto-Create Standard Invoice Button */}
                              <button
                                onClick={() => handleAutoCreateInvoiceFromBOQ(est)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-[10.5px] rounded-lg shadow-xs transition cursor-pointer"
                                title="Auto-Generate Standard Tax Invoice"
                              >
                                <Zap size={11} className="fill-amber-300 text-amber-300" />
                                <span>Auto Invoice</span>
                              </button>

                              {/* Download BOQ PDF */}
                              <button
                                onClick={() => downloadBOQPdf(est)}
                                className="p-1 bg-amber-50 hover:bg-amber-100 text-[#9E7B1D] rounded-lg border border-amber-300 transition cursor-pointer"
                                title="Download Official BOQ PDF"
                              >
                                <Download size={13} />
                              </button>

                              {/* Edit in BOQ Builder */}
                              <button
                                onClick={() => navigate("/boq", { state: { clientName: est.clientName, clientPhone: est.clientPhone } })}
                                className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg border border-stone-200 transition cursor-pointer"
                                title="Open in BOQ Editor"
                              >
                                <Edit2 size={13} />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ALL CLIENTS DIRECTORY VIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === "clients" && invoiceViewMode === "list" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">Clients & Commercial Lifecycle</h3>
              <p className="text-xs text-stone-500">Connected Enquiry &rarr; Client &rarr; BOQ Estimates &rarr; Tax Invoices</p>
            </div>
            <button
              onClick={() => navigate("/clients")}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-stone-800 transition cursor-pointer"
            >
              <User size={14} />
              <span>Open Clients Management</span>
            </button>
          </div>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(clientsList.length > 0 ? clientsList : boqEstimates).map((cl, idx) => {
              const matchedBOQ = boqEstimates.find((b) => b.clientName === cl.name) || cl;
              return (
                <div key={cl._id || idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 hover:border-amber-300 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-stone-900">{cl.name || cl.clientName}</h4>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {cl.phone || cl.clientPhone} • {cl.city || "Pune"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#9E7B1D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {cl.clientCode || cl.boqNumber || `CL-100${idx + 1}`}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Project Scope:</span>
                      <span className="font-bold text-stone-800">{cl.projectType || `${matchedBOQ.numberOfSpaces || 5} Spaces Fitout`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Active BOQ Estimate:</span>
                      <span className="font-mono font-bold text-[#9E7B1D]">
                        ₹{(matchedBOQ.grandTotal || 468800).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEstimateDetail(matchedBOQ)}
                        className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="View BOQ Estimate Details"
                      >
                        <Eye size={13} className="text-blue-500" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => {
                          const invNum = `NCIA${Math.floor(100 + Math.random() * 900)}`;
                          setPdfInvoice({
                            invoiceNumber: invNum,
                            projectName: cl.name || cl.clientName,
                            projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
                            clientName: cl.name || cl.clientName,
                            clientEmail: cl.email || cl.clientEmail || "",
                            clientPhone: cl.phone || cl.clientPhone || "",
                            clientAddress: cl.address || cl.clientAddress || "Pune, Maharashtra",
                            grandTotal: matchedBOQ.grandTotal || 468800,
                            subtotal: matchedBOQ.subtotal || Math.round((matchedBOQ.grandTotal || 468800) / 1.18),
                            gstTotal: matchedBOQ.gstTotal || 0,
                            billTo: {
                              name: cl.name || cl.clientName,
                              email: cl.email || cl.clientEmail || "",
                              phone: cl.phone || cl.clientPhone || "",
                              address: cl.address || cl.clientAddress || "Pune, Maharashtra"
                            }
                          });
                          setIsPdfViewerOpen(true);
                        }}
                        className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="Preview Client Tax Invoice"
                      >
                        <FileSpreadsheet size={13} className="text-emerald-600" />
                        <span>Invoice Preview</span>
                      </button>

                      <button
                        onClick={() => downloadInvoicePdf({
                          invoiceNumber: `NCIA${Math.floor(100 + Math.random() * 900)}`,
                          projectName: cl.name || cl.clientName,
                          clientName: cl.name || cl.clientName,
                          clientEmail: cl.email || cl.clientEmail || "",
                          clientPhone: cl.phone || cl.clientPhone || "",
                          clientAddress: cl.address || cl.clientAddress || "Pune, Maharashtra",
                          grandTotal: matchedBOQ.grandTotal || 468800
                        })}
                        className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        title="Download Client Tax Invoice PDF"
                      >
                        <Download size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAutoCreateInvoiceFromBOQ(matchedBOQ)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Zap size={11} className="fill-amber-300 text-amber-300" />
                      <span>Auto Invoice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ADVANCED ALL DETAILS MODAL FOR CLIENT & BOQ ESTIMATES */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedDetailBOQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF9F5] border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-[#9E7B1D]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-stone-900">
                      {selectedDetailBOQ.clientName}
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#9E7B1D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {selectedDetailBOQ.boqNumber || "BOQ-2026-018"}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedDetailBOQ.activePackage || "Standard"} Specification
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {selectedDetailBOQ.clientPhone} • {selectedDetailBOQ.clientEmail || "email@example.com"} • {selectedDetailBOQ.clientAddress || "Pune, Maharashtra"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Specification Package</span>
                  <span className="font-extrabold text-sm text-stone-900 block mt-0.5">
                    {selectedDetailBOQ.activePackage || "Standard"} Tier
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Number of Spaces</span>
                  <span className="font-extrabold text-sm text-stone-900 block mt-0.5">
                    {selectedDetailBOQ.spaces?.length || selectedDetailBOQ.numberOfSpaces || 1} Rooms
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Applicable GST (18%)</span>
                  <span className="font-mono font-extrabold text-sm text-stone-900 block mt-0.5">
                    ₹{Math.round((selectedDetailBOQ.grandTotal || 0) * 0.18 / 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 bg-[#0A1128] text-white rounded-xl shadow-xs">
                  <span className="text-[10px] text-amber-300 font-bold uppercase block">Grand Total Estimate</span>
                  <span className="font-mono font-black text-base block mt-0.5">
                    ₹{(selectedDetailBOQ.grandTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Spaces Breakdown & Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                    <Layers size={15} className="text-[#9E7B1D]" />
                    <span>Space-by-Space Detailed Component Breakdown</span>
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">
                    Itemized bill of quantities with finishes & rates
                  </span>
                </div>

                {/* Space Selector Tabs */}
                {selectedDetailBOQ.spaces && selectedDetailBOQ.spaces.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {selectedDetailBOQ.spaces.map((sp, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDetailSpaceIdx(idx)}
                          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition cursor-pointer ${
                            activeDetailSpaceIdx === idx
                              ? "bg-stone-900 text-white shadow-xs"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          <span>{sp.name}</span>
                          <span className="ml-1.5 opacity-70 font-mono text-[10px]">
                            ₹{(sp.roomTotal || 0).toLocaleString("en-IN")}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active Space Table */}
                    {(() => {
                      const sp = selectedDetailBOQ.spaces[activeDetailSpaceIdx] || selectedDetailBOQ.spaces[0];
                      const items = sp?.items && sp.items.length > 0 ? sp.items : [
                        { name: `${sp?.name || "Room"} Full Scope Execution`, packageVariant: selectedDetailBOQ.activePackage, lengthFt: 1, heightFt: 1, qty: 1, sqft: 1, rate: sp?.roomTotal || 150000, amount: sp?.roomTotal || 150000, description: "Full turnkey woodwork, finishes and installation" }
                      ];

                      return (
                        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                          <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                            <span className="font-extrabold text-stone-900">{sp?.name} Components</span>
                            <span className="font-mono font-bold text-[#9E7B1D]">Room Total: ₹{(sp?.roomTotal || 0).toLocaleString("en-IN")}</span>
                          </div>

                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-stone-50/50 text-stone-600 font-bold border-b border-stone-200">
                                <th className="py-2.5 px-3">Item / Component</th>
                                <th className="py-2.5 px-2">Type / Package</th>
                                <th className="py-2.5 px-2 text-center">Dimensions</th>
                                <th className="py-2.5 px-2 text-center">Qty</th>
                                <th className="py-2.5 px-2 text-center">Sq.Ft</th>
                                <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                              {items.map((it, iIdx) => (
                                <tr key={iIdx} className="hover:bg-stone-50/60">
                                  <td className="py-2.5 px-3 font-semibold text-stone-900">
                                    {it.name}
                                    {it.description && <span className="block text-[10px] text-stone-400 font-normal">{it.description}</span>}
                                  </td>
                                  <td className="py-2.5 px-2 text-stone-600">{it.typeVariant || it.packageVariant || "Standard"}</td>
                                  <td className="py-2.5 px-2 text-center font-mono text-[11px]">
                                    {it.lengthFt ? `${it.lengthFt}ft × ${it.heightFt || 1}ft` : "Custom"}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-bold">{it.qty || 1}</td>
                                  <td className="py-2.5 px-2 text-center font-mono">{it.sqft || 1}</td>
                                  <td className="py-2.5 px-2 text-right font-mono font-medium">₹{(it.rate || 0).toLocaleString("en-IN")}</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">₹{(it.amount || 0).toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 rounded-xl text-center text-stone-500">
                    Turnkey execution scope configured for {selectedDetailBOQ.clientName}
                  </div>
                )}
              </div>

              {/* Milestone Terms */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <span className="font-extrabold text-xs text-[#9E7B1D] block">Standard Turnkey Milestone Schedule</span>
                <div className="grid grid-cols-3 gap-3 text-stone-700">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-stone-400 font-bold block">1. BOOKING ADVANCE (50%)</span>
                    <span className="font-mono font-bold text-stone-900 block mt-0.5">
                      ₹{Math.round((selectedDetailBOQ.grandTotal || 0) * 0.5).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-stone-400 font-bold block">2. PRODUCTION CLEARANCE (40%)</span>
                    <span className="font-mono font-bold text-stone-900 block mt-0.5">
                      ₹{Math.round((selectedDetailBOQ.grandTotal || 0) * 0.4).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <span className="text-[10px] text-stone-400 font-bold block">3. FINAL HANDOVER (10%)</span>
                    <span className="font-mono font-bold text-stone-900 block mt-0.5">
                      ₹{Math.round((selectedDetailBOQ.grandTotal || 0) * 0.1).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-[#FAF9F5] border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                onClick={() => downloadBOQPdf(selectedDetailBOQ)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                <Download size={14} />
                <span>Download BOQ PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    navigate("/boq", { state: { clientName: selectedDetailBOQ.clientName, clientPhone: selectedDetailBOQ.clientPhone } });
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Edit in BOQ Builder
                </button>

                <button
                  onClick={() => handleAutoCreateInvoiceFromBOQ(selectedDetailBOQ)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Zap size={14} className="fill-amber-300 text-amber-300" />
                  <span>⚡ Auto-Generate Standard Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SELECT CLIENT FROM ENQUIRY MODAL (NEW INVOICE WORKFLOW) */}
      {/* ========================================================================= */}
      {isSelectEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 text-blue-300">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>Select Client from Enquiry Section</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/30 border border-blue-400/30 text-blue-200 font-bold">
                      {enquiriesList.length} Leads
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200/80 mt-0.5 font-medium">
                    Pick a lead from your Enquiry section to automatically load their name, contact, address & project details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSelectEnquiryModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Top Search & Fast Actions */}
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[260px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search enquiry by client name, phone, email, site location, or project..."
                  value={enquirySearchQuery}
                  onChange={(e) => setEnquirySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <button
                onClick={handleStartBlankInvoice}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition cursor-pointer shadow-2xs"
              >
                <FileText size={14} className="text-stone-500" />
                <span>Or Start Blank Invoice</span>
              </button>
            </div>

            {/* Modal List of Enquiries */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-stone-100/50 max-h-[55vh]">
              {loadingEnquiries ? (
                <div className="py-12 text-center text-stone-400 text-xs font-semibold">
                  Loading Enquiries...
                </div>
              ) : (() => {
                const filteredEnqs = enquiriesList.filter((e) => {
                  if (!enquirySearchQuery.trim()) return true;
                  const term = enquirySearchQuery.toLowerCase();
                  return (
                    e.name?.toLowerCase().includes(term) ||
                    e.phone?.toLowerCase().includes(term) ||
                    e.email?.toLowerCase().includes(term) ||
                    e.siteLocation?.toLowerCase().includes(term) ||
                    e.address?.toLowerCase().includes(term) ||
                    e.projectType?.toLowerCase().includes(term) ||
                    e.projectSubtype?.toLowerCase().includes(term) ||
                    e.enquiryNo?.toLowerCase().includes(term)
                  );
                });

                if (filteredEnqs.length === 0) {
                  return (
                    <div className="py-12 text-center text-stone-400">
                      <p className="text-sm font-bold text-stone-600">
                        {enquirySearchQuery ? `No enquiries found matching "${enquirySearchQuery}"` : "No enquiries found in the Enquiry section"}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        You can start with a blank invoice to enter client details manually.
                      </p>
                      <button
                        onClick={handleStartBlankInvoice}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Create Blank Invoice
                      </button>
                    </div>
                  );
                }

                return filteredEnqs.map((enq, idx) => (
                  <div
                    key={enq._id || enq.enquiryNo || idx}
                    className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition flex flex-wrap items-center justify-between gap-4"
                  >
                    {/* Client & Project Info */}
                    <div className="space-y-1.5 flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-stone-900">
                          {enq.salutation ? `${enq.salutation} ` : ""}{enq.name}
                        </span>
                        {enq.enquiryNo && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono font-bold">
                            {enq.enquiryNo}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {enq.projectSubtype || enq.projectType || "Residential"}
                        </span>
                        {enq.prospectStatus && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            enq.prospectStatus === "Hot" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {enq.prospectStatus} Lead
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                        {enq.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={11} className="text-stone-400" />
                            {enq.phone}
                          </span>
                        )}
                        {enq.email && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <Mail size={11} className="text-stone-400" />
                            {enq.email}
                          </span>
                        )}
                        {(enq.siteLocation || enq.address || enq.city) && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <MapPin size={11} className="text-stone-400" />
                            {enq.siteLocation || enq.address || enq.city}
                          </span>
                        )}
                        {enq.budget && (
                          <span className="font-bold text-stone-700">
                            Budget: {enq.budget}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectEnquiryForInvoice(enq)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Select Client & Create Invoice</span>
                    </button>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Loaded directly from Velora Enquiry Module
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSelectEnquiryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartBlankInvoice}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Start Blank Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW INVOICE DETAILS MODAL */}
      {/* ========================================================================= */}
      {isViewModalOpen && viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in select-none">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      Invoice {viewingInvoice.invoiceNumber}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      {viewingInvoice.status || "Issued"}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">
                    {viewingInvoice.clientName} • {viewingInvoice.projectName || "Turnkey Project"}
                  </span>
                </div>
              </div>

              {/* Action Buttons in View Modal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenPdfViewer(viewingInvoice, "tax");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <FileText size={13} />
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={() => downloadInvoicePdf(viewingInvoice)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEdit(viewingInvoice);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dates & Info */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Invoice Details
                  </span>
                  <div className="text-xs space-y-1 text-stone-700">
                    <div>
                      <span className="font-semibold text-stone-500">Issue Date: </span>
                      <span className="font-bold text-stone-900">
                        {viewingInvoice.issueDate ? new Date(viewingInvoice.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-500">Due Date: </span>
                      <span className="font-bold text-stone-900">
                        {viewingInvoice.dueDate ? new Date(viewingInvoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Upon Receipt"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-500">Invoice Type: </span>
                      <span className="font-bold text-stone-900">{viewingInvoice.invoiceType || "Supply"}</span>
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Billed To (Client)
                  </span>
                  <div className="text-xs space-y-1 text-stone-700">
                    <div className="font-extrabold text-stone-900">{viewingInvoice.clientName || viewingInvoice.billTo?.name}</div>
                    {viewingInvoice.clientPhone && (
                      <div className="font-mono text-stone-600">{viewingInvoice.clientPhone}</div>
                    )}
                    {viewingInvoice.clientEmail && (
                      <div className="text-stone-500">{viewingInvoice.clientEmail}</div>
                    )}
                    {viewingInvoice.clientAddress && (
                      <div className="text-[11px] text-stone-500 line-clamp-2">{viewingInvoice.clientAddress}</div>
                    )}
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Total Due
                  </span>
                  <div className="text-xl font-black text-blue-900 font-mono">
                    ₹{(viewingInvoice.grandTotal || viewingInvoice.balanceDue || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium flex justify-between">
                    <span>Tax Applied: {viewingInvoice.taxPercent || 18}%</span>
                    <span>GST: ₹{(viewingInvoice.gstTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-stone-100/75 border-b border-stone-200 font-bold text-xs text-stone-800 flex justify-between items-center">
                  <span>Line Items ({(viewingInvoice.items || []).length})</span>
                  <span className="text-[11px] text-stone-500 font-normal">Currency: INR (₹)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 text-[11px]">
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Product / Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">HSN/SAC</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">GST %</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {(viewingInvoice.items && viewingInvoice.items.length > 0 ? viewingInvoice.items : []).map((it, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-3 px-4 font-bold text-stone-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-stone-900">
                            {it.productName || "Item"}
                            {it.dimensions && (
                              <span className="block text-[10px] text-stone-400 font-normal">
                                {it.dimensions}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-stone-600">{it.category || "General"}</td>
                          <td className="py-3 px-3 font-mono text-stone-500">{it.hsnSac || "995476"}</td>
                          <td className="py-3 px-3 text-center font-bold">{it.quantity || 1} {it.unit || ""}</td>
                          <td className="py-3 px-3 text-right font-mono">₹{(it.rate || 0).toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right font-mono">{it.gstPercent || 0}%</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                            ₹{(it.total || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Footer */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm bg-white p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-stone-800">
                      ₹{(viewingInvoice.subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST Amount ({viewingInvoice.taxPercent || 18}%):</span>
                    <span className="font-mono font-bold text-stone-800">
                      ₹{(viewingInvoice.gstTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-stone-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-600">
                      ₹{(viewingInvoice.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
