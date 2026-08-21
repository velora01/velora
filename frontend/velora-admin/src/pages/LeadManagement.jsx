import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import KanbanBoard from "../components/KanbanBoard";
import erpApi from "../services/erpService";
import {
  LayoutGrid,
  List,
  Plus,
  X,
  User,
  Briefcase,
  Calculator,
  FileText,
  Download,
  Trash2,
  Save,
  PlusCircle,
  FolderOpen,
  Calendar,
  Layers,
  MapPin
} from "lucide-react";
import { downloadBOQPdf, downloadCsv } from "../utils/downloadHelper";

export default function LeadManagement() {
  const [viewMode, setViewMode] = useState("table");
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  // Create Lead Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Pune",
    propertyType: "3BHK Luxury Flat",
    siteArea: 1200,
    possessionStatus: "Possession Handed Over",
    stylePreference: "Modern",
    scopeOfWork: [],
    nextMeetingDate: "",
    address: "",
    budget: "₹35L - ₹50L",
    status: "Booking",
    source: "Website",
    notes: "",
    assignedTo: ""
  });

  // Selected Lead / Detail View State
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("client");
  const [detailFormData, setDetailFormData] = useState({});
  const [leadBOQs, setLeadBOQs] = useState([]);

  // Create BOQ Form State
  const [preparedBy, setPreparedBy] = useState("Velora Designer");
  const [boqRooms, setBoqRooms] = useState([
    {
      name: "Living Room",
      items: [
        { itemName: "TV Console", material: "HDMR + Laminate", quantity: 1, unit: "unit", price: 45000, gstPercent: 18 }
      ]
    }
  ]);

  // Create Material Form State (Inline inside BOQ creator)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialTriggerIndex, setMaterialTriggerIndex] = useState({ rIdx: null, iIdx: null });
  const [newMaterialData, setNewMaterialData] = useState({
    name: "",
    category: "Hardware",
    brand: "",
    unit: "sq.ft",
    unitPrice: 0,
    stockQty: 100,
    vendorName: "Local Pune Supplier"
  });

  // Scope of Work options
  const scopeOptions = [
    "Modular Kitchen",
    "Wardrobes & Storage",
    "Living Room TV Console",
    "False Ceiling & Lighting",
    "Painting & Wall Coverings",
    "Electrical & Plumbing",
    "Flooring & Tiling",
    "Loose Furniture & Decor"
  ];

  // Life Cycle Status Flow
  const lifecycleStatuses = [
    "Booking",
    "Design Phase",
    "Product Work Started",
    "Production Completed",
    "Under Installation",
    "Delivered",
    "Lost"
  ];

  const kanbanColumns = [
    { id: "Booking", title: "Booking / Sign Up" },
    { id: "Design Phase", title: "Design Phase" },
    { id: "Product Work Started", title: "Production Started" },
    { id: "Production Completed", title: "Production Completed" },
    { id: "Under Installation", title: "Under Installation" },
    { id: "Delivered", title: "Project Delivered" },
    { id: "Lost", title: "Lost Opportunities" }
  ];

  // Columns for main leads table
  const columns = [
    { header: "Client Name", key: "name", sortable: true },
    { header: "Phone", key: "phone" },
    { header: "Property Style", key: "stylePreference" },
    { header: "Area (sq.ft)", key: "siteArea" },
    { header: "Property Type", key: "propertyType" },
    { header: "Budget", key: "budget" },
    { header: "Status", key: "status", sortable: true },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelectLead(row);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6ED] border border-[#E8DCC4] rounded-xl text-xs font-bold text-[#9E7B1D] hover:border-[#D4AF37] hover:bg-white transition cursor-pointer"
        >
          <FolderOpen size={12} />
          <span>Manage</span>
        </button>
      )
    }
  ];

  const loadLeads = () => {
    erpApi.getLeads({ search, status: statusFilter }).then((res) => {
      if (res?.data) setLeads(res.data);
    });
  };

  const loadMaterials = () => {
    erpApi.getMaterials().then((res) => {
      if (res?.data) setMaterials(res.data);
    });
  };

  const loadStaffUsers = () => {
    erpApi.getUsers().then((res) => {
      if (res?.data) setStaffUsers(res.data);
    });
  };

  useEffect(() => {
    loadLeads();
    loadMaterials();
    loadStaffUsers();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await erpApi.createLead(formData);
      setIsCreateDrawerOpen(false);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "Pune",
        propertyType: "3BHK Luxury Flat",
        siteArea: 1200,
        possessionStatus: "Possession Handed Over",
        stylePreference: "Modern",
        scopeOfWork: [],
        nextMeetingDate: "",
        address: "",
        budget: "₹35L - ₹50L",
        status: "Booking",
        source: "Website",
        notes: "",
        assignedTo: ""
      });
      loadLeads();
    } catch (err) {
      alert("Error creating lead: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setDetailFormData({
      ...lead,
      assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
      nextMeetingDate: lead.nextMeetingDate ? lead.nextMeetingDate.substring(0, 16) : "",
      scopeOfWork: lead.scopeOfWork || []
    });
    setActiveDetailTab("client");
    loadLeadBOQs(lead._id);
    
    // Initialize empty BOQ builder with default room
    setBoqRooms([
      {
        name: "Living Room",
        items: [
          { itemName: "", material: "", quantity: 1, unit: "sq.ft", price: 0, gstPercent: 18 }
        ]
      }
    ]);
  };

  const loadLeadBOQs = (leadId) => {
    erpApi.getBOQs({ leadId }).then((res) => {
      if (res?.data) {
        setLeadBOQs(res.data);
      }
    });
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await erpApi.updateLead(selectedLead._id, detailFormData);
      if (res?.success) {
        alert("Lead updated successfully!");
        setSelectedLead(res.data);
        loadLeads();
      }
    } catch (err) {
      alert("Error updating lead: " + (err.response?.data?.message || err.message));
    }
  };

  const handleScopeCheckboxChange = (option, isChecked, isCreateForm = false) => {
    if (isCreateForm) {
      const currentScope = [...formData.scopeOfWork];
      if (isChecked) {
        setFormData({ ...formData, scopeOfWork: [...currentScope, option] });
      } else {
        setFormData({ ...formData, scopeOfWork: currentScope.filter((item) => item !== option) });
      }
    } else {
      const currentScope = [...(detailFormData.scopeOfWork || [])];
      if (isChecked) {
        setDetailFormData({ ...detailFormData, scopeOfWork: [...currentScope, option] });
      } else {
        setDetailFormData({ ...detailFormData, scopeOfWork: currentScope.filter((item) => item !== option) });
      }
    }
  };

  // BOQ Creation functions
  const addRoom = () => {
    setBoqRooms([...boqRooms, { name: `New Space ${boqRooms.length + 1}`, items: [] }]);
  };

  const removeRoom = (rIdx) => {
    setBoqRooms(boqRooms.filter((_, idx) => idx !== rIdx));
  };

  const addItemToRoom = (rIdx) => {
    const updated = [...boqRooms];
    updated[rIdx].items.push({
      itemName: "",
      material: "",
      quantity: 1,
      unit: "sq.ft",
      price: 0,
      gstPercent: 18
    });
    setBoqRooms(updated);
  };

  const removeItem = (rIdx, iIdx) => {
    const updated = [...boqRooms];
    updated[rIdx].items.splice(iIdx, 1);
    setBoqRooms(updated);
  };

  const updateItem = (rIdx, iIdx, field, val) => {
    const updated = [...boqRooms];
    updated[rIdx].items[iIdx][field] = val;
    setBoqRooms(updated);
  };

  const handlePredefinedSelect = (rIdx, iIdx, matName) => {
    if (!matName) return;
    const mat = materials.find((m) => m.name === matName);
    if (mat) {
      const updated = [...boqRooms];
      updated[rIdx].items[iIdx].itemName = mat.name;
      updated[rIdx].items[iIdx].material = `${mat.category} / ${mat.brand}`;
      updated[rIdx].items[iIdx].unit = mat.unit;
      updated[rIdx].items[iIdx].price = mat.unitPrice;
      setBoqRooms(updated);
    }
  };

  // Computations
  const calculateBOQTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;
    boqRooms.forEach((room) => {
      room.items.forEach((item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const gst = parseFloat(item.gstPercent) || 18;
        const lineVal = qty * price;
        const lineGst = lineVal * (gst / 100);
        subtotal += lineVal;
        gstTotal += lineGst;
      });
    });
    const grandTotal = subtotal + gstTotal;
    return { subtotal, gstTotal, grandTotal };
  };

  const { subtotal, gstTotal, grandTotal } = calculateBOQTotals();

  const handleSaveBOQ = async () => {
    if (!preparedBy) return alert("Please specify who prepared the BOQ");
    
    if (boqRooms.length === 0 || boqRooms.some(r => r.items.length === 0)) {
      return alert("Please add at least one room with items to save the BOQ");
    }

    // Validate that no item has an empty itemName
    for (let r = 0; r < boqRooms.length; r++) {
      const room = boqRooms[r];
      for (let i = 0; i < room.items.length; i++) {
        const item = room.items[i];
        if (!item.itemName || !item.itemName.trim()) {
          return alert(`Please enter a valid Item Name / Specification for item ${i + 1} in room "${room.name}".`);
        }
      }
    }

    try {
      const boqData = {
        lead: selectedLead._id,
        clientName: selectedLead.name,
        preparedBy,
        rooms: boqRooms.map(r => ({
          name: r.name,
          items: r.items.map(item => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            gstPercent: Number(item.gstPercent) || 18,
            total: (Number(item.quantity) * Number(item.price)) * (1 + (Number(item.gstPercent) || 18) / 100)
          })),
          roomSubtotal: r.items.reduce((sum, item) => {
            const val = (Number(item.quantity) || 1) * (Number(item.price) || 0);
            return sum + val * (1 + (Number(item.gstPercent) || 18) / 100);
          }, 0)
        })),
        subtotal,
        gstTotal,
        grandTotal,
        status: "Approved"
      };

      await erpApi.createBOQ(boqData);
      alert("Estimate Saved & generated successfully!");
      loadLeadBOQs(selectedLead._id);
      setActiveDetailTab("boq");
    } catch (err) {
      alert("Error saving Estimate: " + (err.response?.data?.message || err.message));
    }
  };

  // Custom Inline material creation
  const handleOpenMaterialModal = (rIdx, iIdx) => {
    setMaterialTriggerIndex({ rIdx, iIdx });
    setNewMaterialData({
      name: "",
      category: "Hardware",
      brand: "",
      unit: "sq.ft",
      unitPrice: 0,
      stockQty: 100,
      vendorName: "Local Supplier"
    });
    setIsMaterialModalOpen(true);
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await erpApi.createMaterial(newMaterialData);
      if (res?.success) {
        const createdMat = res.data;
        await loadMaterials();

        // Autofill current row
        const { rIdx, iIdx } = materialTriggerIndex;
        if (rIdx !== null && iIdx !== null) {
          const updated = [...boqRooms];
          updated[rIdx].items[iIdx].itemName = createdMat.name;
          updated[rIdx].items[iIdx].material = `${createdMat.category} / ${createdMat.brand}`;
          updated[rIdx].items[iIdx].unit = createdMat.unit;
          updated[rIdx].items[iIdx].price = createdMat.unitPrice;
          setBoqRooms(updated);
        }

        setIsMaterialModalOpen(false);
      }
    } catch (err) {
      alert("Error adding material: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAutoFillDummy = () => {
    const randPhone = "+91 9" + Math.floor(100000000 + Math.random() * 900000000);
    setFormData({
      name: "Aditya Verma",
      phone: randPhone,
      email: "aditya.verma@example.com",
      city: "Pune",
      propertyType: "3BHK Luxury Flat",
      siteArea: 1450,
      possessionStatus: "Possession Handed Over",
      stylePreference: "Modern",
      scopeOfWork: ["Modular Kitchen", "Wardrobes & Storage", "False Ceiling & Lighting"],
      nextMeetingDate: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16),
      address: "Flat 804, Building C, Clover Highlands, Kondhwa, Pune",
      budget: "₹35L - ₹50L",
      status: "Booking",
      source: "Website",
      notes: "Client wants a premium bronze-charcoal theme. Interested in high-end modular kitchen finishes (BWP Plywood + Acrylic shutters) and false ceiling design with smart home automation compatibility.",
      assignedTo: staffUsers[0]?._id || ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Client Relationship Management (CRM)</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage client details, project scope, design style preferences, and cost estimates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "table" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === "kanban" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Client & Project</span>
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <DataTable
          title="All Client Accounts"
          columns={columns}
          data={leads}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={lifecycleStatuses}
          onExportExcel={() => window.open(erpApi.getExportUrl("leads"), "_blank")}
        />
      ) : (
        <KanbanBoard
          columns={kanbanColumns}
          items={leads}
          onItemClick={handleSelectLead}
          onStatusChange={async (id, newStatus) => {
            await erpApi.updateLead(id, { status: newStatus });
            loadLeads();
          }}
        />
      )}

      {/* CREATE LEAD & PROJECT DRAWER */}
      {isCreateDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-xl flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FFFDF9]">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Create New Client & Project Profile</h3>
                <p className="text-[10px] text-[#9E7B1D] font-extrabold uppercase tracking-wider">Configure client scope, possession details, and style preference</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillDummy}
                  className="px-2.5 py-1 bg-stone-100 border border-stone-200 hover:border-[#D4AF37] hover:bg-white text-[10px] font-bold text-[#9E7B1D] rounded-lg transition cursor-pointer"
                >
                  ⚡ Auto-Fill Dummy
                </button>
                <button onClick={() => setIsCreateDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              
              {/* SECTION: Client details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-[#9E7B1D] uppercase tracking-widest border-b border-[#FAF6ED] pb-1.5 flex items-center gap-1.5">
                  <User size={12} />
                  <span>1. Contact & Admin Details</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google</option>
                      <option value="Reference">Reference</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stage</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                    >
                      {lifecycleStatuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Staff</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="">Unassigned</option>
                      {staffUsers.map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#9E7B1D]" />
                    <span>Next Meeting Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextMeetingDate}
                    onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              {/* SECTION: Interior Design Scope */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-[#9E7B1D] uppercase tracking-widest border-b border-[#FAF6ED] pb-1.5 flex items-center gap-1.5">
                  <Briefcase size={12} />
                  <span>2. Design & Site Scope Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Property</label>
                    <input
                      type="text"
                      placeholder="e.g. 3BHK Apartment"
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Site Area (sqft)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={formData.siteArea}
                      onChange={(e) => setFormData({ ...formData, siteArea: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Possession</label>
                    <select
                      value={formData.possessionStatus}
                      onChange={(e) => setFormData({ ...formData, possessionStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Possession Handed Over">Possession Handed Over</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Style</label>
                    <select
                      value={formData.stylePreference}
                      onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Modern">Modern Elegant</option>
                      <option value="Minimalist">Luxury Minimalist</option>
                      <option value="Traditional">Classic Traditional</option>
                      <option value="Mid-Century">Mid-Century Modern</option>
                      <option value="Scandinavian">Scandinavian Clean</option>
                      <option value="Bohemian">Bohemian Chic</option>
                      <option value="Transitional">Transitional Blend</option>
                      <option value="Other">Other Custom Style</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹35L - ₹45L"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-[#9E7B1D]" />
                    <span>Site Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Site Flat No., Society / Building Name, Street Detail"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-2 flex items-center gap-1">
                    <Layers size={13} className="text-[#9E7B1D]" />
                    <span>Scope of Work</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF9F5] p-3.5 border border-[#E8DCC4] rounded-2xl">
                    {scopeOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.scopeOfWork.includes(opt)}
                          onChange={(e) => handleScopeCheckboxChange(opt, e.target.checked, true)}
                          className="w-3.5 h-3.5 border-slate-300 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Design Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Specific design notes, lighting configurations, color palettes, partition designs..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-extrabold rounded-xl hover:opacity-95 transition shadow-sm cursor-pointer"
                >
                  Create Client Design Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED CLIENT 4-TAB WORKSPACE OVERLAY */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-5xl bg-white border-l border-slate-200 shadow-xl flex flex-col h-full animate-slideIn">
            
            {/* Workspace Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/35 flex items-center justify-center text-[#9E7B1D]">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-extrabold text-base text-slate-900">{selectedLead.name}</h3>
                    <span className="text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 px-2 py-0.5 rounded-full font-black border border-[#D4AF37]/20 uppercase">
                      {selectedLead.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {selectedLead.propertyType} ({selectedLead.siteArea || 1200} sq.ft.) • {selectedLead.stylePreference || "Modern"} • {selectedLead.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Workspace Tabs Bar */}
            <div className="flex border-b border-slate-100 bg-[#FFFDF9] px-6 text-xs">
              <button
                onClick={() => setActiveDetailTab("client")}
                className={`py-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                  activeDetailTab === "client" ? "border-[#D4AF37] text-[#9E7B1D]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Client Profile
              </button>
              <button
                onClick={() => setActiveDetailTab("project")}
                className={`py-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                  activeDetailTab === "project" ? "border-[#D4AF37] text-[#9E7B1D]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Design & Site Scope
              </button>
              <button
                onClick={() => setActiveDetailTab("boq")}
                className={`py-3 px-4 font-bold border-b-2 transition cursor-pointer ${
                  activeDetailTab === "boq" ? "border-[#D4AF37] text-[#9E7B1D]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Estimates ({leadBOQs.length})
              </button>
              <button
                onClick={() => setActiveDetailTab("create_boq")}
                className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "create_boq" ? "border-[#D4AF37] text-[#9E7B1D]" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Calculator size={13} />
                <span>Create Estimate</span>
              </button>
            </div>

            {/* Workspace Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* TAB 1: CLIENT DETAILS */}
              {activeDetailTab === "client" && (
                <form onSubmit={handleUpdateLead} className="space-y-4 max-w-2xl text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Client Name</label>
                      <input
                        type="text"
                        required
                        value={detailFormData.name || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Phone</label>
                      <input
                        type="text"
                        required
                        value={detailFormData.phone || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Email</label>
                      <input
                        type="email"
                        value={detailFormData.email || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">City</label>
                      <input
                        type="text"
                        value={detailFormData.city || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Source</label>
                      <select
                        value={detailFormData.source || "Website"}
                        onChange={(e) => setDetailFormData({ ...detailFormData, source: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:outline-none"
                      >
                        <option value="Website">Website</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Google">Google</option>
                        <option value="Reference">Reference</option>
                        <option value="WhatsApp">WhatsApp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Stage</label>
                      <select
                        value={detailFormData.status || "Booking"}
                        onChange={(e) => setDetailFormData({ ...detailFormData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:outline-none"
                      >
                        {lifecycleStatuses.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Staff</label>
                      <select
                        value={detailFormData.assignedTo || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {staffUsers.map(user => (
                          <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#9E7B1D]" />
                      <span>Next Meeting Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={detailFormData.nextMeetingDate || ""}
                      onChange={(e) => setDetailFormData({ ...detailFormData, nextMeetingDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 font-bold rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </form>
              )}

              {/* TAB 2: PROJECT DETAILS */}
              {activeDetailTab === "project" && (
                <form onSubmit={handleUpdateLead} className="space-y-4 max-w-2xl text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Property</label>
                      <input
                        type="text"
                        value={detailFormData.propertyType || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, propertyType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Site Area (sqft)</label>
                      <input
                        type="number"
                        value={detailFormData.siteArea || 0}
                        onChange={(e) => setDetailFormData({ ...detailFormData, siteArea: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Possession</label>
                      <select
                        value={detailFormData.possessionStatus || "N/A"}
                        onChange={(e) => setDetailFormData({ ...detailFormData, possessionStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:outline-none"
                      >
                        <option value="Possession Handed Over">Possession Handed Over</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Style</label>
                      <select
                        value={detailFormData.stylePreference || "Modern"}
                        onChange={(e) => setDetailFormData({ ...detailFormData, stylePreference: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:outline-none"
                      >
                        <option value="Modern">Modern Elegant</option>
                        <option value="Minimalist">Luxury Minimalist</option>
                        <option value="Traditional">Classic Traditional</option>
                        <option value="Mid-Century">Mid-Century Modern</option>
                        <option value="Scandinavian">Scandinavian Clean</option>
                        <option value="Bohemian">Bohemian Chic</option>
                        <option value="Transitional">Transitional Blend</option>
                        <option value="Other">Other Custom Style</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Budget</label>
                      <input
                        type="text"
                        value={detailFormData.budget || ""}
                        onChange={(e) => setDetailFormData({ ...detailFormData, budget: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Site Address</label>
                    <input
                      type="text"
                      placeholder="Baner, Pune"
                      value={detailFormData.address || ""}
                      onChange={(e) => setDetailFormData({ ...detailFormData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-2 flex items-center gap-1">
                      <Layers size={13} className="text-[#9E7B1D]" />
                      <span>Scope of Work</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF9F5] p-3.5 border border-[#E8DCC4] rounded-2xl">
                      {scopeOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(detailFormData.scopeOfWork || []).includes(opt)}
                            onChange={(e) => handleScopeCheckboxChange(opt, e.target.checked, false)}
                            className="w-3.5 h-3.5 border-slate-300 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Design Notes</label>
                    <textarea
                      rows={4}
                      value={detailFormData.notes || ""}
                      onChange={(e) => setDetailFormData({ ...detailFormData, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#C5A059] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 font-bold rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </form>
              )}

              {/* TAB 3: ESTIMATE HISTORY */}
              {activeDetailTab === "boq" && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-800">Historical Estimates</h3>

                  {leadBOQs.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-medium">
                      <Calculator size={36} className="text-slate-300 mb-2" />
                      <p>No Estimate generated for this client yet.</p>
                      <button
                        onClick={() => setActiveDetailTab("create_boq")}
                        className="mt-3 text-xs font-bold text-[#9E7B1D] hover:underline"
                      >
                        Create first Estimate now &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Estimate Number</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Prepared By</th>
                            <th className="px-4 py-3 text-right">Subtotal</th>
                            <th className="px-4 py-3 text-right">GST Total</th>
                            <th className="px-4 py-3 text-right">Grand Total</th>
                            <th className="px-4 py-3 text-center">PDF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leadBOQs.map((boq) => (
                            <tr key={boq._id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-bold text-slate-800">{boq.boqNumber}</td>
                              <td className="px-4 py-3.5 text-slate-500">
                                {new Date(boq.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="px-4 py-3.5 text-slate-600">{boq.preparedBy}</td>
                              <td className="px-4 py-3.5 text-right font-bold text-slate-700">
                                ₹{Math.round(boq.subtotal || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-3.5 text-right text-slate-500">
                                ₹{Math.round(boq.gstTotal || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-3.5 text-right font-black text-[#9E7B1D]">
                                ₹{Math.round(boq.grandTotal || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => downloadBOQPdf(boq)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF6ED] border border-[#E8DCC4] rounded-lg text-[10px] font-bold text-[#9E7B1D] hover:border-[#D4AF37] transition cursor-pointer"
                                  title="Download BOQ Quotation PDF"
                                >
                                  <Download size={10} />
                                  <span>PDF</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CREATE ESTIMATE */}
              {activeDetailTab === "create_boq" && (
                <div className="space-y-6 text-xs">
                  
                  {/* General Config */}
                  <div className="bg-[#FAF9F5] border border-[#E8DCC4] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Prepared By</label>
                      <input
                        type="text"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        className="w-full px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Tax Calculation</label>
                      <input
                        type="text"
                        disabled
                        value="GST (18% Standard Breakdown)"
                        className="w-full px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Space Template Tags */}
                  <div className="flex flex-wrap gap-2 items-center bg-[#FAF9F5] border border-[#E8DCC4]/60 p-3.5 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mr-1">Quick Add Space:</span>
                    {["Living Room", "Master Bedroom", "Modular Kitchen", "Dining Area", "Balcony", "Kids Bedroom", "Bathroom"].map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => {
                          setBoqRooms([...boqRooms, { name: tpl, items: [] }]);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-slate-200 hover:border-[#D4AF37] text-[11px] font-bold text-[#9E7B1D] rounded-lg transition cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>

                  {/* Rooms/Spaces Setup */}
                  <div className="space-y-6">
                    {boqRooms.map((room, rIdx) => (
                      <div key={rIdx} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-4">
                        
                        {/* Room Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-2.5">
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => {
                              const updated = [...boqRooms];
                              updated[rIdx].name = e.target.value;
                              setBoqRooms(updated);
                            }}
                            className="bg-transparent font-black text-sm text-[#9E7B1D] focus:outline-none border-b border-[#E8DCC4] w-full sm:w-64"
                          />

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {/* Catalog Quick-Add Selector */}
                            <select
                              value=""
                              onChange={(e) => {
                                const matName = e.target.value;
                                if (!matName) return;
                                const mat = materials.find(m => m.name === matName);
                                if (mat) {
                                  const updated = [...boqRooms];
                                  updated[rIdx].items.push({
                                    itemName: mat.name,
                                    material: `${mat.category} / ${mat.brand || "Standard"}`,
                                    quantity: 1,
                                    unit: mat.unit || "unit",
                                    price: mat.unitPrice || 0,
                                    gstPercent: 18
                                  });
                                  setBoqRooms(updated);
                                }
                              }}
                              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#C5A059] max-w-[170px] shadow-2xs font-semibold cursor-pointer"
                            >
                              <option value="">+ Add from Catalog</option>
                              {materials.map((m) => (
                                <option key={m._id} value={m.name}>
                                  {m.name} (₹{m.unitPrice}/{m.unit})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => addItemToRoom(rIdx)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition"
                            >
                              + Custom Item
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenMaterialModal(rIdx, room.items.length)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] cursor-pointer transition"
                            >
                              + Create Product
                            </button>

                            <button
                              onClick={() => removeRoom(rIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Space"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Room Items Grid */}
                        {room.items.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 italic text-xs">
                            No items added in this room yet. Add from catalog or insert a custom item row.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                              <thead>
                                <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                  <th className="py-2">Item Specification</th>
                                  <th className="py-2">Material description</th>
                                  <th className="py-2 w-16 text-right">Qty</th>
                                  <th className="py-2 w-16 text-center">Unit</th>
                                  <th className="py-2 w-20 text-right">Price (₹)</th>
                                  <th className="py-2 w-14 text-center">GST %</th>
                                  <th className="py-2 w-24 text-right">Total</th>
                                  <th className="py-2 w-8"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {room.items.map((item, iIdx) => {
                                  const qty = parseFloat(item.quantity) || 0;
                                  const pr = parseFloat(item.price) || 0;
                                  const gst = parseFloat(item.gstPercent) || 18;
                                  const lineTotal = qty * pr * (1 + gst / 100);

                                  return (
                                    <tr key={iIdx} className="hover:bg-slate-50/50">
                                      
                                      {/* Item name input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="text"
                                          value={item.itemName}
                                          onChange={(e) => updateItem(rIdx, iIdx, "itemName", e.target.value)}
                                          placeholder="e.g. Fluted Wardrobe"
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* Material detail input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="text"
                                          value={item.material}
                                          onChange={(e) => updateItem(rIdx, iIdx, "material", e.target.value)}
                                          placeholder="e.g. MDF / Plywood"
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* Quantity input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => updateItem(rIdx, iIdx, "quantity", e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-right focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* Unit input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="text"
                                          value={item.unit}
                                          onChange={(e) => updateItem(rIdx, iIdx, "unit", e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-1 py-1 text-center focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* Price input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="number"
                                          value={item.price}
                                          onChange={(e) => updateItem(rIdx, iIdx, "price", e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-right focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* GST input */}
                                      <td className="py-2 pr-2">
                                        <input
                                          type="number"
                                          value={item.gstPercent}
                                          onChange={(e) => updateItem(rIdx, iIdx, "gstPercent", e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-1 py-1 text-center focus:outline-none focus:border-[#C5A059]"
                                        />
                                      </td>

                                      {/* Line Total */}
                                      <td className="py-2 text-right font-bold text-[#9E7B1D]">
                                        ₹{Math.round(lineTotal).toLocaleString("en-IN")}
                                      </td>

                                      {/* Remove Item */}
                                      <td className="py-2 text-center">
                                        <button
                                          onClick={() => removeItem(rIdx, iIdx)}
                                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions & Summary Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FAF9F5] border border-[#E8DCC4] rounded-2xl p-5">
                    <button
                      onClick={() => addRoom()}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-[#D4AF37] transition cursor-pointer"
                    >
                      + Add New Room / Space
                    </button>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Subtotal:</span>
                        <span className="font-bold text-slate-900">₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">GST (18%):</span>
                        <span className="font-bold text-[#9E7B1D]">₹{Math.round(gstTotal).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="pl-4 border-l border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-black">Estimated Cost:</span>
                        <span className="font-black text-[#9E7B1D] text-base">₹{Math.round(grandTotal).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveBOQ}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 font-black rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
                    >
                      Save & Generate Estimate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INLINE CREATE MATERIAL MODAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAF9F5]">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-sans">Add Product to database</h3>
                <p className="text-[10px] text-[#9E7B1D] font-extrabold uppercase">Save material to use in future estimates</p>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Plywood 19mm"
                  value={newMaterialData.name}
                  onChange={(e) => setNewMaterialData({ ...newMaterialData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Category</label>
                  <select
                    value={newMaterialData.category}
                    onChange={(e) => setNewMaterialData({ ...newMaterialData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Plywood">Plywood</option>
                    <option value="Laminates">Laminates</option>
                    <option value="Marble">Marble</option>
                    <option value="Veneer">Veneer</option>
                    <option value="Fittings">Fittings</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Paint">Paint</option>
                    <option value="Glass">Glass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. CenturyPly"
                    value={newMaterialData.brand}
                    onChange={(e) => setNewMaterialData({ ...newMaterialData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="sq.ft or unit"
                    value={newMaterialData.unit}
                    onChange={(e) => setNewMaterialData({ ...newMaterialData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Fixed Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="Unit price"
                    value={newMaterialData.unitPrice}
                    onChange={(e) => setNewMaterialData({ ...newMaterialData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 font-black rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
              >
                Add to Predefined List
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
