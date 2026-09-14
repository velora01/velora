import { useState, useEffect, useRef } from "react";
import { getCurrentUser, updateAdminProfile } from "../services/authService";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Camera,
  Trash2,
  Save,
  Loader2,
  Crown,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminProfile() {
  const fileInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(
    getCurrentUser() || {
      name: "Admin",
      email: "admin@veloradesign.com",
      role: "Super Admin",
      phone: "+91 98765 43210",
      avatar: ""
    }
  );

  const [name, setName] = useState(currentUser.name || "");
  const [email] = useState(currentUser.email || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [role] = useState(currentUser.role || "Super Admin");
  const [avatar, setAvatar] = useState(currentUser.avatar || "");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, []);

  // Handle Photo Upload
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB limit. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAvatar(dataUrl);
      toast.info("Photo preview loaded. Click 'Save Changes' to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Profile photo removed. Click 'Save Changes' to apply.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar || ""
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await updateAdminProfile(payload);
      toast.success("Profile updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update profile. Saved locally.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 p-1 shadow-lg ring-4 ring-amber-400/20 flex items-center justify-center text-white text-3xl font-black">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover rounded-[22px]"
                />
              ) : (
                <span>{name ? name.charAt(0).toUpperCase() : "A"}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl shadow-lg border-2 border-stone-900 transition cursor-pointer hover:scale-105"
              title="Upload Profile Picture"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* User Info Header */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                {name || "Administrator"}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <Crown size={12} />
                {role}
              </span>
            </div>

            <p className="text-xs text-stone-300 font-medium">
              Manage your administrator credentials, contact details, and platform security.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-amber-400" />
                {email}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-400" />
                Verified Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Details Box */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <User size={18} className="text-amber-600" />
                Administrator Profile Details
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Personal credentials visible across team communications and system logs.
              </p>
            </div>

            {avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-stone-50 text-stone-900 font-semibold transition"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                Work Email (Login ID)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-100 text-stone-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-stone-50 text-stone-900 font-semibold transition"
                />
              </div>
            </div>

            {/* Role Badge */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                Assigned System Role
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  disabled
                  value={role}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-100 text-stone-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Security Password Section */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-stone-100">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Key size={18} className="text-amber-600" />
              Security & Password Update
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Leave password fields empty if you do not wish to change your current password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* New Password */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                New Security Password
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-stone-50 text-stone-900 font-semibold transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 transition cursor-pointer p-0.5"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-xs bg-stone-50 text-stone-900 font-semibold transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 transition cursor-pointer p-0.5"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
