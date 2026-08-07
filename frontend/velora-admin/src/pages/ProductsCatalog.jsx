import { useState, useEffect } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/catalogService";
import { uploadProjectImage } from "../services/projectsService";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileText,
  DollarSign,
  Upload,
  Info
} from "lucide-react";

const CATEGORIES = ["Sofa", "Dining Table", "Wardrobe", "Bed", "Chair", "Cabinet", "Lighting", "Other"];

export default function ProductsCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "Sofa",
    description: "",
    price: "",
    images: [],
    designs: "",
    materials: "",
    dimensions: "",
    isAvailable: true
  });

  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        category: selectedCategory,
        search: searchTerm
      });
      setProducts(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load products from database.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      category: "Sofa",
      description: "",
      price: "",
      images: [],
      designs: "",
      materials: "",
      dimensions: "",
      isAvailable: true
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "Sofa",
      description: product.description || "",
      price: product.price || "",
      images: product.images || [],
      designs: Array.isArray(product.designs) ? product.designs.join(", ") : "",
      materials: Array.isArray(product.materials) ? product.materials.join(", ") : "",
      dimensions: product.dimensions || "",
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
    });
    setShowFormModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const res = await uploadProjectImage(file);
      if (res.success && res.imageUrl) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, res.imageUrl]
        }));
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to upload image. Please try again.", false);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idxToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showNotification("Name and price are required.", false);
      return;
    }

    setSubmitting(true);
    try {
      // Format materials and designs into arrays
      const formattedData = {
        ...form,
        price: Number(form.price),
        materials: form.materials ? form.materials.split(",").map((m) => m.trim()).filter(Boolean) : [],
        designs: form.designs ? form.designs.split(",").map((d) => d.trim()).filter(Boolean) : []
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, formattedData);
        showNotification("Product updated successfully!");
      } else {
        await createProduct(formattedData);
        showNotification("Product created successfully!");
      }
      setShowFormModal(false);
      loadProducts();
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || "Failed to save product details.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) return;

    try {
      await deleteProduct(product._id);
      showNotification("Product deleted successfully!");
      loadProducts();
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || "Failed to delete product.", false);
    }
  };

  return (
    <div className="py-6 text-gray-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Layers className="text-[#C9A227]" /> SHOWROOM <span className="text-[#C9A227] font-light">CATALOG</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your showroom catalog products, design types, materials list, prices, and stock statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B8931F] text-white font-bold py-2.5 px-5 rounded-full shadow-sm hover:shadow transition duration-200 text-sm uppercase tracking-wide cursor-pointer"
        >
          <Plus size={16} /> Add Catalog Product
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="flex-shrink-0" />
          <p className="font-semibold text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] bg-[#faf8f4] text-gray-800"
          />
        </div>

        {/* Filter Category */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Filter size={14} /> Category:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] bg-white text-gray-800 font-medium cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Loading & Grid List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#C9A227]" />
          <span className="text-gray-500 font-medium text-sm">Loading showroom catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
          No showroom products found. Add a product to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300 relative group"
            >
              
              {/* Product Cover image */}
              <div className="h-48 bg-stone-100 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5 bg-stone-50">
                    <Info size={24} />
                    <span className="text-xs">No media uploaded</span>
                  </div>
                )}
                
                {/* Available Badge */}
                <span
                  className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    product.isAvailable
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {product.isAvailable ? "In Stock" : "Out of Stock"}
                </span>

                {/* Price Tag */}
                <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-extrabold shadow-sm border border-stone-850">
                  {product.price.toLocaleString("en-IN")} INR
                </span>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-[#C9A227] transition">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-gray-150 text-[11px] text-gray-500">
                    {product.dimensions && (
                      <p>
                        <span className="font-bold text-gray-700">Dimensions: </span>
                        {product.dimensions}
                      </p>
                    )}
                    {product.materials && product.materials.length > 0 && (
                      <p className="line-clamp-1">
                        <span className="font-bold text-gray-700">Materials: </span>
                        {product.materials.join(", ")}
                      </p>
                    )}
                    {product.designs && product.designs.length > 0 && (
                      <p className="line-clamp-1">
                        <span className="font-bold text-gray-700">Style tags: </span>
                        {product.designs.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operations Footer */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 hover:border-amber-300 hover:bg-amber-50/50 text-xs font-bold text-gray-600 hover:text-[#C9A227] transition cursor-pointer"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT PRODUCT MODAL FORM */}
      {/* ======================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <span className="text-xs font-bold uppercase text-[#C9A227] tracking-wider block">Showroom Operations</span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {editingProduct ? "Modify Catalog Item" : "Register Catalog Item"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sync changes dynamically with the website's digital showroom catalog.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Velvet Chesterfield Sofa"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 185000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. 8ft x 4ft x 3ft"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Availability Status</label>
                  <select
                    value={form.isAvailable ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.value === "true" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950 cursor-pointer"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>

                {/* Materials (Comma Separated) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Materials (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Teak Wood, Foam, Cotton Velvet"
                    value={form.materials}
                    onChange={(e) => setForm({ ...form, materials: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950"
                  />
                </div>

                {/* Designs (Comma Separated) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Design Style tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Italian Modern, Luxury Gold"
                    value={form.designs}
                    onChange={(e) => setForm({ ...form, designs: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950"
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Material specs, foam densities, texture descriptions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white text-gray-950 resize-y"
                />
              </div>

              {/* Image Upload list */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Product Image Showcase</label>
                
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={url} alt="Product Thumbnail" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-[#C9A227] transition bg-white text-center px-4">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={20} className="animate-spin text-[#C9A227]" />
                      <span className="text-xs text-gray-500 font-medium">Uploading image asset...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-400">
                      <Upload size={20} />
                      <span className="text-xs font-semibold">Click to upload Product Image</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG or WEBP</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="py-2.5 px-5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="py-2.5 px-6 bg-[#C9A227] hover:bg-[#B8931F] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingProduct ? "Update Catalog Item" : "Create Catalog Item"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
