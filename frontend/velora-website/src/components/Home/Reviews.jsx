import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sarah Mitchell",
    role: "Homeowner",
    quote: "Velora transformed our house into a home we absolutely love. The attention to detail and professionalism was exceptional. Highly recommended!",
    rating: 5
  },
  {
    name: "James Chen",
    role: "Hotel Owner",
    quote: "Working with Velora on our boutique hotel was a game-changer. Our guests consistently comment on the beautiful design and comfortable ambiance.",
    rating: 5
  },
  {
    name: "Emma Richardson",
    role: "Corporate Director",
    quote: "Our new office space has increased employee satisfaction significantly. The design perfectly balances aesthetics with functionality. Truly impressive work.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "Restaurant Owner",
    quote: "The team at Velora created an atmosphere that perfectly captures our brand. Customer feedback has been overwhelmingly positive. Outstanding results!",
    rating: 5
  },
  {
    name: "Victoria Park",
    role: "Interior Enthusiast",
    quote: "Professional, creative, and so attentive to every detail. Velora's team listened to my vision and exceeded all expectations. Worth every penny!",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Business Owner",
    quote: "We hired Velora for our retail showroom and the results are stunning. Our sales have improved since the redesign. Excellent investment!",
    rating: 5
  }
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="rounded-3xl border border-gray-100 bg-[#faf8f4] p-8 shadow-xl hover:shadow-2xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-[#C9A227] font-medium">{review.role}</p>
                </div>
                <Quote size={24} className="text-[#C9A227] opacity-40" />
              </div>

              <p className="text-gray-700 leading-7 mb-6">"{review.quote}"</p>

              <div className="flex gap-1 text-[#C9A227]">
                {[...Array(review.rating)].map((_, starIndex) => (
                  <Star key={starIndex} size={16} fill="currentColor" />
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 rounded-3xl bg-gradient-to-r from-[#C9A227]/10 to-transparent p-10 border border-[#C9A227]/20"
        >
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-bold text-[#C9A227]">150+</p>
              <p className="text-gray-700 mt-2 font-medium">Projects Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#C9A227]">200+</p>
              <p className="text-gray-700 mt-2 font-medium">Satisfied Clients</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#C9A227]">8+</p>
              <p className="text-gray-700 mt-2 font-medium">Years Experience</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
