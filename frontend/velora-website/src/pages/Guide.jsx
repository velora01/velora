import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGuides } from "../services/guideService";
import {
  BedDouble,
  ChefHat,
  Sofa,
  Bath,
  Home,
  LampDesk,
  Sparkles,
  Clock,
  ArrowRight,
  X,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

const categories = [
  { id: "bedroom", name: "Bedroom", icon: BedDouble },
  { id: "kitchen", name: "Kitchen", icon: ChefHat },
  { id: "living", name: "Living Room", icon: Sofa },
  { id: "bathroom", name: "Bathroom", icon: Bath },
  { id: "pooja", name: "Pooja Room", icon: Home },
  { id: "office", name: "Home Office", icon: LampDesk },
];

const fallbackGuides = {
  bedroom: [
    {
      title: "15 Modern Bedroom Design Ideas for 2026",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      readTime: "6 min read",
      summary: "Discover layout secrets, velvet upholstered headboards, low-profile bed frames, and layered lighting schemes.",
      content: {
        overview: "Designing a master bedroom involves balancing acoustic tranquility with personal elegance. Modern trends favor soft neutrals, cove ceilings, floating nightstands, and concealed LED illumination.",
        keyTips: [
          "Choose low-slung platform bedframes for an expansive visual feel.",
          "Integrate warm 2700K dimmable LED strip lights behind headboards.",
          "Opt for full-height wardrobes with mirror accents to bounce light.",
          "Add acoustic fabric wall panels for noise insulation."
        ],
        recommendedMaterials: ["Microfiber Suede", "Fluted MDF Panels", "Brushed Brass Finishes"],
        projectScope: "Full Turnkey Bedroom Suite Execution"
      }
    },
    {
      title: "Luxury Master Suite & Walk-in Wardrobes",
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      readTime: "5 min read",
      summary: "Maximize walk-in closet storage with tinted glass shutters, sensor lighting, and vanity island counters.",
      content: {
        overview: "A master suite walk-in closet transforms daily dressing into a boutique store experience.",
        keyTips: [
          "Use full-height glass shutters with warm aluminum framing.",
          "Install automatic infrared proximity sensors for garment rods.",
          "Add a plush velvet ottoman center bench."
        ],
        recommendedMaterials: ["Tinted Glass", "Anodized Aluminum", "Sensored LED Racks"],
        projectScope: "Custom Walk-in Closet & Vanity Design"
      }
    }
  ],
  kitchen: [
    {
      title: "Modular Kitchen Layout & Storage Guide",
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
      readTime: "8 min read",
      summary: "Complete guide on selecting between L-Shape, Parallel, and Island kitchen configurations with soft-close Blum hardware.",
      content: {
        overview: "The kitchen golden triangle (sink, stove, refrigerator) forms the cornerstone of ergonomic kitchen design.",
        keyTips: [
          "Use tandem drawer boxes for pot and pan storage instead of deep cabinets.",
          "Install task lighting under upper wall cabinets.",
          "Choose stain-resistant engineered quartz over porous marble for countertops."
        ],
        recommendedMaterials: ["Kalinga Quartz", "Marine Grade BWP Plywood", "Acrylic Shutters"],
        projectScope: "Complete Ergonomic Modular Kitchen"
      }
    }
  ],
  living: [
    {
      title: "Living Room Space Planning & Furniture Placement",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      readTime: "5 min read",
      summary: "Learn how to anchor your living room with sectionals, coffee tables, accent lighting, and TV wall paneling.",
      content: {
        overview: "A well-designed living room facilitates easy conversation flow while acting as the aesthetic highlight of your home.",
        keyTips: [
          "Position the sofa facing the central focal point (TV unit or view window).",
          "Keep at least 3 feet of walkway clearance between furniture pieces.",
          "Use a large area rug to anchor the seating cluster."
        ],
        recommendedMaterials: ["High-density Foam Sofas", "Veneer TV Units", "Tempered Glass Tables"],
        projectScope: "Turnkey Living Room & Entertainment Zone"
      }
    }
  ],
  bathroom: [
    {
      title: "Luxury Bathroom Vanity & Lighting Handbook",
      image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
      readTime: "4 min read",
      summary: "How to choose moisture-resistant materials, anti-fog LED mirrors, and shower partitions for compact and large bathrooms.",
      content: {
        overview: "Transform daily routines into spa experiences with anti-bacterial surfaces, concealed plumbing, and mood lighting.",
        keyTips: [
          "Use HDHMR or marine plywood for vanity cabinets to prevent water swelling.",
          "Install frameless 8mm glass shower enclosures for a seamless look.",
          "Incorporate LED backlight behind mirrors for glare-free grooming light."
        ],
        recommendedMaterials: ["Statuario Porcelain Tiles", "Kohler Sanitaryware", "Marine Ply"],
        projectScope: "Spa Bathroom & Floating Vanity Suite"
      }
    }
  ],
  pooja: [
    {
      title: "Vastu Compliant Modern Pooja Room Ideas",
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80",
      readTime: "4 min read",
      summary: "Create a serene devotional sanctuary with CNC brass lattice work, warm wooden accents, and marble idol pedestals.",
      content: {
        overview: "Pooja units blend traditional reverence with sleek contemporary interiors.",
        keyTips: [
          "Place the mandir in the North-East direction as per Vastu principles.",
          "Use warm yellow indirect lighting to create a soothing spiritual ambiance.",
          "Integrate pull-out brass trays for oil lamps and incense storage."
        ],
        recommendedMaterials: ["Teak Wood", "CNC Carved Brass Panels", "White Marble Pedestals"],
        projectScope: "Custom Devotional Pooja Unit"
      }
    }
  ],
  office: [
    {
      title: "Ergonomic Home Office Setup & Productivity Guide",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      readTime: "5 min read",
      summary: "Design a professional work-from-home corner with height-adjustable desks, ergonomic mesh seating, and clutter-free wire management.",
      content: {
        overview: "A dedicated workspace promotes posture health, focused concentration, and professional Zoom backdrop aesthetics.",
        keyTips: [
          "Position monitor screens perpendicular to windows to avoid eye strain glare.",
          "Incorporate acoustic wall panels behind microphone area.",
          "Add floating wall shelves for books and greenery."
        ],
        recommendedMaterials: ["Ergonomic Mesh Chair", "Walnut Laminate Desk", "Acoustic Wall Panels"],
        projectScope: "Acoustic Home Workspace & Library"
      }
    }
  ]
};

export default function Guide() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("bedroom");
  const [guidesData, setGuidesData] = useState(fallbackGuides);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    const res = await fetchGuides();
    if (res && res.grouped && Object.keys(res.grouped).length > 0) {
      setGuidesData(res.grouped);
    }
    setLoading(false);
  };

  const currentGuides = guidesData[activeCategory] || fallbackGuides[activeCategory] || [];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 via-white to-amber-50/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold tracking-wide inline-flex items-center gap-2">
            <BookOpen size={16} /> VELORA DESIGN KNOWLEDGE HUB
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-4">
            Interior & Furniture <span className="text-amber-600">Design Guides</span>
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            Browse professionally curated room inspirations, material checklists, and layout planning rules for modern homes.
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 flex-wrap justify-center mb-14">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xl shadow-amber-600/30 scale-105"
                    : "bg-white text-gray-700 border hover:border-amber-500 hover:bg-amber-50"
                }`}
              >
                <Icon size={18} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Guides Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGuides.map((guide, index) => (
              <div
                key={guide._id || index}
                onClick={() => setSelectedGuide(guide)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition duration-500 flex flex-col justify-between cursor-pointer"
              >
                <div className="overflow-hidden relative h-64">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {guide.readTime || "5 min read"}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-3 line-clamp-3">
                      {guide.summary || "Explore expert material selections and layout optimizations."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700">Explore Article</span>
                    <button className="w-9 h-9 rounded-full bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white flex items-center justify-center transition">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARTICLE READER MODAL */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full transition"
            >
              <X size={22} />
            </button>

            {/* Header Banner */}
            <div className="relative h-64 sm:h-72 bg-black shrink-0">
              <img
                src={selectedGuide.image}
                alt={selectedGuide.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-bold w-fit mb-2">
                  {selectedGuide.category?.toUpperCase() || "GUIDE"} • {selectedGuide.readTime || "5 min read"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{selectedGuide.title}</h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-800">
              <div>
                <h4 className="text-xs font-bold uppercase text-amber-600 tracking-wider mb-2">Design Overview</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedGuide.content?.overview || selectedGuide.summary}
                </p>
              </div>

              {/* Key Tips */}
              {selectedGuide.content?.keyTips && (
                <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-100">
                  <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-600" /> Key Design & Layout Tips
                  </h4>
                  <div className="space-y-3">
                    {selectedGuide.content.keyTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-gray-800">
                        <CheckCircle2 size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Materials & Project Scope */}
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedGuide.content?.recommendedMaterials && (
                  <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Materials</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.content.recommendedMaterials.map((mat, i) => (
                        <span key={i} className="bg-white border px-3 py-1 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-100/40">
                  <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Scope & Execution</h5>
                  <span className="text-base font-bold text-amber-900">
                    {selectedGuide.content?.projectScope || "Turnkey Custom Interior Design"}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">Includes materials, manufacturing & professional installation.</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedGuide(null);
                    navigate("/consultation");
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  Discuss this Guide with a Designer <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}