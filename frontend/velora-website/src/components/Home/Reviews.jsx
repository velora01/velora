import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Alicia Harper",
    role: "Residential Client",
    quote:
      "Velora transformed our living room into a peaceful retreat. Every detail feels modern, luxurious, and effortless.",
  },
  {
    name: "Daniel Morgan",
    role: "Boutique Owner",
    quote:
      "The design team captured our brand personality perfectly. The space is elegant, inviting, and highly functional.",
  },
  {
    name: "Priya Singh",
    role: "Penthouse Client",
    quote:
      "From concept to installation, Velora delivered premium finishes and a calming aesthetic with exceptional service.",
  },
];

const Reviews = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Client Reviews
          </p>
          <h2 className="text-5xl font-bold leading-tight">
            What our clients are saying
          </h2>
          <p className="mt-6 text-gray-600 leading-8 max-w-3xl mx-auto">
            Read authentic feedback from clients who trust Velora to create luxurious,
            curated interiors with thoughtful details and a professional finish.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="rounded-3xl border border-gray-100 bg-[#faf8f4] p-8 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A227] text-white">
                  <Quote size={20} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>

              <p className="text-gray-700 leading-8">"{review.quote}"</p>

              <div className="mt-8 flex gap-1 text-[#C9A227]">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} size={18} />
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
