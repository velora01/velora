import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Globe,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Factory,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  ShieldCheck,
  History,
  Menu,
  X,
  LogOut,
  User,
  Search,
  CheckCircle2,
  Crown
} from "lucide-react";
import { getCurrentUser, logout } from "../services/authService";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser] = useState(getCurrentUser() || { name: "Velora Admin", email: "admin@veloradesign.com", role: "Super Admin" });
  const [globalSearch, setGlobalSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuSections = [
    {
      title: "Core CRM",
      items: [
        { path: "/", name: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { path: "/leads", name: "Lead Pipeline", icon: <Users size={16} /> },
        { path: "/website-leads", name: "Website Leads", icon: <Globe size={16} /> },
        { path: "/clients", name: "Clients Directory", icon: <Briefcase size={16} /> }
      ]
    },
    {
      title: "Projects & Estimates",
      items: [
        { path: "/projects", name: "Projects Master", icon: <Briefcase size={16} /> },
        { path: "/boq", name: "BOQ Builder", icon: <FileSpreadsheet size={16} /> },
        { path: "/invoices", name: "Invoices & Quotes", icon: <FileText size={16} /> },
        { path: "/tasks", name: "Tasks Kanban", icon: <CheckCircle2 size={16} /> }
      ]
    },
    {
      title: "Production & Operations",
      items: [
        { path: "/factory", name: "Factory Queue", icon: <Factory size={16} /> },
        { path: "/inventory", name: "Materials Stock", icon: <Package size={16} /> },
        { path: "/installation", name: "Installation Team", icon: <Truck size={16} /> },
        { path: "/site-visits", name: "Site Visits GPS", icon: <MapPin size={16} /> }
      ]
    },
    {
      title: "Finance & Admin",
      items: [
        { path: "/payments", name: "Payments Ledger", icon: <CreditCard size={16} /> },
        { path: "/calendar", name: "Unified Calendar", icon: <Calendar size={16} /> },
        { path: "/reports", name: "Reports Hub", icon: <BarChart3 size={16} /> },
        { path: "/users", name: "Users & RBAC", icon: <ShieldCheck size={16} /> },
        { path: "/logs", name: "Activity Logs", icon: <History size={16} /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-stone-800 flex font-sans antialiased">
      {/* Mobile Top Header - Professional Gold & Cream */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#FFFDF7] border-b border-[#E8DCC4] px-4 flex items-center justify-between z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E2D] flex items-center justify-center text-stone-950 font-black shadow-sm">
            V
          </div>
          <span className="font-extrabold text-sm tracking-wider text-[#9E7B1D]">VELORA ERP</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[#9E7B1D]">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Panel - Professional Ivory Cream & Gold */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-64 bg-[#F8F5EE] border-r border-[#E5DFD3] flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } h-screen overflow-y-auto shadow-sm`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#E8DCC4] flex items-center gap-3 bg-[#FFFDF9]">
            <div className="h-10 w-10 bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#9E7B1D] rounded-xl flex items-center justify-center text-stone-950 font-black text-lg shadow-md shadow-amber-900/10">
              V
            </div>
            <div>
              <h2 className="font-black text-sm text-stone-900 tracking-wider flex items-center gap-1">
                VELORA CRM
                <Crown size={12} className="text-[#D4AF37]" />
              </h2>
              <span className="text-[10px] text-[#9E7B1D] font-extrabold uppercase tracking-widest">Luxury ERP Suite</span>
            </div>
          </div>

          {/* Nav Sections */}
          <nav className="p-3 space-y-5">
            {menuSections.map((section, idx) => (
              <div key={idx}>
                <h4 className="px-3 text-[10px] font-extrabold text-[#9E7B1D]/80 uppercase tracking-widest mb-1.5">
                  {section.title}
                </h4>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 shadow-sm font-extrabold"
                            : "text-stone-700 hover:bg-[#FFFDF9] hover:text-[#9E7B1D]"
                        }`}
                      >
                        <span className={isActive ? "text-stone-950" : "text-[#9E7B1D]"}>{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-[#E8DCC4] space-y-3 bg-[#FFFDF9]">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#FAF6ED] rounded-xl border border-[#E8DCC4]">
            <div className="h-8 w-8 bg-[#E8DCC4] rounded-full flex items-center justify-center text-[#9E7B1D] font-black">
              <User size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-stone-900 truncate">{adminUser?.name || "Admin User"}</p>
              <span className="inline-block text-[9px] font-black text-[#9E7B1D] uppercase tracking-wider bg-[#D4AF37]/15 px-1.5 py-0.2 rounded border border-[#E8DCC4]">
                {adminUser?.role || "Super Admin"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Area */}
      <main className="flex-1 min-w-0 pt-16 md:pt-0 overflow-y-auto h-screen">
        {/* Top Navbar Header - Professional Golden Cream Luxury Bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-[#FFFDF7] border-b border-[#E8DCC4] sticky top-0 z-30 shadow-xs">
          <div className="relative w-96">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E7B1D]" />
            <input
              type="text"
              placeholder="Global Search (Clients, Projects, Invoices)..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-[#FAF7F0] border border-[#E8DCC4] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative p-2 text-[#9E7B1D] transition bg-[#FAF7F0] border border-[#E8DCC4] rounded-xl hover:bg-white"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
            </Link>

            <div className="h-4 w-px bg-[#E8DCC4]" />

            <div className="text-right">
              <p className="text-xs font-black text-stone-900">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
              <p className="text-[10px] text-[#9E7B1D] font-extrabold flex items-center justify-end gap-1">
                <span>Pune Showroom HQ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              </p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
