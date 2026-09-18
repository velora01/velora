import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import {
  PhoneCall,
  Plus,
  Edit2,
  Trash2,
  User,
  Home,
  Palette,
  IndianRupee,
  Layers,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FolderOpen,
  X,
  Sparkles,
  Receipt,
  Download,
  Eye,
  FileText,
  CreditCard,
  Building,
  MapPin,
  Tag,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Printer,
  File,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  FileDown,
  Paperclip,
  Check,
  ZoomIn
} from "lucide-react";
import { downloadBOQPdf, downloadInvoicePdf, printInvoice } from "../utils/downloadHelper";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [allBOQs, setAllBOQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer & Tabs
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeClientTab, setActiveClientTab] = useState("overview"); // overview | project | boq | products | pricing | payments | invoices | documents | notes
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [newLog, setNewLog] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Documents & Files state
  const [docCategoryFilter, setDocCategoryFilter] = useState("All");
  const [docSearch, setDocSearch] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("2D Layout & Floor Plans");
  const [newDocFile, setNewDocFile] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [clientDocumentsMap, setClientDocumentsMap] = useState(() => {
    try {
      const saved = localStorage.getItem("velora_clients_documents_vault");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Client Form state
  const initialFormData = {
    name: "",
    salutation: "Mr",
    phone: "",
    altPhone: "",
    email: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411057",
    address: "",
    siteAddress: "",
    gstin: "",
    companyName: "",
    status: "Active",
    projectType: "3BHK Luxury Apartment",
    projectLocation: "Pune",
    propertyType: "Residential",
    preferredStyle: "Modern Contemporary",
    budgetRange: "₹25L - ₹40L",
    approximateBudget: 2500000,
    spaceRequirements: ["Living Room", "Modular Kitchen", "Master Bedroom"],
    targetHandoverDate: "",
    specialInstructions: "",
    notes: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const availableSpaces = [
    "Entrance",
    "Living Room",
    "Dining Area",
    "Modular Kitchen",
    "Master Bedroom",
    "Kids Bedroom",
    "Parents Bedroom",
    "Guest Bedroom",
    "Puja Room",
    "Balcony",
    "Home Theater",
    "Walk-in Wardrobe",
    "Bathroom / Vanity"
  ];

  const projectTypesList = [
    "2BHK Apartment",
    "3BHK Luxury Apartment",
    "4BHK Luxury Apartment",
    "Penthouse",
    "Independent Villa",
    "Commercial Office",
    "Showroom / Retail",
    "Modular Kitchen & Living"
  ];

  const stylesList = [
    "Modern Contemporary",
    "Minimalist Luxury",
    "Neo-Classical Bespoke",
    "Scandinavian Warm Wood",
    "Art Deco & Brass Accents",
    "Industrial Chic & Metallic",
    "Traditional Heritage Luxury"
  ];

  const budgetRangesList = [
    "₹15L - ₹25L",
    "₹25L - ₹40L",
    "₹40L - ₹60L",
    "₹60L - ₹90L",
    "₹1Cr - ₹1.5Cr",
    "₹1.5Cr+"
  ];

  const loadClients = async () => {
    setLoading(true);
    try {
      const [resClients, resBOQs] = await Promise.all([
        erpApi.getClients({ search, status: statusFilter }),
        erpApi.getBOQs({ limit: 100 }).catch(() => ({ data: [] }))
      ]);

      const boqList = resBOQs?.data || [];
      setAllBOQs(boqList);

      const rawClients = resClients?.data || [];
      const clientMap = new Map();

      // Normalize client key helper
      const getClientKey = (c) => {
        const p = (c.phone || "").replace(/\D/g, "").slice(-10);
        if (p) return `p_${p}`;
        const n = (c.name || "").trim().toLowerCase();
        if (n) return `n_${n}`;
        return `id_${c._id || c.clientCode}`;
      };

      // Add real client records
      rawClients.forEach((c) => {
        const key = getClientKey(c);
        if (key && !clientMap.has(key)) {
          // Attach relevant BOQs
          const clientBoqs = boqList.filter((b) => {
            const bPhone = (b.clientPhone || "").replace(/\D/g, "").slice(-10);
            const bName = (b.clientName || "").trim().toLowerCase();
            return (bPhone && bPhone === (c.phone || "").replace(/\D/g, "").slice(-10)) ||
                   (bName && bName === (c.name || "").trim().toLowerCase());
          });
          clientMap.set(key, { ...c, boqs: clientBoqs.length > 0 ? clientBoqs : (c.boqs || []) });
        }
      });

      // For any BOQ whose client is truly missing from DB, add single fallback entry
      boqList.forEach((b, idx) => {
        if (b.clientName) {
          const fakeClient = {
            name: b.clientName,
            phone: b.clientPhone || "",
            email: b.clientEmail || ""
          };
          const key = getClientKey(fakeClient);
          if (key && !clientMap.has(key)) {
            clientMap.set(key, {
              _id: b._id || `boq-cl-${idx}`,
              clientCode: `VEL-CL-${1010 + idx}`,
              name: b.clientName,
              phone: b.clientPhone || "",
              email: b.clientEmail || (b.clientName ? `${b.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com` : ""),
              city: "Pune",
              address: b.clientAddress || "",
              status: "Active",
              projectType: b.numberOfSpaces ? `${b.numberOfSpaces} Space Residence` : "Turnkey Fitout",
              budgetRange: b.grandTotal > 5000000 ? "₹60L - ₹90L" : "₹25L - ₹40L",
              commercialSummary: {
                grandTotal: b.grandTotal || 0,
                subtotal: b.subtotal || Math.round((b.grandTotal || 0) / 1.18),
                taxGst: b.gstTotal || Math.round((b.grandTotal || 0) * 0.18 / 1.18),
                paidAmount: 0,
                balanceDue: b.grandTotal || 0
              },
              boqs: [b]
            });
          }
        }
      });

      setClients(Array.from(clientMap.values()));
    } catch (err) {
      console.error("Failed to load clients & BOQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingClientId(null);
    setFormData(initialFormData);
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClientId(client._id);
    setFormData({
      ...initialFormData,
      ...client,
      spaceRequirements: client.spaceRequirements || initialFormData.spaceRequirements
    });
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Client Name and Phone are required.");
      return;
    }

    try {
      if (editingClientId) {
        await erpApi.updateClient(editingClientId, formData);
        setSuccessToast("Client profile updated successfully!");
      } else {
        await erpApi.createClient(formData);
        setSuccessToast("New client added successfully!");
      }
      setIsEditModalOpen(false);
      loadClients();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to save client: " + err.message);
    }
  };

  const handleDeleteClient = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"?`)) return;
    try {
      await erpApi.deleteClient(id);
      setSuccessToast("Client removed.");
      loadClients();
      if (selectedClient?._id === id) setSelectedClient(null);
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      alert("Failed to delete client: " + err.message);
    }
  };

  const handleAddLog = async () => {
    if (!selectedClient || !newLog.trim()) return;
    try {
      const res = await erpApi.addClientCommunication(selectedClient._id, { summary: newLog.trim(), channel: "Call" });
      setNewLog("");
      if (res?.data) {
        setSelectedClient(res.data);
      }
      loadClients();
    } catch (err) {
      alert("Failed to record communication log: " + err.message);
    }
  };

  // Get isolated documents for currently selected client (No dummy/mock data - only real uploaded files)
  const getSelectedClientDocuments = () => {
    if (!selectedClient) return [];
    const clientKey = selectedClient._id || selectedClient.clientCode || selectedClient.clientId || (selectedClient.phone ? `p_${selectedClient.phone}` : "default");

    // 1. Documents directly on selectedClient (from backend DB)
    const backendDocs = Array.isArray(selectedClient.documents) ? selectedClient.documents : [];

    // 2. Documents stored in clientDocumentsMap / localStorage
    const localDocs = clientDocumentsMap[clientKey] || [];

    // Merge by id / title / url ensuring no duplicates
    const combined = [...backendDocs];
    for (const doc of localDocs) {
      const exists = combined.some(
        (d) =>
          (d._id && String(d._id) === String(doc.id || doc._id)) ||
          (d.id && String(d.id) === String(doc.id || doc._id)) ||
          (d.fileName && d.fileName === doc.fileName && d.title === doc.title)
      );
      if (!exists) {
        combined.push(doc);
      }
    }

    return combined;
  };

  // Upload new document for selected client
  const handleUploadClientDoc = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!newDocTitle.trim()) {
      setErrorMsg("Please enter a document title");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setIsUploadingDoc(true);
    const clientKey = selectedClient._id || selectedClient.clientCode || selectedClient.clientId || (selectedClient.phone ? `p_${selectedClient.phone}` : "default");

    try {
      let fileUrl = "";
      let fileName = newDocFile ? newDocFile.name : `${newDocTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
      let fileSize = newDocFile ? `${(newDocFile.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB";
      let fileType = fileName.split(".").pop().toUpperCase() || "PDF";

      if (newDocFile) {
        try {
          const uploadRes = await erpApi.uploadImage(newDocFile);
          if (uploadRes?.imageUrl) {
            fileUrl = uploadRes.imageUrl;
          }
        } catch {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(newDocFile);
          });
        }
      }

      const docPayload = {
        id: "doc_" + Date.now(),
        title: newDocTitle.trim(),
        name: newDocTitle.trim(),
        fileName: fileName,
        url: fileUrl,
        fileType: fileType,
        category: newDocCategory,
        fileSize: fileSize,
        uploadedBy: "Admin",
        uploadedAt: new Date().toISOString()
      };

      // 1. If client exists on backend, post to API
      if (selectedClient._id) {
        try {
          const res = await erpApi.addClientDocument(selectedClient._id, docPayload);
          if (res?.data) {
            setSelectedClient(res.data);
          }
        } catch (apiErr) {
          console.warn("Backend document save sync fallback to local store:", apiErr);
        }
      }

      // 2. Persist in clientDocumentsMap & localStorage
      const currentList = getSelectedClientDocuments();
      const updatedList = [docPayload, ...currentList];
      const updatedMap = { ...clientDocumentsMap, [clientKey]: updatedList };

      setClientDocumentsMap(updatedMap);
      localStorage.setItem("velora_clients_documents_vault", JSON.stringify(updatedMap));

      // Reset form
      setNewDocTitle("");
      setNewDocFile(null);
      setShowUploadModal(false);
      setSuccessToast(`Document '${docPayload.title}' saved to ${selectedClient.name}'s profile!`);
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload document: " + err.message);
      setTimeout(() => setErrorMsg(""), 3500);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Delete document
  const handleDeleteClientDoc = async (docId, docTitle) => {
    if (!selectedClient) return;
    if (!window.confirm(`Are you sure you want to delete '${docTitle || "this document"}'?`)) return;

    const clientKey = selectedClient._id || selectedClient.clientCode || selectedClient.clientId || (selectedClient.phone ? `p_${selectedClient.phone}` : "default");

    try {
      if (selectedClient._id) {
        try {
          await erpApi.deleteClientDocument(selectedClient._id, docId);
        } catch (apiErr) {
          console.warn("Backend document delete fallback:", apiErr);
        }
      }

      const currentList = getSelectedClientDocuments();
      const updatedList = currentList.filter(
        (d) => String(d._id) !== String(docId) && String(d.id) !== String(docId)
      );
      const updatedMap = { ...clientDocumentsMap, [clientKey]: updatedList };

      setClientDocumentsMap(updatedMap);
      localStorage.setItem("velora_clients_documents_vault", JSON.stringify(updatedMap));

      setSuccessToast("Document removed from client profile");
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete document");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Download document
  const handleDownloadDoc = (doc) => {
    if (doc.url && doc.url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = doc.url;
      a.download = doc.fileName || `${doc.title}.${(doc.fileType || "pdf").toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessToast(`Downloaded ${doc.fileName || doc.title}`);
      setTimeout(() => setSuccessToast(""), 2500);
      return;
    }
    if (doc.url && (doc.url.startsWith("http://") || doc.url.startsWith("https://"))) {
      window.open(doc.url, "_blank");
      setSuccessToast(`Opened ${doc.fileName || doc.title}`);
      setTimeout(() => setSuccessToast(""), 2500);
      return;
    }
    const blob = new Blob(
      [
        `VELORA LUXURY INTERIORS - OFFICIAL CLIENT ARCHIVE\n` +
          `--------------------------------------------------\n` +
          `Document: ${doc.title}\n` +
          `Category: ${doc.category}\n` +
          `Client: ${selectedClient?.name || "Client"}\n` +
          `File: ${doc.fileName || doc.title}\n` +
          `Date: ${new Date(doc.uploadedAt || Date.now()).toLocaleDateString("en-IN")}\n` +
          `Verified by: Velora Quality Assurance & Engineering Division\n`
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName ? (doc.fileName.endsWith(".txt") ? doc.fileName : `${doc.fileName}.txt`) : `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessToast(`Downloaded ${doc.fileName || doc.title}`);
    setTimeout(() => setSuccessToast(""), 2500);
  };

  const getFileCategoryColor = (category) => {
    switch (category) {
      case "2D Layout & Floor Plans":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "3D Designs & Renders":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Contracts & Agreements":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Site Photos & Measurements":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Quotation & Invoices":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Material Specs & KYC":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Sample BOQ items for client view demonstration
  const getClientSampleProducts = (client) => {
    if (client.name?.toLowerCase().includes("prem")) {
      return [
        { name: "Queen Size Bed, With Cush", category: "Bedroom", dimensions: "6.5 × 5.5 ft", qty: 1, unit: "Unit", rate: 36000, discount: 0, tax: 0, total: 36000 },
        { name: "King Size Bed Hydrolic", category: "Bedroom", dimensions: "6.5 × 6.5 ft", qty: 1, unit: "Unit", rate: 64000, discount: 0, tax: 0, total: 64000 },
        { name: "Openable Wardrobe 1", category: "Storage", dimensions: "7.0 × 6.0 ft", qty: 1, unit: "Unit", rate: 55000, discount: 0, tax: 0, total: 55000 },
        { name: "Openable Wardrobe 2, Study", category: "Storage", dimensions: "8.5 × 7.0 ft", qty: 1, unit: "Unit", rate: 71400, discount: 0, tax: 0, total: 71400 },
        { name: "Openable Wardrobe 3, Study", category: "Storage", dimensions: "5.0 × 7.0 ft", qty: 1, unit: "Unit", rate: 40800, discount: 0, tax: 0, total: 40800 },
        { name: "Study Table", category: "Furniture", dimensions: "8.0 × 2.5 ft", qty: 1, unit: "Unit", rate: 67200, discount: 0, tax: 0, total: 67200 },
        { name: "Side Table", category: "Furniture", dimensions: "1.5 × 1.5 ft", qty: 4, unit: "Unit", rate: 5500, discount: 0, tax: 0, total: 22000 },
        { name: "Dressing", category: "Storage", dimensions: "3.0 × 7.0 ft", qty: 3, unit: "Unit", rate: 21000, discount: 0, tax: 0, total: 63000 },
        { name: "Shoe Rack, With Side Sitting", category: "Foyer", dimensions: "4.0 × 3.0 ft", qty: 1, unit: "Unit", rate: 14400, discount: 0, tax: 0, total: 14400 }
      ];
    }
    return [
      { name: "Modular Island Kitchen", category: "Kitchen", dimensions: "12.0 × 8.0 ft", qty: 1, unit: "Unit", rate: 250000, discount: 20000, tax: 41400, total: 271400 },
      { name: "Master Bedroom Full-Height Wardrobe", category: "Bedroom", dimensions: "10.0 × 9.0 ft", qty: 1, unit: "Unit", rate: 180000, discount: 10000, tax: 30600, total: 200600 },
      { name: "Living Room Fluted TV Console", category: "Living Room", dimensions: "9.0 × 7.5 ft", qty: 1, unit: "Unit", rate: 95000, discount: 5000, tax: 16200, total: 106200 }
    ];
  };

  const columns = [
    {
      header: "Client ID",
      key: "clientCode",
      render: (row) => (
        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.clientId || row.clientCode}
        </span>
      )
    },
    {
      header: "Client Name & Location",
      key: "name",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 block">{row.name}</span>
          <span className="text-[10px] text-slate-500 font-semibold">{row.city || "Pune"}</span>
        </div>
      )
    },
    {
      header: "Contact Details",
      render: (row) => (
        <div className="space-y-0.5">
          <span className="block font-semibold text-slate-800">{row.phone}</span>
          <span className="block text-[10px] text-slate-500 truncate max-w-[140px]">{row.email}</span>
        </div>
      )
    },
    {
      header: "Project Requirements",
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <Home size={11} />
            {row.projectType || "3BHK Luxury"}
          </span>
          <span className="block text-[10px] text-slate-500 font-medium">
            Budget: <b className="text-slate-700">{row.budgetRange || "₹25L - ₹40L"}</b>
          </span>
        </div>
      )
    },
    {
      header: "Commercials",
      render: (row) => {
        const comm = row.commercialSummary || {};
        const grand = comm.grandTotal || (row.name?.includes("PREM") ? 468800 : 0);
        return (
          <div>
            <span className="font-mono font-extrabold text-slate-900 block">
              ₹{grand.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {comm.paidAmount ? `Paid ₹${comm.paidAmount.toLocaleString("en-IN")}` : "Ready for Invoice"}
            </span>
          </div>
        );
      }
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
            row.status === "Active"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : row.status === "Completed"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedClient(row);
              setActiveClientTab("overview");
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="View 360° Profile"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Edit Client Requirements"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              navigate("/invoices", {
                state: {
                  createFromClient: true,
                  client: row
                }
              });
            }}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
            title="Generate Tax Invoice"
          >
            <Receipt size={14} />
          </button>
          <button
            onClick={() => handleDeleteClient(row._id, row.name)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Delete Client"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Clients Directory View */}
      {!selectedClient && (
        <>
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clients Directory</h1>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {clients.length} Registered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Velora Antaraal • Connected Enquiry &rarr; Client 360° &rarr; BOQ Estimates &rarr; Tax Invoices
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Client</span>
            </button>
          </div>

          {/* Main Table */}
          <DataTable
            title="All Clients & Accounts"
            columns={columns}
            data={clients}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={["Active", "Lead", "Completed", "Archived"]}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CLIENT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  {editingClientId ? "Modify Client & Requirements" : "Add New Client Profile"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClient} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} />
                  <span>1. Contact & Identity</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Client Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PREM SHUKLA"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 78000 20496"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. premshukla@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune / Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Site / Delivery Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 402, WAKAD CHOWK, AUNDH HINJEWADI ROAD, WAKAD, PUNE, 411057"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Project Scope & Requirement Customization */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={13} />
                  <span>2. Project Requirements & Preferences</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project Type</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {projectTypesList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Styling / Theme</label>
                    <select
                      value={formData.preferredStyle}
                      onChange={(e) => setFormData({ ...formData, preferredStyle: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {stylesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Budget Range</label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {budgetRangesList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-xs transition cursor-pointer"
                >
                  {editingClientId ? "Save Requirements" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL-PAGE CLIENT 360° WORKSPACE (WHEN CLIENT IS SELECTED) */}
      {/* ========================================================================= */}
      {selectedClient && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Executive Header with Back Navigation & Quick Actions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedClient(null)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                title="Return to Clients Directory"
              >
                <ArrowRight size={14} className="rotate-180" />
                <span>Back to All Clients</span>
              </button>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedClient.salutation ? `${selectedClient.salutation} ` : ""}{selectedClient.name}
                  </h1>
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                    {selectedClient.clientId || selectedClient.clientCode || "VLA-CL-1001"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      selectedClient.status === "Active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {selectedClient.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedClient.phone} • {selectedClient.email || "No email"} • {selectedClient.city || "Pune, Maharashtra"}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenEditModal(selectedClient)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Client</span>
              </button>

              <button
                onClick={() => {
                  navigate("/boq", {
                    state: {
                      clientName: selectedClient.name,
                      clientPhone: selectedClient.phone,
                      clientEmail: selectedClient.email
                    }
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span>Open in BOQ Builder</span>
              </button>

              <button
                onClick={() => {
                  navigate("/invoices", {
                    state: {
                      createFromClient: true,
                      client: selectedClient
                    }
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Receipt size={14} />
                <span>Generate Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* 2-Column Full-Page Layout with Left Side Tags/Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar Navigation Tags / Tabs (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Profile Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {selectedClient.name?.substring(0, 2).toUpperCase() || "CL"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{selectedClient.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {selectedClient.projectType || "Turnkey Project"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Commercials:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{(selectedClient.commercialSummary?.grandTotal || (selectedClient.name?.includes("PREM") ? 468800 : 525000)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Style:</span>
                    <span className="font-bold text-slate-700">{selectedClient.preferredStyle || "Modern Contemporary"}</span>
                  </div>
                </div>
              </div>

              {/* Vertical Navigation Tags / Tabs */}
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Client Workspace
                </div>
                {[
                  { id: "overview", label: "Overview & Profile", icon: User },
                  { id: "project", label: "Project & Design Scope", icon: Home },
                  { id: "boq", label: "BOQ & Products Scope", icon: Layers },
                  { id: "pricing", label: "Pricing & Commercials", icon: IndianRupee },
                  { id: "invoices", label: "Tax Invoices & Billing", icon: Receipt },
                  { id: "documents", label: "Documents & Files", icon: FileText },
                  { id: "notes", label: "Communication & Calls", icon: PhoneCall }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeClientTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveClientTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition cursor-pointer text-left ${
                        active
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={active ? "text-white" : "text-slate-500"} />
                        <span className="font-bold">{tab.label}</span>
                      </div>
                      <ArrowRight size={13} className={active ? "text-white" : "text-slate-300"} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Full-Width Main Content Workspace (9 cols) */}
            <div className="lg:col-span-9 space-y-6">
              {/* 1. OVERVIEW TAB */}
              {activeClientTab === "overview" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <User size={13} className="text-blue-600" />
                      <span>Basic Client Information</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-slate-700 text-xs">
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Client ID</span>
                        <span className="font-bold font-mono text-slate-900">{selectedClient.clientId || selectedClient.clientCode}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Client Name</span>
                        <span className="font-bold text-slate-900">{selectedClient.name}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Phone Number</span>
                        <span className="font-medium text-slate-800">{selectedClient.phone}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Email Address</span>
                        <span className="font-medium text-slate-800">{selectedClient.email || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 text-[10px] font-semibold">Site Address</span>
                        <span className="font-medium text-slate-800">{selectedClient.address || "Pune, Maharashtra"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Home size={13} className="text-blue-600" />
                      <span>Project & Style Requirements</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-slate-700 text-xs">
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Project Type</span>
                        <span className="font-bold text-slate-900">{selectedClient.projectType || "3BHK Luxury Apartment"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Location</span>
                        <span className="font-medium text-slate-800">{selectedClient.city || "Pune"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Design Styling</span>
                        <span className="font-medium text-slate-800">{selectedClient.preferredStyle || "Modern Contemporary"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] font-semibold">Budget Range</span>
                        <span className="font-bold text-blue-600">{selectedClient.budgetRange || "₹25L - ₹40L"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PROJECT TAB */}
              {activeClientTab === "project" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-extrabold text-slate-900 text-xs">Project Master File</h4>
                      <span className="font-bold font-mono text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        PRJ-2026-008
                      </span>
                    </div>
                    <div className="space-y-2 text-slate-700 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Project Scope:</span>
                        <span className="font-bold">Turnkey Interior Execution</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Stage:</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">In Production</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Handover Timeline:</span>
                        <span className="font-medium">45 Days from Sign-off</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BOQ & PRODUCTS TAB */}
              {activeClientTab === "boq" && (() => {
                const clientBOQ = allBOQs.find((b) => b.clientName?.toLowerCase() === selectedClient.name?.toLowerCase()) || (selectedClient.boqs && selectedClient.boqs[0]);
                const sampleProducts = getClientSampleProducts(selectedClient);

                return (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          {clientBOQ ? `${clientBOQ.boqNumber || "BOQ-2026-018"} • ${clientBOQ.activePackage || "Standard"} Specification` : "Configured BOQ Products"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Total Estimate: <b className="font-mono text-slate-900">₹{((clientBOQ?.grandTotal) || (selectedClient.name?.includes("PREM") ? 468800 : 525000)).toLocaleString("en-IN")}</b>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {clientBOQ && (
                          <button
                            onClick={() => downloadBOQPdf(clientBOQ)}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Download size={11} />
                            <span>PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigate("/invoices", {
                              state: {
                                createFromBOQ: true,
                                boqData: clientBOQ || {
                                  clientName: selectedClient.name,
                                  clientPhone: selectedClient.phone,
                                  clientEmail: selectedClient.email,
                                  grandTotal: selectedClient.commercialSummary?.grandTotal || 468800
                                }
                              }
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles size={11} />
                          <span>Auto Invoice</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/boq", { state: { clientName: selectedClient.name, clientPhone: selectedClient.phone } });
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer pl-1"
                        >
                          <span>BOQ Editor</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Spaces / Products List */}
                    {clientBOQ && clientBOQ.spaces && clientBOQ.spaces.length > 0 ? (
                      <div className="space-y-3">
                        {clientBOQ.spaces.map((sp, sIdx) => (
                          <div key={sIdx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{sp.name}</span>
                              <span className="font-mono font-bold text-xs text-blue-600">
                                ₹{(sp.roomTotal || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                            {sp.items && sp.items.length > 0 ? (
                              <div className="divide-y divide-slate-100 p-2 space-y-1">
                               {sp.items.map((it, iIdx) => (
                                  <div key={iIdx} className="flex items-center justify-between p-1.5 text-xs">
                                    <div>
                                      <span className="font-bold text-slate-900 block">{it.name}</span>
                                      <span className="text-[10px] text-slate-400">
                                        {it.packageVariant || "Standard"} • {it.lengthFt ? `${it.lengthFt}ft × ${it.heightFt || 1}ft` : "Custom"} • Qty: {it.qty || 1}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-900">
                                      ₹{(it.amount || (it.rate * (it.qty || 1))).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2 text-slate-400 text-[11px] italic">Turnkey space fitout included</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sampleProducts.map((p, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 text-xs block">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {p.category} • Size: {p.dimensions} • Qty: {p.qty} {p.unit}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 text-xs block">
                                ₹{p.total.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                @ ₹{p.rate.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 4. PRICING & COMMERCIALS TAB */}
              {activeClientTab === "pricing" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">
                      Commercial Summary & Financial Breakdown
                    </h4>
                    <div className="space-y-2 text-slate-700 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Products Subtotal:</span>
                        <span className="font-bold font-mono text-slate-900">
                          ₹{(selectedClient.name?.includes("PREM") ? 468800 : 525000).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Discount:</span>
                        <span className="font-bold font-mono text-emerald-600">₹0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Additional Charges (Installation & Transport):</span>
                        <span className="font-mono text-slate-700">₹0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GST / Tax Amount:</span>
                        <span className="font-mono text-slate-700">₹0</span>
                      </div>
                      <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between font-extrabold text-sm shadow-xs mt-3">
                        <span>Grand Total Amount</span>
                        <span className="font-mono text-base text-blue-400">
                          ₹{(selectedClient.name?.includes("PREM") ? 468800 : 525000).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. INVOICES TAB */}
              {activeClientTab === "invoices" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Tax Invoices</span>
                    <button
                      onClick={() => {
                        navigate("/invoices", { state: { createFromClient: true, client: selectedClient } });
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Create Tax Invoice</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs text-slate-900 block">
                          {selectedClient.invoiceNumber || `VLA-INV-${selectedClient.clientCode || "001"}`}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                          Issued
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Issued: {new Date().toLocaleDateString("en-IN")} • Velora Turnkey Interior Execution
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 font-medium block">Grand Total</span>
                        <span className="font-mono font-bold text-sm text-slate-900">
                          ₹{(selectedClient.commercialSummary?.grandTotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          navigate("/invoices", {
                            state: {
                              openInvoice: selectedClient.invoiceNumber || `VLA-INV-${selectedClient.clientCode || "001"}`
                            }
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
                        title="Preview Tax Invoice Template"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => {
                          const invNum = selectedClient.invoiceNumber || `VLA-INV-${selectedClient.clientCode || "001"}`;
                          const totalAmt = selectedClient.commercialSummary?.grandTotal || 0;
                          printInvoice({
                            invoiceNumber: invNum,
                            clientName: selectedClient.name,
                            clientPhone: selectedClient.phone,
                            clientEmail: selectedClient.email,
                            clientAddress: selectedClient.address,
                            projectName: `${selectedClient.name} Project`,
                            grandTotal: totalAmt,
                            subtotal: totalAmt
                          });
                        }}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        title="Print Tax Invoice"
                      >
                        <Printer size={14} />
                        <span>Print Invoice</span>
                      </button>

                      <button
                        onClick={() => {
                          const invNum = selectedClient.invoiceNumber || `VLA-INV-${selectedClient.clientCode || "001"}`;
                          const totalAmt = selectedClient.commercialSummary?.grandTotal || 0;
                          downloadInvoicePdf({
                            invoiceNumber: invNum,
                            clientName: selectedClient.name,
                            clientPhone: selectedClient.phone,
                            clientEmail: selectedClient.email,
                            clientAddress: selectedClient.address,
                            projectName: `${selectedClient.name} Project`,
                            grandTotal: totalAmt,
                            subtotal: totalAmt
                          });
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        title="Download Luxury Tax Invoice PDF"
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. DOCUMENTS & FILES TAB */}
              {activeClientTab === "documents" && (() => {
                const allClientDocs = getSelectedClientDocuments();
                const filteredDocs = allClientDocs.filter((doc) => {
                  const matchCategory = docCategoryFilter === "All" || doc.category === docCategoryFilter;
                  const matchSearch =
                    !docSearch ||
                    (doc.title && doc.title.toLowerCase().includes(docSearch.toLowerCase())) ||
                    (doc.fileName && doc.fileName.toLowerCase().includes(docSearch.toLowerCase())) ||
                    (doc.category && doc.category.toLowerCase().includes(docSearch.toLowerCase()));
                  return matchCategory && matchSearch;
                });

                const categoriesList = [
                  "All",
                  "2D Layout & Floor Plans",
                  "3D Designs & Renders",
                  "Contracts & Agreements",
                  "Site Photos & Measurements",
                  "Quotation & Invoices",
                  "Material Specs & KYC"
                ];

                return (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Header Bar */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <FolderOpen size={17} className="text-blue-600" />
                            <span>Client Documents, CAD Drawings & 3D Files</span>
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[11px] font-bold rounded-full border border-blue-200">
                            {allClientDocs.length} files
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Secure vault for {selectedClient.name} • 2D plans, 3D renderings, agreements & site records
                        </p>
                      </div>

                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <UploadCloud size={15} />
                        <span>Upload Document / Design</span>
                      </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:w-80">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search client files by name, type, or title..."
                            value={docSearch}
                            onChange={(e) => setDocSearch(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Showing {filteredDocs.length} of {allClientDocs.length} documents
                        </span>
                      </div>

                      {/* Category Pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                        {categoriesList.map((cat) => {
                          const count = cat === "All" ? allClientDocs.length : allClientDocs.filter((d) => d.category === cat).length;
                          const active = docCategoryFilter === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => setDocCategoryFilter(cat)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              <span>{cat}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload Modal Drawer/Popup */}
                    {showUploadModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <UploadCloud size={18} />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 text-sm">Upload File for {selectedClient.name}</h3>
                                <span className="text-[10px] text-slate-500">Supports PDFs, 2D/3D images, CAD drawings & agreements</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowUploadModal(false)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <form onSubmit={handleUploadClientDoc} className="space-y-3.5 text-xs">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Document / Design Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Master Bedroom 3D Isometric View"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Document Category *</label>
                              <select
                                value={newDocCategory}
                                onChange={(e) => setNewDocCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="2D Layout & Floor Plans">2D Layout & Floor Plans (CAD / DWG)</option>
                                <option value="3D Designs & Renders">3D Designs & Renders (Photorealistic)</option>
                                <option value="Contracts & Agreements">Contracts & Agreements (Signed PDF)</option>
                                <option value="Site Photos & Measurements">Site Photos & Measurements</option>
                                <option value="Quotation & Invoices">Quotation & Invoices</option>
                                <option value="Material Specs & KYC">Material Specs & KYC Profile</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold mb-1">Select File / Attachment</label>
                              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 transition bg-slate-50">
                                <input
                                  type="file"
                                  id="clientDocFileInput"
                                  onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="clientDocFileInput"
                                  className="cursor-pointer flex flex-col items-center gap-1.5"
                                >
                                  <UploadCloud size={24} className="text-blue-600" />
                                  <span className="font-bold text-slate-800 text-xs">
                                    {newDocFile ? newDocFile.name : "Click to select a file from device"}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {newDocFile
                                      ? `${(newDocFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                                      : "PDF, JPG, PNG, WEBP, DWG, DOCX up to 50MB"}
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isUploadingDoc}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
                              >
                                {isUploadingDoc ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} />
                                    <span>Save & Attach Document</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Preview Modal */}
                    {previewDoc && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2.5">
                              <FileText size={18} className="text-blue-600" />
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h3>
                                <span className="text-[10px] text-slate-500">
                                  {previewDoc.category} • {previewDoc.fileName} • {previewDoc.fileSize}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadDoc(previewDoc)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => setPreviewDoc(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>

                          <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-900 min-h-[350px]">
                            {previewDoc.url && (previewDoc.fileType?.includes("JPG") || previewDoc.fileType?.includes("PNG") || previewDoc.fileType?.includes("WEBP") || previewDoc.url.startsWith("data:image") || previewDoc.url.includes("unsplash")) ? (
                              <img
                                src={previewDoc.url}
                                alt={previewDoc.title}
                                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                              />
                            ) : (
                              <div className="text-center p-8 space-y-3 bg-white/10 rounded-2xl text-white max-w-md">
                                <FileText size={48} className="mx-auto text-blue-400" />
                                <h4 className="font-bold text-base">{previewDoc.title}</h4>
                                <p className="text-xs text-slate-300">
                                  Official {previewDoc.fileType || "PDF"} Document for {selectedClient.name}
                                </p>
                                <button
                                  onClick={() => handleDownloadDoc(previewDoc)}
                                  className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2"
                                >
                                  <Download size={14} /> Download & Open File
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documents List Grid */}
                    {filteredDocs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredDocs.map((doc) => {
                          const isImage =
                            doc.fileType?.includes("JPG") ||
                            doc.fileType?.includes("PNG") ||
                            doc.fileType?.includes("WEBP") ||
                            doc.url?.startsWith("data:image") ||
                            doc.url?.includes("unsplash");

                          return (
                            <div
                              key={doc.id || doc._id}
                              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-200 flex flex-col justify-between gap-3 shadow-2xs group"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getFileCategoryColor(
                                      doc.category
                                    )}`}
                                  >
                                    {doc.category || "General Document"}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {doc.fileType || "PDF"}
                                  </span>
                                </div>

                                <div className="flex gap-3 items-center">
                                  {isImage && doc.url ? (
                                    <div
                                      onClick={() => setPreviewDoc(doc)}
                                      className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer border border-slate-200 relative group/thumb"
                                    >
                                      <img
                                        src={doc.url}
                                        alt={doc.title}
                                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition"
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white">
                                        <Eye size={14} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                      <FileText size={20} />
                                    </div>
                                  )}

                                  <div className="overflow-hidden">
                                    <h5
                                      className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-blue-600 transition cursor-pointer"
                                      onClick={() => (doc.url ? setPreviewDoc(doc) : handleDownloadDoc(doc))}
                                    >
                                      {doc.title}
                                    </h5>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                      {doc.fileName || "document.pdf"}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                      <span>{doc.fileSize || "1.5 MB"}</span>
                                      <span>•</span>
                                      <span>{new Date(doc.uploadedAt || Date.now()).toLocaleDateString("en-IN")}</span>
                                      <span>•</span>
                                      <span>{doc.uploadedBy || "Admin"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => (doc.url ? setPreviewDoc(doc) : handleDownloadDoc(doc))}
                                    className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-bold text-[11px] rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                                    title="View / Preview"
                                  >
                                    <Eye size={12} />
                                    <span>Preview</span>
                                  </button>
                                  <button
                                    onClick={() => handleDownloadDoc(doc)}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download size={12} />
                                    <span>Download</span>
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleDeleteClientDoc(doc.id || doc._id, doc.title)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Delete Document"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                        <FolderOpen size={36} className="mx-auto text-slate-300" />
                        <h5 className="font-bold text-slate-700 text-sm">No documents found</h5>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {docSearch
                            ? `No files match the search "${docSearch}". Try another search term.`
                            : `No files uploaded in "${docCategoryFilter}" yet. Upload 2D CAD layouts, 3D renderings, or signed contracts.`}
                        </p>
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UploadCloud size={14} />
                          <span>Upload First File</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 7. COMMUNICATION & CALLS TAB */}
              {activeClientTab === "notes" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <PhoneCall size={14} className="text-blue-600" />
                          <span>Communication & Consultation History</span>
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          Interaction logs and notes recorded for {selectedClient.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Record discussion notes, client phone conversation, or requirements..."
                        value={newLog}
                        onChange={(e) => setNewLog(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <button
                        onClick={handleAddLog}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Record Note</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pt-2">
                      {(selectedClient.communicationHistory || []).length > 0 ? (
                        (selectedClient.communicationHistory || []).map((log, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <p className="font-bold text-slate-800 text-xs">{log.summary}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <span className="font-semibold text-blue-600">{log.channel || "Call"}</span>
                              <span>•</span>
                              <span>{new Date(log.timestamp).toLocaleString("en-IN")}</span>
                              <span>•</span>
                              <span>By {log.performedBy || "Staff"}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
                          No consultation calls or notes recorded yet. Type a note above to record.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
