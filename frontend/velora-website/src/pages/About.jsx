import { motion } from "framer-motion";

const About = () => {
  return (
    <main className="min-h-screen bg-[#faf8f4] text-gray-900">
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            About Velora
          </p>

          <h1 className="text-5xl font-bold leading-tight">
            The art of interior design, crafted for modern living.
          </h1>

          <p className="mt-6 text-gray-600 leading-8 max-w-3xl">
            Velora blends premium materials, timeless textures, and intuitive space planning to create
            interiors that feel personal, inviting, and refined. Our designs support everyday routines
            while elevating your home with thoughtful luxury.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-3 mt-16">
          {[
            {
              title: "Why Choose Us",
              description:
                "Every project is tailored to your lifestyle, with curated finishes, bespoke furniture, and expert craftsmanship.",
            },
            {
              title: "Our Mission",
              description:
                "To create beautiful, functional spaces that make life feel effortless and inspired.",
            },
            {
              title: "Our Promise",
              description:
                "Transparent process, premium sourcing, and exceptional attention to detail from concept to completion.",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{card.title}</h2>
              <p className="text-gray-600 leading-7">{card.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.section
          className="mt-20 grid gap-10 lg:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="rounded-3xl bg-[#fff9eb] p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-[#C9A227] mb-4">Design Philosophy</h2>
            <p className="text-gray-700 leading-8">
              We design with balance in mind: layered textures, soft palettes, and strong spatial flow
              create spaces that feel calm yet luxurious.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-[#C9A227] mb-4">What We Do</h2>
            <p className="text-gray-700 leading-8">
              From residential interiors to boutique commercial spaces, we offer full-service design,
              styling, and furniture curation that brings every detail together.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <h2 className="text-3xl font-bold text-[#C9A227] mb-4">Studio Values</h2>
            <p className="text-gray-700 leading-8">
              Quality, sustainability, and joyful collaboration guide every decision we make for our
              clients and our projects.
            </p>
          </div>
        </motion.section>
      </section>
    </main>
  );
};

export default About;