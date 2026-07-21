import { motion } from "framer-motion";

const Contact = () => {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Get In Touch
          </p>

          <h1 className="text-5xl font-bold leading-tight">
            Let’s bring your interior vision to life.
          </h1>

          <p className="mt-6 text-gray-600 leading-8 max-w-3xl">
            Reach out to discuss a new home makeover, furniture concept, or commercial interior project.
            Our team will guide you through every step of the design process.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-3xl bg-[#faf8f4] p-10 shadow-xl border border-gray-100"
          >
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Contact Details
            </h2>
            <div className="space-y-6 text-gray-700 leading-8">
              <div>
                <p className="font-semibold">Studio Address</p>
                <p>12 Velvet Lane, Interior District, City Center</p>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>hello@velora.com</p>
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p>+1 555 123 4567</p>
              </div>
              <div>
                <p className="font-semibold">Hours</p>
                <p>Mon – Fri: 9:00am – 6:00pm</p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-3xl bg-gray-50 p-10 shadow-xl border border-gray-100"
          >
            <div className="grid gap-6">
              <label className="block">
                <span className="text-gray-700 font-medium">Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Email</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Project Details</span>
                <textarea
                  rows="6"
                  placeholder="Tell us about your design goals"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#C9A227] px-8 py-4 text-white font-semibold transition hover:bg-yellow-700"
              >
                Send Message
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
};

export default Contact;