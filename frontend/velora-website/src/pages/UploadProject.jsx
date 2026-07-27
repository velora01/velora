import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Heading,
  FileText,
  Tag,
  Check,
  Loader2,
  Sparkles,
  Plus,
  Eye,
  Globe,
  RefreshCw,
  X,
  FileImage,
  Sparkle,
} from "lucide-react";
import { createProject, uploadProjectImage } from "../services/projects";

const PRESET_TAGS = [
  { name: "Living Room", icon: "🛋️" },
  { name: "Bedroom", icon: "🛏️" },
  { name: "Kitchen", icon: "🍳" },
  { name: "Dining Room", icon: "🍽️" },
  { name: "Office", icon: "💼" },
  { name: "Commercial", icon: "🏛️" },
  { name: "Bathroom", icon: "🛁" },
];

export default function UploadProject() {
  const navigate = useNavigate();

  // Form states
  const [heading, setHeading] = useState("");
  const [tag, setTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [description, setDescription] = useState("");
  
  // Image states: supports both upload and URL
  const [coverSource, setCoverSource] = useState("upload"); // 'upload' | 'url'
  const [coverImage, setCoverImage] = useState("");
  const [coverUrlInput, setCoverUrlInput] = useState("");

  const [gallerySource, setGallerySource] = useState("upload"); // 'upload' | 'url'
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  // Upload/Progress UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);

  // Drag over states
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // Status feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState("card"); // 'card' | 'gallery'

  // Helper: Simulate progress bar
  const startProgressSimulation = (setProgress) => {
    setProgress(5);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
    return interval;
  };

  // Handle Cover Upload
  const handleCoverUpload = async (file) => {
    if (!file) return;
    setIsUploadingCover(true);
    setError("");
    const progressInterval = startProgressSimulation(setCoverProgress);

    try {
      const result = await uploadProjectImage(file);
      clearInterval(progressInterval);
      setCoverProgress(100);
      
      if (result.success && result.imageUrl) {
        setCoverImage(result.imageUrl);
      } else {
        throw new Error("Failed to retrieve image URL.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload cover image. Please check backend connections.");
    } finally {
      setTimeout(() => {
        setIsUploadingCover(false);
        setCoverProgress(0);
      }, 500);
    }
  };

  // Drag and Drop handlers for Cover
  const onDragOverCover = (e) => {
    e.preventDefault();
    setIsDraggingCover(true);
  };

  const onDragLeaveCover = () => {
    setIsDraggingCover(false);
  };

  const onDropCover = (e) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleCoverUpload(file);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  // Handle Gallery Uploads
  const handleGalleryUpload = async (files) => {
    if (files.length === 0) return;
    setIsUploadingGallery(true);
    setError("");
    const progressInterval = startProgressSimulation(setGalleryProgress);

    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadProjectImage(file);
        if (result.success && result.imageUrl) {
          return result.imageUrl;
        }
        throw new Error("Failed to upload gallery item.");
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      clearInterval(progressInterval);
      setGalleryProgress(100);
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload one or more gallery images.");
    } finally {
      setTimeout(() => {
        setIsUploadingGallery(false);
        setGalleryProgress(0);
      }, 500);
    }
  };

  // Drag and Drop handlers for Gallery
  const onDragOverGallery = (e) => {
    e.preventDefault();
    setIsDraggingGallery(true);
  };

  const onDragLeaveGallery = () => {
    setIsDraggingGallery(false);
  };

  const onDropGallery = (e) => {
    e.preventDefault();
    setIsDraggingGallery(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      handleGalleryUpload(files);
    } else {
      setError("Please drop valid image files.");
    }
  };

  // Paste Cover URL
  const applyCoverUrl = () => {
    if (!coverUrlInput.trim().startsWith("http")) {
      setError("Please enter a valid absolute image URL (starting with http/https).");
      return;
    }
    setCoverImage(coverUrlInput.trim());
    setCoverUrlInput("");
  };

  // Paste Gallery URL
  const applyGalleryUrl = () => {
    if (!galleryUrlInput.trim().startsWith("http")) {
      setError("Please enter a valid absolute image URL (starting with http/https).");
      return;
    }
    setGalleryImages((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
  };

  // Swap Cover Image with any Gallery Image
  const swapCoverWithGallery = (index) => {
    const originalCover = coverImage;
    const selectedGallery = galleryImages[index];

    setCoverImage(selectedGallery);
    setGalleryImages((prev) => {
      const updated = [...prev];
      if (originalCover) {
        updated[index] = originalCover;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  // Reset entire form state
  const resetForm = () => {
    setHeading("");
    setTag("");
    setCustomTag("");
    setDescription("");
    setCoverImage("");
    setGalleryImages([]);
    setError("");
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalTag = tag === "Custom" ? customTag.trim() : tag;

    if (!heading.trim()) {
      setError("Project title / heading is required.");
      return;
    }
    if (!finalTag) {
      setError("Please select or enter a category tag.");
      return;
    }
    if (!description.trim()) {
      setError("Project description is required.");
      return;
    }
    if (!coverImage) {
      setError("Please upload or enter a URL for the cover image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        heading: heading.trim(),
        tag: finalTag,
        description: description.trim(),
        image: coverImage,
        images: [coverImage, ...galleryImages],
      };

      await createProject(projectData);
      setSuccess(true);

      // Auto redirect to projects listing page
      setTimeout(() => {
        navigate("/projects");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to publish the project. Verify backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTagValue = tag === "Custom" ? customTag : tag;

  return (
    <main className="min-h-screen bg-[#faf8f4] py-12 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans selection:bg-[#C9A227] selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Admin Pill */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#C9A227] transition"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center gap-2 bg-[#C9A227]/10 px-4 py-1.5 rounded-full border border-[#C9A227]/20">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-[#C9A227]">
              Design Creator Portal
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-14 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-24 h-24 bg-amber-100 rounded-full blur-3xl opacity-65 -z-10" />
          <p className="text-[#C9A227] uppercase tracking-[8px] font-bold mb-3 text-xs sm:text-sm">
            Interactive Console
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Publish New Masterpiece
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Fill the portfolio metadata, upload cover graphics, select tag presets, and review your live card presentation side-by-side.
          </p>
        </div>

        {/* Error Callout */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 shadow-md max-w-3xl mx-auto"
            >
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-bold leading-normal">{error}</p>
              <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace split: Editor (Left) & Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Creator Form */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100/80">
            <form onSubmit={handleSubmit} className="space-y-7">
              
              {/* Form Heading & Reset */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <Sparkle size={18} className="text-[#C9A227]" />
                  <span>Metadata Details</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-400 hover:text-[#C9A227] flex items-center gap-1 font-semibold transition"
                >
                  <RefreshCw size={12} />
                  <span>Reset Form</span>
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
                  <Heading size={14} className="text-[#C9A227]" />
                  <span>Project Title / Heading</span>
                </label>
                <input
                  type="text"
                  required
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Contemporary Luxury Penthouse"
                  className="w-full px-4.5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] transition placeholder-gray-400 bg-gray-50/50 text-gray-900 font-medium"
                />
              </div>

              {/* Category selector pills */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-3.5 flex items-center gap-2">
                  <Tag size={14} className="text-[#C9A227]" />
                  <span>Project Category Tag</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setTag(t.name);
                        setCustomTag("");
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                        tag === t.name
                          ? "bg-[#C9A227] text-white shadow-md shadow-[#C9A227]/30 scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTag("Custom")}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                      tag === "Custom"
                        ? "bg-[#C9A227] text-white shadow-md shadow-[#C9A227]/30 scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>✨</span>
                    <span>Custom +</span>
                  </button>
                </div>

                {tag === "Custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, mt: 0 }}
                    animate={{ opacity: 1, height: "auto", mt: 12 }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      required
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Type custom category tag..."
                      className="w-full px-4.5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] transition bg-gray-50/50 text-gray-900 font-medium"
                    />
                  </motion.div>
                )}
              </div>

              {/* Description Box */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 flex items-center gap-2">
                  <FileText size={14} className="text-[#C9A227]" />
                  <span>Detailed Description</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the materials used (e.g. Italian marble, brushed gold accents), design philosophy, color palettes, and customized furniture arrangements..."
                  className="w-full px-4.5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] transition placeholder-gray-400 bg-gray-50/50 text-gray-900 resize-y leading-relaxed font-medium"
                />
              </div>

              {/* COVER IMAGE SLIDE */}
              <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#C9A227]" />
                    <span>Main Cover Banner (Required)</span>
                  </label>
                  
                  {/* Toggle Mode */}
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border">
                    <button
                      type="button"
                      onClick={() => setCoverSource("upload")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                        coverSource === "upload"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverSource("url")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                        coverSource === "url"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 h-52 bg-gray-100 group">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-lg flex items-center gap-2 font-bold text-xs"
                      >
                        <Trash2 size={16} />
                        <span>Delete Image</span>
                      </button>
                    </div>
                  </div>
                ) : coverSource === "upload" ? (
                  <label
                    onDragOver={onDragOverCover}
                    onDragLeave={onDragLeaveCover}
                    onDrop={onDropCover}
                    className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition bg-white ${
                      isDraggingCover
                        ? "border-[#C9A227] bg-[#C9A227]/5 scale-[0.99]"
                        : "border-gray-300 hover:border-[#C9A227] hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center text-center px-4 py-5">
                      {isUploadingCover ? (
                        <div className="w-full max-w-[200px]">
                          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin mb-3 mx-auto" />
                          <p className="text-xs font-bold text-gray-700 mb-2">Uploading: {coverProgress}%</p>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C9A227] h-full transition-all duration-150" style={{ width: `${coverProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className={`w-9 h-9 text-gray-400 mb-2.5 transition-colors ${isDraggingCover ? "text-[#C9A227]" : ""}`} />
                          <p className="text-xs font-bold text-gray-700">
                            {isDraggingCover ? "Drop file to upload!" : "Click or drag file to upload Cover"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            PNG, JPG, JPEG, WEBP (Supports Local Storage fallback)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCoverUpload(e.target.files[0])}
                      disabled={isUploadingCover}
                    />
                  </label>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      placeholder="Paste absolute image web address (e.g. https://images.unsplash.com/...)"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] transition bg-white text-xs font-medium text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={applyCoverUrl}
                      className="px-4 bg-gray-900 hover:bg-[#C9A227] text-white hover:text-white rounded-xl transition text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Globe size={14} />
                      <span>Apply</span>
                    </button>
                  </div>
                )}
              </div>

              {/* GALLERY UPLOADER */}
              <div className="border border-gray-100 p-5 rounded-2xl bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
                    <Plus size={14} className="text-[#C9A227]" />
                    <span>Additional Gallery Items (Optional)</span>
                  </label>
                  
                  {/* Toggle Mode */}
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border">
                    <button
                      type="button"
                      onClick={() => setGallerySource("upload")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                        gallerySource === "upload"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setGallerySource("url")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                        gallerySource === "url"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails list */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5 mb-4">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group"
                    >
                      <img
                        src={img}
                        alt={`Gallery Thumbnail ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => swapCoverWithGallery(idx)}
                          className="px-1.5 py-0.5 bg-[#C9A227] hover:bg-[#B8931F] text-white rounded text-[8px] font-bold uppercase transition"
                          title="Swap with Cover Image"
                        >
                          Cover Swap
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                          title="Delete image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Uploader pill */}
                  {gallerySource === "upload" && (
                    <label
                      onDragOver={onDragOverGallery}
                      onDragLeave={onDragLeaveGallery}
                      onDrop={onDropGallery}
                      className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl cursor-pointer transition bg-white text-center p-2 ${
                        isDraggingGallery
                          ? "border-[#C9A227] bg-[#C9A227]/5"
                          : "border-gray-300 hover:border-[#C9A227] hover:bg-gray-50/50"
                      }`}
                    >
                      {isUploadingGallery ? (
                        <div className="px-1 w-full">
                          <Loader2 className="w-5 h-5 text-[#C9A227] animate-spin mx-auto mb-1" />
                          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-[#C9A227] h-full" style={{ width: `${galleryProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-gray-400 mb-0.5" />
                          <span className="text-[9px] font-bold text-gray-600">Add Items</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleGalleryUpload(Array.from(e.target.files))}
                        disabled={isUploadingGallery}
                      />
                    </label>
                  )}
                </div>

                {gallerySource === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      placeholder="Paste gallery image address URL..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] transition bg-white text-xs font-medium text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={applyGalleryUrl}
                      className="px-4 bg-gray-900 hover:bg-[#C9A227] text-white hover:text-white rounded-xl transition text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add URL</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ACTION SUBMIT */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingCover || isUploadingGallery}
                  className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8931F] text-white font-extrabold py-4 px-6 rounded-2xl hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition duration-300 text-base uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md shadow-[#C9A227]/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Portfolio Entry...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="animate-pulse" />
                      <span>Publish Design to Live Website</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </section>

          {/* RIGHT: Live Preview Panel */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full blur-2xl" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800 relative z-10">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#C9A227]" />
                  <h3 className="font-extrabold text-xs uppercase tracking-widest text-gray-200">
                    Live UI Preview
                  </h3>
                </div>
                <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
                  <button
                    onClick={() => setPreviewTab("card")}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                      previewTab === "card"
                        ? "bg-[#C9A227] text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Card List
                  </button>
                  <button
                    onClick={() => setPreviewTab("gallery")}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                      previewTab === "gallery"
                        ? "bg-[#C9A227] text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Gallery Slider
                  </button>
                </div>
              </div>

              {/* Rendering container */}
              <div className="bg-[#faf8f4] text-gray-900 p-6 rounded-2xl min-h-[390px] flex flex-col justify-center border border-gray-200 relative z-10">
                <AnimatePresence mode="wait">
                  {previewTab === "card" ? (
                    <motion.article
                      key="card-preview"
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left"
                    >
                      <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt="Preview Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={36} className="stroke-1" />
                            <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">No cover image</span>
                          </div>
                        )}
                        {selectedTagValue && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100/50 shadow-sm">
                            <p className="text-[9px] uppercase tracking-wider text-[#C9A227] font-bold">
                              {selectedTagValue}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <p className="text-[10px] uppercase tracking-[3px] text-[#C9A227] font-bold">
                          {selectedTagValue || "Category / Tag"}
                        </p>
                        <h2 className="mt-2 text-xl font-extrabold text-gray-900 line-clamp-1 leading-tight">
                          {heading || "Project Title"}
                        </h2>
                        <p className="mt-3.5 text-xs text-gray-500 leading-relaxed line-clamp-3 font-medium">
                          {description || "Provide an elegant overview description of the spaces and premium craftworks. This description will render exactly here..."}
                        </p>
                      </div>
                    </motion.article>
                  ) : (
                    <motion.div
                      key="gallery-preview"
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      className="w-full text-left flex flex-col gap-4"
                    >
                      {/* Large View */}
                      <div className="relative h-56 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-md">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-500">
                            <FileImage size={36} />
                            <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">Empty Slider</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                          Cover Image
                        </div>
                      </div>

                      {/* Small Previews */}
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                          Gallery Index ({(galleryImages.length + (coverImage ? 1 : 0))} Images)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {coverImage && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#C9A227] shadow-sm relative">
                              <img src={coverImage} alt="Cover Mini" className="w-full h-full object-cover" />
                              <div className="absolute top-0 right-0 bg-[#C9A227] text-white text-[6px] px-1 rounded-bl">Cover</div>
                            </div>
                          )}
                          {galleryImages.map((img, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                              <img src={img} alt={`Gallery mini ${idx}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notice */}
              <div className="mt-6 flex items-start gap-3 bg-gray-800/40 p-4 rounded-xl border border-gray-800">
                <span className="text-base text-yellow-500">💡</span>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  Use the <span className="text-[#C9A227] font-semibold">Cover Swap</span> badge on thumbnails in the form if you want to switch another uploaded image to the main cover banner slot.
                </p>
              </div>

            </div>
          </section>

        </div>

      </div>

      {/* Success Modal Backdrop */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Check size={32} strokeWidth={3} />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Project Published!
              </h3>
              
              <p className="mt-4 text-gray-600 leading-relaxed text-sm font-medium">
                Your luxury interior design project <span className="font-extrabold text-gray-900">"{heading}"</span> has been successfully saved to the server.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/projects")}
                  className="w-full py-3.5 bg-[#C9A227] hover:bg-[#B8931F] text-white font-extrabold rounded-xl transition uppercase tracking-wider text-xs shadow-md shadow-[#C9A227]/20"
                >
                  View Live Projects Page
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    resetForm();
                  }}
                  className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl transition uppercase tracking-wider text-xs"
                >
                  Create Another Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
