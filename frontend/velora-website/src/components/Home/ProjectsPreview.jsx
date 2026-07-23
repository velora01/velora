import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchProjects } from "../../services/projects";

const ProjectsPreview = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[4px] text-[#C9A227] font-semibold">
            Featured Projects
          </p>
          <h2 className="text-5xl font-bold mt-4 text-gray-900">
            Explore Our Latest Interior Work
          </h2>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto leading-8">
            A glimpse of the latest spaces we have designed, crafted with timeless style and thoughtful functionality.
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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.article
                key={project._id || project.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="overflow-hidden rounded-3xl bg-[#faf8f4] shadow-lg border border-gray-100"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={project.image || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"}
                    alt={project.heading}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <p className="text-sm uppercase tracking-[4px] text-[#C9A227] font-semibold">
                    {project.tag}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold text-gray-900">
                    {project.heading}
                  </h3>
                  <p className="mt-4 text-gray-600 leading-7">
                    {project.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsPreview;
