import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Info,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import erpApi from "../services/erpService";

export default function LibraryComponents() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const initialForm = {
    name: "",
    variant: "Box",
    relevantSpace: "Modular Kitchen",
    description: "Used in BOQ when a variant has no description",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  };

  const [formData, setFormData] = useState(initialForm);

  const spacesList = [
    "Entrance",
    "Modular Kitchen",
    "Living Room",
    "Dining Area",
    "PUJA ROOM",
    "Master Bedroom",
    "Kids Bedroom",
    "Parents Bedroom",
    "Guest Bedroom",
    "Bathroom",
    "Balcony"
  ];

  const variantsList = [
    "Box",
    "Box Standard",
    "Open Box",
    "Panel",
    "Frame Standard",
    "Hardware",
    "Custom",
    "Shutter Glass"
  ];

  // Fetch components from API
  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getComponents({ search, page: pagination.page, limit: pagination.limit });
      if (res?.success) {
        setComponents(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total || 0,
            pages: res.pagination.pages || 1
          }));
        }
      }
    } catch {
      // Fallback local mock data
      const mockList = [
        {
          _id: "comp1",
          name: "Kitchen Base Cabinet",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "Standard modular kitchen base counter carcass with PVC edge banding",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        },
        {
          _id: "comp2",
          name: "Loft",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "Overhead ceiling-height loft storage unit",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        },
        {
          _id: "comp3",
          name: "Kitchen SS Trolly",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "High grade SS-304 soft-close pull-out baskets and organisers",
          visibility: true,
          elite: { type: "Box", rate: 6000 },
          premium: { type: "Box", rate: 6000 },
          standard: { type: "Box", rate: 6000 }
        },
        {
          _id: "comp4",
          name: "Kitchen Overhead Storage",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "Wall mounted upper storage cabinets with hydraulic lift-up fittings",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        },
        {
          _id: "comp5",
          name: "Kitchen Wall Unit- Open",
          relevantSpace: "Modular Kitchen",
          variant: "Open Box",
          description: "Open display cubby with moisture resistant laminate finish",
          visibility: true,
          elite: { type: "Open Box", rate: 2200 },
          premium: { type: "Open Box", rate: 1800 },
          standard: { type: "Open Box", rate: 1500 }
        },
        {
          _id: "comp6",
          name: "Kitchen Tall Pantry Unit",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "Full height tall pantry unit with multi-tier tandem drawers",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        },
        {
          _id: "comp7",
          name: "Wall Unit - Open",
          relevantSpace: "Living Room",
          variant: "Open Box",
          description: "Minimalist open wall accent niche with integrated LED profiles",
          visibility: true,
          elite: { type: "Open Box", rate: 2200 },
          premium: { type: "Open Box", rate: 1800 },
          standard: { type: "Open Box", rate: 1500 }
        },
        {
          _id: "comp8",
          name: "Kitchen Wall Cabinet",
          relevantSpace: "Modular Kitchen",
          variant: "Box",
          description: "Closed shutter wall cabinet unit",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        },
        {
          _id: "comp9",
          name: "TV Unit Wall Back Paneling With Louvers",
          relevantSpace: "Living Room",
          variant: "Panel",
          description: "Architectural fluted louvered acoustic wall panel backdrop",
          visibility: true,
          elite: { type: "Panel", rate: 2200 },
          premium: { type: "Panel", rate: 1800 },
          standard: { type: "Panel", rate: 1500 }
        },
        {
          _id: "comp10",
          name: "Wall Unit Tinted Glass With Aluminium Profile Shutter",
          relevantSpace: "Living Room",
          variant: "Box",
          description: "Anodised champagne gold aluminium frame with fluted glass shutters",
          visibility: true,
          elite: { type: "Box", rate: 2200 },
          premium: { type: "Box", rate: 1800 },
          standard: { type: "Box", rate: 1500 }
        }
      ];
      setComponents(mockList);
      setPagination((p) => ({ ...p, total: mockList.length }));
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Toggle component visibility
  const handleToggleVisibility = async (id, currentVal) => {
    try {
      const updatedList = components.map((c) => (c._id === id ? { ...c, visibility: !currentVal } : c));
      setComponents(updatedList);
      await erpApi.updateComponent(id, { visibility: !currentVal });
    } catch (err) {
      setErrorMsg("Failed to toggle visibility: " + err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (comp) => {
    setEditingComponent(comp);
    setFormData({
      name: comp.name || "",
      variant: comp.variant || "Box",
      relevantSpace: comp.relevantSpace || "Modular Kitchen",
      description: comp.description || "",
      visibility: comp.visibility !== false,
      elite: comp.elite || { type: "Box", rate: 2200 },
      premium: comp.premium || { type: "Box", rate: 1800 },
      standard: comp.standard || { type: "Box", rate: 1500 }
    });
    setIsAddModalOpen(true);
  };

  // Delete Component
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?")) return;
    try {
      await erpApi.deleteComponent(id);
      setSuccessToast("Component deleted successfully!");
      fetchComponents();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete component: " + err.message);
    }
  };

  // Submit Form (Add / Edit)
  const handleSaveComponent = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      setErrorMsg("Component Name is required.");
      return;
    }

    try {
      if (editingComponent) {
        await erpApi.updateComponent(editingComponent._id, formData);
        setSuccessToast("Component updated successfully!");
      } else {
        await erpApi.createComponent(formData);
        setSuccessToast("Component created successfully!");
      }
      setIsAddModalOpen(false);
      setEditingComponent(null);
      setFormData(initialForm);
      fetchComponents();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save component");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#9E7B1D] text-white text-xs font-bold rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Table Card (Screenshot 3) */}
      <div className="bg-white border border-[#EAE3D2] rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Left: Search input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by component name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:bg-white transition"
            />
          </div>

          {/* Right: Count & + New Component button */}
          <div className="flex items-center gap-4 justify-between sm:justify-end">
            <div className="text-xs font-bold text-stone-800 select-none">
              <span>{pagination.total || components.length}</span>{" "}
              <span className="text-stone-500 font-normal">Components</span>
            </div>

            <button
              onClick={() => {
                setEditingComponent(null);
                setFormData(initialForm);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus size={15} />
              <span>New Component</span>
            </button>
          </div>
        </div>

        {/* Table View (Screenshot 3) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Header Row */}
              <tr className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-stone-700 text-xs font-bold">
                <th className="py-3 px-3 w-10 text-center text-stone-400"></th>
                <th className="py-3 px-3 w-14 font-semibold text-stone-600">S.No</th>
                <th className="py-3 px-4 font-bold text-stone-900 min-w-[240px]">Component</th>
                {/* Elite */}
                <th colSpan={2} className="py-3 px-4 text-center border-l border-[#EAE3D2] bg-amber-50/40">
                  <span className="font-extrabold text-[#9E7B1D]">Elite</span>
                  <div className="grid grid-cols-2 text-[11px] font-semibold text-stone-600 mt-1">
                    <span className="text-left">Type</span>
                    <span className="text-right">Rate</span>
                  </div>
                </th>
                {/* Premium */}
                <th colSpan={2} className="py-3 px-4 text-center border-l border-[#EAE3D2]">
                  <span className="font-extrabold text-stone-800">Premium</span>
                  <div className="grid grid-cols-2 text-[11px] font-semibold text-stone-600 mt-1">
                    <span className="text-left">Type</span>
                    <span className="text-right">Rate</span>
                  </div>
                </th>
                {/* Standard */}
                <th colSpan={2} className="py-3 px-4 text-center border-l border-[#EAE3D2] bg-stone-50/50">
                  <span className="font-extrabold text-stone-800">Standard</span>
                  <div className="grid grid-cols-2 text-[11px] font-semibold text-stone-600 mt-1">
                    <span className="text-left">Type</span>
                    <span className="text-right">Rate</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center border-l border-[#EAE3D2] font-bold text-stone-800 min-w-[120px]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0EBE0] text-xs text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    Loading components...
                  </td>
                </tr>
              ) : components.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    No components found. Click "+ New Component" to add one.
                  </td>
                </tr>
              ) : (
                components.map((comp, idx) => (
                  <tr key={comp._id || idx} className="hover:bg-amber-50/20 transition">
                    {/* Drag Handle */}
                    <td className="py-3 px-3 text-center text-stone-300">
                      <GripVertical size={14} className="mx-auto cursor-grab" />
                    </td>

                    {/* S.No */}
                    <td className="py-3 px-3 font-mono text-stone-500 font-semibold">{idx + 1}</td>

                    {/* Component Name */}
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      <span className="hover:text-[#9E7B1D] transition cursor-pointer" onClick={() => handleOpenEdit(comp)}>
                        {comp.name}
                      </span>
                      {comp.relevantSpace && (
                        <span className="ml-2 text-[10px] bg-amber-50 text-[#9E7B1D] border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                          {comp.relevantSpace}
                        </span>
                      )}
                    </td>

                    {/* Elite Type & Rate */}
                    <td className="py-3 px-3 border-l border-[#EAE3D2] bg-amber-50/20 text-stone-700">
                      {comp.elite?.type || "Box"}
                    </td>
                    <td className="py-3 px-3 bg-amber-50/20 text-right font-bold text-[#9E7B1D]">
                      ₹{(comp.elite?.rate || 2200).toLocaleString("en-IN")}
                    </td>

                    {/* Premium Type & Rate */}
                    <td className="py-3 px-3 border-l border-[#EAE3D2] text-stone-700">
                      {comp.premium?.type || "Box"}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900">
                      ₹{(comp.premium?.rate || 1800).toLocaleString("en-IN")}
                    </td>

                    {/* Standard Type & Rate */}
                    <td className="py-3 px-3 border-l border-[#EAE3D2] bg-stone-50/30 text-stone-700">
                      {comp.standard?.type || "Box"}
                    </td>
                    <td className="py-3 px-3 bg-stone-50/30 text-right font-bold text-stone-900">
                      ₹{(comp.standard?.rate || 1500).toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 border-l border-[#EAE3D2] text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        {/* Edit icon */}
                        <button
                          onClick={() => handleOpenEdit(comp)}
                          title="Edit Component"
                          className="p-1 text-stone-400 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Visibility Toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(comp._id, comp.visibility !== false)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                            comp.visibility !== false ? "bg-[#D4AF37]" : "bg-stone-300"
                          }`}
                          title={comp.visibility !== false ? "Visible in BOQ" : "Hidden"}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition ${
                              comp.visibility !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>

                        {/* Delete trash icon */}
                        <button
                          onClick={() => handleDelete(comp._id)}
                          title="Delete Component"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

      {/* ========================================================================= */}
      {/* ADD / EDIT COMPONENT MODAL (Screenshot 4) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAE3D2] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <h2 className="text-sm font-bold text-stone-900">
                {editingComponent ? "Edit Component" : "Add New Component"}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body (Screenshot 4) */}
            <form onSubmit={handleSaveComponent} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Component Name */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Component Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Component Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                />
              </div>

              {/* Variant & Relevant Space Dropdowns Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Variant</label>
                  <select
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                  >
                    {variantsList.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Relevant Space</label>
                  <select
                    value={formData.relevantSpace}
                    onChange={(e) => setFormData({ ...formData, relevantSpace: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                  >
                    {spacesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Info Notification Note (Screenshot 4) */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200 text-stone-800 rounded-xl text-[11px] leading-relaxed">
                <Info size={16} className="text-[#9E7B1D] shrink-0 mt-0.5" />
                <span>
                  <b>Note:</b> Variants with images cannot be unselected. Please remove all images from a variant before unselecting it.
                </span>
              </div>

              {/* Component Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Component description</label>
                <textarea
                  rows={3}
                  placeholder="Used in BOQ when a variant has no description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                />
              </div>

              {/* Rates for Elite / Premium / Standard */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-[#9E7B1D] mb-1">Elite Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.elite?.rate || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        elite: { ...formData.elite, rate: Number(e.target.value) }
                      })
                    }
                    className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Premium Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.premium?.rate || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premium: { ...formData.premium, rate: Number(e.target.value) }
                      })
                    }
                    className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Standard Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.standard?.rate || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        standard: { ...formData.standard, rate: Number(e.target.value) }
                      })
                    }
                    className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Visibility Toggle Switch (Screenshot 4) */}
              <div className="flex items-center gap-3 pt-2">
                <span className="font-semibold text-stone-700">Visibility</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: !formData.visibility })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    formData.visibility ? "bg-[#D4AF37]" : "bg-stone-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition ${
                      formData.visibility ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#EAE3D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-stone-50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
