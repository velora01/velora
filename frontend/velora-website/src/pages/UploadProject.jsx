import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createProject, uploadProjectImage } from "../services/projects";

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

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

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
      setError("Failed to upload cover image. Please try again.");
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
      setError("Failed to upload one or more gallery images.");
    } finally {
      setIsUploadingGallery(false);
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

      // Redirect to projects page after short delay
      setTimeout(() => {
        navigate("/projects");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] py-12 px-4 sm:px-6 lg:px-8 text-gray-800 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#C9A227] transition mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Upload New Project</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Create and publish a new design project showcase to the live website.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Project Published Successfully!</p>
              <p className="text-xs text-green-600 mt-0.5">Redirecting you to the projects page...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Penthouse Lounge"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition text-sm text-gray-900 bg-white"
            />
          </div>

          {/* Project Category Tag */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category / Tag
            </label>
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setCustomTag("");
              }}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition text-sm text-gray-900 bg-white"
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
                className="w-full mt-3 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition text-sm text-gray-900 bg-white"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a detailed description of the project, including design concepts, color palettes, and material choices."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] transition text-sm text-gray-900 bg-white leading-relaxed resize-y"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Cover Image
            </label>
            
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-50 h-48 group">
                <img
                  src={coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition shadow-sm"
                  title="Remove Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#C9A227] transition bg-white text-center px-4">
                {isUploadingCover ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#C9A227]" />
                    <span className="text-xs text-gray-500 font-medium">Uploading image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-500">
                    <Upload size={24} />
                    <span className="text-xs font-semibold">Click to upload Cover Image</span>
                    <span className="text-[10px] text-gray-400">PNG, JPG, JPEG, or WEBP</span>
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

          {/* Gallery Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Gallery Images (Optional)
            </label>

            {/* Thumbnail Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-50 group">
                    <img
                      src={url}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition shadow-sm"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#C9A227] transition bg-white text-center px-4">
              {isUploadingGallery ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-[#C9A227]" />
                  <span className="text-xs text-gray-500 font-medium">Uploading images...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500">
                  <Upload size={20} />
                  <span className="text-xs font-semibold">Click to add Gallery Images</span>
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
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover || isUploadingGallery}
              className="w-full bg-[#C9A227] hover:bg-[#B8931F] text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow transition duration-200 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
