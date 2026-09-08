import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createProject, uploadProjectImage, uploadProjectVideo } from "../services/projectsService";

const PRESET_TAGS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Dining Room",
  "Office",
  "Commercial",
  "Bathroom",
];

export default function UploadProject() {
  const navigate = useNavigate();

  // Form States
  const [heading, setHeading] = useState("");
  const [tag, setTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [video, setVideo] = useState("");

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Message States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError("");

    try {
      const result = await uploadProjectImage(file);
      if (result.success && result.imageUrl) {
        setCoverImage(result.imageUrl);
      } else {
        throw new Error("Failed to get image URL from server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to upload cover image. Please try again.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    setError("");

    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadProjectImage(file);
        if (result.success && result.imageUrl) {
          return result.imageUrl;
        }
        throw new Error("Upload failed");
      });

      const urls = await Promise.all(uploadPromises);
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to upload one or more gallery images.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setError("");

    try {
      const result = await uploadProjectVideo(file);
      if (result.success && result.videoUrl) {
        setVideo(result.videoUrl);
      } else {
        throw new Error("Failed to get video URL from server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to upload video. Please try again.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Remove Gallery Image
  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const finalTag = tag === "Custom" ? customTag.trim() : tag;

    if (!heading.trim()) {
      setError("Project title is required.");
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
      setError("Please upload a cover image.");
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
        video: video,
      };

      await createProject(projectData);
      setSuccess(true);
      
      // Clear form
      setHeading("");
      setTag("");
      setCustomTag("");
      setDescription("");
      setCoverImage("");
      setGalleryImages([]);
      setVideo("");

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to create the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 text-gray-800 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-8 cursor-pointer font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upload New Project</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Create and publish a new design project showcase to the live website.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 shadow-xs">
            <CheckCircle size={20} className="shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-sm">Project Published Successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Redirecting you to the dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 shadow-xs">
            <AlertCircle size={20} className="shrink-0 text-rose-600" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Penthouse Lounge"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
            />
          </div>

          {/* Project Category Tag */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Category / Tag
            </label>
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setCustomTag("");
              }}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs cursor-pointer"
            >
              <option value="">-- Select a Category --</option>
              {PRESET_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Custom">Custom Tag...</option>
            </select>

            {tag === "Custom" && (
              <input
                type="text"
                required
                placeholder="Enter custom category name..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="w-full mt-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a detailed description of the project, including design concepts, color palettes, and material choices."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs leading-relaxed resize-y"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Main Cover Image
            </label>
            
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48 group shadow-xs">
                <img
                  src={coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition shadow-sm cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-500 transition bg-slate-50/50 text-center px-4">
                {isUploadingCover ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500 font-bold">Uploading image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Upload size={24} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Click to upload Cover Image</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, JPEG, or WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Project Video (Optional)
            </label>
            
            {video ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48 group shadow-xs">
                <video
                  src={video}
                  controls
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setVideo("")}
                  className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition shadow-sm cursor-pointer"
                  title="Remove Video"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-500 transition bg-slate-50/50 text-center px-4">
                {isUploadingVideo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500 font-bold">Uploading video...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <Upload size={24} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Click to upload Video</span>
                    <span className="text-[10px] text-slate-400">MP4, WEBM, OGG, or MOV</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploadingVideo}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Gallery Images Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Additional Gallery Images (Optional)
            </label>

            {/* Thumbnail Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
                    <img
                      src={url}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition shadow-sm cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-blue-50/40 hover:border-blue-500 transition bg-slate-50/50 text-center px-4">
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500 font-bold">Uploading images...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Upload size={20} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">Click to add Gallery Images</span>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={isUploadingGallery}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover || isUploadingGallery || isUploadingVideo}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-xs hover:shadow-md transition duration-200 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing Project...</span>
                </>
              ) : (
                <span>Publish Project</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
