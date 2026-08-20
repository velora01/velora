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
  MessageSquare
} from "lucide-react";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer / Modal states
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [newLog, setNewLog] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Client Form state
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    city: "Pune",
    address: "",
    gstin: "",
    status: "Active",
    projectType: "3BHK Luxury Apartment",
    preferredStyle: "Modern Contemporary",
    budgetRange: "₹25L - ₹40L",
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
      const res = await erpApi.getClients({ search, status: statusFilter });
      if (res?.data) {
        setClients(res.data);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);
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
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      city: client.city || "Pune",
      address: client.address || "",
      gstin: client.gstin || "",
      status: client.status || "Active",
      projectType: client.projectType || "3BHK Luxury Apartment",
      preferredStyle: client.preferredStyle || "Modern Contemporary",
      budgetRange: client.budgetRange || "₹25L - ₹40L",
      spaceRequirements: client.spaceRequirements || ["Living Room", "Modular Kitchen", "Master Bedroom"],
      targetHandoverDate: client.targetHandoverDate ? new Date(client.targetHandoverDate).toISOString().split("T")[0] : "",
      specialInstructions: client.specialInstructions || "",
      notes: client.notes || ""
    });
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const handleToggleSpaceRequirement = (space) => {
    setFormData((prev) => {
      const exists = prev.spaceRequirements.includes(space);
      return {
        ...prev,
        spaceRequirements: exists
          ? prev.spaceRequirements.filter((s) => s !== space)
          : [...prev.spaceRequirements, space]
      };
    });
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingClientId) {
        await erpApi.updateClient(editingClientId, formData);
        setSuccessToast("Client requirements updated successfully!");
      } else {
        await erpApi.createClient(formData);
        setSuccessToast("New Client added successfully!");
      }

      setIsEditModalOpen(false);
      loadClients();
      if (selectedClient && selectedClient._id === editingClientId) {
        setSelectedClient((prev) => ({ ...prev, ...formData }));
      }
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save client");
    }
  };

  const handleDeleteClient = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"?`)) return;
    try {
      await erpApi.deleteClient(id);
      setSuccessToast(`Client "${name}" removed successfully.`);
      if (selectedClient?._id === id) setSelectedClient(null);
      loadClients();
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

  const columns = [
    {
      header: "Client Code",
      key: "clientCode",
      render: (row) => <span className="font-mono font-bold text-stone-500">{row.clientCode}</span>
    },
    {
      header: "Client Name & City",
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
      header: "Contact Info",
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
      header: "Preferred Style",
      render: (row) => (
        <span className="text-xs font-semibold text-stone-700">
          {row.preferredStyle || "Modern Contemporary"}
        </span>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
            row.status === "Active"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : row.status === "Lead"
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : row.status === "Completed"
              ? "bg-purple-50 text-purple-800 border-purple-200"
              : "bg-stone-100 text-stone-600 border-stone-200"
          }`}
        >
          {row.status || "Active"}
        </span>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedClient(row)}
            className="px-2.5 py-1 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-lg text-xs font-bold text-[#9E7B1D] transition cursor-pointer"
            title="View 360 Client Profile"
          >
            360° Profile
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-stone-400 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
            title="Edit Client & Requirements"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteClient(row._id, row.name)}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Delete Client"
          >
            <Trash2 size={13} />
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
            360-degree client profiles, project scope requirements, styling preferences, and communication history
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
        title="All Clients & Requirements Registry"
        columns={columns}
        data={clients}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={["Active", "Lead", "Completed", "Archived"]}
      />

      {/* ========================================================================= */}
      {/* ADD / EDIT CLIENT & REQUIREMENTS MODAL */}
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
                      placeholder="e.g. Rajeev Singhal"
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
                      placeholder="e.g. 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. client@example.com"
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
                    <label className="block font-semibold text-stone-700 mb-1">Site Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 802, Marvel Gold, Koregaon Park, Pune"
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
                    <label className="block font-semibold text-stone-700 mb-1">Target Handover Date</label>
                    <input
                      type="date"
                      value={formData.targetHandoverDate}
                      onChange={(e) => setFormData({ ...formData, targetHandoverDate: e.target.value })}
                      className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Spaces Required Checklist */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Spaces to Design & Execute ({formData.spaceRequirements.length} selected):
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {availableSpaces.map((space) => {
                      const isSelected = formData.spaceRequirements.includes(space);
                      return (
                        <button
                          key={space}
                          type="button"
                          onClick={() => handleToggleSpaceRequirement(space)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                            isSelected
                              ? "bg-amber-100 border-amber-300 text-[#9E7B1D]"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {space}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Requirements & Notes */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Special Requirements / Custom Specs</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Italian marble flooring, smart automation, acoustic wall paneling in living room..."
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  />
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
      {/* CLIENT 360 PROFILE DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title="Client 360° Profile & Requirements"
      >
        {selectedClient && (
          <div className="space-y-5 text-xs">
            {/* Client Top Card */}
            <div className="p-4 bg-gradient-to-br from-[#FAF9F5] to-amber-50/40 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-stone-900">{selectedClient.name}</h3>
                <span className="font-mono font-bold text-xs text-[#9E7B1D] bg-amber-100 px-2 py-0.5 rounded-md">
                  {selectedClient.clientCode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-stone-600 pt-1">
                <p>
                  <b>Phone:</b> {selectedClient.phone}
                </p>
                <p>
                  <b>City:</b> {selectedClient.city || "Pune"}
                </p>
                <p className="col-span-2">
                  <b>Email:</b> {selectedClient.email || "N/A"}
                </p>
                {selectedClient.address && (
                  <p className="col-span-2">
                    <b>Site:</b> {selectedClient.address}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  navigate("/admin/boq", { state: { clientName: selectedClient.name, clientPhone: selectedClient.phone } });
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-amber-50 hover:bg-[#D4AF37] text-[#9E7B1D] hover:text-stone-950 font-bold rounded-xl border border-amber-200 transition cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={13} />
                <span>Open / Build BOQ</span>
              </button>

              <button
                onClick={() => {
                  navigate("/admin/projects");
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white font-bold rounded-xl border border-sky-200 transition cursor-pointer shadow-2xs"
              >
                <FolderOpen size={13} />
                <span>Manage Project</span>
              </button>
            </div>

            {/* Requirements Box */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="font-black text-stone-900 flex items-center gap-1.5">
                  <Palette size={14} className="text-[#9E7B1D]" />
                  <span>Configured Requirements</span>
                </h4>
                <button
                  onClick={() => handleOpenEditModal(selectedClient)}
                  className="text-[11px] font-bold text-[#9E7B1D] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-1.5 text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-400">Project Type:</span>
                  <span className="font-bold text-stone-900">{selectedClient.projectType || "3BHK Luxury"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Design Styling:</span>
                  <span className="font-semibold">{selectedClient.preferredStyle || "Modern Contemporary"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Budget Range:</span>
                  <span className="font-bold text-[#9E7B1D]">{selectedClient.budgetRange || "₹25L - ₹40L"}</span>
                </div>
              </div>

              {selectedClient.spaceRequirements && selectedClient.spaceRequirements.length > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="block text-stone-400 text-[10px] uppercase font-bold mb-1.5">Required Spaces:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedClient.spaceRequirements.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.specialInstructions && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="block text-stone-400 text-[10px] uppercase font-bold mb-0.5">Special Notes:</span>
                  <p className="italic text-stone-600">{selectedClient.specialInstructions}</p>
                </div>
              )}
            </div>

            {/* Communication History */}
            <div className="space-y-3">
              <h4 className="font-black text-stone-900 text-xs flex items-center gap-1.5">
                <PhoneCall size={14} className="text-[#9E7B1D]" />
                <span>Call & Meeting Logs</span>
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record summary of discussion / site notes..."
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
                {(!selectedClient.communicationHistory || selectedClient.communicationHistory.length === 0) && (
                  <p className="text-center text-stone-400 py-3 italic">No communication logs recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
