import { useState, useEffect } from "react";
import {
  Users,
  Phone,
  Mail,
  Layers,
  Activity,
  Calendar,
  MapPin,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  Loader2,
  Briefcase,
  Globe,
  DollarSign,
  ChevronRight,
  X,
  FileText
} from "lucide-react";
import {
  fetchCrmLeads,
  fetchCrmStats,
  createCrmLead,
  updateCrmLead,
  updateCrmStatus,
  deleteCrmLead,
  fetchPendingSubmissions
} from "../services/crmService";

const CATEGORIES = [
  "Modular Kitchen",
  "Wardrobes",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Dining Room",
  "Commercial Office",
  "Full Home Interior",
  "Other"
];

const STATUSES = [
  "Inquiry",
  "Consultation",
  "Proposal",
  "Booked",
  "Designing",
  "Production",
  "Installation",
  "Completed",
  "Cancelled"
];

// Helper for status badge styling
const getStatusStyles = (status) => {
  switch (status) {
    case "Inquiry":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Consultation":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Proposal":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Booked":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Designing":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "Production":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Installation":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "Cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function CrmDashboard() {
  // State
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingSubs, setPendingSubs] = useState({ consults: [], contacts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters state
  const [activeTab, setActiveTab] = useState("active"); // active, all, pending
  const [subTab, setSubTab] = useState("consults"); // consults, contacts (for pending tab)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectCategory: "Full Home Interior",
    status: "Inquiry",
    propertyAddress: "",
    estimatedBudget: "Not Specified",
    notes: "",
    source: "Manual Entry",
    consultRef: "",
    contactRef: ""
  });

  const [statusUpdate, setStatusUpdate] = useState({
    status: "Inquiry",
    comment: ""
  });

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState({});

  // Loading indicator for buttons
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    loadDashboardData();
  }, [searchTerm, selectedCategory, selectedStatus, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get stats
      const statsData = await fetchCrmStats();
      setStats(statsData);

      // Get pending submissions
      const submissions = await fetchPendingSubmissions();
      setPendingSubs(submissions);

      // Get filtered CRM leads
      const filterParams = {
        category: selectedCategory,
        search: searchTerm,
      };

      if (activeTab === "all") {
        if (selectedStatus) {
          filterParams.status = selectedStatus;
        }
      } else if (activeTab === "active") {
        // Handled on client-side below, but we pull all leads first
      }

      const leadsData = await fetchCrmLeads(filterParams);
      
      // Filter active vs all on client-side for smoother UI
      if (activeTab === "active") {
        setLeads(leadsData.filter(l => l.status !== "Completed" && l.status !== "Cancelled"));
      } else {
        setLeads(leadsData);
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load CRM data. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  // Create lead submit
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.clientName || !newLeadForm.clientPhone) {
      showNotification("Client Name and Phone are required", false);
      return;
    }

    setSubmitting(true);
    try {
      await createCrmLead(newLeadForm);
      showNotification("CRM Lead created successfully!");
      setShowAddModal(false);
      
      // Reset form
      setNewLeadForm({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        projectCategory: "Full Home Interior",
        status: "Inquiry",
        propertyAddress: "",
        estimatedBudget: "Not Specified",
        notes: "",
        source: "Manual Entry",
        consultRef: "",
        contactRef: ""
      });

      loadDashboardData();
    } catch (err) {
      showNotification(err.message || "Failed to create lead", false);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Promote Modal
  const handlePromoteClick = (item, type) => {
    setNewLeadForm({
      clientName: item.name || item.fullName || "",
      clientEmail: item.email || "",
      clientPhone: item.mobile || item.phone || "+91 ",
      projectCategory: type === "consult" ? "Full Home Interior" : "Living Room",
      status: "Inquiry",
      propertyAddress: item.city || "",
      estimatedBudget: "Not Specified",
      notes: `Promoted from website submission: "${item.message || ""}"`,
      source: type === "consult" ? "Website Consultation" : "Website Contact",
      consultRef: type === "consult" ? item._id : "",
      contactRef: type === "contact" ? item._id : ""
    });
    setShowAddModal(true);
  };

  // Open details modal
  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setStatusUpdate({
      status: lead.status,
      comment: ""
    });
    setEditLeadForm({ ...lead });
    setIsEditingDetails(false);
    setShowDetailsModal(true);
  };

  // Update Status Submit
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSubmitting(true);
    try {
      const updated = await updateCrmStatus(selectedLead._id, statusUpdate.status, statusUpdate.comment);
      setSelectedLead(updated);
      setStatusUpdate(prev => ({ ...prev, comment: "" }));
      showNotification("Status updated successfully!");
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || "Failed to update status", false);
    } finally {
      setSubmitting(false);
    }
  };

  // Save general updates
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editLeadForm.clientName || !editLeadForm.clientPhone) {
      showNotification("Name and Phone are required", false);
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateCrmLead(selectedLead._id, editLeadForm);
      setSelectedLead(updated);
      setIsEditingDetails(false);
      showNotification("Lead details updated successfully!");
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || "Failed to save details", false);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;

    try {
      await deleteCrmLead(id);
      showNotification("Lead deleted successfully!");
      setShowDetailsModal(false);
      setSelectedLead(null);
      loadDashboardData();
    } catch (err) {
      showNotification(err.message || "Failed to delete lead", false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] py-8 px-4 sm:px-6 lg:px-8 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-2">
              <Briefcase className="text-[#C9A227]" /> VELORA <span className="text-[#C9A227] font-light">CRM</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage luxury interior designs, project lifecycles, fabrication status, and client relationships.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B8931F] text-white font-bold py-2.5 px-5 rounded-full shadow-sm hover:shadow transition duration-200 text-sm uppercase tracking-wide cursor-pointer"
          >
            <Plus size={16} /> Book New Project
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <p className="font-semibold text-sm">{successMsg}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Bookings</span>
                <span className="text-3xl font-black text-gray-900 block mt-1">{stats.totalLeads}</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-[#C9A227]">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Active execution</span>
                <span className="text-3xl font-black text-gray-900 block mt-1">{stats.activeLeads}</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Activity size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">In Factory Production</span>
                <span className="text-3xl font-black text-gray-900 block mt-1">{stats.statusCounts.Production || 0}</span>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                <Layers size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Delivered / Handover</span>
                <span className="text-3xl font-black text-green-700 block mt-1">{stats.completedLeads}</span>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 font-bold text-sm uppercase tracking-wider border-b-2 transition ${
              activeTab === "active"
                ? "border-[#C9A227] text-[#C9A227]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Active Projects ({stats ? stats.activeLeads : 0})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 font-bold text-sm uppercase tracking-wider border-b-2 transition ${
              activeTab === "all"
                ? "border-[#C9A227] text-[#C9A227]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            All Bookings ({stats ? stats.totalLeads : 0})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 font-bold text-sm uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "border-[#C9A227] text-[#C9A227]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Website Submissions
            <span className="bg-red-500 text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold">
              {pendingSubs.consults.length + pendingSubs.contacts.length}
            </span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#C9A227]" />
            <span className="text-gray-500 font-medium text-sm">Loading CRM records...</span>
          </div>
        ) : activeTab === "pending" ? (
          /* PENDING SUBMISSIONS VIEW */
          <div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSubTab("consults")}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition border ${
                  subTab === "consults"
                    ? "bg-[#C9A227] text-white border-[#C9A227] shadow-sm"
                    : "bg-white text-gray-600 hover:bg-amber-50 border-gray-200"
                }`}
              >
                Consultation Requests ({pendingSubs.consults.length})
              </button>
              <button
                onClick={() => setSubTab("contacts")}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition border ${
                  subTab === "contacts"
                    ? "bg-[#C9A227] text-white border-[#C9A227] shadow-sm"
                    : "bg-white text-gray-600 hover:bg-amber-50 border-gray-200"
                }`}
              >
                General Contact Forms ({pendingSubs.contacts.length})
              </button>
            </div>

            {subTab === "consults" ? (
              pendingSubs.consults.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
                  No new consultation requests pending conversion.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {pendingSubs.consults.map((c) => (
                    <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-300 transition duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-extrabold text-gray-900 text-lg">{c.name}</h3>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800">
                            {c.propertyType}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2"><Phone size={14} /> {c.mobile}</p>
                          <p className="flex items-center gap-2"><MapPin size={14} /> {c.city}</p>
                          {c.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-xs italic border-l-2 border-[#C9A227]">
                              "{c.message}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[11px] text-gray-400"><Clock size={12} className="inline mr-1" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handlePromoteClick(c, "consult")}
                          className="text-xs font-bold text-[#C9A227] hover:text-[#B8931F] flex items-center gap-1 uppercase tracking-wider"
                        >
                          Promote to Lead <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              pendingSubs.contacts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
                  No new contact submissions pending conversion.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {pendingSubs.contacts.map((c) => (
                    <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-300 transition duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-extrabold text-gray-900 text-lg">{c.fullName}</h3>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                            {c.projectType}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2"><Mail size={14} /> {c.email}</p>
                          {c.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-xs italic border-l-2 border-[#C9A227]">
                              "{c.message}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[11px] text-gray-400"><Clock size={12} className="inline mr-1" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => handlePromoteClick(c, "contact")}
                          className="text-xs font-bold text-[#C9A227] hover:text-[#B8931F] flex items-center gap-1 uppercase tracking-wider"
                        >
                          Promote to Lead <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          /* LEADS ACTIVE / ALL LIST VIEW */
          <div>
            
            {/* Filters Row */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by client name, phone, email, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] bg-[#faf8f4] text-gray-800"
                />
              </div>

              {/* Select Category */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Filter size={14} /> Filter:
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] bg-white text-gray-800 font-medium"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {activeTab === "all" && (
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] bg-white text-gray-800 font-medium"
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map((stat) => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Leads Card Grid */}
            {leads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
                No matching leads found.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => handleViewLead(lead)}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition duration-300 cursor-pointer flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                          {lead.projectCategory}
                        </span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>

                      {/* Client Info */}
                      <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-[#C9A227] transition">{lead.clientName}</h3>
                      
                      <div className="space-y-1 mt-3 text-xs text-gray-500">
                        <p className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /> {lead.clientPhone}</p>
                        {lead.clientEmail && <p className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" /> {lead.clientEmail}</p>}
                        {lead.propertyAddress && <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" /> {lead.propertyAddress}</p>}
                      </div>

                      {/* Description / Notes snippet */}
                      {lead.notes && (
                        <p className="text-xs text-gray-500 mt-4 line-clamp-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 italic">
                          "{lead.notes}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Details */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <div>
                        <span className="font-medium text-gray-500">Budget: </span>
                        <span className="font-bold text-amber-800">{lead.estimatedBudget}</span>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-[#C9A227] opacity-0 group-hover:opacity-100 transition duration-300">
                        Open File <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 1. ADD CLIENT / PROMOTIONAL BOOKING MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleCreateLead} className="space-y-6">
              
              <div>
                <span className="text-xs font-bold uppercase text-[#C9A227] tracking-wider block">CRM Lead Booking</span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">Book New Design Project</h3>
                <p className="text-xs text-gray-400 mt-1">Initialize client records, category tags, project budget, and lead sources.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Client Name */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={newLeadForm.clientName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, clientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  />
                </div>

                {/* Client Phone */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newLeadForm.clientPhone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, clientPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  />
                </div>

                {/* Client Email */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={newLeadForm.clientEmail}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, clientEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  />
                </div>

                {/* Project Category */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Project Category *</label>
                  <select
                    value={newLeadForm.projectCategory}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, projectCategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Initial Status *</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  >
                    {STATUSES.map((stat) => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Estimated Budget</label>
                  <select
                    value={newLeadForm.estimatedBudget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedBudget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                  >
                    <option value="Not Specified">Not Specified</option>
                    <option value="Under 5L">Under 5 Lakhs</option>
                    <option value="5-10L">5–10 Lakhs</option>
                    <option value="10-20L">10–20 Lakhs</option>
                    <option value="20L+">20+ Lakhs (Luxury Tier)</option>
                  </select>
                </div>

              </div>

              {/* Property Address */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Site / Property Address</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 301, Tower C, Imperial Heights, Pune"
                  value={newLeadForm.propertyAddress}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, propertyAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white"
                />
              </div>

              {/* Design Notes */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Design Requirements & Notes</label>
                <textarea
                  rows="3"
                  placeholder="Details about styles, modular requests, materials, civil work requirements..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-sm bg-white resize-y"
                />
              </div>

              {/* Form Submitter buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-5 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 bg-[#C9A227] hover:bg-[#B8931F] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Book Project</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. LEAD DETAILED PROFILE & STATUS MANAGEMENT MODAL */}
      {/* ======================================================== */}
      {showDetailsModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Profile Details Panel (8 Columns) */}
              <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-8">
                
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#C9A227] tracking-wider block">Project File</span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{selectedLead.clientName}</h3>
                    
                    {selectedLead.source && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-[#C9A227] px-2 py-0.5 rounded border border-amber-100 mt-1.5">
                        <Globe size={10} /> Source: {selectedLead.source}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails(!isEditingDetails)}
                      className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[#C9A227] transition"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(selectedLead._id)}
                      className="p-2 border border-red-200 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isEditingDetails ? (
                  /* EDIT LEAD FORM */
                  <form onSubmit={handleSaveDetails} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Client Name</label>
                        <input
                          type="text"
                          required
                          value={editLeadForm.clientName || ""}
                          onChange={(e) => setEditLeadForm({ ...editLeadForm, clientName: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Phone</label>
                        <input
                          type="text"
                          required
                          value={editLeadForm.clientPhone || ""}
                          onChange={(e) => setEditLeadForm({ ...editLeadForm, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                        <input
                          type="email"
                          value={editLeadForm.clientEmail || ""}
                          onChange={(e) => setEditLeadForm({ ...editLeadForm, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                        <select
                          value={editLeadForm.projectCategory || ""}
                          onChange={(e) => setEditLeadForm({ ...editLeadForm, projectCategory: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] bg-white"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Estimated Budget</label>
                        <input
                          type="text"
                          value={editLeadForm.estimatedBudget || ""}
                          onChange={(e) => setEditLeadForm({ ...editLeadForm, estimatedBudget: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Property Address</label>
                      <input
                        type="text"
                        value={editLeadForm.propertyAddress || ""}
                        onChange={(e) => setEditLeadForm({ ...editLeadForm, propertyAddress: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Notes & Specs</label>
                      <textarea
                        rows="3"
                        value={editLeadForm.notes || ""}
                        onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] resize-y"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(false)}
                        className="py-1.5 px-4 border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="py-1.5 px-5 bg-[#C9A227] hover:bg-[#B8931F] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-1 transition cursor-pointer"
                      >
                        {submitting && <Loader2 size={12} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STATIC INFO DISPLAY */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Category Type</span>
                        <span className="text-sm font-bold text-gray-800">{selectedLead.projectCategory}</span>
                      </div>
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Target Budget</span>
                        <span className="text-sm font-black text-amber-800">{selectedLead.estimatedBudget}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-1.5">Contact Profile</h4>
                      <p className="flex items-center gap-3 text-sm text-gray-600"><Phone size={15} className="text-[#C9A227]" /> {selectedLead.clientPhone}</p>
                      {selectedLead.clientEmail && <p className="flex items-center gap-3 text-sm text-gray-600"><Mail size={15} className="text-[#C9A227]" /> {selectedLead.clientEmail}</p>}
                      {selectedLead.propertyAddress && <p className="flex items-center gap-3 text-sm text-gray-600"><MapPin size={15} className="text-[#C9A227]" /> {selectedLead.propertyAddress}</p>}
                    </div>

                    {selectedLead.notes && (
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-1.5">Specifications & Notes</h4>
                        <div className="bg-[#faf8f4] p-4 rounded-2xl border border-amber-100/50 text-sm leading-relaxed text-gray-600 italic">
                          "{selectedLead.notes}"
                        </div>
                      </div>
                    )}

                    {/* Referencing Submissions */}
                    {(selectedLead.consultRef || selectedLead.contactRef) && (
                      <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/50 text-xs text-amber-900 flex items-center gap-2">
                        <FileText size={16} />
                        <span>This lead is linked to active web request submission ID: <span className="font-mono">{selectedLead.consultRef?._id || selectedLead.contactRef?._id}</span></span>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Status Update & History Timeline (5 Columns) */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full">
                
                {/* Status Transition Controller */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-[#C9A227]" /> Transition Lifecycle Status
                  </h4>

                  <form onSubmit={handleUpdateStatus} className="space-y-3.5">
                    <div>
                      <select
                        value={statusUpdate.status}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] bg-white text-gray-800 font-bold"
                      >
                        {STATUSES.map((stat) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Add execution comments (e.g. advance paid, modular delivery)..."
                        value={statusUpdate.comment}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#C9A227] bg-white text-gray-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || statusUpdate.status === selectedLead.status}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {submitting && <Loader2 size={12} className="animate-spin" />}
                      Update Phase
                    </button>
                  </form>
                </div>

                {/* Timeline History */}
                <div className="flex-1 overflow-y-auto max-h-[30vh] pr-2">
                  <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" /> Status Audit Logs
                  </h4>

                  {selectedLead.statusHistory && selectedLead.statusHistory.length > 0 ? (
                    <div className="relative border-l border-gray-200 ml-2.5 pl-5 space-y-5 py-1 text-xs">
                      {selectedLead.statusHistory.map((history, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[26.5px] top-1 w-3 h-3 rounded-full border-2 border-white bg-[#C9A227] ring-1 ring-amber-200"></div>
                          
                          <div className="flex justify-between items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{history.status}</span>
                            <span className="text-[10px] text-gray-400">{new Date(history.updatedAt).toLocaleDateString()}</span>
                          </div>
                          
                          {history.comment && (
                            <p className="text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                              "{history.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs italic">No history logged yet.</p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
