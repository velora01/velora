import { useState } from "react";
import axios from "axios";
import {
  MapPin,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Sparkles,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export default function ConsultationSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    propertyType: "2 BHK",
    city: "",
    name: "",
    mobile: "",
    message: "",
  });

  const propertyTypes = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Villa"];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      setLoading(true);

      const res = await axios.post(`${getBaseUrl()}/consult`, form);

      setSuccess(true);
      setForm({
        propertyType: "2 BHK",
        city: "",
        name: "",
        mobile: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#faf8f4] sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Clean Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          
          {/* Header Layout */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 pb-8 mb-8">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full border border-[#C9A227]/20 bg-[#C9A227]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] text-[#C9A227] mb-3">
                Free Consultation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                Get a luxury home design plan in just a few clicks
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Share your property details and custom preferences, and our design team will guide you with a tailored strategy.
              </p>
            </div>

            <div className="hidden sm:block rounded-xl bg-[#C9A227]/10 p-3 text-[#C9A227]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={20} className="flex-shrink-0 text-green-600" />
              <p className="text-sm font-semibold">Your consultation request has been submitted! We will contact you shortly.</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="flex-shrink-0 text-red-600" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-6">
            
            {/* Property Type Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2.5">
                Property Type
              </label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setForm({
                        ...form,
                        propertyType: item,
                      })
                    }
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition duration-200 ${
                      form.propertyType === item
                        ? "border-[#C9A227] bg-[#C9A227] text-white shadow-sm shadow-[#C9A227]/25"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#C9A227] hover:text-[#C9A227]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* City Input */}
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3.5 text-[#C9A227]"
                  size={16}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-gray-900 placeholder-gray-400 font-medium"
                  required
                />
              </div>

              {/* Name Input */}
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-[#C9A227]"
                  size={16}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-gray-900 placeholder-gray-400 font-medium"
                  required
                />
              </div>

              {/* Mobile Input */}
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-[#C9A227]"
                  size={16}
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-gray-900 placeholder-gray-400 font-medium"
                  required
                />
              </div>

              {/* Message Input */}
              <div className="relative">
                <MessageSquare
                  className="absolute left-3 top-3.5 text-[#C9A227]"
                  size={16}
                />
                <textarea
                  rows={3}
                  name="message"
                  placeholder="Tell us about your project (optional)..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-gray-900 placeholder-gray-400 font-medium leading-relaxed resize-y"
                />
              </div>

            </div>

            {/* Checklist */}
            <div className="grid gap-3 pt-2 text-xs text-gray-500 sm:grid-cols-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="text-[#C9A227]" size={15} />
                <span>Free Expert Advice</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="text-[#C9A227]" size={15} />
                <span>No Hidden Charges</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="text-[#C9A227]" size={15} />
                <span>Premium Designers</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="text-[#C9A227]" size={15} />
                <span>Quick Response</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <button
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#C9A227] hover:bg-[#B8931F] text-sm font-semibold text-white shadow-sm hover:shadow transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Book Free Consultation</span>
                )}
              </button>

              <a
                href="https://wa.me/7705965556?text=Hello%20Velora%2C%20I%20would%20like%20more%20details%20about%20interior%20designs."
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227] group"
              >
                <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-[#C9A227] transition" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <p className="text-center text-[11px] text-gray-400 font-medium">
              🔒 Your information is secure and never shared.
            </p>

          </form>
        </div>
      </div>
    </section>
  );
}