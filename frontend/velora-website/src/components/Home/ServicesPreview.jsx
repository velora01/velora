import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchProjects } from "../../services/projects";

const ServicesPreview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        if (isMounted) {
          setProjects(data.slice(0, 6));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load projects.");
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
    <motion.section
      className="py-24 bg-[#faf8f4]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[4px] text-[#C9A227] font-semibold">
            Featured Projects
          </p>
          <h2 className="text-5xl font-bold mt-4">
            Interior Solutions For Every Space
          </h2>
          <p className="mt-6 text-gray-500 max-w-2xl mx-auto">
            From concept to completion, Velora delivers beautifully crafted interiors with premium materials and exceptional attention to detail.
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-600">Loading projects...</div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center text-gray-600">No projects available right now.</div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project._id || project.slug || index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                whileHover={{ y: -10 }}
                className="group relative h-[430px] rounded-3xl overflow-hidden shadow-xl cursor-pointer"
              >
                <img
                  src={project.image || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}
                  alt={project.heading}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-sm uppercase tracking-[4px] text-[#C9A227] font-semibold">
                    {project.tag}
                  </p>
                  <h3 className="mt-4 text-3xl font-bold">
                    {project.heading}
                  </h3>
                  <p className="mt-3 text-gray-200 leading-7">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ServicesPreview;
