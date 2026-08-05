import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import KanbanBoard from "../components/KanbanBoard";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import { LayoutGrid, List, Plus } from "lucide-react";

export default function LeadManagement() {
  const [viewMode, setViewMode] = useState("table");
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Pune",
    propertyType: "3BHK Luxury Flat",
    budget: "₹35L - ₹50L",
    status: "Warm",
    source: "Instagram",
    notes: ""
  });

  const loadLeads = () => {
    erpApi.getLeads({ search, status: statusFilter }).then((res) => {
      if (res?.data) setLeads(res.data);
    });
  };

  useEffect(() => {
    loadLeads();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await erpApi.createLead(formData);
    setIsDrawerOpen(false);
    loadLeads();
  };

  const kanbanColumns = [
    { id: "Cold", title: "Cold Leads" },
    { id: "Warm", title: "Warm Prospects" },
    { id: "Hot", title: "Hot Opportunities" },
    { id: "Qualified", title: "Qualified / Site Visit" },
    { id: "Won", title: "Won Projects" },
    { id: "Lost", title: "Lost Leads" }
  ];

  const columns = [
    { header: "Client Name", key: "name", sortable: true },
    { header: "Phone", key: "phone" },
    { header: "Email", key: "email" },
    { header: "Source", key: "source" },
    { header: "Property Type", key: "propertyType" },
    { header: "Budget", key: "budget" },
    { header: "Status", key: "status", sortable: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lead Pipeline Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Track prospective client consultations, sources, and status transitions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "table" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:opacity-95"
          >
            <Plus size={16} />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <DataTable
          title="All Registered Leads"
          columns={columns}
          data={leads}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={["Cold", "Warm", "Hot", "Qualified", "Won", "Lost"]}
          onExportExcel={() => window.open(erpApi.getExportUrl("leads"), "_blank")}
        />
      ) : (
        <KanbanBoard
          columns={kanbanColumns}
          items={leads}
          onStatusChange={async (id, newStatus) => {
            await erpApi.updateLead(id, { status: newStatus });
            loadLeads();
          }}
        />
      )}

      {/* Create Lead Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059]"
              >
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Reference">Reference</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059]"
              >
                <option value="Cold">Cold</option>
                <option value="Warm">Warm</option>
                <option value="Hot">Hot</option>
                <option value="Qualified">Qualified</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Property Type</label>
            <input
              type="text"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Estimated Budget</label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#C5A059] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-bold rounded-xl hover:opacity-95 transition"
          >
            Save Lead
          </button>
        </form>
      </Drawer>
    </div>
  );
}
