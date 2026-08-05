import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerAdmin } from "../services/authService";
import { Loader2, Briefcase, Key, Mail, User, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error("Full name is required.");
        await registerAdmin(name.trim(), email.trim(), password);
        setSuccess("Admin account registered successfully! You can now log in.");
        setIsRegistering(false);
        setPassword("");
      } else {
        await login(email.trim(), password);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 z-10">
        
        {/* Branding Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#FFFBF0] rounded-full flex items-center justify-center border border-[#E8D49E] shadow-sm">
            <Briefcase size={32} className="text-[#9E7B1D]" />
          </div>
          
          <h2 className="mt-6 text-3xl font-black tracking-widest text-slate-900 uppercase">
            VELORA <span className="text-[#9E7B1D] font-light">CRM</span>
          </h2>
          
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {isRegistering 
              ? "Provision a new administrator account for system operations" 
              : "Sign in to access secure workspace pipelines & client records"}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="font-medium text-xs">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm">
            <CheckCircle size={18} className="flex-shrink-0" />
            <p className="font-medium text-xs">{success}</p>
          </div>
        )}

        {/* Form Box */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm relative space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isRegistering && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#C5A059] text-xs bg-slate-50 text-slate-800 placeholder-slate-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@velora.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#C5A059] text-xs bg-slate-50 text-slate-800 placeholder-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Security Password
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#C5A059] text-xs bg-slate-50 text-slate-800 placeholder-slate-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isRegistering ? "Register Account" : "Access Workspace"}</span>
              )}
            </button>

          </form>

          {/* Toggle Register/Login Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setSuccess("");
              }}
              className="text-xs text-[#9E7B1D] hover:underline font-bold tracking-wider cursor-pointer"
            >
              {isRegistering 
                ? "Already have an account? Sign In" 
                : "New staff? Register Administrator Account"}
            </button>
          </div>

        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Velora Luxury ERP Portal.</span>
        </div>

      </div>
    </div>
  );
}
