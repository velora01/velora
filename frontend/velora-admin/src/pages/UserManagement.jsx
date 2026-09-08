import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Crown,
  Sparkles,
  Users,
  KeyRound
} from "lucide-react";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import { getCurrentUser } from "../services/authService";

const ROLES_LIST = [
  "Admin",
  "Designer",
  "Sales",
  "Project Manager",
  "Factory Manager",
  "Installation Team",
  "Accountant",
  "Super Admin"
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const loggedInUser = getCurrentUser() || { name: "Admin", role: "Super Admin" };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Sales",
    isActive: true
  });

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await erpApi.getUsers();
      if (res?.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load staff users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateDrawer = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "Sales",
      isActive: true
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // leave blank unless updating
      role: user.role || "Sales",
      isActive: user.isActive !== false
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedUserId) {
        await erpApi.updateUser(selectedUserId, formData);
        showToast(`User account '${formData.name}' updated successfully!`, "success");
      } else {
        await erpApi.createUser(formData);
        showToast(`New staff account created for '${formData.name}'!`, "success");
      }
      setIsDrawerOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save user account", "error");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await erpApi.updateUserRole(userId, { role: newRole });
      showToast("User role updated successfully", "success");
      loadUsers();
    } catch (err) {
      showToast("Failed to update role", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await erpApi.deleteUser(userId);
      showToast("User account permanently deleted", "success");
      setDeleteConfirmId(null);
      loadUsers();
    } catch (err) {
      showToast("Failed to delete user", "error");
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.role?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "Super Admin":
      case "Admin":
        return "bg-amber-100 text-amber-900 border-amber-300 font-black";
      case "Designer":
        return "bg-purple-50 text-purple-800 border-purple-200 font-bold";
      case "Sales":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
      case "Project Manager":
        return "bg-blue-50 text-blue-800 border-blue-200 font-bold";
      case "Factory Manager":
        return "bg-orange-50 text-orange-800 border-orange-200 font-bold";
      case "Accountant":
        return "bg-stone-100 text-stone-800 border-stone-300 font-bold";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200 font-medium";
    }
  };

  const columns = [
    {
      header: "Staff Member",
      key: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9E7B1D] text-slate-950 font-black text-sm flex items-center justify-center shadow-sm">
            {row.name ? row.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <span>{row.name}</span>
              {row.role === "Super Admin" && <Crown size={13} className="text-[#9E7B1D]" />}
            </div>
            <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
              <Mail size={11} className="text-stone-400" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Contact Phone",
      render: (row) => (
        <div className="text-xs text-stone-700 font-medium flex items-center gap-1.5">
          <Phone size={12} className="text-stone-400" />
          <span>{row.phone || "—"}</span>
        </div>
      )
    },
    {
      header: "Role & Access",
      render: (row) => (
        <select
          value={row.role || "Sales"}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none cursor-pointer transition-all ${getRoleBadgeStyle(
            row.role
          )}`}
        >
          {ROLES_LIST.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )
    },
    {
      header: "Account Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            row.isActive !== false
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-stone-100 text-stone-500 border-stone-200"
          }`}
        >
          {row.isActive !== false ? <CheckCircle2 size={12} /> : <UserX size={12} />}
          <span>{row.isActive !== false ? "Active" : "Inactive"}</span>
        </span>
      )
    },
    {
      header: "Joined On",
      render: (row) => (
        <span className="text-xs text-stone-600 font-medium">
          {new Date(row.createdAt || Date.now()).toLocaleDateString("en-IN", {
            month: "short",
            day: "2-digit",
            year: "numeric"
          })}
        </span>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditDrawer(row)}
            title="Edit User"
            className="p-1.5 text-stone-600 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition-all"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteConfirmId(row._id)}
            title="Delete User"
            disabled={row._id === loggedInUser?._id}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  // Stats calculation
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "Admin" || u.role === "Super Admin").length;
  const designerCount = users.filter((u) => u.role === "Designer").length;
  const salesCount = users.filter((u) => u.role === "Sales").length;
  const pmCount = users.filter((u) => u.role === "Project Manager").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-slate-900 border-[#D4AF37]/50 text-amber-300"
              : "bg-red-900 border-red-500/50 text-red-200"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 size={20} className="text-[#D4AF37]" /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={24} />
              <h3 className="text-lg font-black text-stone-900">Delete User Account</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete this user account? This staff member will immediately lose access to the Velora ERP system.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-[#9E7B1D]/30 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9E7B1D] flex items-center justify-center text-slate-950 font-black shadow-inner">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#FAF9F5]">User & Access Management (RBAC)</h1>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Manage all 8 team roles, staff permissions, login credentials, and audit tracking
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateDrawer}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#DFBE5B] hover:to-[#D4AF37] text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={16} />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[
          { label: "Total Team Members", count: totalCount, icon: Users, color: "text-[#9E7B1D]", bg: "bg-amber-50" },
          { label: "Admins / Super Admins", count: adminCount, icon: Crown, color: "text-amber-800", bg: "bg-amber-100/50" },
          { label: "Designers", count: designerCount, icon: Sparkles, color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Sales Executives", count: salesCount, icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Project Managers", count: pmCount, icon: Shield, color: "text-blue-700", bg: "bg-blue-50" }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon size={14} />
                </div>
              </div>
              <div className="text-xl font-black text-stone-900">{stat.count}</div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-stone-400" />
          <span className="text-xs font-bold text-stone-700">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#9E7B1D]"
          >
            <option value="all">All Roles ({totalCount})</option>
            {ROLES_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:border-[#9E7B1D]"
          />
        </div>
      </div>

      {/* Staff Accounts DataTable */}
      <DataTable
        title="Active Staff Directory"
        columns={columns}
        data={filteredUsers}
        search={search}
        setSearch={setSearch}
      />

      {/* Create / Edit User Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isEditMode ? "Edit Staff Account" : "Create New Staff Account"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-bold mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rohan Sharma"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#9E7B1D]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rohan@velora.family"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#9E7B1D]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#9E7B1D]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">
              {isEditMode ? "New Password (Leave blank to keep unchanged)" : "Account Password *"}
            </label>
            <div className="relative">
              <input
                type="password"
                required={!isEditMode}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#9E7B1D]"
              />
              <KeyRound size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Assigned Role & Privilege Tier *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#9E7B1D]"
            >
              {ROLES_LIST.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-stone-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#9E7B1D] rounded"
              />
              <span>Account is Active & Permitted to Login</span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#DFBE5B] hover:to-[#D4AF37] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              {isEditMode ? "Save Changes" : "Create Staff Account"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
