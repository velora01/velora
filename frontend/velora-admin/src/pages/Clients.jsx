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
  FileCheck
} from "lucide-react";
import { downloadBOQPdf, downloadInvoicePdf } from "../utils/downloadHelper";

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

      let clientList = resClients?.data || [];

      // Ensure all clients present in BOQs exist in the clients table
      boqList.forEach((b, idx) => {
        if (b.clientName) {
          const match = clientList.find(
            (c) =>
              c.name?.toLowerCase() === b.clientName?.toLowerCase() ||
              (b.clientPhone && c.phone === b.clientPhone)
          );
          if (!match) {
            clientList.push({
              _id: b._id || `boq-cl-${idx}`,
              clientCode: `VEL-CL-${1010 + idx}`,
              name: b.clientName,
              phone: b.clientPhone || "89482 74553",
              email: b.clientEmail || `${b.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
              city: "Pune",
              address: b.clientAddress || "Baner / Koregaon Park, Pune",
              status: "Active",
              projectType: `${b.numberOfSpaces || 5}BHK Luxury Residence`,
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

      setClients(clientList);
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
        <span className="font-mono font-bold text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
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
          <span className="font-extrabold text-stone-900 block">{row.name}</span>
          <span className="text-[10px] text-stone-400 font-semibold">{row.city || "Pune"}</span>
        </div>
      )
    },
    {
      header: "Contact Details",
      render: (row) => (
        <div className="space-y-0.5">
          <span className="block font-semibold text-stone-800">{row.phone}</span>
          <span className="block text-[10px] text-stone-400 truncate max-w-[140px]">{row.email}</span>
        </div>
      )
    },
    {
      header: "Project Requirements",
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9E7B1D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Home size={11} />
            {row.projectType || "3BHK Luxury"}
          </span>
          <span className="block text-[10px] text-stone-500 font-medium">
            Budget: <b className="text-stone-700">{row.budgetRange || "₹25L - ₹40L"}</b>
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
            <span className="font-mono font-extrabold text-stone-900 block">
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
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : "bg-stone-50 text-stone-600 border-stone-200"
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
            className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
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
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Clients Directory</h1>
            <span className="text-xs font-bold text-[#9E7B1D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {clients.length} Registered
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Single Source of Truth: Connected Enquiry &rarr; Client &rarr; BOQ &rarr; Invoice Lifecycle
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
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

      {/* ========================================================================= */}
      {/* ADD / EDIT CLIENT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#9E7B1D]" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  {editingClientId ? "Modify Client & Requirements" : "Add New Client Profile"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
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
                <h4 className="text-xs font-bold text-[#9E7B1D] uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} />
                  <span>1. Contact & Identity</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Client Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PREM SHUKLA"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 78000 20496"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. premshukla@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune / Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">Site / Delivery Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 402, WAKAD CHOWK, AUNDH HINJEWADI ROAD, WAKAD, PUNE, 411057"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Project Scope & Requirement Customization */}
              <div className="space-y-3 pt-3 border-t border-[#EAE3D2]">
                <h4 className="text-xs font-bold text-[#9E7B1D] uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={13} />
                  <span>2. Project Requirements & Preferences</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Project Type</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {projectTypesList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Preferred Styling / Theme</label>
                    <select
                      value={formData.preferredStyle}
                      onChange={(e) => setFormData({ ...formData, preferredStyle: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {stylesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Budget Range</label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {budgetRangesList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
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
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE3D2]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 rounded-xl font-black shadow-xs hover:opacity-95 transition cursor-pointer"
                >
                  {editingClientId ? "Save Requirements" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADVANCED 360° CLIENT DETAIL DRAWER (TABBED) */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title="Client 360° Detailed Workspace"
      >
        {selectedClient && (
          <div className="space-y-4 text-xs">
            {/* Top Client Header Badge */}
            <div className="p-4 bg-gradient-to-br from-[#FAF9F5] to-amber-50/50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-stone-900">{selectedClient.name}</h3>
                  <span className="font-mono font-bold text-xs text-[#9E7B1D] bg-amber-100 px-2 py-0.5 rounded-md">
                    {selectedClient.clientId || selectedClient.clientCode}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {selectedClient.phone} • {selectedClient.city || "Pune"}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    navigate("/invoices", { state: { createFromClient: true, client: selectedClient } });
                  }}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Receipt size={12} />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/boq", { state: { clientName: selectedClient.name, clientPhone: selectedClient.phone } });
                  }}
                  className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#B38E2D] text-stone-950 font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <FileSpreadsheet size={12} />
                  <span>BOQ</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "project", label: "Project", icon: Home },
                { id: "boq", label: "BOQ & Products", icon: Layers },
                { id: "pricing", label: "Pricing & Commercials", icon: IndianRupee },
                { id: "invoices", label: "Invoices", icon: Receipt },
                { id: "documents", label: "Documents", icon: FileText },
                { id: "notes", label: "Notes & Calls", icon: PhoneCall }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeClientTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveClientTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap text-xs transition cursor-pointer ${
                      active
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {/* 1. OVERVIEW TAB */}
            {activeClientTab === "overview" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-100 pb-2">
                    <User size={13} className="text-[#9E7B1D]" />
                    <span>Basic Client Information</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-stone-700 text-xs">
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Client ID</span>
                      <span className="font-bold font-mono">{selectedClient.clientId || selectedClient.clientCode}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Client Name</span>
                      <span className="font-bold text-stone-900">{selectedClient.name}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Phone Number</span>
                      <span className="font-medium">{selectedClient.phone}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Email Address</span>
                      <span className="font-medium">{selectedClient.email || "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-stone-400 text-[10px] font-semibold">Site Address</span>
                      <span className="font-medium">{selectedClient.address || "Pune, Maharashtra"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-100 pb-2">
                    <Home size={13} className="text-[#9E7B1D]" />
                    <span>Project & Style Requirements</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-stone-700 text-xs">
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Project Type</span>
                      <span className="font-bold text-stone-900">{selectedClient.projectType || "3BHK Luxury Apartment"}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Location</span>
                      <span className="font-medium">{selectedClient.city || "Pune"}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Design Styling</span>
                      <span className="font-medium">{selectedClient.preferredStyle || "Modern Contemporary"}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400 text-[10px] font-semibold">Budget Range</span>
                      <span className="font-bold text-[#9E7B1D]">{selectedClient.budgetRange || "₹25L - ₹40L"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROJECT TAB */}
            {activeClientTab === "project" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h4 className="font-extrabold text-stone-900 text-xs">Project Master File</h4>
                    <span className="font-bold font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      PRJ-2026-008
                    </span>
                  </div>
                  <div className="space-y-2 text-stone-700">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Project Scope:</span>
                      <span className="font-bold">Turnkey Interior Execution</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Current Stage:</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-[#9E7B1D] rounded font-bold">In Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Handover Timeline:</span>
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
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF9F5] p-3 rounded-2xl border border-amber-200">
                    <div>
                      <span className="font-extrabold text-xs text-stone-900 block">
                        {clientBOQ ? `${clientBOQ.boqNumber || "BOQ-2026-018"} • ${clientBOQ.activePackage || "Standard"} Specification` : "Configured BOQ Products"}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        Total Estimate: <b className="font-mono text-stone-900">₹{((clientBOQ?.grandTotal) || (selectedClient.name?.includes("PREM") ? 468800 : 525000)).toLocaleString("en-IN")}</b>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {clientBOQ && (
                        <button
                          onClick={() => downloadBOQPdf(clientBOQ)}
                          className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
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
                        <Sparkles size={11} className="text-amber-300 fill-amber-300" />
                        <span>Auto Invoice</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/boq", { state: { clientName: selectedClient.name, clientPhone: selectedClient.phone } });
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#9E7B1D] hover:underline cursor-pointer pl-1"
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
                        <div key={sIdx} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                          <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-xs">{sp.name}</span>
                            <span className="font-mono font-bold text-xs text-[#9E7B1D]">
                              ₹{(sp.roomTotal || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          {sp.items && sp.items.length > 0 ? (
                            <div className="divide-y divide-stone-100 p-2 space-y-1">
                              {sp.items.map((it, iIdx) => (
                                <div key={iIdx} className="flex items-center justify-between p-1.5 text-xs">
                                  <div>
                                    <span className="font-bold text-stone-900 block">{it.name}</span>
                                    <span className="text-[10px] text-stone-400">
                                      {it.packageVariant || "Standard"} • {it.lengthFt ? `${it.lengthFt}ft × ${it.heightFt || 1}ft` : "Custom"} • Qty: {it.qty || 1}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-stone-900">
                                    ₹{(it.amount || (it.rate * (it.qty || 1))).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 text-stone-400 text-[11px] italic">Turnkey space fitout included</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sampleProducts.map((p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-stone-900 text-xs block">{p.name}</span>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {p.category} • Size: {p.dimensions} • Qty: {p.qty} {p.unit}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-stone-900 text-xs block">
                              ₹{p.total.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
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
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-xs border-b border-stone-100 pb-2">
                    Commercial Summary & Financial Breakdown
                  </h4>
                  <div className="space-y-2 text-stone-700 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Products Subtotal:</span>
                      <span className="font-bold font-mono text-stone-900">
                        ₹{(selectedClient.name?.includes("PREM") ? 468800 : 525000).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total Discount:</span>
                      <span className="font-bold font-mono text-emerald-600">₹0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Additional Charges (Installation & Transport):</span>
                      <span className="font-mono text-stone-700">₹0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">GST / Tax Amount:</span>
                      <span className="font-mono text-stone-700">₹0</span>
                    </div>
                    <div className="p-3 bg-[#0A1128] text-white rounded-xl flex items-center justify-between font-extrabold text-sm shadow-xs mt-3">
                      <span>Grand Total Amount</span>
                      <span className="font-mono text-base">
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
                  <span className="font-extrabold text-xs text-stone-900">Tax Invoices</span>
                  <button
                    onClick={() => {
                      navigate("/invoices", { state: { createFromClient: true, client: selectedClient } });
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[11px] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Create Tax Invoice</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-xs text-stone-900 block">
                        {selectedClient.name?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001"}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                        Issued
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Issued: {new Date().toLocaleDateString("en-IN")} • Velora Turnkey Interior Execution
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <span className="text-[10px] text-stone-400 font-medium block">Grand Total</span>
                      <span className="font-mono font-bold text-sm text-stone-900">
                        ₹{(selectedClient.name?.includes("PREM") ? 468800 : 525000).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/invoices", {
                          state: {
                            openInvoice: selectedClient.name?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001"
                          }
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      title="Preview Tax Invoice Template"
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => {
                        const invNum = selectedClient.name?.includes("PREM") ? "NCIA003" : "VLA-INV-2026-0001";
                        const totalAmt = selectedClient.name?.includes("PREM") ? 468800 : 525000;
                        downloadInvoicePdf({
                          invoiceNumber: invNum,
                          clientName: selectedClient.name,
                          clientPhone: selectedClient.phone,
                          clientEmail: selectedClient.email,
                          clientAddress: selectedClient.address,
                          projectName: `${selectedClient.name} Residence`,
                          grandTotal: totalAmt,
                          subtotal: totalAmt
                        });
                      }}
                      className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#B38E2D] text-stone-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      title="Download Luxury Tax Invoice PDF"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DOCUMENTS & NOTES TAB */}
            {(activeClientTab === "documents" || activeClientTab === "notes") && (
              <div className="space-y-3 animate-in fade-in">
                <div className="space-y-3">
                  <h4 className="font-black text-stone-900 text-xs flex items-center gap-1.5">
                    <PhoneCall size={14} className="text-[#9E7B1D]" />
                    <span>Communication & Consultation Logs</span>
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Record discussion notes / client requirements..."
                      value={newLog}
                      onChange={(e) => setNewLog(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={handleAddLog}
                      className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#B38E2D] text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Record
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedClient.communicationHistory || []).map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-0.5">
                        <p className="font-semibold text-stone-800">{log.summary}</p>
                        <span className="text-[10px] text-stone-400 block">
                          {log.channel} • {new Date(log.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
