import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProjects } from "../services/projects";
import { ChevronLeft, ChevronRight, X, Sparkles, MapPin, ArrowRight, CheckCircle } from "lucide-react";

const Projects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculator States
  const [calcArea, setCalcArea] = useState("");
  const [calcQuality, setCalcQuality] = useState("Luxury");
  const [calcEstimate, setCalcEstimate] = useState(0);

  const calculateCost = () => {
    const area = parseFloat(calcArea);
    if (!area || isNaN(area)) return;

    let rate = 1500; // Rate in INR per sq ft
    if (calcQuality === "Luxury") rate = 2500;
    if (calcQuality === "Ultra-Luxury") rate = 4000;

    setCalcEstimate(area * rate);
  };

  const getProjectGallery = (project) => {
    const gallery = [];

    if (project?.video) {
      gallery.push({ type: "video", url: project.video });
    }

    if (Array.isArray(project?.images)) {
      project.images.filter(Boolean).forEach((img) => {
        gallery.push({ type: "image", url: img });
      });
    } else if (project?.image) {
      gallery.push({ type: "image", url: project.image });
    }

    if (gallery.length === 0) {
      gallery.push({
        type: "image",
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      });
    }

    return gallery;
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const data = await fetchProjects();

        if (isMounted) {
          setProjects(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong while loading projects.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (location.state?.selectedProjectId && projects.length > 0) {
      const project = projects.find(
        (p) => p._id === location.state.selectedProjectId
      );
      if (project) {
        setSelectedProject(project);
        // Clear history state to prevent reopening on reload
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, projects]);

  return (
    <main className="min-h-screen bg-[#faf8f4] text-gray-900">
      <section className="max-w-7xl mx-auto px-6 py-12 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4 text-xs sm:text-sm">
            Recent Projects
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Explore Our Latest Interior Designs
          </h1>

          <p className="mt-6 text-gray-600 leading-relaxed sm:leading-8 max-w-3xl mx-auto text-sm sm:text-base">
            Discover a selection of recent design projects that showcase luxury, comfort, and a strong sense of place.
          </p>
        </motion.div>

        {loading && (
          <div className="mt-16 text-center text-gray-600">Loading projects...</div>
        )}

        {!loading && error && (
          <div className="mt-16 text-center text-red-600">{error}</div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="mt-16 text-center text-gray-600">No projects available right now.</div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {projects.map((project, index) => {
              const gallery = getProjectGallery(project);
              const firstImageItem = gallery.find((item) => item.type === "image");
              const coverImage = firstImageItem
                ? firstImageItem.url
                : (project.image || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80");

              return (
                <motion.article
                  key={project._id || project.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.12 }}
                  onClick={() => setSelectedProject(project)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedProject(project);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={project.heading}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8">
                    <p className="text-sm uppercase tracking-[4px] text-[#C9A227] font-semibold">
                      {project.tag}
                    </p>
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">
                      {project.heading}
                    </h2>
                    <p className="mt-4 text-gray-600 leading-7">
                      {project.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 md:p-6 backdrop-blur-xs"
            onClick={() => {
              setSelectedProject(null);
              setCurrentImageIndex(0);
              setActiveTab("overview");
              setCalcArea("");
              setCalcEstimate(0);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white w-full max-w-6xl h-[92vh] max-h-[820px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute right-4 top-4 z-50 bg-black/75 hover:bg-black text-white p-2 rounded-full transition shadow-lg"
                onClick={() => {
                  setSelectedProject(null);
                  setCurrentImageIndex(0);
                  setActiveTab("overview");
                  setCalcArea("");
                  setCalcEstimate(0);
                }}
              >
                <X size={20} />
              </button>

              {/* Left Column: Interactive Image Gallery */}
              <div className="w-full md:w-[58%] h-[38vh] md:h-full bg-[#141414] flex flex-col justify-between p-4 relative border-b md:border-b-0 md:border-r border-gray-100">
                {/* Main Carousel View */}
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center group/carousel">
                  {getProjectGallery(selectedProject)[currentImageIndex]?.type === "video" ? (
                    <video
                      src={getProjectGallery(selectedProject)[currentImageIndex]?.url}
                      controls
                      autoPlay
                      muted
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={getProjectGallery(selectedProject)[currentImageIndex]?.url || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}
                      alt={`${selectedProject.heading} view ${currentImageIndex + 1}`}
                      className="h-full w-full object-cover transition-all duration-500"
                    />
                  )}

                  {/* Arrows */}
                  {getProjectGallery(selectedProject).length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex(
                            currentImageIndex === 0
                              ? getProjectGallery(selectedProject).length - 1
                              : currentImageIndex - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-[#C9A227] text-white p-2.5 transition shadow-md opacity-0 group-hover/carousel:opacity-100 duration-300 animate-fade-in"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex(
                            currentImageIndex === getProjectGallery(selectedProject).length - 1
                              ? 0
                              : currentImageIndex + 1
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-[#C9A227] text-white p-2.5 transition shadow-md opacity-0 group-hover/carousel:opacity-100 duration-300 animate-fade-in"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Image Counter Pill */}
                  <div className="absolute bottom-4 right-4 bg-black/75 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                    {currentImageIndex + 1} / {getProjectGallery(selectedProject).length}
                  </div>
                </div>

                {/* Thumbnails Row */}
                {getProjectGallery(selectedProject).length > 1 && (
                  <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent shrink-0">
                    {getProjectGallery(selectedProject).map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition duration-200 shrink-0 ${currentImageIndex === idx
                            ? "border-[#C9A227] scale-95"
                            : "border-transparent opacity-50 hover:opacity-100"
                          }`}
                      >
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center relative">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover opacity-60"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 text-white p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Title, Metadata, Tabs, and Cost Calculator */}
              <div className="w-full md:w-[42%] h-[54vh] md:h-full flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                  {/* Title & Tag */}
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-[2px] text-[#C9A227] border border-[#C9A227]/25 px-2 py-0.5 rounded bg-[#C9A227]/5">
                      {selectedProject.tag}
                    </span>
                    <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                      {selectedProject.heading}
                    </h1>
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Minimal Tab Headers */}
                  <div className="border-b border-gray-100 sticky top-0 bg-white z-20 -mx-6 md:-mx-8 px-6 md:px-8">
                    <div className="flex gap-2 overflow-x-auto pb-px scrollbar-none">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "guide", label: "Design Guide" },
                        { id: "offerings", label: "Offerings" },
                        { id: "scope", label: "Design Scope" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-3.5 px-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.id
                              ? "text-[#C9A227] border-[#C9A227]"
                              : "text-gray-400 hover:text-gray-600 border-transparent"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Body Contents */}
                  <div className="pt-2">
                    {/* Overview */}
                    {activeTab === "overview" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Project Type</span>
                            <span className="block text-sm font-semibold text-gray-800 mt-1">{selectedProject.tag || "Interior"}</span>
                          </div>
                          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Timeline</span>
                            <span className="block text-sm font-semibold text-gray-800 mt-1">8 - 12 Weeks</span>
                          </div>
                          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Deliverable</span>
                            <span className="block text-sm font-semibold text-gray-800 mt-1">Full Turnkey</span>
                          </div>
                          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Warranty</span>
                            <span className="block text-sm font-semibold text-gray-800 mt-1">10 Years</span>
                          </div>
                        </div>

                        <div className="bg-[#faf8f4] border border-[#C9A227]/10 rounded-xl p-5">
                          <h4 className="text-xs uppercase font-bold text-[#C9A227] tracking-wider mb-2">Scope of Work</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            This luxury space features tailored spatial layout improvements, premium material finishes, customized lighting automation, and curated bespoke furniture designs.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Design Guide */}
                    {activeTab === "guide" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                      >
                        {/* Luxury Color Palette */}
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Color Palette</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { hex: "#C9A227", name: "Gold" },
                              { hex: "#F5F2EB", name: "Ivory" },
                              { hex: "#2C2C2C", name: "Charcoal" },
                              { hex: "#7E715C", name: "Taupe" }
                            ].map((color, idx) => (
                              <div key={idx} className="text-center">
                                <div
                                  className="h-10 rounded-lg border border-gray-200 mx-auto"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-[10px] text-gray-500 font-semibold mt-1 block">{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Finishes */}
                        <div className="space-y-3">
                          <div className="border-l-2 border-[#C9A227] pl-3 py-0.5">
                            <h5 className="text-xs font-bold text-gray-800">Materials & Finishes</h5>
                            <p className="text-xs text-gray-500 mt-1">Italian marble slabs, polished oak cabinetry, and brass fixtures.</p>
                          </div>
                          <div className="border-l-2 border-[#C9A227] pl-3 py-0.5">
                            <h5 className="text-xs font-bold text-gray-800">Lighting Design</h5>
                            <p className="text-xs text-gray-500 mt-1">Indirect dimmable LED warm profiles, luxury crystal chandeliers.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Offerings */}
                    {activeTab === "offerings" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-3"
                      >
                        {[
                          { title: "Turnkey Interiors", desc: "From structure layouts to decor styling." },
                          { title: "Bespoke Furniture", desc: "Custom sofas, beds, and modular fittings." },
                          { title: "Modular Wardrobes", desc: "Sleek, high-capacity, scratch-free finishes." }
                        ].map((offering, idx) => (
                          <div key={idx} className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                            <CheckCircle size={16} className="text-[#C9A227] mt-0.5 shrink-0" />
                            <div>
                              <h5 className="text-xs font-bold text-gray-800">{offering.title}</h5>
                              <p className="text-xs text-gray-500 mt-0.5">{offering.desc}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Scope Plan */}
                    {activeTab === "scope" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3">
                          <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Project Quality Tier</h4>
                          <span className="block text-sm font-bold text-[#C9A227]">Luxury Bespoke Craftsmanship</span>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Includes complete 3D design renders, factory manufacturing, marine-grade materials, and on-site white-glove installation.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>

                {/* Sticky CTA Bottom */}
                <div className="p-6 border-t border-gray-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      navigate("/consultation");
                    }}
                    className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-[#C9A227] border border-[#C9A227] text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span>Schedule Consultation</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Projects;