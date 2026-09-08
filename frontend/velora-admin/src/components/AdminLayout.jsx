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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    { path: "/users", name: "User Management", icon: <ShieldCheck size={17} /> },
    { path: "/inventory", name: "Library", icon: <Package size={17} />, hasSubmenu: true, aliases: ["/factory"] },
    { path: "/settings", name: "Settings", icon: <Settings size={17} />, aliases: ["/logs", "/calendar"] }
  ];

  // Helper to determine active title
  const getCurrentPageTitle = () => {
    if (location.pathname.startsWith("/enquiry") || location.pathname.startsWith("/leads")) {
      return location.search.includes("mode=add") ? "Add Enquiry" : "Enquiry";
    }
    if (location.pathname.startsWith("/boq") || location.pathname === "/estimates") {
      return "BOQ";
    }
    if (location.pathname.startsWith("/library/component") || location.pathname === "/library" || location.pathname === "/inventory") {
      return "Component";
    }
    if (location.pathname.startsWith("/settings")) {
      return "Settings";
    }
    const current = navItems.find(
      (item) => item.path === location.pathname || item.aliases?.includes(location.pathname)
    );
    return current?.name || "Velora";
  };

  const isBOQPage = location.pathname.startsWith("/boq") || location.pathname === "/estimates";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased" onClick={() => isProfileOpen && setIsProfileOpen(false)}>
      {/* Mobile Top Navigation */}
      {!isBOQPage && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40 shadow-xs">
          <span className="font-black text-sm text-blue-600 tracking-wider">VELORA</span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      )}

      {/* Sidebar Panel - Clean Executive Royal Blue & White Theme */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-56 bg-white border-r border-slate-200 flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } h-screen overflow-y-auto select-none shadow-xs`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black shadow-xs">
              <Crown size={15} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-wider">
                VELORA
              </h2>
              <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-widest block">
                Executive CRM
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isLibrary = item.name === "Library";
              const isLibraryActive = location.pathname.startsWith("/library") || location.pathname === "/inventory";

              const isActive =
                (isLibrary && isLibraryActive) ||
                location.pathname === item.path ||
                (item.path === "/enquiry" && location.pathname === "/leads") ||
                (item.path === "/boq" && location.pathname.startsWith("/boq")) ||
                item.aliases?.includes(location.pathname);

              return (
                <div key={item.path}>
                  <Link
                    to={item.path === "/inventory" ? "/library/component" : item.path}
                    onClick={() => {
                      if (!item.hasSubmenu) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive && !isLibrary
                        ? "bg-blue-600 text-white shadow-xs font-bold"
                        : isActive && isLibrary
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive && !isLibrary ? "text-white" : isActive && isLibrary ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${
                          isLibraryActive ? "rotate-90 text-blue-600" : "text-slate-400"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Expandable Submenu for Library */}
                  {isLibrary && isLibraryActive && (
                    <div className="pl-9 pr-2 py-1 space-y-0.5 animate-in slide-in-from-top-1">
                      {[
                        { name: "Space", path: "/library/space" },
                        { name: "Brand", path: "/library/brand" },
                        { name: "Type", path: "/library/type" },
                        { name: "Variant", path: "/library/variant" },
                        { name: "Components", path: "/library/component" },
                        { name: "Accessories", path: "/library/accessories" },
                        { name: "Appliances", path: "/library/appliances" },
                        { name: "Other Services", path: "/library/other-services" },
                        { name: "Import / Export", path: "/library/import-export" }
                      ].map((sub) => {
                        const isSubActive =
                          location.pathname === sub.path ||
                          (sub.path === "/library/component" &&
                            (location.pathname === "/library" ||
                              location.pathname === "/library/component" ||
                              location.pathname === "/library/components"));

                        return (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              isSubActive
                                ? "bg-blue-600 text-white font-bold shadow-2xs"
                                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout & User Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 ${isBOQPage ? "pt-0" : "pt-14 md:pt-0"} overflow-y-auto h-screen flex flex-col`}>
        {/* Top Navbar Header - Hidden on BOQ Page */}
        {!isBOQPage && (
          <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
            {/* Left: Page Title */}
            <div className="flex items-center">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {getCurrentPageTitle()}
              </h1>
            </div>

            {/* Right: Notifications Bell & Real User Profile Header */}
            <div className="flex items-center gap-4 relative">
              {/* Notification Bell with blue dot */}
              <Link
                to="/notifications"
                className="relative p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </Link>

              {/* Real User Profile Avatar & Role Badge Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center gap-2.5 pl-2 py-1 pr-1 border-l border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight flex items-center justify-end gap-1">
                      <span>{adminUser?.name || "Admin"}</span>
                      {adminUser?.role === "Super Admin" && <Crown size={12} className="text-blue-600" />}
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {adminUser?.role || "Super Admin"}
                    </span>
                  </div>

                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs select-none"
                  >
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 space-y-2 text-xs"
                  >
                    <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white">
                      <div className="font-black text-sm text-blue-400">{adminUser?.name || "Admin User"}</div>
                      <div className="text-[11px] text-slate-300 truncate">{adminUser?.email || "admin@velora.family"}</div>
                      <div className="mt-1.5 inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        {adminUser?.role || "Super Admin"}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition"
                      >
                        <Settings size={15} />
                        <span>Settings & QR Hub</span>
                      </Link>

                      <Link
                        to="/users"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition"
                      >
                        <ShieldCheck size={15} />
                        <span>User Management & Staff</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Page Body */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">{children}</div>
      </main>
    </div>
  );
}


