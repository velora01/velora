import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sofa,
  Star,
  Truck,
  Wrench,
  Award,
  Sparkles,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";



const offerings = [
  {
    icon: <Sofa size={32} />,
    title: "Premium Branded Furniture",
    description:
      "We provide modern furniture from trusted and premium brands ensuring durability, comfort, and elegant design.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "High Quality Interior Materials",
    description:
      "Only premium plywood, laminates, acrylic, veneer, marble, hardware, and accessories are used in every project.",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: <Award size={32} />,
    title: "Trusted Brand Partnerships",
    description:
      "We collaborate with India's leading brands for hardware, modular kitchens, wardrobes, lighting, and fittings.",
    image:
      "https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: <Truck size={32} />,
    title: "Safe Delivery & Installation",
    description:
      "Professional installation team with secure transportation and timely project completion.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: <Wrench size={32} />,
    title: "After Sales Support",
    description:
      "Dedicated customer support with maintenance assistance and quick issue resolution.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: <Sparkles size={32} />,
    title: "Customized Interior Design",
    description:
      "Every home is designed according to your lifestyle, taste, and budget with premium finishes.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const zoom = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
    },
  },
};

const slideLeft = {
  hidden: {
    opacity: 0,
    x: -80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const slideRight = {
  hidden: {
    opacity: 0,
    x: 80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const brands = [
  "Greenply",
  "CenturyPly",
  "Hettich",
  "Häfele",
  "Ebco",
  "Asian Paints",
  "Merino",
  "Royal Touche",
];

const features = [
  "Premium Quality Materials",
  "100% Customized Designs",
  "Experienced Designers",
  "Transparent Pricing",
  "Branded Hardware",
  "Professional Installation",
  "Warranty Support",
  "Timely Delivery",
];


const Offering = () => {


  const navigate = useNavigate();

  function handleClick() {
    navigate("/consultation");
  }
  return (
    <div className="bg-gray-50">


      <section className="relative h-[500px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
        />

        <div className="absolute inset-0 bg-black/60"></div>
        <motion.div
          className="relative z-10 text-center text-white max-w-4xl px-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <p className="uppercase tracking-[5px] text-yellow-400 font-semibold">
            Premium Interior Solutions
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">
            Everything You Need
            <br />
            For Your Dream Home
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            We deliver luxury interiors with premium furniture, branded
            materials, expert craftsmanship, and complete project execution.
          </p>

          <button className="mt-8 bg-yellow-500 hover:bg-yellow-600 transition px-8 py-4 rounded-full font-semibold flex items-center gap-2 mx-auto">
            Explore Services
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto py-24 px-6">

        <div className="text-center mb-16">
          <p className="text-yellow-600 font-semibold uppercase">
            What We Offer
          </p>

          <h2 className="text-4xl font-bold mt-3">
            Premium Services For Every Space
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            From furniture selection to complete interior execution, we ensure
            every detail meets luxury standards.
          </p>
        </div>

        <motion.div
          className="grid lg:grid-cols-3 md:grid-cols-2 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          {offerings.map((item, index) => (

            <motion.div
              key={index}
              variants={zoom}
              whileHover={{
                y: -12,
                scale: 1.03,
              }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 group"
            >

              <div className="overflow-hidden h-60">

                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-110 duration-500"
                />

              </div>

              <div className="p-8">

                <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 mb-5">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-4 leading-7">
                  {item.description}
                </p>

              </div>

            </motion.div>

          ))}

        </motion.div>

      </section>

      <section className="bg-white py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center">

            <p className="text-yellow-600 font-semibold uppercase">
              Trusted Material Partners
            </p>

            <h2 className="text-4xl font-bold mt-4">
              We Use Only Premium Brands
            </h2>

            <p className="mt-5 text-gray-600 max-w-3xl mx-auto">
              Every project is built using trusted and industry-leading brands
              to ensure long-lasting durability, premium finishes, and customer
              satisfaction.
            </p>

          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            {brands.map((brand) => (

              <motion.div
                key={brand}
                variants={zoom}
                whileHover={{
                  scale: 1.08,
                  rotate: 2,
                }}
                className="bg-gray-50 rounded-2xl py-8 text-center shadow hover:shadow-xl transition"
              >
                <Star
                  className="mx-auto text-yellow-500 mb-3"
                  size={28}
                />

                <h3 className="font-bold text-lg">
                  {brand}
                </h3>

              </motion.div>

            ))}

          </motion.div>

        </div>

      </section >

      <section className="py-24 max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <motion.img
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
            alt=""
            className="rounded-3xl shadow-xl"
          />

          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >

            <p className="text-yellow-600 font-semibold uppercase">
              Why Choose Us
            </p>

            <h2 className="text-4xl font-bold mt-4">
              Interior Excellence That Lasts
            </h2>

            <p className="text-gray-600 mt-6 leading-8">
              Our mission is to deliver elegant interiors with superior quality,
              professional execution, transparent pricing, and unmatched
              customer satisfaction.
            </p>

            <div className="grid grid-cols-2 gap-5 mt-10">

              {features.map((feature) => (

                <div
                  key={feature}
                  className="flex items-center gap-3"
                >

                  <BadgeCheck
                    className="text-green-600"
                    size={22}
                  />

                  <span className="font-medium">
                    {feature}
                  </span>

                </div>

              ))}

            </div>

          </motion.div>

        </div>

      </section >


      <section className="bg-yellow-500 py-20">

        <div className="max-w-5xl mx-auto text-center px-6">

          <h2 className="text-4xl font-bold text-white">
            Ready To Build Your Dream Home?
          </h2>

          <p className="text-yellow-100 mt-5 text-lg">
            Book a free consultation with our interior experts and receive
            personalized design solutions tailored to your style and budget.
          </p>

          <button onClick={handleClick} className="mt-8 bg-white text-yellow-600 px-8 py-4 rounded-full font-bold hover:scale-105 transition">
            Book Free Consultation
          </button>

        </div>

      </section>

    </div >
  );
};

export default Offering;