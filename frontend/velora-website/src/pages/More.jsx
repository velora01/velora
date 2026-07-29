import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReviews, submitReview } from "../services/reviewService";
import { submitQuoteRequest } from "../services/estimatorService";
import {
  ShieldCheck,
  CheckCircle,
  Clock3,
  Award,
  Star,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Calculator,
  MessageSquarePlus,
  X,
  Check,
  Sliders,
  Send,
  Building,
  CheckCircle2,
} from "lucide-react";

const faqs = [
  {
    question: "How long does an interior project take?",
    answer: "Most residential interior projects are completed within 30–60 days depending on the project size.",
  },
  {
    question: "Do you provide 3D designs?",
    answer: "Yes. We provide premium 3D visualization before execution so you know exactly how your home will look.",
  },
  {
    question: "Is installation included?",
    answer: "Absolutely. Manufacturing, delivery, and professional installation are included.",
  },
  {
    question: "Do you offer warranty?",
    answer: "Yes. We provide warranty on furniture and fittings along with after-sales support.",
  },
  {
    question: "Can I customize the furniture?",
    answer: "Yes. Every project is customized according to your space, style and preferences.",
  },
];

const process = [
  "Book Free Consultation",
  "Site Measurement",
  "3D Design & Plan",
  "Material Selection",
  "Factory Manufacturing",
  "Installation",
  "Quality Inspection",
  "Project Handover",
];

const furnitureAddonList = [
  "Modular Kitchen",
  "Master Bedroom Wardrobe",
  "Luxury L-Shape Sofa",
  "6-Seater Dining Table",
  "Custom TV Unit & Wall Design",
  "False Ceiling & Ambient Lighting",
  "Smart Home Lighting Integration",
  "Italian Marble / Premium Flooring",
];

const fallbackReviews = [
  {
    name: "Rohan & Priya Sharma",
    location: "Mumbai",
    projectType: "3BHK Full Home Interior",
    rating: 5,
    comment: "Velora turned our 3BHK apartment into a dream space! The 3D renderings matched the final execution 100%. The team completed the project on time within 45 days. The modular kitchen and master bedroom wardrobes are stunning!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    verified: true,
  },
  {
    name: "Ananya Deshmukh",
    location: "Pune",
    projectType: "Modular Kitchen & Living Room",
    rating: 5,
    comment: "Extremely professional team! The quality of materials and soft-close hardware used in our parallel kitchen is top-notch. Special thanks to the project manager for daily updates.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    verified: true,
  },
  {
    name: "Vikram Malhotra",
    location: "Delhi NCR",
    projectType: "Luxury Penthouse Renovation",
    rating: 5,
    comment: "Velora delivered pure luxury. The fluted wooden TV unit, Italian marble dining, and ambient lighting automation exceeded our expectations!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    verified: true,
  },
];

export default function More() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  // Estimator state (Scope Planner without price display)
  const [homeType, setHomeType] = useState("2 BHK");
  const [sqft, setSqft] = useState(1000);
  const [packageTier, setPackageTier] = useState("Premium");
  const [selectedAddons, setSelectedAddons] = useState(["Modular Kitchen", "Master Bedroom Wardrobe"]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "" });
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Review state
  const [reviews, setReviews] = useState(fallbackReviews);
  const [avgRating, setAvgRating] = useState(5.0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    location: "",
    projectType: "Full Home Interior",
    rating: 5,
    comment: "",
  });
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    loadReviewsData();
  }, []);

  const loadReviewsData = async () => {
    const res = await fetchReviews();
    if (res && res.data && res.data.length > 0) {
      setReviews(res.data);
      if (res.averageRating) setAvgRating(res.averageRating);
    }
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitQuoteRequest({
        ...quoteForm,
        homeType,
        sqft,
        packageTier,
        selectedFurniture: selectedAddons,
      });
      setQuoteSuccess(true);
      setTimeout(() => {
        setQuoteSuccess(false);
        setShowQuoteModal(false);
        setQuoteForm({ name: "", email: "", phone: "" });
      }, 2500);
    } catch (err) {
      alert(err.message || "Failed to submit quote request.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await submitReview(reviewForm);
      setReviewMsg("Review submitted successfully! Thank you.");
      if (res.data) {
        setReviews([res.data, ...reviews]);
      }
      setTimeout(() => {
        setReviewMsg("");
        setShowReviewModal(false);
        setReviewForm({ name: "", location: "", projectType: "Full Home Interior", rating: 5, comment: "" });
      }, 2000);
    } catch (err) {
      alert(err.message || "Failed to submit review.");
    }
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-gray-100 py-12 sm:py-24">
        <div className="absolute w-96 h-96 rounded-full bg-amber-200 blur-[120px] opacity-30 -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 rounded-full bg-orange-100 blur-[120px] opacity-30 bottom-0 right-0"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold inline-flex items-center gap-2">
            <Sparkles size={16} /> VELORA EXPERIENCE & RESOURCES
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mt-6 tracking-tight">
            More About <span className="text-amber-600">Velora Interiors</span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
            From interactive space planning and verified client reviews to turnkey process walkthroughs and quality guarantees, discover why Velora is India's premier choice for luxury home interiors.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <a
              href="#planner"
              className="px-6 py-3 rounded-full bg-amber-600 text-white font-bold hover:bg-amber-700 transition flex items-center gap-2 shadow-lg shadow-amber-600/30 text-sm"
            >
              <Calculator size={18} /> Space & Scope Planner
            </a>
            <a
              href="#reviews"
              className="px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-800 font-bold hover:bg-amber-50 transition flex items-center gap-2 text-sm"
            >
              <Star size={18} className="text-amber-500 fill-amber-500" /> Client Reviews
            </a>
          </div>
        </div>
      </section>

      {/* SPACE & SCOPE PLANNER SECTION */}
      <section id="planner" className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calculator size={16} /> Interior Scope Estimator
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-3">
              Furniture & Interior <span className="text-amber-600">Scope Planner</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              Customize your space size, material quality tier, and furniture requirements to generate a tailored design consultation plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-8">
              {/* 1. Home Type */}
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-3 flex items-center gap-2">
                  <Building size={18} className="text-amber-600" /> Select Space / Home Configuration
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa", "Kitchen Only"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setHomeType(type)}
                      className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition border ${
                        homeType === type
                          ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/30"
                          : "bg-gray-50 text-gray-700 hover:bg-amber-50 border-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sqft Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sliders size={18} className="text-amber-600" /> Carpet Area (Sq. Ft)
                  </label>
                  <span className="text-lg font-black text-amber-700 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
                    {sqft} sq. ft.
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3500"
                  step="50"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>400 sq.ft</span>
                  <span>1500 sq.ft</span>
                  <span>3500 sq.ft</span>
                </div>
              </div>

              {/* 3. Package Tier */}
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-3">Select Material & Quality Grade</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { title: "Essential", grade: "Standard Quality", desc: "Commercial Plywood & High Gloss Laminate" },
                    { title: "Premium", grade: "High Durability", desc: "BWP Marine Ply & Acrylic Finish" },
                    { title: "Luxury", grade: "Bespoke Grade", desc: "Veneer, Italian Marble & PVD Brass" },
                  ].map((tier) => (
                    <button
                      key={tier.title}
                      onClick={() => setPackageTier(tier.title)}
                      className={`p-4 rounded-2xl text-left border transition ${
                        packageTier === tier.title
                          ? "bg-amber-50/80 border-amber-600 ring-2 ring-amber-600/30"
                          : "bg-white border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <span className="font-extrabold block text-gray-900 text-base">{tier.title}</span>
                      <span className="text-xs font-semibold text-amber-700 block mt-1">{tier.grade}</span>
                      <span className="text-xs text-gray-500 block mt-2">{tier.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Furniture & Interior Addons */}
              <div>
                <label className="text-sm font-bold text-gray-900 block mb-3">Include Specific Furniture & Add-ons</label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {furnitureAddonList.map((addon) => {
                    const checked = selectedAddons.includes(addon);
                    return (
                      <button
                        key={addon}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          checked
                            ? "bg-amber-600/10 border-amber-500 text-amber-900"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            checked ? "bg-amber-600 text-white" : "border border-gray-300 bg-white"
                          }`}
                        >
                          {checked && <Check size={14} />}
                        </div>
                        <span>{addon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scope Output Display Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Design Plan Summary</span>
                <h3 className="text-2xl font-bold mt-1">Custom Scope Prepared</h3>

                <div className="mt-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Target Configuration</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
                    {homeType} • {sqft} sq.ft
                  </div>
                  <span className="text-xs text-gray-300 mt-2 block">
                    Includes customized 3D design, factory manufacturing & white-glove installation.
                  </span>
                </div>

                {/* Breakdown Summary */}
                <div className="mt-6 space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>Quality Grade</span>
                    <span className="font-semibold text-white">{packageTier} Quality</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>Selected Add-ons</span>
                    <span className="font-semibold text-amber-300">{selectedAddons.length} Modules</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Estimated Timeline</span>
                    <span className="font-bold text-green-400">{sqft > 1500 ? "45–60 Days" : "30–45 Days"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-amber-600/40"
                >
                  Request Official Design Consultation <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS & TESTIMONIALS SECTION */}
      <section id="reviews" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Star size={14} className="fill-amber-600 text-amber-600" /> VERIFIED CUSTOMER REVIEWS
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-3">
                Loved by <span className="text-amber-600">Homeowners</span>
              </h2>
              <p className="text-gray-600 mt-3 max-w-xl text-sm sm:text-base">
                Read real experiences from homeowners across India who transformed their living spaces with Velora.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 shrink-0">
              <div className="text-center pr-4 border-r border-amber-200">
                <div className="text-3xl font-black text-amber-900">{avgRating}</div>
                <div className="flex text-amber-500 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-500" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 mt-1 block">{reviews.length} Verified Reviews</span>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-amber-600/30"
              >
                <MessageSquarePlus size={16} /> Write a Review
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div
                key={rev._id || idx}
                className="bg-gray-50/80 p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={16} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Verified Home
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-4">
                  <img
                    src={rev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.name)}`}
                    alt={rev.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base leading-tight">{rev.name}</h4>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      {rev.projectType} • {rev.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE VELORA */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">Why Choose Velora?</h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">Excellence in every corner.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: <Award size={40} />, title: "Premium Quality" },
            { icon: <ShieldCheck size={40} />, title: "Warranty Included" },
            { icon: <Clock3 size={40} />, title: "On-Time Delivery" },
            { icon: <Star size={40} />, title: "Luxury Finish" },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-8 rounded-3xl border border-gray-200 hover:border-amber-400 hover:-translate-y-2 transition duration-500 shadow-sm hover:shadow-xl bg-white text-center"
            >
              <div className="text-amber-600 mb-6 group-hover:scale-110 transition flex justify-center">{item.icon}</div>
              <h3 className="font-bold text-xl">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl sm:text-4xl font-bold mb-14">Our 8-Step Turnkey Process</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {process.map((step, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow hover:shadow-xl transition hover:-translate-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-lg">
                  {i + 1}
                </div>
                <h3 className="mt-6 font-bold text-base sm:text-lg">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-14">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left font-bold text-base sm:text-lg text-gray-900"
              >
                {faq.question}
                <ChevronDown className={`transition ${activeFaq === index ? "rotate-180 text-amber-600" : ""}`} />
              </button>

              {activeFaq === index && (
                <div className="px-6 pb-6 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE REQUEST MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            {quoteSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-extrabold text-gray-900">Design Consultation Requested!</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Our lead interior architect will call you shortly with detailed material catalogs and sample designs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">Design Request</span>
                  <h3 className="text-2xl font-extrabold text-gray-900">Request Custom Consultation</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {homeType} ({sqft} sqft) • {packageTier} Grade
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-600 text-white font-bold rounded-full hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Submit & Get Call Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            {reviewMsg ? (
              <div className="text-center py-8">
                <CheckCircle size={56} className="text-amber-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">{reviewMsg}</h3>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">Client Feedback</span>
                  <h3 className="text-2xl font-extrabold text-gray-900">Share Your Velora Experience</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Project Type</label>
                  <input
                    type="text"
                    placeholder="e.g. 3BHK Full Home / Modular Kitchen"
                    value={reviewForm.projectType}
                    onChange={(e) => setReviewForm({ ...reviewForm, projectType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Rating</label>
                  <div className="flex gap-2 text-amber-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        className={star <= reviewForm.rating ? "fill-amber-500" : "text-gray-300"}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Your Feedback & Review</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Tell us about the design quality, project timeline, and finish..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 text-white font-bold rounded-full hover:bg-amber-700 transition"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}