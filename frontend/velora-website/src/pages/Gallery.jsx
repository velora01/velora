import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGalleryItems } from "../services/galleryService";
import { Search, Eye, X, Check, Sparkles, ArrowRight, Compass } from "lucide-react";

// Backup fallback gallery data
const fallbackGalleryData = [
  {
    id: "f1",
    title: "Minimalist Nordic Living Room",
    category: "Living Room",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    description: "Spacious living area featuring custom oak furniture, soft velvet upholstery, and ambient warm cove lighting.",
    dimensions: "18ft x 14ft",
    materialSpecs: ["Solid Oak Wood", "Teal Velvet Fabric", "Warm LED Strips", "Fluted Wall Paneling"]
  },
  {
    id: "f2",
    title: "Luxury Master Suite with Tufted Headboard",
    category: "Bedroom",
    style: "Luxury",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    description: "Opulent bedroom layout with king-sized velvet bed, floor-to-ceiling padded headboard, and matching side tables.",
    dimensions: "16ft x 16ft",
    materialSpecs: ["Custom Suede Upholstery", "Brass Metal Trims", "Tinted Mirror Backdrop"]
  },
  {
    id: "f3",
    title: "Contemporary Matte Black & Wood Kitchen",
    category: "Kitchen",
    style: "Minimal",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    description: "Handleless modular kitchen with quartz countertop, quartz island, and soft-close Blum fittings.",
    dimensions: "14ft x 10ft Parallel",
    materialSpecs: ["Acrylic Laminate", "Kalinga Quartz Stone", "Hafele Hydraulic Fittings"]
  },
  {
    id: "f4",
    title: "Spa-Inspired Marble Bathroom",
    category: "Bathroom",
    style: "Luxury",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    description: "Italian marble wall tiling with floating vanity unit, backlit LED mirror, and rain shower enclosure.",
    dimensions: "10ft x 7ft",
    materialSpecs: ["Statuario Marble Tiles", "Grohe Kohler Concealed Fittings", "Marine Ply Vanity"]
  },
  {
    id: "f5",
    title: "Executive Ergonomic Home Office Setup",
    category: "Office",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    description: "Custom walnut desk with built-in cable management, acoustic wall slats, and bookcase unit.",
    dimensions: "12ft x 10ft",
    materialSpecs: ["Walnut Veneer", "Acoustic Felt Slats", "Task LED Lighting"]
  },
  {
    id: "f6",
    title: "6-Seater Scandinavian Marble Dining",
    category: "Dining",
    style: "Contemporary",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    description: "Italian white marble tabletop with brushed brass legs and cushioned dining chairs.",
    dimensions: "6ft x 3.5ft Table",
    materialSpecs: ["Carrara Italian Marble", "Stainless Steel PVD Gold", "Leatherette Upholstery"]
  },
  {
    id: "f7",
    title: "Fluted Wood Floating TV Console",
    category: "TV Unit",
    style: "Wooden",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    description: "Wall-mounted entertainment center with fluted wooden paneling and hidden ambient LED strip backlighting.",
    dimensions: "8ft W x 6ft H",
    materialSpecs: ["Teak Fluted Panel", "Charcoal Louvers", "Warm White LED Strips"]
  },
  {
    id: "f8",
    title: "Floor-to-Ceiling Tinted Glass Wardrobe",
    category: "Wardrobe",
    style: "Luxury",
    image: "https://images.unsplash.com/photo-1558882224-dda166733046?auto=format&fit=crop&w=1200&q=80",
    description: "Modern sliding walk-in wardrobe with bronze tinted glass shutters and automatic sensor LED clothing racks.",
    dimensions: "10ft W x 9ft H",
    materialSpecs: ["Aluminium Frame Shutters", "Bronze Tinted Toughened Glass", "Sensor LED Rods"]
  }
];

const categories = [
  "All",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Furniture",
  "Dining",
  "TV Unit",
  "Wardrobe",
  "Office",
  "Kids Room",
  "Balcony",
  "Hall"
];

export default function Gallery() {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadGalleryData();
  }, [activeCategory]);

  const loadGalleryData = async () => {
    setLoading(true);
    const data = await fetchGalleryItems(activeCategory, "All", "");
    if (data && data.length > 0) {
      setGalleryItems(data);
    } else {
      const filteredFallback = fallbackGalleryData.filter((item) =>
        activeCategory === "All" ? true : item.category.toLowerCase() === activeCategory.toLowerCase()
      );
      setGalleryItems(filteredFallback);
    }
    setLoading(false);
  };

  const filteredItems = galleryItems.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.style?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-12 sm:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold tracking-wide inline-flex items-center gap-2">
            <Sparkles size={16} /> VELORA DESIGN SHOWCASE
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Furniture & Interior <span className="text-amber-600">Gallery</span>
          </h1>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Explore hundreds of high-resolution interior concepts, custom modular furniture collections, luxury kitchens, master suites, and bespoke architectural woodwork designed for modern homes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search living room, modular kitchen, wardrobe, luxury sofa..."
              className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 pl-14 shadow-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-105"
                  : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading high resolution designs...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <Compass className="mx-auto text-amber-500 mb-3" size={48} />
            <h3 className="text-xl font-bold text-gray-800">No designs match your search</h3>
            <p className="text-gray-500 mt-2">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearch("");
              }}
              className="mt-6 px-6 py-2.5 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition duration-500 flex flex-col"
              >
                <div className="overflow-hidden relative h-72 cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-amber-600/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {item.category}
                    </span>
                    {item.style && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                        {item.style}
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center backdrop-blur-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-amber-500 hover:text-white transition flex items-center gap-2 shadow-xl"
                    >
                      <Eye size={18} /> Preview Design
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {item.description || "Premium bespoke interior setup tailored for contemporary living."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">Customization</span>
                      <span className="text-sm font-bold text-amber-700">Full Custom Layout</span>
                    </div>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 group-hover:translate-x-1 transition"
                    >
                      Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESIGN LIGHTBOX MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row">
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full transition"
            >
              <X size={22} />
            </button>

            {/* Image section */}
            <div className="md:w-1/2 bg-black relative flex items-center justify-center min-h-[300px]">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover max-h-[500px]"
              />
              <span className="absolute bottom-4 left-4 bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                {selectedItem.category} • {selectedItem.style || "Modern"}
              </span>
            </div>

            {/* Details section */}
            <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">Design Inspection</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{selectedItem.title}</h2>
                <p className="text-gray-600 mt-4 text-sm sm:text-base leading-relaxed">
                  {selectedItem.description || "Exquisite furniture and interior setup designed with precision engineering, premium materials, and custom finishes."}
                </p>

                {/* Dimensions & Quality */}
                <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div>
                    <span className="text-xs text-gray-500 block">Quality Standard</span>
                    <span className="text-sm font-bold text-amber-800">Bespoke Luxury Grade</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Standard Dimensions</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedItem.dimensions || "Customizable"}</span>
                  </div>
                </div>

                {/* Specs */}
                {selectedItem.materialSpecs && selectedItem.materialSpecs.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Key Material Specifications</h4>
                    <div className="space-y-2">
                      {selectedItem.materialSpecs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2.5 text-sm text-gray-700">
                          <Check size={16} className="text-amber-600 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    navigate("/consultation");
                  }}
                  className="flex-1 py-3.5 px-6 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 text-sm"
                >
                  Book Free Consultation for this Design <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}