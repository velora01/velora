import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { Loader2, Briefcase, Key, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      toast.success(`Welcome back, ${data?.user?.name || "Admin"}!`);
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.message || "Invalid credentials. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 z-10">
        
        {/* Branding Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200 shadow-2xs">
            <Briefcase size={30} className="text-amber-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-black tracking-widest text-slate-900 uppercase">
            VELORA <span className="text-amber-600 font-light">CRM</span>
          </h2>
          
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Sign in to access secure workspace pipelines & client records
          </p>
        </div>

        {/* Inline Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="font-medium text-xs">{error}</p>
          </div>
        )}

        {/* Form Box */}
        <div className="bg-white border border-amber-100/80 p-8 rounded-3xl shadow-sm relative space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 transition"
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
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-slate-50 text-slate-800 placeholder-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-600 transition cursor-pointer p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Access Workspace</span>
              )}
            </button>

          </form>

        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Velora Luxury ERP Portal.</span>
        </div>

      </div>
    </div>
  );
}
