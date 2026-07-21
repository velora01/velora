import { motion } from "framer-motion";

const projectList = [
  {
    title: "Modern Living Suite",
    location: "Downtown Residence",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A refined living and dining concept with warm neutrals, sculpted lighting, and custom furnishings.",
  },
  {
    title: "Serene Bedroom Retreat",
    location: "Luxury Penthouse",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Soft textures, layered finishes, and elegant accents create a calming private oasis.",
  },
  {
    title: "Signature Kitchen Design",
    location: "Contemporary Villa",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A luxury kitchen with clean lines, statement cabinetry, and premium integrated appliances.",
  },
  {
    title: "Cozy Family Library",
    location: "Suburban Townhouse",
    image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A warm, layered reading room with custom shelving, cozy textures, and intimate lighting.",
  },
  {
    title: "Elegant Guest Suite",
    location: "Country Estate",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A serene and luxurious guest retreat with refined soft goods, premium accents, and hotel-inspired comfort.",
  },
  {
    title: "Contemporary Workspace",
    location: "Creative Studio",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A modern home office designed for productivity, calm focus, and elevated material finishes.",
  },
  {
    title: "Luxury Bathroom Oasis",
    location: "Seaside Villa",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A spa-inspired bathroom with textured stone, brass accents, and a tranquil, refined palette.",
  },
  {
    title: "Sunlit Dining Room",
    location: "Modern Loft",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    summary:
      "An inviting dining space with elegant seating, layered lighting, and polished natural finishes.",
  },
  {
    title: "Grand Entry Experience",
    location: "Luxury Residence",
    image:
      "https://images.unsplash.com/photo-1616594039964-4f6fb5b0f2d5?auto=format&fit=crop&w=1200&q=80",
    summary:
      "A dramatic foyer with sculptural details, bespoke storage, and an impressive first impression.",
  },
];

const Projects = () => {
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

        <div className="grid gap-8 mt-16 lg:grid-cols-3">
          {projectList.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.12 }}
              className="group overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <p className="text-sm uppercase tracking-[4px] text-[#C9A227] font-semibold">
                  {project.location}
                </p>
                <h2 className="mt-4 text-3xl font-bold text-gray-900">
                  {project.title}
                </h2>
                <p className="mt-4 text-gray-600 leading-7">
                  {project.summary}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Projects;