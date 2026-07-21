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
} from "lucide-react";

export default function ConsultationSection() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    propertyType: "2 BHK",
    city: "",
    name: "",
    mobile: "",
    message: "",
  });

  const propertyTypes = [
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "4+ BHK",
    "Villa",
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/api/consult",
        form
      );

      alert(res.data.message);

      setForm({
        propertyType: "2 BHK",
        city: "",
        name: "",
        mobile: "",
        message: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 bg-[radial-gradient(circle_at_top_left,#fffdf8,#fff4db_60%,#fff8ea)] sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[30px] border border-amber-100 bg-white/95 shadow-[0_25px_70px_-25px_rgba(15,23,42,0.3)] backdrop-blur">
          <div className="p-4 sm:p-5 lg:p-6">
            <form
              onSubmit={submitHandler}
              className="rounded-3xl border border-amber-100 bg-linear-to-br from-[#fffdf8] to-[#fff8ed] p-5 shadow-inner sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                  <p className="mb-2 inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[3px] text-amber-600">
                    Free Consultation
                  </p>
                  <h2 className="text-2xl font-black leading-tight text-gray-900 sm:text-3xl lg:text-[2rem]">
                    Get a luxury home design plan in just a few clicks
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Share your idea and we’ll guide you with a tailored design strategy.
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-600">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-gray-700">
                  Property Type
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
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
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        form.propertyType === item
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-amber-400"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-amber-400"
                    required
                  />
                </div>

                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-amber-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={form.mobile}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-amber-400"
                    required
                  />
                </div>

                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-3.5 text-amber-500"
                    size={18}
                  />
                  <textarea
                    rows={3}
                    name="message"
                    placeholder="Tell us about your project..."
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Free Expert Advice
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  No Hidden Charges
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Premium Designers
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Quick Response
                </div>
              </div>

              <button
                disabled={loading}
                className="mt-5 h-12 w-full rounded-xl bg-linear-to-r from-amber-500 to-yellow-400 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01]"
              >
                {loading ? "Booking..." : "Book Free Consultation"}
              </button>

              <a
                href="https://wa.me/7705965556?text=Hello%20Velora%2C%20I%20would%20like%20more%20details%20about%20interior%20designs."
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>

              <p className="mt-3 text-center text-xs text-gray-500">
                🔒 Your information is secure and never shared.
              </p>
            </form>
          </div>
        </div>
      </div>

    </section>
  );
}