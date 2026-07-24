import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  CheckCircle,
  Clock3,
  Wrench,
  Award,
  Star,
  Home,
  Sofa,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const faqs = [
  {
    question: "How long does an interior project take?",
    answer:
      "Most residential interior projects are completed within 30–60 days depending on the project size.",
  },
  {
    question: "Do you provide 3D designs?",
    answer:
      "Yes. We provide premium 3D visualization before execution so you know exactly how your home will look.",
  },
  {
    question: "Is installation included?",
    answer:
      "Absolutely. Manufacturing, delivery, and professional installation are included.",
  },
  {
    question: "Do you offer warranty?",
    answer:
      "Yes. We provide warranty on furniture and fittings along with after-sales support.",
  },
  {
    question: "Can I customize the furniture?",
    answer:
      "Yes. Every project is customized according to your space, budget and preferences.",
  },
];

const process = [
  "Book Free Consultation",
  "Site Measurement",
  "3D Design & Quotation",
  "Material Selection",
  "Factory Manufacturing",
  "Installation",
  "Quality Inspection",
  "Project Handover",
];

const features = [
  "Premium Branded Materials",
  "Custom Modular Furniture",
  "Complete Home Interiors",
  "Kitchen & Wardrobes",
  "Lighting & False Ceiling",
  "Electrical Planning",
  "Space Optimization",
  "Professional Installation",
];

export default function More() {
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);


  const navigate = useNavigate()
  function handleClick(){
    navigate("/consultation");
  }

  return (
    <div className="bg-white text-gray-800">

      {/* HERO */}

      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-gray-100 py-24">

        <div className="absolute w-96 h-96 rounded-full bg-amber-200 blur-[120px] opacity-30 -top-20 -left-20"></div>

        <div className="absolute w-96 h-96 rounded-full bg-orange-100 blur-[120px] opacity-30 bottom-0 right-0"></div>

        <div
          className={`max-w-7xl mx-auto px-6 text-center transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
            Premium Interior Solutions
          </span>

          <h1 className="text-5xl md:text-6xl font-black mt-8">
            More About
            <span className="text-amber-600"> Velora Interiors</span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-gray-600">
            Creating elegant interiors with premium furniture, thoughtful
            planning, and flawless execution. Your dream home deserves the
            perfect design.
          </p>
        </div>
      </section>

      {/* WHY */}

      <section className="py-20 max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">
            Why Choose Velora?
          </h2>
          <p className="text-gray-500 mt-3">
            Excellence in every corner.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">

          {[
            {
              icon: <Award size={40} />,
              title: "Premium Quality",
            },
            {
              icon: <ShieldCheck size={40} />,
              title: "Warranty Included",
            },
            {
              icon: <Clock3 size={40} />,
              title: "On-Time Delivery",
            },
            {
              icon: <Star size={40} />,
              title: "Luxury Finish",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-8 rounded-3xl border hover:border-amber-400 hover:-translate-y-2 transition duration-500 shadow-sm hover:shadow-xl"
            >
              <div className="text-amber-600 mb-6 group-hover:scale-110 transition">
                {item.icon}
              </div>

              <h3 className="font-bold text-xl">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}

      <section className="bg-gray-50 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-center text-4xl font-bold mb-14">
            Our Process
          </h2>

          <div className="grid md:grid-cols-4 gap-8">

            {process.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow hover:shadow-xl transition hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl">
                  {i + 1}
                </div>

                <h3 className="mt-6 font-bold">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}

      <section className="py-20 max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div>

            <h2 className="text-4xl font-bold mb-8">
              What's Included?
            </h2>

            <div className="space-y-5">

              {features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4"
                >
                  <CheckCircle className="text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-10">

            <Home className="text-amber-600 mb-5" size={55}/>

            <h3 className="text-3xl font-bold">
              Complete Home Interior
            </h3>

            <p className="mt-5 text-gray-600 leading-8">
              From kitchens and wardrobes to bedrooms, living rooms, TV units,
              false ceilings and lighting, we deliver complete turnkey
              solutions.
            </p>

          </div>

        </div>
      </section>

      {/* WARRANTY */}

      <section className="bg-amber-50 py-20">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

          <div className="bg-white rounded-3xl p-8">
            <ShieldCheck className="text-amber-600 mb-5" size={45}/>
            <h3 className="font-bold text-2xl">
              Warranty
            </h3>
            <p className="mt-4 text-gray-600">
              Premium warranty on furniture, fittings and installation.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8">
            <Wrench className="text-amber-600 mb-5" size={45}/>
            <h3 className="font-bold text-2xl">
              Service Support
            </h3>
            <p className="mt-4 text-gray-600">
              Quick assistance whenever you need maintenance.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8">
            <Sparkles className="text-amber-600 mb-5" size={45}/>
            <h3 className="font-bold text-2xl">
              Quality Check
            </h3>
            <p className="mt-4 text-gray-600">
              Every project undergoes multiple quality inspections.
            </p>
          </div>

        </div>

      </section>

      {/* FAQ */}

      <section className="py-24 max-w-5xl mx-auto px-6">

        <h2 className="text-center text-4xl font-bold mb-14">
          Frequently Asked Questions
        </h2>

        <div className="space-y-5">

          {faqs.map((faq, index) => (

            <div
              key={index}
              className="border rounded-2xl overflow-hidden"
            >

              <button
                onClick={() =>
                  setActive(active === index ? null : index)
                }
                className="w-full flex justify-between items-center p-6 font-semibold"
              >
                {faq.question}

                <ChevronDown
                  className={`transition ${
                    active === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {active === index && (

                <div className="px-6 pb-6 text-gray-600 animate-pulse">
                  {faq.answer}
                </div>

              )}

            </div>

          ))}

        </div>

      </section>

      {/* CTA */}

      <section className="py-24 bg-gradient-to-r from-amber-600 to-orange-500 text-white">

        <div className="max-w-5xl mx-auto text-center px-6">

          <h2 className="text-5xl font-black">
            Ready to Design Your Dream Home?
          </h2>

          <p className="mt-6 text-lg opacity-90">
            Get expert consultation, premium designs, transparent pricing,
            and professional execution—all under one roof.
          </p>

          <button onClick={handleClick} className="mt-10 px-8 py-4 rounded-full bg-white text-amber-600 font-bold hover:scale-105 transition flex items-center gap-3 mx-auto">
            Book Free Consultation
            <ArrowRight />
          </button>

        </div>

      </section>

    </div>
  );
}