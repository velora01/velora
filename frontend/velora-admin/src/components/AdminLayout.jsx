import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  FileSpreadsheet,
  Users,
  Briefcase,
  Wrench,
  FileText,
  BarChart3,
  CheckCircle,
  ShieldCheck,
  Package,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Crown
} from "lucide-react";
import { getCurrentUser, logout } from "../services/authService";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser] = useState(
    getCurrentUser() || { name: "Admin", email: "admin@veloradesign.com", role: "Super Admin" }
  );
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Menu items faithfully reflecting the user reference screenshot
  const navItems = [
    { path: "/", name: "Dashboard", icon: <LayoutDashboard size={17} /> },
    {
      path: "/enquiry",
      name: "Enquiry",
      icon: <Mail size={17} />,
      aliases: ["/leads", "/enquiry/add"]
    },
    { path: "/boq", name: "BOQ", icon: <FileSpreadsheet size={17} />, aliases: ["/estimates"] },
    { path: "/clients", name: "Client", icon: <Users size={17} /> },
    { path: "/projects", name: "Project", icon: <Briefcase size={17} /> },
    { path: "/installation", name: "Service", icon: <Wrench size={17} />, aliases: ["/site-visits"] },
    { path: "/invoices", name: "Invoice", icon: <FileText size={17} />, aliases: ["/payments"] },
    { path: "/reports", name: "Reports", icon: <BarChart3 size={17} /> },
    { path: "/tasks", name: "Approvals", icon: <CheckCircle size={17} /> },
    { path: "/users", name: "User Management", icon: <ShieldCheck size={17} />, hasSubmenu: true },
    { path: "/inventory", name: "Library", icon: <Package size={17} />, hasSubmenu: true, aliases: ["/factory"] },
    { path: "/logs", name: "Settings", icon: <Settings size={17} />, hasSubmenu: true, aliases: ["/calendar"] }
  ];

  // Helper to determine active title
  const getCurrentPageTitle = () => {
    if (location.pathname.startsWith("/enquiry") || location.pathname.startsWith("/leads")) {
      return location.search.includes("mode=add") ? "Add Enquiry" : "Enquiry";
    }
    const current = navItems.find(
      (item) => item.path === location.pathname || item.aliases?.includes(location.pathname)
    );
    return current?.name || "Velora";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex font-sans antialiased">
      {/* Mobile Top Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E8DFCE] px-4 flex items-center justify-between z-40 shadow-xs">
        <span className="font-black text-sm text-[#9E7B1D] tracking-wider">VELORA</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-stone-600 hover:bg-amber-50 rounded-lg transition"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Panel - Clean Luxury Gold & White Theme */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-56 bg-white border-r border-[#EAE3D2] flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } h-screen overflow-y-auto select-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#EAE3D2] flex items-center gap-2.5 bg-gradient-to-b from-[#FFFDF9] to-white">
            <div className="h-8 w-8 bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#9E7B1D] rounded-xl flex items-center justify-center text-stone-950 font-black shadow-xs">
              <Crown size={15} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-stone-900 tracking-wider">
                VELORA
              </h2>
              <span className="text-[9px] text-[#9E7B1D] font-extrabold uppercase tracking-widest block">
                Luxury Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/enquiry" && location.pathname === "/leads") ||
                item.aliases?.includes(location.pathname);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs font-extrabold"
                      : "text-stone-700 hover:bg-amber-50/70 hover:text-[#9E7B1D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-stone-950" : "text-[#9E7B1D]"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.hasSubmenu && (
                    <ChevronRight
                      size={14}
                      className={isActive ? "text-stone-950/80" : "text-stone-400"}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout & User Profile */}
        <div className="p-3 border-t border-[#EAE3D2] bg-[#FFFDF9] space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-y-auto h-screen flex flex-col">
        {/* Top Navbar Header - Clean without CRM word or V logo */}
        <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white border-b border-[#EAE3D2] sticky top-0 z-30 shadow-2xs">
          {/* Left: Page Title only (no V logo, no CRM word) */}
          <div className="flex items-center">
            <h1 className="text-base font-bold text-stone-900 tracking-tight">
              {getCurrentPageTitle()}
            </h1>
          </div>

          {/* Right: Notifications Bell & Golden User Avatar Badge */}
          <div className="flex items-center gap-4">
            {/* Notification Bell with golden dot */}
            <Link
              to="/notifications"
              className="relative p-1.5 text-stone-600 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-white" />
            </Link>

            {/* Profile Avatar (Golden circle with user initial) */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#EAE3D2]">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#9E7B1D] text-stone-950 font-black text-xs flex items-center justify-center shadow-xs cursor-pointer select-none"
                title={`${adminUser?.name || "Admin"} (${adminUser?.role || "Super Admin"})`}
              >
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "N"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">{children}</div>
      </main>
    </div>
  );
}


