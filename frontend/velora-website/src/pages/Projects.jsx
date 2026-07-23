import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchProjects } from "../services/projects";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const getProjectGallery = (project) => {
    const images = Array.isArray(project?.images)
      ? project.images.filter(Boolean)
      : [];

    if (images.length > 0) {
      return images;
    }

    if (project?.image) {
      return [project.image];
    }

    return [];
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

  return (
    <main className="min-h-screen bg-[#faf8f4] text-gray-900">
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Recent Projects
          </p>

          <h1 className="text-5xl font-bold leading-tight">
            Explore Our Latest Interior Designs
          </h1>

          <p className="mt-6 text-gray-600 leading-8 max-w-3xl mx-auto">
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
          <div className="grid gap-8 mt-16 lg:grid-cols-3">
            {projects.map((project, index) => {
              const gallery = getProjectGallery(project);
              const coverImage = gallery[0] || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-4 md:py-6"
            onClick={() => {
              setSelectedProject(null);
              setCurrentImageIndex(0);
              setActiveTab("overview");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute right-4 top-4 z-20 rounded-full bg-white shadow-lg p-2 text-gray-800 hover:bg-gray-100 transition"
                onClick={() => {
                  setSelectedProject(null);
                  setCurrentImageIndex(0);
                  setActiveTab("overview");
                }}
              >
                <span className="text-2xl">×</span>
              </button>

              {/* Main Container */}
              <div className="h-full overflow-y-auto">
                {/* Large Image Gallery */}
                <div className="relative bg-black/95 w-full h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center">
                  <img
                    src={getProjectGallery(selectedProject)[currentImageIndex] || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}
                    alt={`${selectedProject.heading} view ${currentImageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Navigation Arrows */}
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white p-2 transition shadow-lg"
                      >
                        <ChevronLeft size={24} className="text-gray-800" />
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 hover:bg-white p-2 transition shadow-lg"
                      >
                        <ChevronRight size={24} className="text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {getProjectGallery(selectedProject).length}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 lg:p-10">
                  {/* Project Header */}
                  <div className="mb-8 border-b border-gray-200 pb-8">
                    <p className="text-sm uppercase tracking-[4px] text-[#C9A227] font-semibold">
                      {selectedProject.tag}
                    </p>
                    <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
                      {selectedProject.heading}
                    </h1>
                    <p className="mt-6 text-gray-700 leading-8 text-lg max-w-3xl">
                      {selectedProject.description}
                    </p>
                  </div>
                  {/* Sticky Tab Navigation Header */}
                  <div className="sticky top-0 z-40 bg-white border-b-2 border-[#C9A227]/20 shadow-md -mx-6 md:-mx-8 lg:-mx-10 px-6 md:px-8 lg:px-10">
                    <div className="flex items-center justify-start gap-1 py-0 overflow-x-auto">
                      {[
                        { id: "overview", label: "Overview", icon: "📋" },
                        { id: "gallery", label: "Gallery", icon: "🖼️" },
                        { id: "review", label: "Review", icon: "✨" },
                        { id: "offerings", label: "Offerings", icon: "🎁" },
                        { id: "calculator", label: "Calculator", icon: "💰" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-300 border-b-4 whitespace-nowrap ${
                            activeTab === tab.id
                              ? "text-[#C9A227] border-[#C9A227] bg-[#C9A227]/5"
                              : "text-gray-600 hover:text-[#C9A227] border-transparent hover:border-[#C9A227]/30 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-xl hidden sm:inline">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-8">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-[#C9A227]/10 to-transparent rounded-2xl p-6 border border-[#C9A227]/20">
                            <h3 className="text-[#C9A227] font-semibold uppercase tracking-wide mb-2">
                              Project Type
                            </h3>
                            <p className="text-gray-800 text-lg font-medium">
                              {selectedProject.tag || "Interior Design"}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-[#C9A227]/10 to-transparent rounded-2xl p-6 border border-[#C9A227]/20">
                            <h3 className="text-[#C9A227] font-semibold uppercase tracking-wide mb-2">
                              Status
                            </h3>
                            <p className="text-gray-800 text-lg font-medium">
                              Completed
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-[#C9A227]/10 to-transparent rounded-2xl p-6 border border-[#C9A227]/20">
                            <h3 className="text-[#C9A227] font-semibold uppercase tracking-wide mb-2">
                              Gallery Items
                            </h3>
                            <p className="text-gray-800 text-lg font-medium">
                              {getProjectGallery(selectedProject).length} Images
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Project Details
                          </h3>
                          <p className="text-gray-700 leading-8">
                            {selectedProject.description}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Gallery Guide Tab */}
                    {activeTab === "gallery" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 rounded-2xl p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Gallery Guide
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {getProjectGallery(selectedProject).map((image, idx) => (
                              <div
                                key={idx}
                                className="relative group cursor-pointer rounded-xl overflow-hidden"
                                onClick={() => setCurrentImageIndex(idx)}
                              >
                                <img
                                  src={image}
                                  alt={`Gallery item ${idx + 1}`}
                                  className="h-48 w-full object-cover group-hover:scale-110 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                                  <span className="text-white font-semibold text-lg">
                                    View {idx + 1}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-gray-700 leading-8">
                            Explore our complete gallery showcasing every detail of this luxury interior design project. Each image captures the essence of craftsmanship, elegance, and attention to detail.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Guide Review Tab */}
                    {activeTab === "review" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 rounded-2xl p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Design Guide & Review
                          </h3>
                          <div className="space-y-4">
                            <div className="border-l-4 border-[#C9A227] pl-6 py-2">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                Design Concept
                              </h4>
                              <p className="text-gray-700">
                                This project embodies modern luxury combined with timeless elegance, creating a space that is both functional and aesthetically stunning.
                              </p>
                            </div>
                            <div className="border-l-4 border-[#C9A227] pl-6 py-2">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                Materials & Finishes
                              </h4>
                              <p className="text-gray-700">
                                Premium materials including marble, oak wood, and custom upholstery were carefully selected to ensure durability and visual appeal.
                              </p>
                            </div>
                            <div className="border-l-4 border-[#C9A227] pl-6 py-2">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                Color Palette
                              </h4>
                              <p className="text-gray-700">
                                A sophisticated blend of neutral tones with gold accents creates a warm, inviting atmosphere while maintaining elegance.
                              </p>
                            </div>
                            <div className="border-l-4 border-[#C9A227] pl-6 py-2">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                Spatial Planning
                              </h4>
                              <p className="text-gray-700">
                                Every element is thoughtfully positioned to maximize flow, functionality, and visual harmony throughout the space.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Offerings Tab */}
                    {activeTab === "offerings" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-gradient-to-br from-[#C9A227]/5 to-transparent rounded-2xl p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            Our Premium Offerings
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 border-2 border-[#C9A227]/30 hover:border-[#C9A227] transition">
                              <div className="text-3xl mb-3">✨</div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">
                                Full Interior Design
                              </h4>
                              <p className="text-gray-600 mb-4">
                                Complete design solution from concept to execution with professional consultation.
                              </p>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>✓ Space planning & layout</li>
                                <li>✓ Material selection</li>
                                <li>✓ Color coordination</li>
                              </ul>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border-2 border-[#C9A227]/30 hover:border-[#C9A227] transition">
                              <div className="text-3xl mb-3">🛋️</div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">
                                Furniture Curation
                              </h4>
                              <p className="text-gray-600 mb-4">
                                Expert selection of premium furniture pieces that complement your design.
                              </p>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>✓ Designer collaborations</li>
                                <li>✓ Custom options</li>
                                <li>✓ Quality assurance</li>
                              </ul>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border-2 border-[#C9A227]/30 hover:border-[#C9A227] transition">
                              <div className="text-3xl mb-3">🎨</div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">
                                Decor & Styling
                              </h4>
                              <p className="text-gray-600 mb-4">
                                Curated accessories and styling that bring your space to life with personality.
                              </p>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>✓ Art & wall decor</li>
                                <li>✓ Lighting design</li>
                                <li>✓ Styling consultation</li>
                              </ul>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border-2 border-[#C9A227]/30 hover:border-[#C9A227] transition">
                              <div className="text-3xl mb-3">🔧</div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">
                                Project Management
                              </h4>
                              <p className="text-gray-600 mb-4">
                                End-to-end management ensuring timely delivery and quality execution.
                              </p>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>✓ Contractor coordination</li>
                                <li>✓ Timeline management</li>
                                <li>✓ Quality control</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Cost Calculator Tab */}
                    {activeTab === "calculator" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-gradient-to-br from-[#C9A227]/5 to-transparent rounded-2xl p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            Cost Breakdown & Calculator
                          </h3>
                          <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-6">
                                    Service Pricing
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                      <span className="text-gray-700">Design Consultation</span>
                                      <span className="font-semibold text-gray-900">$500 - $1,000</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                      <span className="text-gray-700">Space Planning</span>
                                      <span className="font-semibold text-gray-900">$2,000 - $5,000</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                      <span className="text-gray-700">Material Selection</span>
                                      <span className="font-semibold text-gray-900">Varies</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                      <span className="text-gray-700">Project Management</span>
                                      <span className="font-semibold text-gray-900">10% of total</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t-2 border-[#C9A227]">
                                      <span className="text-lg font-bold text-gray-900">
                                        Estimated Base
                                      </span>
                                      <span className="text-xl font-bold text-[#C9A227]">
                                        $15,000+
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-6">
                                    Quick Estimate
                                  </h4>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Size (sq ft)
                                      </label>
                                      <input
                                        type="number"
                                        placeholder="Enter area"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Range
                                      </label>
                                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]">
                                        <option>Select budget range</option>
                                        <option>$15,000 - $25,000</option>
                                        <option>$25,000 - $50,000</option>
                                        <option>$50,000 - $100,000</option>
                                        <option>$100,000+</option>
                                      </select>
                                    </div>
                                    <button className="w-full bg-[#C9A227] text-white font-semibold py-3 rounded-lg hover:bg-[#B8931F] transition">
                                      Get Estimate
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                              💡 <span className="font-semibold">Note:</span> This is an estimated guide. Final costs depend on specific requirements, materials chosen, and project scope. Contact us for a personalized quote.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <button className="w-full bg-gradient-to-r from-[#C9A227] to-[#B8931F] text-white font-bold py-4 px-6 rounded-2xl hover:shadow-lg transition text-lg uppercase tracking-wide">
                      Schedule a Consultation
                    </button>
                  </div>
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