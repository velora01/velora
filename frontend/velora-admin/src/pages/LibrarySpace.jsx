import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import erpApi from "../services/erpService";

export default function LibrarySpace() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });

  // Modal / Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    name: "",
    description: "",
    visibility: true
  };

  const [formData, setFormData] = useState(initialForm);

  const defaultPresetSpaces = [
    { _id: "sp_1", name: "PUJA ROOM", description: "Pooja unit, spiritual and mandir area styling", visibility: true, sortOrder: 1 },
    { _id: "sp_2", name: "KITCHEN", description: "Modular kitchen, base/wall cabinets and pantry storage", visibility: true, sortOrder: 2 },
    { _id: "sp_3", name: "Parents Bedroom", description: "Parents room wardrobes, headboard & vanity", visibility: true, sortOrder: 3 },
    { _id: "sp_4", name: "Foyer Area", description: "Entrance safety door, shoe rack & accent paneling", visibility: true, sortOrder: 4 },
    { _id: "sp_5", name: "Bathroom", description: "Vanity counter, under-basin cabinet and mirror with LED", visibility: true, sortOrder: 5 },
    { _id: "sp_6", name: "Wash Basin Area", description: "Handwash counter storage and quartz backdrop", visibility: true, sortOrder: 6 },
    { _id: "sp_7", name: "Master Bedroom Bath", description: "En-suite master bathroom vanities and linen storage", visibility: true, sortOrder: 7 },
    { _id: "sp_8", name: "All Area", description: "Universal components applicable to any zone", visibility: true, sortOrder: 8 },
    { _id: "sp_9", name: "Dry Balcony", description: "Utility cabinet, washing machine ledge and overhead rack", visibility: true, sortOrder: 9 },
    { _id: "sp_10", name: "Balcony", description: "Balcony bar ledge, artificial turf backdrop & seating", visibility: true, sortOrder: 10 },
    { _id: "sp_11", name: "Master Bedroom", description: "King size hydraulic bed, 4-door wardrobe and dresser", visibility: true, sortOrder: 11 },
    { _id: "sp_12", name: "Kids Bedroom", description: "Study table, bunk/single bed and multi-color wardrobe", visibility: true, sortOrder: 12 },
    { _id: "sp_13", name: "Living Room", description: "TV unit, acoustic fluted panels and crockery display", visibility: true, sortOrder: 13 },
    { _id: "sp_14", name: "Dining Area", description: "Dining buffet counter, bar unit and console", visibility: true, sortOrder: 14 },
    { _id: "sp_15", name: "General", description: "General furniture and hardware items", visibility: true, sortOrder: 15 }
  ];

  // Fetch Spaces from API with localStorage fallback
  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getSpaces({ search, page: pagination.page, limit: pagination.limit });
      if (res?.success && res.data && res.data.length > 0) {
        setSpaces(res.data);
        localStorage.setItem("velora_custom_spaces", JSON.stringify(res.data));
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total || res.data.length,
            pages: res.pagination.pages || 1
          }));
        }
      } else {
        const saved = JSON.parse(localStorage.getItem("velora_custom_spaces") || "null");
        const list = saved && saved.length > 0 ? saved : defaultPresetSpaces;
        const filtered = search
          ? list.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()))
          : list;
        setSpaces(filtered);
        setPagination((p) => ({ ...p, total: filtered.length }));
      }
    } catch {
      const saved = JSON.parse(localStorage.getItem("velora_custom_spaces") || "null");
      const list = saved && saved.length > 0 ? saved : defaultPresetSpaces;
      const filtered = search
        ? list.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()))
        : list;
      setSpaces(filtered);
      setPagination((p) => ({ ...p, total: filtered.length }));
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSpace(null);
    setFormData(initialForm);
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (space) => {
    setEditingSpace(space);
    setFormData({
      name: space.name || "",
      description: space.description || "",
      visibility: space.visibility !== false
    });
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Toggle Space Visibility
  const handleToggleVisibility = async (id, currentVal) => {
    try {
      const updatedList = spaces.map((s) => (s._id === id ? { ...s, visibility: !currentVal } : s));
      setSpaces(updatedList);
      localStorage.setItem("velora_custom_spaces", JSON.stringify(updatedList));
      await erpApi.updateSpace(id, { visibility: !currentVal });
    } catch (err) {
      console.warn("Visibility toggle warning:", err);
    }
  };

  // Delete Space
  const handleDelete = async (space) => {
    if (!window.confirm(`Are you sure you want to delete space "${space.name}"?`)) return;
    try {
      await erpApi.deleteSpace(space._id);
      setSuccessToast(`Space "${space.name}" deleted successfully!`);
      const updated = spaces.filter((s) => s._id !== space._id);
      setSpaces(updated);
      localStorage.setItem("velora_custom_spaces", JSON.stringify(updated));
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      // Local fallback removal
      const updated = spaces.filter((s) => s._id !== space._id);
      setSpaces(updated);
      localStorage.setItem("velora_custom_spaces", JSON.stringify(updated));
      setSuccessToast(`Space "${space.name}" deleted!`);
      setTimeout(() => setSuccessToast(""), 3000);
    }
  };

  // Save Space (Create / Update)
  const handleSaveSpace = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Space Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      visibility: formData.visibility
    };

    try {
      if (editingSpace) {
        await erpApi.updateSpace(editingSpace._id, payload);
        setSuccessToast(`Space "${payload.name}" updated successfully!`);
        const updated = spaces.map((s) => (s._id === editingSpace._id ? { ...s, ...payload } : s));
        setSpaces(updated);
        localStorage.setItem("velora_custom_spaces", JSON.stringify(updated));
      } else {
        const res = await erpApi.createSpace(payload);
        const newObj = res?.data || { ...payload, _id: `sp_${Date.now()}` };
        setSuccessToast(`Space "${payload.name}" created successfully!`);
        const updated = [...spaces, newObj];
        setSpaces(updated);
        localStorage.setItem("velora_custom_spaces", JSON.stringify(updated));
      }

      setIsDrawerOpen(false);
      setEditingSpace(null);
      setFormData(initialForm);
      fetchSpaces();
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save space.";
      // Check if duplicate error or fallback save
      if (!editingSpace) {
        const newObj = { ...payload, _id: `sp_${Date.now()}` };
        const updated = [...spaces, newObj];
        setSpaces(updated);
        localStorage.setItem("velora_custom_spaces", JSON.stringify(updated));
        setIsDrawerOpen(false);
        setEditingSpace(null);
        setFormData(initialForm);
        setSuccessToast(`Space "${payload.name}" created!`);
        setTimeout(() => setSuccessToast(""), 3500);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Table Card (Exact Match to Screenshot) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Left: Search input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by space name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition shadow-2xs"
            />
          </div>

          {/* Right: Count & + New Space button */}
          <div className="flex items-center gap-4 justify-between sm:justify-end">
            <div className="text-xs font-bold text-slate-800 select-none">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full mr-1.5 font-bold">
                {spaces.length}
              </span>
              <span className="text-slate-500 font-medium">Spaces</span>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus size={15} />
              <span>New Space</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-700 text-xs font-bold">
                <th className="py-3.5 px-3 w-10 text-center text-slate-400"></th>
                <th className="py-3.5 px-4 w-16 font-semibold text-slate-600">S.No</th>
                <th className="py-3.5 px-6 font-bold text-slate-900 min-w-[220px]">Space</th>
                <th className="py-3.5 px-6 font-bold text-slate-900">Space Description</th>
                <th className="py-3.5 px-6 text-center font-bold text-slate-800 w-28">Visibility</th>
                <th className="py-3.5 px-6 text-center font-bold text-slate-800 w-28">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span>Loading spaces...</span>
                    </div>
                  </td>
                </tr>
              ) : spaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No spaces found. Click "+ New Space" to create one.
                  </td>
                </tr>
              ) : (
                spaces.map((sp, idx) => (
                  <tr key={sp._id || idx} className="hover:bg-blue-50/30 transition">
                    {/* Drag Handle */}
                    <td className="py-3.5 px-3 text-center text-slate-300">
                      <GripVertical size={14} className="mx-auto cursor-grab" />
                    </td>

                    {/* S.No */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-semibold">{idx + 1}</td>

                    {/* Space Name */}
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <span
                        onClick={() => handleOpenEdit(sp)}
                        className="hover:text-blue-600 transition cursor-pointer"
                      >
                        {sp.name}
                      </span>
                    </td>

                    {/* Space Description */}
                    <td className="py-3.5 px-6 text-slate-600 font-normal">
                      {sp.description || "-"}
                    </td>

                    {/* Visibility Toggle */}
                    <td className="py-3.5 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(sp._id, sp.visibility)}
                        className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition duration-300 mx-auto ${
                          sp.visibility !== false ? "bg-blue-600" : "bg-slate-300"
                        }`}
                        title={sp.visibility !== false ? "Visible" : "Hidden"}
                      >
                        <div
                          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition duration-300 ${
                            sp.visibility !== false ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Action (Edit / Delete) */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(sp)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Space"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sp)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Space"
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

      {/* Right Drawer / Modal for "Add New Space" (Exact Match to Screenshot) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingSpace ? "Edit Space" : "Add New Space"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Drawer Body Form */}
              <form onSubmit={handleSaveSpace} className="p-5 space-y-4">
                {/* 1. Space Name */}
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                    Space Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Space Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs font-semibold"
                  />
                </div>

                {/* 2. Space Description */}
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                    Space Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter Space Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-2xs resize-none"
                  />
                </div>

                {/* 3. Visibility Toggle */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="font-semibold text-slate-700 text-xs">Visibility</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: !formData.visibility })}
                    className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                      formData.visibility ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition duration-300 ${
                        formData.visibility ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </form>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || !formData.name.trim()}
                onClick={handleSaveSpace}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
