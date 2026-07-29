import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";
import { submitContactForm } from "../services/contactService";

const Contact = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    projectType: "Residential Interior Design",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        projectType: "Residential Interior Design",
        message: ""
      });
    } catch (err) {
      setError(err.message || "Failed to submit contact message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: "Studio Address",
      content: "velora antraal, wakad chauk, aundh road, pune 411008"
    },
    {
      icon: Mail,
      label: "Email",
      content: "info@velora.family"
    },
    {
      icon: Phone,
      label: "Phone",
      content: "+91 88 88 88 8888"
    },
    {
      icon: Clock,
      label: "Office Hours",
      content: "Mon – Sun: 10:00 AM - 10:00 PM"
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
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4 text-xs sm:text-sm">
            Get In Touch
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
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
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-3xl bg-gradient-to-br from-[#faf8f4] to-white p-8 shadow-xl border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
            
            {success && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm">
                Thank you! Your message has been sent successfully. We will get back to you shortly.
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Project Type</span>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                >
                  <option value="Residential Interior Design">Residential Interior Design</option>
                  <option value="Commercial Space">Commercial Space</option>
                  <option value="Furniture Curation">Furniture Curation</option>
                  <option value="Consultation Only">Consultation Only</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your design goals..."
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#C9A227] px-6 py-3 text-white font-semibold transition hover:bg-[#B8931F] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare size={18} />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4 text-xs sm:text-sm">
            Questions & Answers
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
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
