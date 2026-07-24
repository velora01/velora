import { motion } from "framer-motion";
import { Award, Target, Heart, Globe, Users, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const stats = [
    { icon: Award, value: "20+", label: "Years of Experience" },
    { icon: Users, value: "25+", label: "Team Members" },
    { icon: Target, value: "350+", label: "Projects Completed" },
    { icon: Heart, value: "320+", label: "Satisfied Clients" }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Creative solutions combining timeless design with modern functionality"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Uncompromising quality in every aspect of design and execution"
    },
    {
      icon: Target,
      title: "Focus",
      description: "Dedicated attention to each client's unique vision and lifestyle needs"
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "Responsible sourcing and eco-friendly design practices"
    }
  ];

  const awards = [
    "Best Interior Design Studio 2023",
    "Excellence in Commercial Design 2022",
    "Sustainable Design Leadership 2023",
    "Customer Choice Award 2022"
  ];


  const navigate = useNavigate();

  function handleClick(){
    navigate("/consultation");
  }


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

          <p className="mt-6 text-gray-600 leading-8 max-w-3xl text-lg">
            Founded in 2015, Velora has established itself as a premier interior design studio, blending premium materials, timeless textures, and intuitive space planning to create interiors that feel personal, inviting, and refined. Our designs support everyday routines while elevating your home with thoughtful luxury and professional excellence.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition">
                <Icon size={40} className="text-[#C9A227] mx-auto mb-4" />
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Core Values Section */}
        <div className="grid gap-10 lg:grid-cols-3 mt-20">
          {[
            {
              title: "Why Choose Us",
              description:
                "Every project is tailored to your lifestyle, with curated finishes, bespoke furniture, and expert craftsmanship. We combine aesthetic vision with practical expertise to deliver exceptional results.",
            },
            {
              title: "Our Mission",
              description:
                "To create beautiful, functional spaces that make life feel effortless and inspired. We believe great design should enhance daily living while reflecting personal style and sophistication.",
            },
            {
              title: "Our Promise",
              description:
                "Transparent process, premium sourcing, and exceptional attention to detail from concept to completion. Quality, integrity, and client satisfaction guide everything we do.",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{card.title}</h2>
              <p className="text-gray-600 leading-8">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Design Philosophy Section */}
        <motion.section
          className="mt-20 grid gap-10 lg:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#fff9eb] to-[#fffef5] p-10 shadow-xl border border-[#C9A227]/20">
            <h3 className="text-3xl font-bold text-[#C9A227] mb-4">Design Philosophy</h3>
            <p className="text-gray-700 leading-8 mb-4">
              We design with balance in mind: layered textures, soft palettes, and strong spatial flow create spaces that feel calm yet luxurious.
            </p>
            <p className="text-gray-600 text-sm">
              Every element is carefully considered to create harmony between form and function.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition">
            <h3 className="text-3xl font-bold text-[#C9A227] mb-4">What We Do</h3>
            <p className="text-gray-700 leading-8 mb-4">
              From residential interiors to boutique commercial spaces, we offer full-service design, styling, and furniture curation.
            </p>
            <p className="text-gray-600 text-sm">
              Our comprehensive approach ensures seamless execution and stunning results.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition">
            <h3 className="text-3xl font-bold text-[#C9A227] mb-4">Studio Values</h3>
            <p className="text-gray-700 leading-8 mb-4">
              Quality, sustainability, and joyful collaboration guide every decision we make for our clients and projects.
            </p>
            <p className="text-gray-600 text-sm">
              We measure success by client satisfaction and lasting design impact.
            </p>
          </div>
        </motion.section>
      </section>
      
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Our Core Values
          </p>
          <h2 className="text-5xl font-bold leading-tight">What Drives Us</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#C9A227] transition"
              >
                <Icon size={40} className="text-[#C9A227] mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-7">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Awards Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Recognition
          </p>
          <h2 className="text-5xl font-bold leading-tight">Awards & Accolades</h2>
          <p className="mt-6 text-gray-600 leading-8 max-w-3xl mx-auto">
            Our commitment to excellence and innovation has been recognized by industry leaders and satisfied clients worldwide.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {awards.map((award, index) => (
            <motion.div
              key={award}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl bg-gradient-to-r from-[#C9A227]/10 to-transparent border border-[#C9A227]/20 p-6 flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                <Award size={32} className="text-[#C9A227]" />
              </div>
              <p className="text-lg font-semibold text-gray-900">{award}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 bg-gradient-to-br from-white to-[#faf8f4] rounded-3xl my-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A227] uppercase tracking-[6px] font-semibold mb-4">
            Our Team
          </p>
          <h2 className="text-5xl font-bold leading-tight">Meet the Professionals</h2>
          <p className="mt-6 text-gray-600 leading-8 max-w-3xl mx-auto">
            Our diverse team of designers, consultants, and specialists brings together decades of combined experience and creative expertise.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="rounded-2xl bg-white p-8 border border-gray-100"
          >
            <div className="text-4xl font-bold text-[#C9A227] mb-2">12+</div>
            <p className="text-gray-700 font-semibold">Certified Interior Designers</p>
            <p className="text-gray-600 text-sm mt-2">Professional designers with expertise in luxury residential and commercial projects</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl bg-white p-8 border border-gray-100"
          >
            <div className="text-4xl font-bold text-[#C9A227] mb-2">8+</div>
            <p className="text-gray-700 font-semibold">Design Consultants</p>
            <p className="text-gray-600 text-sm mt-2">Specialized consultants for color, materials, lighting, and project management</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl bg-white p-8 border border-gray-100"
          >
            <div className="text-4xl font-bold text-[#C9A227] mb-2">5+</div>
            <p className="text-gray-700 font-semibold">Support Specialists</p>
            <p className="text-gray-600 text-sm mt-2">Administrative and logistical support ensuring smooth project execution</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Space?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Let our team of professional designers create a beautiful, functional space that reflects your vision and lifestyle.
          </p>
          <button onClick={handleClick} className="inline-block rounded-2xl bg-[#C9A227] text-white font-bold py-4 px-10 hover:bg-[#B8931F] transition text-lg">
            Schedule Your Consultation
          </button>
        </motion.div>
      </section>
    </main>
  );
};

export default About;