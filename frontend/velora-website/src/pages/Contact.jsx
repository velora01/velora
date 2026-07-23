import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactInfo = [
    {
      icon: MapPin,
      label: "Studio Address",
      content: "12 Velvet Lane, Interior District, City Center"
    },
    {
      icon: Mail,
      label: "Email",
      content: "hello@velora.com"
    },
    {
      icon: Phone,
      label: "Phone",
      content: "+1 (555) 123-4567"
    },
    {
      icon: Clock,
      label: "Office Hours",
      content: "Mon – Fri: 9:00 AM - 6:00 PM"
    }
  ];

  const faqs = [
    {
      question: "What is your typical project timeline?",
      answer: "Project timelines vary based on scope. Consultations typically take 1-2 weeks, while full home redesigns range from 3-6 months. We provide detailed timelines during our initial planning phase."
    },
    {
      question: "How do you determine project costs?",
      answer: "We work with budgets at every level. During our initial consultation, we discuss your financial parameters and provide customized solutions that maximize value without compromising quality."
    },
    {
      question: "Do you offer virtual consultations?",
      answer: "Yes! We offer both in-person and virtual consultations via video call. We can assess spaces remotely and provide design recommendations for clients worldwide."
    },
    {
      question: "Can you work with my existing furniture?",
      answer: "Absolutely. We can redesign around your existing pieces, repurpose items, or source new pieces to complement your current collection. Flexibility is key to our approach."
    },
    {
      question: "What is your design style philosophy?",
      answer: "We believe in timeless luxury that balances aesthetics with functionality. Our designs are tailored to reflect each client's personality while maintaining sophisticated, professional standards."
    },
    {
      question: "How do I book a consultation?",
      answer: "Contact us via email, phone, or fill out our consultation form. Our team will respond within 24 hours to schedule your initial consultation, which is complimentary."
    }
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header Section */}
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
            Let's bring your interior vision to life.
          </h1>

          <p className="mt-6 text-gray-600 leading-8 max-w-3xl">
            Reach out to discuss a new home makeover, furniture concept, or commercial interior project.
            Our team will guide you through every step of the design process with professionalism and creativity.
          </p>
        </motion.div>

        {/* Contact Info & Form */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] mt-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#C9A227]/10">
                        <IconComponent size={24} className="text-[#C9A227]" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{info.label}</p>
                      <p className="text-gray-600 mt-1">{info.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="font-semibold text-gray-900 mb-4">Follow Us</p>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-[#C9A227]/10 hover:bg-[#C9A227] text-[#C9A227] hover:text-white transition flex items-center justify-center font-semibold">
                  f
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-[#C9A227]/10 hover:bg-[#C9A227] text-[#C9A227] hover:text-white transition flex items-center justify-center font-semibold">
                  in
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-[#C9A227]/10 hover:bg-[#C9A227] text-[#C9A227] hover:text-white transition flex items-center justify-center">
                  📍
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-3xl bg-gradient-to-br from-[#faf8f4] to-white p-8 shadow-xl border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email Address</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Project Type</span>
                <select className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20">
                  <option>Select project type</option>
                  <option>Residential Interior Design</option>
                  <option>Commercial Space</option>
                  <option>Furniture Curation</option>
                  <option>Consultation Only</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  rows="4"
                  placeholder="Tell us about your design goals..."
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 resize-none"
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#C9A227] px-6 py-3 text-white font-semibold transition hover:bg-[#B8931F] flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Send Message
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Questions & Answers
          </p>
          <h2 className="text-5xl font-bold leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-gray-600 leading-8 max-w-3xl mx-auto">
            Find answers to common questions about our services, process, and how we work with clients.
          </p>
        </motion.div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="rounded-2xl border border-gray-200 overflow-hidden hover:border-[#C9A227] transition"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#faf8f4] transition"
              >
                <h3 className="font-semibold text-gray-900 text-left">{faq.question}</h3>
                <span className="flex-shrink-0 text-[#C9A227] text-2xl">
                  {expandedFaq === index ? "−" : "+"}
                </span>
              </button>
              {expandedFaq === index && (
                <div className="px-6 py-4 bg-[#faf8f4] border-t border-gray-200">
                  <p className="text-gray-600 leading-7">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Contact;
