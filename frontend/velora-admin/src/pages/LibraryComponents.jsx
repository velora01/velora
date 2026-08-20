import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Info,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Eye,
  Loader2
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
  const [uploadingVariant, setUploadingVariant] = useState(null); // 'elite', 'premium', 'standard'
  const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null); // url to view in lightbox

  const variantDropdownRef = useRef(null);

  const availableVariantKeys = ["Elite", "Premium", "Standard"];

  const defaultVariantConfig = (defaultRate = 1500) => ({
    unit: {
      lengthFt: 0,
      lengthIn: 0,
      heightFt: 0,
      heightIn: 0,
      depthFt: 0,
      depthIn: 0,
      rate: defaultRate
    },
    type: "Box",
    rate: defaultRate,
    images: [],
    description: ""
  });

  const initialForm = {
    name: "",
    relevantSpace: "Modular Kitchen",
    selectedVariants: ["Elite", "Premium", "Standard"],
    elite: defaultVariantConfig(2200),
    premium: defaultVariantConfig(1800),
    standard: defaultVariantConfig(1500),
    variant: "Box",
    description: "Used in BOQ when a variant has no description",
    visibility: true
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
    "Balcony",
    "General"
  ];

  const typesList = [
    "Box",
    "Box Standard",
    "Open Box",
    "Panel",
    "Frame Standard",
    "Hardware",
    "Custom",
    "Shutter Glass",
    "Fluted Panel"
  ];

  // Close variant dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (variantDropdownRef.current && !variantDropdownRef.current.contains(event.target)) {
        setIsVariantDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // Local fallback mock data
      const mockList = [
        {
          _id: "comp1",
          name: "Kitchen Base Cabinet",
          relevantSpace: "Modular Kitchen",
          selectedVariants: ["Elite", "Premium", "Standard"],
          elite: {
            type: "Box",
            rate: 2200,
            unit: { lengthFt: 2, lengthIn: 6, heightFt: 2, heightIn: 8, depthFt: 2, depthIn: 0, rate: 2200 },
            images: [],
            description: "Elite marine ply with high gloss acrylic shutter"
          },
          premium: {
            type: "Box",
            rate: 1800,
            unit: { lengthFt: 2, lengthIn: 6, heightFt: 2, heightIn: 8, depthFt: 2, depthIn: 0, rate: 1800 },
            images: [],
            description: "Premium HDHMR with textured laminate finish"
          },
          standard: {
            type: "Box",
            rate: 1500,
            unit: { lengthFt: 2, lengthIn: 6, heightFt: 2, heightIn: 8, depthFt: 2, depthIn: 0, rate: 1500 },
            images: [],
            description: "Standard commercial ply with 0.8mm laminate"
          },
          variant: "Box",
          description: "Standard modular kitchen base counter carcass with PVC edge banding",
          visibility: true
        },
        {
          _id: "comp2",
          name: "Loft",
          relevantSpace: "Modular Kitchen",
          selectedVariants: ["Elite", "Premium", "Standard"],
          elite: { type: "Box", rate: 2200, unit: { lengthFt: 3, lengthIn: 0, heightFt: 2, heightIn: 0, depthFt: 2, depthIn: 0, rate: 2200 }, images: [], description: "" },
          premium: { type: "Box", rate: 1800, unit: { lengthFt: 3, lengthIn: 0, heightFt: 2, heightIn: 0, depthFt: 2, depthIn: 0, rate: 1800 }, images: [], description: "" },
          standard: { type: "Box", rate: 1500, unit: { lengthFt: 3, lengthIn: 0, heightFt: 2, heightIn: 0, depthFt: 2, depthIn: 0, rate: 1500 }, images: [], description: "" },
          variant: "Box",
          description: "Overhead ceiling-height loft storage unit",
          visibility: true
        },
        {
          _id: "comp3",
          name: "Kitchen SS Trolly",
          relevantSpace: "Modular Kitchen",
          selectedVariants: ["Elite", "Premium", "Standard"],
          elite: { type: "Box", rate: 6000, unit: { lengthFt: 1, lengthIn: 6, heightFt: 1, heightIn: 6, depthFt: 1, depthIn: 8, rate: 6000 }, images: [], description: "" },
          premium: { type: "Box", rate: 6000, unit: { lengthFt: 1, lengthIn: 6, heightFt: 1, heightIn: 6, depthFt: 1, depthIn: 8, rate: 6000 }, images: [], description: "" },
          standard: { type: "Box", rate: 6000, unit: { lengthFt: 1, lengthIn: 6, heightFt: 1, heightIn: 6, depthFt: 1, depthIn: 8, rate: 6000 }, images: [], description: "" },
          variant: "Box",
          description: "High grade SS-304 soft-close pull-out baskets and organisers",
          visibility: true
        },
        {
          _id: "comp4",
          name: "TV Unit Wall Back Paneling With Louvers",
          relevantSpace: "Living Room",
          selectedVariants: ["Elite", "Premium", "Standard"],
          elite: { type: "Panel", rate: 2200, unit: { lengthFt: 6, lengthIn: 0, heightFt: 8, heightIn: 0, depthFt: 0, depthIn: 3, rate: 2200 }, images: [], description: "" },
          premium: { type: "Panel", rate: 1800, unit: { lengthFt: 6, lengthIn: 0, heightFt: 8, heightIn: 0, depthFt: 0, depthIn: 3, rate: 1800 }, images: [], description: "" },
          standard: { type: "Panel", rate: 1500, unit: { lengthFt: 6, lengthIn: 0, heightFt: 8, heightIn: 0, depthFt: 0, depthIn: 3, rate: 1500 }, images: [], description: "" },
          variant: "Panel",
          description: "Architectural fluted louvered acoustic wall panel backdrop",
          visibility: true
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

    const parseVariant = (v, defaultRate) => {
      if (!v) return defaultVariantConfig(defaultRate);
      return {
        unit: {
          lengthFt: v.unit?.lengthFt ?? 0,
          lengthIn: v.unit?.lengthIn ?? 0,
          heightFt: v.unit?.heightFt ?? 0,
          heightIn: v.unit?.heightIn ?? 0,
          depthFt: v.unit?.depthFt ?? 0,
          depthIn: v.unit?.depthIn ?? 0,
          rate: v.unit?.rate ?? v.rate ?? defaultRate
        },
        type: v.type || "Box",
        rate: v.rate ?? defaultRate,
        images: v.images || [],
        description: v.description || ""
      };
    };

    const selectedVariants = comp.selectedVariants?.length
      ? comp.selectedVariants
      : ["Elite", "Premium", "Standard"];

    setFormData({
      name: comp.name || "",
      variant: comp.variant || "Box",
      relevantSpace: comp.relevantSpace || "Modular Kitchen",
      selectedVariants,
      elite: parseVariant(comp.elite, 2200),
      premium: parseVariant(comp.premium, 1800),
      standard: parseVariant(comp.standard, 1500),
      description: comp.description || "",
      visibility: comp.visibility !== false
    });
    setErrorMsg("");
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

  // Handle Variant Multi-Select Checkbox Click
  const handleToggleVariantSelection = (variantName) => {
    const isSelected = formData.selectedVariants.includes(variantName);
    const key = variantName.toLowerCase();

    if (isSelected) {
      // Check if variant has uploaded images
      const variantImages = formData[key]?.images || [];
      if (variantImages.length > 0) {
        alert(`Cannot unselect "${variantName}" because it contains uploaded images. Please remove all images from ${variantName} first.`);
        return;
      }

      if (formData.selectedVariants.length <= 1) {
        alert("At least one variant must be selected.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        selectedVariants: prev.selectedVariants.filter((v) => v !== variantName)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedVariants: [...prev.selectedVariants, variantName]
      }));
    }
  };

  // Update In-Unit field for a variant
  const handleUpdateUnitField = (variantKey, field, val) => {
    setFormData((prev) => ({
      ...prev,
      [variantKey]: {
        ...prev[variantKey],
        unit: {
          ...prev[variantKey].unit,
          [field]: val
        }
      }
    }));
  };

  // Update In-Type field for a variant
  const handleUpdateTypeField = (variantKey, field, val) => {
    setFormData((prev) => {
      const updated = {
        ...prev[variantKey],
        [field]: val
      };
      if (field === "rate") {
        updated.unit = {
          ...prev[variantKey].unit,
          rate: val
        };
      }
      return {
        ...prev,
        [variantKey]: updated
      };
    });
  };

  // Update Variant Description
  const handleUpdateVariantDescription = (variantKey, desc) => {
    setFormData((prev) => ({
      ...prev,
      [variantKey]: {
        ...prev[variantKey],
        description: desc
      }
    }));
  };

  // Handle Uploading Images for a specific variant
  const handleImageUpload = async (variantKey, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingVariant(variantKey);
    setErrorMsg("");

    try {
      const uploadPromises = files.map(async (file) => {
        const res = await erpApi.uploadImage(file);
        return {
          url: res.imageUrl || res.url,
          name: res.originalName || file.name,
          publicId: res.publicId || ""
        };
      });

      const uploadedImgs = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        [variantKey]: {
          ...prev[variantKey],
          images: [...(prev[variantKey]?.images || []), ...uploadedImgs]
        }
      }));
      setSuccessToast(`Uploaded ${uploadedImgs.length} image(s) to ${variantKey.toUpperCase()}!`);
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to upload image(s): " + (err.message || "Unknown error"));
    } finally {
      setUploadingVariant(null);
      e.target.value = null; // reset input
    }
  };

  // Remove an image from a variant
  const handleRemoveImage = (variantKey, imgIdx) => {
    setFormData((prev) => {
      const currentImgs = [...(prev[variantKey]?.images || [])];
      currentImgs.splice(imgIdx, 1);
      return {
        ...prev,
        [variantKey]: {
          ...prev[variantKey],
          images: currentImgs
        }
      };
    });
  };

  // Submit Form (Add / Edit)
  const handleSaveComponent = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Component Name is required.");
      return;
    }

    if (!formData.selectedVariants.length) {
      setErrorMsg("Please select at least one variant.");
      return;
    }

    // Collect all images across variants for the main images gallery field as well
    const allGalleryImages = [
      ...(formData.elite?.images || []),
      ...(formData.premium?.images || []),
      ...(formData.standard?.images || [])
    ];

    const payload = {
      ...formData,
      name: formData.name.trim(),
      images: allGalleryImages
    };

    try {
      if (editingComponent) {
        await erpApi.updateComponent(editingComponent._id, payload);
        setSuccessToast("Component updated successfully!");
      } else {
        await erpApi.createComponent(payload);
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

      {/* Main Table Card (Screenshot 3 Reference) */}
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
                setErrorMsg("");
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
                components.map((comp, idx) => {
                  const totalImages = [
                    ...(comp.elite?.images || []),
                    ...(comp.premium?.images || []),
                    ...(comp.standard?.images || []),
                    ...(comp.images || [])
                  ].filter(Boolean).length;

                  return (
                    <tr key={comp._id || idx} className="hover:bg-amber-50/20 transition">
                      {/* Drag Handle */}
                      <td className="py-3 px-3 text-center text-stone-300">
                        <GripVertical size={14} className="mx-auto cursor-grab" />
                      </td>

                      {/* S.No */}
                      <td className="py-3 px-3 font-mono text-stone-500 font-semibold">{idx + 1}</td>

                      {/* Component Name & Space Badge & Image Badges */}
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="hover:text-[#9E7B1D] transition cursor-pointer"
                            onClick={() => handleOpenEdit(comp)}
                          >
                            {comp.name}
                          </span>
                          {comp.relevantSpace && (
                            <span className="text-[10px] bg-amber-50 text-[#9E7B1D] border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                              {comp.relevantSpace}
                            </span>
                          )}
                          {totalImages > 0 && (
                            <span
                              onClick={() => {
                                const firstImg =
                                  comp.elite?.images?.[0]?.url ||
                                  comp.premium?.images?.[0]?.url ||
                                  comp.standard?.images?.[0]?.url ||
                                  comp.images?.[0]?.url;
                                if (firstImg) setPreviewImageModal(firstImg);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100"
                              title={`${totalImages} images attached. Click to preview.`}
                            >
                              <ImageIcon size={10} />
                              <span>{totalImages}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Elite Type & Rate */}
                      <td className="py-3 px-3 border-l border-[#EAE3D2] bg-amber-50/20 text-stone-700">
                        {comp.elite?.type || "Box"}
                      </td>
                      <td className="py-3 px-3 bg-amber-50/20 text-right font-bold text-[#9E7B1D]">
                        ₹{(comp.elite?.rate || comp.elite?.unit?.rate || 2200).toLocaleString("en-IN")}
                      </td>

                      {/* Premium Type & Rate */}
                      <td className="py-3 px-3 border-l border-[#EAE3D2] text-stone-700">
                        {comp.premium?.type || "Box"}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-stone-900">
                        ₹{(comp.premium?.rate || comp.premium?.unit?.rate || 1800).toLocaleString("en-IN")}
                      </td>

                      {/* Standard Type & Rate */}
                      <td className="py-3 px-3 border-l border-[#EAE3D2] bg-stone-50/30 text-stone-700">
                        {comp.standard?.type || "Box"}
                      </td>
                      <td className="py-3 px-3 bg-stone-50/30 text-right font-bold text-stone-900">
                        ₹{(comp.standard?.rate || comp.standard?.unit?.rate || 1500).toLocaleString("en-IN")}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT COMPONENT MODAL (Matching Reference Screenshots 1, 2, 3, 4) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <h2 className="text-sm font-bold text-stone-900">
                {editingComponent ? "Edit Component" : "Add New Component"}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveComponent} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Component Name */}
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
                  className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition shadow-2xs"
                />
              </div>

              {/* 2. Variant Multi-select Dropdown & Relevant Space Dropdown Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Variant Multi-Select Dropdown (Screenshot 1) */}
                <div className="relative" ref={variantDropdownRef}>
                  <label className="block font-semibold text-stone-700 mb-1.5">Variant</label>
                  <button
                    type="button"
                    onClick={() => setIsVariantDropdownOpen(!isVariantDropdownOpen)}
                    className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 flex items-center justify-between focus:outline-none focus:border-[#D4AF37] transition shadow-2xs cursor-pointer"
                  >
                    <span className="truncate">
                      {formData.selectedVariants.length > 0
                        ? formData.selectedVariants.join(", ")
                        : "Select Variants"}
                    </span>
                    <ChevronDown size={15} className={`text-stone-400 transition-transform ${isVariantDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Multi-Select Popover Dropdown (Screenshot 1) */}
                  {isVariantDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#EAE3D2] rounded-xl shadow-xl z-30 p-2 space-y-1 animate-in zoom-in-95 duration-150">
                      {availableVariantKeys.map((v) => {
                        const isChecked = formData.selectedVariants.includes(v);
                        return (
                          <label
                            key={v}
                            onClick={() => handleToggleVariantSelection(v)}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50/70 rounded-lg cursor-pointer text-xs font-medium text-stone-800 select-none transition"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-stone-300 pointer-events-none"
                            />
                            <span>{v}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Relevant Space Dropdown */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Relevant Space</label>
                  <select
                    value={formData.relevantSpace}
                    onChange={(e) => setFormData({ ...formData, relevantSpace: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition shadow-2xs cursor-pointer"
                  >
                    {spacesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Blue Info Banner Note (Screenshots 1 & 2) */}
              <div className="flex items-start gap-2.5 p-3.5 bg-sky-50/80 border border-sky-200 text-sky-900 rounded-xl text-[11px] leading-relaxed">
                <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <b>Note:</b> Variants with images cannot be unselected. Please remove all images from a variant before unselecting it.
                </span>
              </div>

              {/* 4. DYNAMIC VARIANT SECTIONS / TABS (Screenshots 2, 3, 4) */}
              <div className="space-y-6 pt-1">
                {formData.selectedVariants.map((variantName) => {
                  const key = variantName.toLowerCase();
                  const vData = formData[key] || defaultVariantConfig();

                  return (
                    <div
                      key={variantName}
                      className="border border-[#EAE3D2] rounded-2xl overflow-hidden bg-white shadow-2xs space-y-4 pb-4"
                    >
                      {/* Section Header with Blue/Gold Accent Banner */}
                      <div className="px-4 py-2.5 bg-gradient-to-r from-sky-50 to-amber-50/40 border-b border-[#EAE3D2] flex items-center justify-between">
                        <span className="font-extrabold text-sm text-stone-900">{variantName}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E7B1D] bg-amber-100/60 px-2 py-0.5 rounded-md">
                          Variant Config
                        </span>
                      </div>

                      <div className="px-5 space-y-4">
                        {/* Section Subtitle: In Unit */}
                        <div className="space-y-2">
                          <span className="block font-bold text-stone-800 text-[11px]">In Unit</span>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            {/* Length (ft & inch) */}
                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                                Length (ft & inch)
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="number"
                                  placeholder="ft"
                                  value={vData.unit?.lengthFt || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "lengthFt", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="in"
                                  value={vData.unit?.lengthIn || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "lengthIn", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            {/* Height (ft & inch) */}
                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                                Height (ft & inch)
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="number"
                                  placeholder="ft"
                                  value={vData.unit?.heightFt || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "heightFt", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="in"
                                  value={vData.unit?.heightIn || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "heightIn", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            {/* Depth (ft & inch) */}
                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                                Depth (ft & inch)
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="number"
                                  placeholder="ft"
                                  value={vData.unit?.depthFt || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "depthFt", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="in"
                                  value={vData.unit?.depthIn || 0}
                                  onChange={(e) =>
                                    handleUpdateUnitField(key, "depthIn", Number(e.target.value))
                                  }
                                  className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            {/* Rate (per sq.ft) */}
                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                                Rate (per sq.ft)
                              </label>
                              <input
                                type="number"
                                value={vData.unit?.rate || 0}
                                onChange={(e) =>
                                  handleUpdateUnitField(key, "rate", Number(e.target.value))
                                }
                                className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs font-semibold text-stone-800"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section Subtitle: In Type (Screenshots 2, 3, 4) */}
                        <div className="space-y-2 pt-1 border-t border-[#F0EBE0]">
                          <span className="block font-bold text-stone-800 text-[11px]">In Type</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">Type</label>
                              <select
                                value={vData.type || "Box"}
                                onChange={(e) => handleUpdateTypeField(key, "type", e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                              >
                                {typesList.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                                Rate (per sq.ft)
                              </label>
                              <input
                                type="number"
                                placeholder="Enter Rate"
                                value={vData.rate || 0}
                                onChange={(e) =>
                                  handleUpdateTypeField(key, "rate", Number(e.target.value))
                                }
                                className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-lg text-xs font-semibold text-stone-800"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Images (Optional) Gallery / Upload Box (Screenshots 3 & 4) */}
                        <div className="space-y-2 pt-1 border-t border-[#F0EBE0]">
                          <div className="flex items-center justify-between">
                            <span className="block font-bold text-stone-800 text-[11px]">Images (Optional)</span>
                            {vData.images?.length > 0 && (
                              <span className="text-[10px] text-stone-400 font-medium">
                                {vData.images.length} image(s) attached
                              </span>
                            )}
                          </div>

                          {/* Upload Trigger Button & Previews Grid */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-dashed border-[#D4AF37] bg-amber-50/50 hover:bg-amber-100/70 text-[#9E7B1D] font-bold text-xs rounded-xl cursor-pointer transition shadow-2xs">
                                {uploadingVariant === key ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Plus size={14} />
                                )}
                                <span>{uploadingVariant === key ? "Uploading..." : "+ Add Images"}</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  disabled={uploadingVariant === key}
                                  onChange={(e) => handleImageUpload(key, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Gallery Thumbnails List */}
                            {vData.images?.length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                                {vData.images.map((img, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="group relative aspect-square rounded-xl overflow-hidden border border-[#EAE3D2] bg-stone-100 shadow-2xs"
                                  >
                                    <img
                                      src={img.url}
                                      alt={img.name || "Component preview"}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                    />
                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImageModal(img.url)}
                                        title="View image"
                                        className="p-1 rounded-full bg-white/80 text-stone-900 hover:bg-white cursor-pointer"
                                      >
                                        <Eye size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(key, imgIdx)}
                                        title="Remove image"
                                        className="p-1 rounded-full bg-rose-600/80 text-white hover:bg-rose-600 cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Variant Description (Screenshots 3 & 4) */}
                        <div className="space-y-1.5 pt-1 border-t border-[#F0EBE0]">
                          <label className="block font-semibold text-stone-700 text-[11px]">
                            {variantName} - Variant description
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Enter description"
                            value={vData.description || ""}
                            onChange={(e) => handleUpdateVariantDescription(key, e.target.value)}
                            className="w-full p-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General / Fallback Component Description */}
              <div className="pt-1">
                <label className="block font-semibold text-stone-700 mb-1.5">Component description</label>
                <textarea
                  rows={2}
                  placeholder="Used in BOQ when a variant has no description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                />
              </div>

              {/* Visibility Toggle Switch (Screenshot 4) */}
              <div className="flex items-center gap-3 pt-1">
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

      {/* ========================================================================= */}
      {/* IMAGE LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden p-2 border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-950/70 text-white hover:bg-stone-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={previewImageModal}
              alt="Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
