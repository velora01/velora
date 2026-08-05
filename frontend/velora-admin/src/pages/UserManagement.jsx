import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import { Shield, Plus } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Sales"
  });

  const loadUsers = () => {
    erpApi.getUsers().then((res) => {
      if (res?.data) setUsers(res.data);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await erpApi.createUser(formData);
    setIsDrawerOpen(false);
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    await erpApi.updateUserRole(userId, { role: newRole });
    loadUsers();
  };

  const rolesList = [
    "Admin",
    "Sales",
    "Designer",
    "Project Manager",
    "Factory Manager",
    "Installation Team",
    "Accountant",
    "Super Admin"
  ];

  const columns = [
    { header: "Name", key: "name", sortable: true },
    { header: "Email", key: "email" },
    {
      header: "Assigned Role",
      render: (row) => (
        <select
          value={row.role || "Sales"}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="bg-slate-50 border border-slate-200 text-[#9E7B1D] font-bold rounded-lg px-2 py-1 text-xs focus:outline-none"
        >
          {rolesList.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )
    },
    {
      header: "Created At",
      render: (row) => new Date(row.createdAt || Date.now()).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield size={22} className="text-[#9E7B1D]" />
            User Management & RBAC Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Manage 8 distinct user roles and module access privileges</p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:opacity-95"
        >
          <Plus size={16} />
          <span>Add System User</span>
        </button>
      </div>

      <DataTable title="All Staff Accounts" columns={columns} data={users} search={search} setSearch={setSearch} />

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Create Staff Account">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Assigned Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-bold rounded-xl"
          >
            Create User
          </button>
        </form>
      </Drawer>
    </div>
  );
}
