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
import { downloadInvoicePdf, downloadBOQPdf } from "../utils/downloadHelper";

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
  const [activePdfPage, setActivePdfPage] = useState(1);

  // Quotations state
  const [quotations, setQuotations] = useState([]);
  const [quotationSearch, setQuotationSearch] = useState("");

  // Toast Notification
  const [toastMsg, setToastMsg] = useState("");

  // Default initial invoice data
  const defaultInvoiceForm = {
    _id: null,
    invoiceNumber: "NCIA003",
    projectName: "PREM SHUKLA",
    projectNumber: "PRJ-2026-008",
    clientId: "VLA-CL-1001",
    invoiceType: "Supply",
    clientName: "PREM SHUKLA",
    clientEmail: "PREMSHUKLA@GMAIL.COM",
    clientPhone: "78000 20496",
    clientAddress: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, WAKAD, PUNE, MAHARASHTRA, 411057",
    billTo: {
      name: "PREM SHUKLA",
      email: "PREMSHUKLA@GMAIL.COM",
      phone: "78000 20496",
      gstin: "",
      address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, WAKAD, PUNE, MAHARASHTRA, 411057"
    },
    shipTo: {
      name: "",
      email: "",
      phone: "74104 10123",
      gstin: "",
      address: ""
    },
    sameAsBillTo: true,
    items: [
      {
        productName: "Queen Size Bed, With Cush",
        category: "Bedroom",
        dimensions: "6.5 × 5.5 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "30",
        rate: 36000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 36000
      },
      {
        productName: "King Size Bed Hydrolic",
        category: "Bedroom",
        dimensions: "6.5 × 6.5 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "45.5",
        rate: 64000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 64000
      },
      {
        productName: "Openable Wardrobe 1",
        category: "Storage",
        dimensions: "7.0 × 6.0 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "42.5",
        rate: 55000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 55000
      },
      {
        productName: "Openable Wardrobe 2, Study",
        category: "Storage",
        dimensions: "8.5 × 7.0 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "59.5",
        rate: 71400,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 71400
      },
      {
        productName: "Openable Wardrobe 3, Study",
        category: "Storage",
        dimensions: "5.0 × 7.0 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "34",
        rate: 40800,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 40800
      },
      {
        productName: "Study Table",
        category: "Furniture",
        dimensions: "8.0 × 2.5 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "56",
        rate: 67200,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 67200
      },
      {
        productName: "Side Table",
        category: "Furniture",
        dimensions: "1.5 × 1.5 ft",
        hsnSac: "HSN/SAC",
        quantity: 4,
        unit: "1.96",
        rate: 5500,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 22000
      },
      {
        productName: "Dressing",
        category: "Storage",
        dimensions: "3.0 × 7.0 ft",
        hsnSac: "HSN/SAC",
        quantity: 3,
        unit: "Unit",
        rate: 21000,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 63000
      },
      {
        productName: "Shoe Rack, With Side Sitting",
        category: "Foyer",
        dimensions: "4.0 × 3.0 ft",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "12",
        rate: 14400,
        discount: 0,
        gstPercent: 0,
        gstAmount: 0,
        total: 14400
      }
    ],
    subtotal: 468800,
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
    gstTotal: 0,
    grandTotal: 468800,
    paidAmount: 0,
    balanceDue: 468800,
    issueDate: "2026-08-13",
    dueDate: "",
    termsAndConditions:
      "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance along with work order confirmation.\n2. 40% on material delivery or production clearance.\n3. Balance 10% on completion and final snag handover.",
    bankDetails:
      "Account Holder: NETTLE CREEK INTERIORS / VELORA ANTRAAL\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
  };

  const [editingInvoice, setEditingInvoice] = useState(defaultInvoiceForm);

  // Load Invoices from Backend
  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await erpApi.getInvoices({ search: invoiceSearch });
      if (res?.data && res.data.length > 0) {
        setInvoices(res.data);
      } else {
        // Fallback default sample list matching Screenshot 1
        setInvoices([
          {
            _id: "inv-1",
            invoiceNumber: "NCIA003",
            clientName: "PREM SHUKLA",
            projectName: "PREM SHUKLA",
            projectNumber: "PRJ-2026-008",
            issueDate: "2026-08-13",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 468800,
            subtotal: 468800,
            gstTotal: 0,
            balanceDue: 468800,
            items: defaultInvoiceForm.items
          },
          {
            _id: "inv-2",
            invoiceNumber: "NCI005",
            clientName: "Rashid sir",
            projectName: "Rashid sir Showroom",
            projectNumber: "PRJ-2026-005",
            issueDate: "2026-07-11",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 23364,
            subtotal: 23364,
            gstTotal: 0,
            balanceDue: 23364,
            items: [{ productName: "Custom Display Units", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 23364, gstPercent: 0, gstAmount: 0, total: 23364 }]
          },
          {
            _id: "inv-3",
            invoiceNumber: "NCI004",
            clientName: "Dr Hardik",
            projectName: "Dr Hardik Clinic Phase 2",
            projectNumber: "PRJ-2026-004",
            issueDate: "2026-06-05",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 194000,
            subtotal: 194000,
            gstTotal: 0,
            balanceDue: 194000,
            items: [{ productName: "Reception Counter & Storage", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 194000, gstPercent: 0, gstAmount: 0, total: 194000 }]
          },
          {
            _id: "inv-4",
            invoiceNumber: "NCI003",
            clientName: "Dr Hardik",
            projectName: "Dr Hardik Consultation Room",
            projectNumber: "PRJ-2026-004",
            issueDate: "2026-06-05",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 211000,
            subtotal: 211000,
            gstTotal: 0,
            balanceDue: 211000,
            items: [{ productName: "Doctor Cabin Acoustic Panels", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 211000, gstPercent: 0, gstAmount: 0, total: 211000 }]
          },
          {
            _id: "inv-5",
            invoiceNumber: "NCI002",
            clientName: "Akash Jain",
            projectName: "Akash Jain 3BHK Residence",
            projectNumber: "PRJ-2026-002",
            issueDate: "2026-05-26",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 0,
            subtotal: 0,
            gstTotal: 0,
            balanceDue: 0,
            items: [{ productName: "Living Room Wall Louvers", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 0, gstPercent: 0, gstAmount: 0, total: 0 }]
          },
          {
            _id: "inv-6",
            invoiceNumber: "NCI001",
            clientName: "Dr Saurabh",
            projectName: "Dr Saurabh Clinic",
            projectNumber: "PRJ-2026-001",
            issueDate: "2026-05-19",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 324950,
            subtotal: 324950,
            gstTotal: 0,
            balanceDue: 324950,
            items: [{ productName: "Waiting Lounge & Partitioning", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 324950, gstPercent: 0, gstAmount: 0, total: 324950 }]
          },
          {
            _id: "inv-7",
            invoiceNumber: "NCIA002",
            clientName: "Dr Hardik",
            projectName: "Dr Hardik Phase 1",
            projectNumber: "PRJ-2026-004",
            issueDate: "2026-05-03",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 0,
            subtotal: 0,
            gstTotal: 0,
            balanceDue: 0,
            items: [{ productName: "Initial Demolition & Framing Advance", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 0, gstPercent: 0, gstAmount: 0, total: 0 }]
          },
          {
            _id: "inv-8",
            invoiceNumber: "NCIA001",
            clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
            projectName: "Wipro Executive Cabin",
            projectNumber: "PRJ-2026-001",
            issueDate: "2026-04-30",
            dueDate: "",
            taxPercent: 0,
            grandTotal: 29000,
            subtotal: 29000,
            gstTotal: 0,
            balanceDue: 29000,
            items: [{ productName: "Executive Ergonomic Desk", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 29000, gstPercent: 0, gstAmount: 0, total: 29000 }]
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoadingInvoices(false);
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
      if (res?.data) setClientsList(res.data);
    } catch (err) {
      console.error("Error loading clients:", err);
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
  }, [invoiceSearch, quotationSearch]);

  // Open PDF Viewer Modal
  const handleOpenPdfViewer = (inv) => {
    setPdfInvoice(inv || defaultInvoiceForm);
    setIsPdfViewerOpen(true);
  };

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
        "Account Holder: NETTLE CREEK INTERIORS / VELORA ANTRAAL\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
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

  // Open New Invoice Mode
  const handleOpenNewInvoice = () => {
    const invNum = `VLA-INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const calced = recalculateItems(defaultInvoiceForm.items);
    setEditingInvoice({
      ...defaultInvoiceForm,
      _id: null,
      invoiceNumber: invNum,
      items: calced.items,
      subtotal: calced.subtotal,
      gstTotal: calced.gstTotal,
      grandTotal: calced.grandTotal,
      balanceDue: calced.grandTotal
    });
    setInvoiceViewMode("edit");
  };

  // Save Invoice
  const handleSaveInvoice = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingInvoice._id) {
        await erpApi.updateInvoice(editingInvoice._id, editingInvoice);
        setToastMsg(`Invoice ${editingInvoice.invoiceNumber} updated successfully!`);
      } else {
        await erpApi.createInvoice(editingInvoice);
        setToastMsg(`Invoice ${editingInvoice.invoiceNumber} created & issued successfully!`);
      }
      loadInvoices();
      setInvoiceViewMode("list");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.warn("Backend save fallback to local state:", err);
      setInvoices((prev) => {
        const idx = prev.findIndex((i) => i.invoiceNumber === editingInvoice.invoiceNumber);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = editingInvoice;
          return updated;
        }
        return [editingInvoice, ...prev];
      });
      setToastMsg(`Invoice ${editingInvoice.invoiceNumber} saved!`);
      setInvoiceViewMode("list");
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id, invNum) => {
    if (!window.confirm(`Delete Invoice ${invNum}?`)) return;
    try {
      await erpApi.deleteInvoice(id);
      loadInvoices();
      setToastMsg(`Invoice ${invNum} deleted.`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      setInvoices((prev) => prev.filter((i) => i.invoiceNumber !== invNum && i._id !== id));
      setToastMsg(`Invoice ${invNum} deleted.`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  // Open PDF Viewer Modal (Screenshot 2)
  const handleOpenPdfViewer = (inv) => {
    setPdfInvoice(inv || editingInvoice);
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

            {/* Right: Counter and "+ New Invoice" Button */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-stone-800">
                {filteredInvoices.length} Invoice
              </span>

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
                      <td colSpan={7} className="py-8 text-center text-stone-400 font-medium">
                        No invoices found matching "{invoiceSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.invoiceNumber || inv._id}
                        className="hover:bg-stone-50/70 transition"
                      >
                        {/* Invoice No */}
                        <td className="py-3 px-4 font-bold text-stone-900 font-mono">
                          {inv.invoiceNumber}
                        </td>

                        {/* Billed To */}
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          {inv.clientName || inv.billTo?.name || "Client"}
                        </td>

                        {/* Invoice Date */}
                        <td className="py-3 px-4 text-stone-600">
                          {inv.issueDate
                            ? new Date(inv.issueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "-"}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-4 text-stone-400">
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : ""}
                        </td>

                        {/* Tax % */}
                        <td className="py-3 px-4 text-stone-600 font-medium">
                          {inv.taxPercent !== undefined ? `${inv.taxPercent}%` : "0%"}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3 px-4 text-right font-bold text-stone-900 font-mono">
                          ₹{(inv.grandTotal || inv.balanceDue || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Action Column: Preview, Download, Edit & 3-Dots Menu */}
                        <td className="py-3 px-4 text-center">
                          <div className="relative inline-flex items-center justify-center gap-1.5">
                            {/* Preview Eye Icon */}
                            <button
                              onClick={() => handleOpenPdfViewer(inv)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Preview Tax Invoice"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Download PDF Icon */}
                            <button
                              onClick={() => downloadInvoicePdf(inv)}
                              className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Download Tax Invoice PDF"
                            >
                              <Download size={15} />
                            </button>

                            {/* Pencil Edit Icon */}
                            <button
                              onClick={() => handleOpenEdit(inv)}
                              className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                              title="Edit Invoice"
                            >
                              <Edit2 size={15} />
                            </button>

                            {/* 3-dots Menu Button */}
                            <button
                              onClick={() =>
                                setActiveDropdownId(
                                  activeDropdownId === inv.invoiceNumber ? null : inv.invoiceNumber
                                )
                              }
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="More Options"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdownId === inv.invoiceNumber && (
                              <div
                                className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1 text-left animate-in fade-in zoom-in-95"
                                onMouseLeave={() => setActiveDropdownId(null)}
                              >
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleOpenPdfViewer(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Eye size={13} className="text-blue-500" />
                                  <span>Preview Invoice</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    downloadInvoicePdf(inv);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Download size={13} className="text-[#9E7B1D]" />
                                  <span>Download PDF</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handlePrint();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                                >
                                  <Printer size={13} className="text-stone-600" />
                                  <span>Print Invoice</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    handleDeleteInvoice(inv._id, inv.invoiceNumber);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
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
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInvoiceViewMode("list")}
                className="p-2 hover:bg-stone-200/60 rounded-xl transition text-stone-600 cursor-pointer"
                title="Back to Invoices"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-stone-900">
                  {editingInvoice._id ? "Edit Invoice" : "Create Invoice"}
                </h2>
                <span className="text-[11px] text-stone-500">
                  Single Source of Truth: Linked Client &rarr; BOQ &rarr; Tax Invoice
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPdfViewer(editingInvoice)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Preview
              </button>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 8 Cols on Desktop */}
            <div className="lg:col-span-8 space-y-6">
              {/* Invoice Metadata & Parties Card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                <h3 className="font-extrabold text-base text-stone-900">Invoice</h3>

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

              {/* Bottom Actions Card matching Screenshot 3 */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceViewMode("list")}
                  className="px-6 py-2.5 bg-white border border-stone-300 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPdfViewer(editingInvoice)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Preview
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-black text-xs rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer"
                >
                  Save Invoice
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. PDF VIEWER MODAL (SCREENSHOT 2) */}
      {/* ========================================================================= */}
      {isPdfViewerOpen && pdfInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-6xl h-[90vh] bg-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-stone-700">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-700 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-400" />
                <h3 className="font-bold text-sm">PDF Viewer</h3>
              </div>
              <button
                onClick={() => setIsPdfViewerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Left Thumbnail Bar + Center Document Canvas */}
            <div className="flex-1 overflow-hidden flex bg-stone-900">
              {/* Left Sidebar Thumbnail Pane matching Screenshot 2 */}
              <div className="w-48 bg-stone-950 border-r border-stone-800 p-4 space-y-4 overflow-y-auto hidden sm:block select-none">
                {[1, 2, 3].map((pageNum) => (
                  <div
                    key={pageNum}
                    onClick={() => setActivePdfPage(pageNum)}
                    className={`cursor-pointer transition rounded-lg p-1 text-center ${
                      activePdfPage === pageNum
                        ? "ring-2 ring-blue-500 bg-stone-800/80"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="w-full h-44 bg-white rounded shadow-inner p-2 overflow-hidden text-[5px] text-stone-600 leading-tight">
                      <div className="border-b border-blue-500 pb-1 mb-1 font-bold text-[6px] text-blue-600">
                        NETTLE CREEK INTERIORS
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-stone-200 rounded w-3/4" />
                        <div className="h-1 bg-stone-200 rounded w-1/2" />
                        <div className="h-4 bg-blue-50 border border-blue-200 rounded" />
                        <div className="space-y-0.5 pt-2">
                          <div className="h-1 bg-stone-200 rounded" />
                          <div className="h-1 bg-stone-200 rounded" />
                          <div className="h-1 bg-stone-200 rounded" />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 font-bold block mt-1.5">
                      {pageNum}
                    </span>
                  </div>
                ))}
              </div>

              {/* Main Document Viewer Canvas matching Screenshot 2 */}
              <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-stone-800">
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-8 space-y-6 text-stone-800 font-sans">
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

                  {/* Items Table */}
                  <div className="border border-stone-900 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-stone-900 text-amber-400 font-bold">
                          <th className="py-2 px-3">Product Name</th>
                          <th className="py-2 px-2 text-center">HSN/SAC</th>
                          <th className="py-2 px-2 text-center">Quantity</th>
                          <th className="py-2 px-2 text-center">Unit</th>
                          <th className="py-2 px-2 text-right">Rate</th>
                          <th className="py-2 px-2 text-center">GST(%)</th>
                          <th className="py-2 px-2 text-right">GST(₹)</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-800">
                        {(pdfInvoice.items || []).map((it, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                            <td className="py-2 px-3 font-semibold">{it.productName}</td>
                            <td className="py-2 px-2 text-center text-stone-500">{it.hsnSac || "HSN/SAC"}</td>
                            <td className="py-2 px-2 text-center font-bold">{it.quantity || 1}</td>
                            <td className="py-2 px-2 text-center">{it.unit || "1"}</td>
                            <td className="py-2 px-2 text-right font-mono">
                              ₹{(it.rate || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-2 text-center">{it.gstPercent || 0}%</td>
                            <td className="py-2 px-2 text-right font-mono">
                              ₹{(it.gstAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-bold font-mono">
                              ₹{(it.total || (it.rate * (it.quantity || 1))).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Commercial Totals & Bank Details */}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {/* Left: Bank Details */}
                    <div className="p-3 bg-stone-50 rounded border border-stone-200 text-[10px] space-y-1 text-stone-600">
                      <span className="font-bold text-stone-900 block text-[11px]">
                        BANK DETAILS & PAYMENT INSTRUCTIONS
                      </span>
                      <p>Account Holder: VELORA LUXURY INTERIORS</p>
                      <p>Account Number: 50200073374185</p>
                      <p>Bank: HDFC Bank, Wakad Branch | IFSC: HDFC0000123</p>
                    </div>

                    {/* Right: Commercial Summary */}
                    <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-xs space-y-1.5">
                      <div className="flex justify-between text-stone-600">
                        <span>Sub Total:</span>
                        <span className="font-bold font-mono text-stone-900">
                          ₹{(pdfInvoice.subtotal || pdfInvoice.grandTotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>GST Total:</span>
                        <span className="font-bold font-mono text-stone-900">
                          ₹{(pdfInvoice.gstTotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-300 pt-1.5 font-extrabold text-sm text-blue-900">
                        <span>Total Amount:</span>
                        <span className="font-mono">
                          ₹{(pdfInvoice.grandTotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Terms */}
                  <div className="border-t border-stone-200 pt-3 text-[10px] text-stone-400 space-y-0.5">
                    <p>1. This is a computer generated invoice and requires no physical signature.</p>
                    <p>2. Subject to Pune jurisdiction only.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-900 border-t border-stone-700 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setIsPdfViewerOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold border border-stone-600 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                onClick={() => downloadInvoicePdf(pdfInvoice)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-xs transition cursor-pointer"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
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

                          {/* Quick Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Open Details Button */}
                              <button
                                onClick={() => handleOpenEstimateDetail(est)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Open All Estimate Details"
                              >
                                <Eye size={15} />
                              </button>

                              {/* 1-Click Auto-Create Standard Invoice Button */}
                              <button
                                onClick={() => handleAutoCreateInvoiceFromBOQ(est)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-[10px] rounded-lg shadow-xs transition cursor-pointer"
                                title="Auto-Generate Standard Tax Invoice"
                              >
                                <Zap size={11} className="fill-amber-300 text-amber-300" />
                                <span>Invoice</span>
                              </button>

                              {/* Download PDF Quotation */}
                              <button
                                onClick={() => downloadBOQPdf(est)}
                                className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Download Official BOQ PDF"
                              >
                                <Download size={14} />
                              </button>

                              {/* Edit in BOQ Builder */}
                              <button
                                onClick={() => navigate("/boq", { state: { clientName: est.clientName, clientPhone: est.clientPhone } })}
                                className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
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

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenEstimateDetail(matchedBOQ)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View All Details</span>
                    </button>

                    <button
                      onClick={() => handleAutoCreateInvoiceFromBOQ(matchedBOQ)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Zap size={12} className="fill-amber-300 text-amber-300" />
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
    </div>
  );
}
