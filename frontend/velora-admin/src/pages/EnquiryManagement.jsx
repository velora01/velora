import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  UploadCloud,
  Filter,
  SlidersHorizontal,
  List as ListIcon,
  Columns3,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Edit2,
  Trash2,
  Eye,
  Info,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  User,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertCircle
} from "lucide-react";
import erpApi from "../services/erpService";
import BulkUploadModal from "../components/BulkUploadModal";

export default function EnquiryManagement() {
  // Navigation & View Mode: "list" | "pipeline" | "add" | "edit" | "detail"
  const [viewMode, setViewMode] = useState("list");
  const [wizardStep, setWizardStep] = useState(1);

  // Data & Pagination
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Filters & Customization
  const [filterProjectType, setFilterProjectType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    enquiryDate: true,
    name: true,
    phone: true,
    projectType: true,
    projectLocation: true,
    status: true,
    budget: true,
    handledBy: true
  });

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form State matching Reference Screenshots
  const initialFormData = {
    // Step 1: Contact Information
    salutation: "Mr",
    name: "",
    countryCode: "+91",
    phone: "",
    email: "",
    enquiryDate: new Date().toISOString().split("T")[0],
    address: "",
    occupation: "",
    landlineSTD: "",
    landlineNumber: "",
    companyName: "",

    // Step 1: Alternate Contact Information
    altSalutation: "Mr",
    altName: "",
    altCountryCode: "+91",
    altPhone: "",
    altEmail: "",

    // Step 2: Project Details
    projectType: "Residential",
    projectSubtype: "",
    siteStatus: "Possession Handed Over",
    siteSize: "",
    siteLocation: "",
    siteAddress: "",
    sameAsAddress: false,
    gstNumber: "",
    source: "Website",

    // Step 2: Enquiry Details
    handledBy: "Admin",
    designedBy: "Lead Designer",
    prospectStatus: "Warm",
    budget: "",
    timeline: "",
    expectedOn: "",
    financialStatus: "Self Funded",
    priorityStatus: "Medium",
    remarks: "",
    officeVisited: false,
    siteVisited: false,
    referenceSiteVisited: false,

    // Step 3: Additional Details
    scopeOfWork: ["Modular Kitchen"],
    stylePreference: "Modern",
    estimatedValue: "",
    notes: "",
    status: "Inquiry"
  };

  const [formData, setFormData] = useState(initialFormData);

  // Scope options for Step 3
  const scopeOptions = [
    "Modular Kitchen",
    "Wardrobes & Storage",
    "Living Room TV Unit",
    "False Ceiling & Lighting",
    "Painting & Wall Coverings",
    "Electrical & Plumbing",
    "Flooring & Tiling",
    "Loose Furniture & Decor",
    "Full Home Interior"
  ];

  // Pipeline Stages
  const pipelineStages = [
    { key: "Inquiry", label: "New Inquiry", color: "bg-[#D4AF37]" },
    { key: "Booking", label: "Site Visit / Booking", color: "bg-amber-500" },
    { key: "Design Phase", label: "Design Phase", color: "bg-[#9E7B1D]" },
    { key: "Proposal", label: "Proposal / BOQ Sent", color: "bg-stone-600" },
    { key: "Under Installation", label: "Execution", color: "bg-emerald-600" },
    { key: "Delivered", label: "Delivered / Won", color: "bg-teal-600" },
    { key: "Lost", label: "Lost", color: "bg-rose-500" }
  ];

  // Fetch Enquiries from Backend API
  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus || undefined,
        projectType: filterProjectType || undefined,
        source: filterSource || undefined
      };

      const res = await erpApi.getLeads(params);
      if (res?.success) {
        setEnquiries(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total || 0,
            pages: res.pagination.pages || 1
          }));
        }
      }
    } catch {
      // Fallback mock dataset if backend is unreachable
      const mockData = [
        {
          _id: "mock1",
          enquiryDate: "2026-08-13",
          salutation: "Mr",
          name: "PREM SHUKLA",
          phone: "78000 20496",
          email: "prem.shukla@example.com",
          projectType: "Commercial",
          projectSubtype: "Corporate Office",
          siteLocation: "PHASE 2",
          siteStatus: "Ready to Move",
          budget: "₹45 Lakhs",
          handledBy: "Admin",
          status: "Inquiry",
          prospectStatus: "Hot"
        },
        {
          _id: "mock2",
          enquiryDate: "2026-08-08",
          salutation: "Mr",
          name: "Rajeev Singhal",
          phone: "89482 74553",
          email: "rajeev.s@example.com",
          projectType: "Renovation",
          projectSubtype: "3BHK Flat",
          siteLocation: "RISHITA - SERENITY POCKET C, SECTOR-6, SUSHANT GOLF CITY",
          siteStatus: "Possession Handed Over",
          budget: "₹30 Lakhs",
          handledBy: "Admin",
          status: "Booking",
          prospectStatus: "Warm"
        },
        {
          _id: "mock3",
          enquiryDate: "2026-07-11",
          salutation: "Mr",
          name: "Rasid sir",
          phone: "84128 52592",
          email: "rasid@example.com",
          projectType: "Commercial",
          projectSubtype: "Retail Showroom",
          siteLocation: "Wakad",
          siteStatus: "Bare Shell",
          budget: "₹25 Lakhs",
          handledBy: "Admin",
          status: "Inquiry",
          prospectStatus: "Warm"
        },
        {
          _id: "mock4",
          enquiryDate: "2026-06-21",
          salutation: "Ms",
          name: "Meenakshi Krishnani",
          phone: "91671 35606",
          email: "meenakshi@example.com",
          projectType: "Residential",
          projectSubtype: "4BHK Penthouse",
          siteLocation: "Kalyani Nagar",
          siteStatus: "Ready to Move",
          budget: "₹60 Lakhs",
          handledBy: "Admin",
          status: "Design Phase",
          prospectStatus: "Hot"
        },
        {
          _id: "mock5",
          enquiryDate: "2026-06-18",
          salutation: "Mrs",
          name: "Khushi",
          phone: "73551 23408",
          email: "khushi@example.com",
          projectType: "Residential",
          projectSubtype: "2BHK Apartment",
          siteLocation: "Baner Highway",
          siteStatus: "Under Construction",
          budget: "₹18 Lakhs",
          handledBy: "Admin",
          status: "Inquiry",
          prospectStatus: "Cold"
        },
        {
          _id: "mock6",
          enquiryDate: "2026-05-25",
          salutation: "Mr",
          name: "Akash Jain",
          phone: "89778 99643",
          email: "akash.jain@example.com",
          projectType: "Commercial",
          projectSubtype: "Co-working Space",
          siteLocation: "Viman Nagar",
          siteStatus: "Ready to Move",
          budget: "₹50 Lakhs",
          handledBy: "Admin",
          status: "Proposal",
          prospectStatus: "Warm"
        },
        {
          _id: "mock7",
          enquiryDate: "2026-05-19",
          salutation: "Dr",
          name: "Dr Saurabh",
          phone: "77090 19535",
          email: "saurabh.clinic@example.com",
          projectType: "Commercial",
          projectSubtype: "Dental Clinic",
          siteLocation: "shop no 84, vj happiness street, Hinjewadi phase 2",
          siteStatus: "Bare Shell",
          budget: "₹35 Lakhs",
          handledBy: "Admin",
          status: "Booking",
          prospectStatus: "Hot"
        },
        {
          _id: "mock8",
          enquiryDate: "2026-04-28",
          salutation: "Mr",
          name: "WIPRO LINCRAFT AI PRIVATE LIMITED",
          phone: "96323 00992",
          email: "contact@wiprolincraft.com",
          projectType: "Commercial",
          projectSubtype: "Tech HQ",
          siteLocation: "Sus Pashan Baner",
          siteStatus: "Ready to Move",
          budget: "₹1.2 Crore",
          handledBy: "Admin",
          status: "Under Installation",
          prospectStatus: "Hot"
        }
      ];
      setEnquiries(mockData);
      setPagination((prev) => ({ ...prev, total: mockData.length, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit, filterStatus, filterProjectType, filterSource]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Form field change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "address" && prev.sameAsAddress) {
        updated.siteAddress = value;
      }
      return updated;
    });
  };

  const handleSameAsAddressToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      sameAsAddress: checked,
      siteAddress: checked ? prev.address : prev.siteAddress
    }));
  };

  const handleScopeToggle = (item) => {
    setFormData((prev) => {
      const exists = prev.scopeOfWork.includes(item);
      return {
        ...prev,
        scopeOfWork: exists
          ? prev.scopeOfWork.filter((s) => s !== item)
          : [...prev.scopeOfWork, item]
      };
    });
  };

  // Submit Form (Add / Edit)
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.phone) {
      setErrorMessage("Please enter both Name and Phone number.");
      return;
    }

    try {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const generatedEnquiryNo = formData.enquiryNo || `ENQ-2026-${String(randomNum).padStart(3, "0")}`;
      const payload = { ...formData, enquiryNo: generatedEnquiryNo };

      if (editingId) {
        await erpApi.updateLead(editingId, payload);
        setSuccessToast("Enquiry updated successfully!");
      } else {
        const res = await erpApi.createLead(payload);
        const createdItem = res?.data || { ...payload, _id: `local_${Date.now()}` };
        
        // Sync to localStorage for instant BOQ discovery
        const existingLocal = JSON.parse(localStorage.getItem("velora_custom_enquiries") || "[]");
        localStorage.setItem("velora_custom_enquiries", JSON.stringify([createdItem, ...existingLocal]));
        
        setSuccessToast("New enquiry added successfully!");
      }
      setViewMode("list");
      setEditingId(null);
      setFormData(initialFormData);
      setWizardStep(1);
      fetchEnquiries();
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      // Fallback local persistence if backend is offline
      const generatedEnquiryNo = `ENQ-2026-019`;
      const createdItem = { ...formData, enquiryNo: generatedEnquiryNo, _id: `local_${Date.now()}` };
      const existingLocal = JSON.parse(localStorage.getItem("velora_custom_enquiries") || "[]");
      localStorage.setItem("velora_custom_enquiries", JSON.stringify([createdItem, ...existingLocal]));
      
      setEnquiries((prev) => [createdItem, ...prev]);
      setViewMode("list");
      setEditingId(null);
      setFormData(initialFormData);
      setWizardStep(1);
      setSuccessToast("New enquiry added successfully!");
      setTimeout(() => setSuccessToast(""), 4000);
    }
  };

  // Open Edit Mode
  const handleEditEnquiry = (enquiry) => {
    setEditingId(enquiry._id);
    setFormData({
      ...initialFormData,
      ...enquiry,
      enquiryDate: enquiry.enquiryDate
        ? new Date(enquiry.enquiryDate).toISOString().split("T")[0]
        : initialFormData.enquiryDate
    });
    setWizardStep(1);
    setViewMode("edit");
  };

  // Delete Enquiry
  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await erpApi.deleteLead(id);
      setSuccessToast("Enquiry deleted successfully!");
      fetchEnquiries();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMessage("Failed to delete enquiry: " + err.message);
    }
  };

  // Checkbox Selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(enquiries.map((e) => e._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // =========================================================================
  // VIEW: 3-STEP ADD / EDIT ENQUIRY WIZARD (Screenshots 1 & 2 - Golden Theme)
  // =========================================================================
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Wizard Header Bar */}
        <div className="bg-white border border-[#EAE3D2] rounded-2xl p-6 shadow-xs">
          {/* Top Title & Close */}
          <div className="flex items-center justify-between pb-6 border-b border-[#EAE3D2] mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewMode("list");
                  setEditingId(null);
                }}
                className="p-2 text-stone-400 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  {editingId ? "Edit Enquiry" : "Add Enquiry"}
                </h1>
                <p className="text-xs text-[#9E7B1D] font-medium">
                  {editingId ? "Modify enquiry specifications" : "Register a new client enquiry"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setViewMode("list");
                setEditingId(null);
              }}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Back to List
            </button>
          </div>

          {/* Stepper Progress Bar (Reference UI with Luxury Golden Accent) */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 h-[2px] bg-[#EAE3D2] -z-0" />

              {/* Step 1: Contact Detail */}
              <div
                onClick={() => setWizardStep(1)}
                className={`flex flex-col items-center cursor-pointer group z-10 px-4 py-2 rounded-xl transition ${
                  wizardStep === 1 ? "bg-amber-50/80" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mb-2 shadow-xs transition ${
                    wizardStep === 1
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 ring-4 ring-amber-100"
                      : wizardStep > 1
                      ? "bg-[#9E7B1D] text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {wizardStep > 1 ? <Check size={16} /> : "1"}
                </div>
                <span
                  className={`text-xs font-bold transition ${
                    wizardStep === 1 ? "text-[#9E7B1D]" : "text-stone-600"
                  }`}
                >
                  Contact Detail
                </span>
              </div>

              {/* Step 2: Project Detail */}
              <div
                onClick={() => setWizardStep(2)}
                className={`flex flex-col items-center cursor-pointer group z-10 px-4 py-2 rounded-xl transition ${
                  wizardStep === 2 ? "bg-amber-50/80" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mb-2 shadow-xs transition ${
                    wizardStep === 2
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 ring-4 ring-amber-100"
                      : wizardStep > 2
                      ? "bg-[#9E7B1D] text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {wizardStep > 2 ? <Check size={16} /> : wizardStep === 2 ? "2" : <Edit2 size={14} />}
                </div>
                <span
                  className={`text-xs font-bold transition ${
                    wizardStep === 2 ? "text-[#9E7B1D]" : "text-stone-600"
                  }`}
                >
                  Project Detail
                </span>
              </div>

              {/* Step 3: Additional Detail */}
              <div
                onClick={() => setWizardStep(3)}
                className={`flex flex-col items-center cursor-pointer group z-10 px-4 py-2 rounded-xl transition ${
                  wizardStep === 3 ? "bg-amber-50/80" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm mb-2 shadow-xs transition ${
                    wizardStep === 3
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 ring-4 ring-amber-100"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-bold transition ${
                    wizardStep === 3 ? "text-[#9E7B1D]" : "text-stone-600"
                  }`}
                >
                  Additional Detail
                </span>
              </div>
            </div>
          </div>

          {/* Form Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 1: CONTACT DETAIL (Screenshot 1 - Golden Theme) */}
          {/* ============================================================= */}
          {wizardStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <h2 className="text-sm font-extrabold text-[#9E7B1D] tracking-wide">
                  Contact Information
                </h2>

                {/* Row 1: Salutation, Name, Phone, Email, Enquiry Date */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Salutation */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Salutation
                    </label>
                    <select
                      value={formData.salutation}
                      onChange={(e) => handleInputChange("salutation", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex h-10 border border-[#EAE3D2] rounded-xl overflow-hidden focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-amber-100 transition bg-white">
                      <div className="flex items-center gap-1 px-2.5 bg-[#FFFDF9] border-r border-[#EAE3D2] text-xs font-semibold text-stone-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="74104 10123"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="flex-1 px-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>

                  {/* Enquiry Date */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Enquiry Date
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={formData.enquiryDate}
                        onChange={(e) => handleInputChange("enquiryDate", e.target.value)}
                        className="w-full h-10 pl-3 pr-9 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                      />
                      <CalendarIcon
                        size={14}
                        className="absolute right-3 text-[#D4AF37] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Address, Occupation, Landline, Company Name */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                  {/* Address */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="Enter occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>

                  {/* Landline (STD + Number) */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Landline (STD + Number)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 044"
                        value={formData.landlineSTD}
                        onChange={(e) => handleInputChange("landlineSTD", e.target.value)}
                        className="w-24 h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                      />
                      <input
                        type="text"
                        placeholder="e.g. 2345678"
                        value={formData.landlineNumber}
                        onChange={(e) => handleInputChange("landlineNumber", e.target.value)}
                        className="flex-1 h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Alternate Contact Information */}
              <div className="space-y-4 pt-4 border-t border-[#EAE3D2]">
                <h2 className="text-sm font-extrabold text-[#9E7B1D] tracking-wide">
                  Alternate Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Salutation */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Salutation
                    </label>
                    <select
                      value={formData.altSalutation}
                      onChange={(e) => handleInputChange("altSalutation", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={formData.altName}
                      onChange={(e) => handleInputChange("altName", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Phone
                    </label>
                    <div className="flex h-10 border border-[#EAE3D2] rounded-xl overflow-hidden focus-within:border-[#D4AF37] transition bg-white">
                      <div className="flex items-center gap-1 px-2.5 bg-[#FFFDF9] border-r border-[#EAE3D2] text-xs font-semibold text-stone-700 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="74104 10123"
                        value={formData.altPhone}
                        onChange={(e) => handleInputChange("altPhone", e.target.value)}
                        className="flex-1 px-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={formData.altEmail}
                      onChange={(e) => handleInputChange("altEmail", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions for Step 1 */}
              <div className="pt-6 border-t border-[#EAE3D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("list");
                    setEditingId(null);
                  }}
                  className="px-6 py-2.5 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-amber-50/50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name || !formData.phone) {
                      setErrorMessage("Name and Phone number are required to continue.");
                      return;
                    }
                    setErrorMessage("");
                    setWizardStep(2);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-2.5 text-xs font-extrabold text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 2: PROJECT DETAIL (Screenshot 2 - Golden Theme) */}
          {/* ============================================================= */}
          {wizardStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Section 1: Project Details */}
              <div className="space-y-4">
                <h2 className="text-sm font-extrabold text-[#9E7B1D] tracking-wide">
                  Project Details
                </h2>

                {/* Row 1: Project Type, Project Subtype, Site Status, Site Size */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Project Type */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Project Type
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => handleInputChange("projectType", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Renovation">Renovation</option>
                      <option value="Villa">Villa / Bungalow</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Office">Office / Workstation</option>
                      <option value="Retail">Retail & Showroom</option>
                      <option value="Hospitality">Hospitality & Cafe</option>
                    </select>
                  </div>

                  {/* Project Subtype */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Project Subtype
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project subtype"
                      value={formData.projectSubtype}
                      onChange={(e) => handleInputChange("projectSubtype", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* Site Status */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Site Status
                    </label>
                    <select
                      value={formData.siteStatus}
                      onChange={(e) => handleInputChange("siteStatus", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Possession Handed Over">Possession Handed Over</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Bare Shell">Bare Shell</option>
                      <option value="Renovating">Renovating</option>
                    </select>
                  </div>

                  {/* Site Size */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Site Size
                    </label>
                    <input
                      type="text"
                      placeholder="Enter site size"
                      value={formData.siteSize}
                      onChange={(e) => handleInputChange("siteSize", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                {/* Row 2: Site Location, Site Address (with Same as Address checkbox), GST Number, Source */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                  {/* Site Location */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Site Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter site location"
                      value={formData.siteLocation}
                      onChange={(e) => handleInputChange("siteLocation", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* Site Address */}
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        Site Address
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.sameAsAddress}
                          onChange={(e) => handleSameAsAddressToggle(e.target.checked)}
                          className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <span>Same as Address</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Site Address"
                      value={formData.siteAddress}
                      onChange={(e) => handleInputChange("siteAddress", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* GST Number */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-stone-700">
                        GST Number
                      </label>
                      <Info size={12} className="text-stone-400" title="Optional 15-digit GSTIN" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter GST number"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* Source */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Source
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => handleInputChange("source", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google Ads / Search</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Reference">Client Reference</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Walk-in">Showroom Walk-in</option>
                      <option value="Cold Call">Cold Outreach</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Enquiry Details */}
              <div className="space-y-4 pt-4 border-t border-[#EAE3D2]">
                <h2 className="text-sm font-extrabold text-[#9E7B1D] tracking-wide">
                  Enquiry Details
                </h2>

                {/* Row 1: Handled By, Designed By, Prospect Status, Budget */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Handled By */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Handled By <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.handledBy}
                      onChange={(e) => handleInputChange("handledBy", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Sales Manager Rahul">Sales Manager Rahul</option>
                      <option value="Relationship Lead Sneha">Relationship Lead Sneha</option>
                      <option value="Sr. Consultant Amit">Sr. Consultant Amit</option>
                    </select>
                  </div>

                  {/* Designed By */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Designed By
                    </label>
                    <select
                      value={formData.designedBy}
                      onChange={(e) => handleInputChange("designedBy", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Lead Designer">Lead Designer</option>
                      <option value="Architect Rohit">Architect Rohit</option>
                      <option value="Designer Priya">Designer Priya</option>
                      <option value="3D Visualizer Karan">3D Visualizer Karan</option>
                    </select>
                  </div>

                  {/* Prospect Status */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Prospect Status
                    </label>
                    <select
                      value={formData.prospectStatus}
                      onChange={(e) => handleInputChange("prospectStatus", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Hot">Hot</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Budget
                    </label>
                    <input
                      type="text"
                      placeholder="Enter budget (e.g. ₹35L)"
                      value={formData.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                {/* Row 2: Timeline, Expected On, Financial Status, Priority Status */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                  {/* Timeline */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Timeline
                    </label>
                    <input
                      type="text"
                      placeholder="Enter timeline (e.g. 3 Months)"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange("timeline", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>

                  {/* Expected On */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Expected On
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={formData.expectedOn}
                        onChange={(e) => handleInputChange("expectedOn", e.target.value)}
                        className="w-full h-10 pl-3 pr-9 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                      />
                      <CalendarIcon
                        size={14}
                        className="absolute right-3 text-[#D4AF37] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Financial Status */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Financial Status
                    </label>
                    <select
                      value={formData.financialStatus}
                      onChange={(e) => handleInputChange("financialStatus", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Self Funded">Self Funded</option>
                      <option value="Bank Loan Applied">Bank Loan Applied</option>
                      <option value="Bank Loan Approved">Bank Loan Approved</option>
                      <option value="Undecided">Undecided / Flexible</option>
                    </select>
                  </div>

                  {/* Priority Status */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Priority Status
                    </label>
                    <select
                      value={formData.priorityStatus}
                      onChange={(e) => handleInputChange("priorityStatus", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Remarks */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="Enter remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                {/* Row 4: Radio Buttons for Site Visits (Screenshot 2) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 pt-4 pb-2">
                  {/* Office Visited */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-700">
                    <span>Office Visited:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="officeVisited"
                        checked={formData.officeVisited === true}
                        onChange={() => handleInputChange("officeVisited", true)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="officeVisited"
                        checked={formData.officeVisited === false}
                        onChange={() => handleInputChange("officeVisited", false)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {/* Site Visited */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-700">
                    <span>Site Visited:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="siteVisited"
                        checked={formData.siteVisited === true}
                        onChange={() => handleInputChange("siteVisited", true)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="siteVisited"
                        checked={formData.siteVisited === false}
                        onChange={() => handleInputChange("siteVisited", false)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {/* Reference Site Visited */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-700">
                    <span>Reference Site Visited:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="referenceSiteVisited"
                        checked={formData.referenceSiteVisited === true}
                        onChange={() => handleInputChange("referenceSiteVisited", true)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="referenceSiteVisited"
                        checked={formData.referenceSiteVisited === false}
                        onChange={() => handleInputChange("referenceSiteVisited", false)}
                        className="text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Actions for Step 2 */}
              <div className="pt-6 border-t border-[#EAE3D2] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-[#EAE3D2] hover:bg-amber-50/50 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Step 1</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("list");
                      setEditingId(null);
                    }}
                    className="px-6 py-2.5 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-amber-50/50 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="inline-flex items-center gap-2 px-8 py-2.5 text-xs font-extrabold text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <span>Continue to Step 3</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 3: ADDITIONAL DETAIL (Golden Theme) */}
          {/* ============================================================= */}
          {wizardStep === 3 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold text-[#9E7B1D] tracking-wide">
                  Additional Detail & Scope of Work
                </h2>

                {/* Scope of Work Multi-select Badges */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Scope of Work
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {scopeOptions.map((item) => {
                      const isSelected = formData.scopeOfWork.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleScopeToggle(item)}
                          className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-amber-50 border-[#D4AF37] text-[#9E7B1D] font-bold shadow-xs"
                              : "bg-white border-[#EAE3D2] text-stone-700 hover:bg-amber-50/30"
                          }`}
                        >
                          <span>{item}</span>
                          {isSelected && <Check size={14} className="text-[#9E7B1D]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Style Preference & Estimated Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Design Style Preference
                    </label>
                    <select
                      value={formData.stylePreference}
                      onChange={(e) => handleInputChange("stylePreference", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37] transition"
                    >
                      <option value="Modern">Modern Minimalist</option>
                      <option value="Luxury Contemporary">Luxury Contemporary</option>
                      <option value="Scandinavian">Scandinavian Clean</option>
                      <option value="Traditional">Traditional Royal</option>
                      <option value="Industrial">Industrial Loft</option>
                      <option value="Bohemian">Bohemian Chic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Initial Estimated Value (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2500000"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>

                {/* Special Notes / Floor Plan Info */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Client Special Notes & Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter special requirements, timeline urgency, or architectural notes..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full p-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>
              </div>

              {/* Bottom Actions for Step 3 */}
              <div className="pt-6 border-t border-[#EAE3D2] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-[#EAE3D2] hover:bg-amber-50/50 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Step 2</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("list");
                      setEditingId(null);
                    }}
                    className="px-6 py-2.5 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-amber-50/50 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="inline-flex items-center gap-2 px-8 py-2.5 text-xs font-extrabold text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{editingId ? "Update Enquiry" : "Save Enquiry"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN LIST & PIPELINE VIEW (Golden Theme)
  // =========================================================================
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#9E7B1D] text-white text-xs font-bold rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white border border-[#EAE3D2] rounded-2xl shadow-xs overflow-hidden">
        {/* Top Action & Filter Toolbar (Screenshot 3 - Golden Theme) */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D2] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left: Search Bar & Count */}
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search by Name, Phone, Email, Site Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:bg-white transition"
              />
            </div>

            {/* Total Enquiries Count Display */}
            <div className="text-xs font-bold text-stone-800 select-none">
              <span>{pagination.total || enquiries.length}</span>{" "}
              <span className="text-stone-500 font-normal">Enquiries</span>
            </div>
          </div>

          {/* Right: View Switchers & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* View Switchers: List / Pipeline */}
            <div className="flex items-center p-0.5 bg-[#FAF9F5] rounded-xl border border-[#EAE3D2]">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <ListIcon size={14} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "pipeline"
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Columns3 size={14} />
                <span>Pipeline</span>
              </button>
            </div>

            {/* + New Enquiry Button */}
            <button
              onClick={() => {
                setFormData(initialFormData);
                setEditingId(null);
                setWizardStep(1);
                setViewMode("add");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#9E7B1D] bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>New Enquiry</span>
            </button>

            {/* Bulk Upload Button */}
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-amber-50/50 border border-[#EAE3D2] rounded-xl transition shadow-xs cursor-pointer"
            >
              <UploadCloud size={15} className="text-[#9E7B1D]" />
              <span>Bulk Upload</span>
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition shadow-xs cursor-pointer ${
                filterProjectType || filterStatus || filterSource
                  ? "bg-amber-50 border-amber-200 text-[#9E7B1D] font-bold"
                  : "bg-white border-[#EAE3D2] text-stone-700 hover:bg-amber-50/50"
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>

            {/* Customize Columns Button */}
            <button
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-amber-50/50 border border-[#EAE3D2] rounded-xl transition shadow-xs cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer / Dropdown */}
        {isFilterOpen && (
          <div className="p-4 bg-[#FAF9F5] border-b border-[#EAE3D2] grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in slide-in-from-top-1">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Project Type
              </label>
              <select
                value={filterProjectType}
                onChange={(e) => setFilterProjectType(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800"
              >
                <option value="">All Project Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Renovation">Renovation</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Stage / Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800"
              >
                <option value="">All Stages</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Booking">Booking / Site Visit</option>
                <option value="Design Phase">Design Phase</option>
                <option value="Proposal">Proposal</option>
                <option value="Under Installation">Under Installation</option>
                <option value="Delivered">Delivered</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Lead Source
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Reference">Reference</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setFilterProjectType("");
                  setFilterStatus("");
                  setFilterSource("");
                }}
                className="h-8 px-3 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Customize Columns Modal */}
        {isCustomizeOpen && (
          <div className="p-4 bg-[#FAF9F5] border-b border-[#EAE3D2] flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-stone-700">Display Columns:</span>
            {Object.keys(visibleColumns).map((col) => (
              <label key={col} className="flex items-center gap-1.5 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns[col]}
                  onChange={(e) =>
                    setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                  }
                  className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className="capitalize">{col.replace(/([A-Z])/g, " $1")}</span>
              </label>
            ))}
          </div>
        )}

        {/* ============================================================= */}
        {/* TABLE VIEW (Golden Theme) */}
        {/* ============================================================= */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-stone-700 text-xs font-semibold">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        enquiries.length > 0 && selectedIds.length === enquiries.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                    />
                  </th>
                  {visibleColumns.enquiryDate && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Enquiry Date</th>
                  )}
                  {visibleColumns.name && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Name</th>
                  )}
                  {visibleColumns.phone && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Phone</th>
                  )}
                  {visibleColumns.projectType && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Project Type</th>
                  )}
                  {visibleColumns.projectLocation && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Project Location</th>
                  )}
                  {visibleColumns.status && (
                    <th className="py-3.5 px-4 font-bold text-stone-800">Status</th>
                  )}
                  <th className="py-3.5 px-4 font-bold text-stone-800 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[#F0EBE0] text-xs text-stone-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-stone-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="font-bold text-stone-700">No enquiries found</p>
                        <p className="text-xs text-stone-400">
                          Try adjusting your search criteria or add a new enquiry.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enquiries.map((row) => {
                    const isSelected = selectedIds.includes(row._id);
                    return (
                      <tr
                        key={row._id}
                        className={`hover:bg-amber-50/30 transition ${
                          isSelected ? "bg-amber-50/50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(row._id, e.target.checked)}
                            className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                          />
                        </td>

                        {/* Enquiry Date */}
                        {visibleColumns.enquiryDate && (
                          <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap">
                            {formatDate(row.enquiryDate || row.createdAt)}
                          </td>
                        )}

                        {/* Name */}
                        {visibleColumns.name && (
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            {row.salutation && row.salutation !== "Mr" && (
                              <span className="text-stone-400 font-normal mr-1">{row.salutation}</span>
                            )}
                            <span className="hover:text-[#9E7B1D] transition cursor-pointer" onClick={() => setSelectedEnquiry(row)}>
                              {row.name}
                            </span>
                            {row.isDuplicate && (
                              <span className="ml-2 text-[10px] bg-amber-50 text-[#9E7B1D] border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                                Dup
                              </span>
                            )}
                          </td>
                        )}

                        {/* Phone */}
                        {visibleColumns.phone && (
                          <td className="py-3.5 px-4 text-stone-700 font-mono">
                            {row.phone}
                          </td>
                        )}

                        {/* Project Type */}
                        {visibleColumns.projectType && (
                          <td className="py-3.5 px-4 font-medium text-stone-700 whitespace-nowrap">
                            {row.projectType || "Residential"}
                          </td>
                        )}

                        {/* Project Location */}
                        {visibleColumns.projectLocation && (
                          <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate" title={row.siteLocation || row.address}>
                            {row.siteLocation || row.address || "-"}
                          </td>
                        )}

                        {/* Status */}
                        {visibleColumns.status && (
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                row.status === "Delivered" || row.status === "Closed Won"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : row.status === "Lost"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : row.status === "Under Installation"
                                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                                  : row.status === "Design Phase" || row.status === "Proposal"
                                  ? "bg-amber-50 text-[#9E7B1D] border border-amber-200"
                                  : row.status === "Booking"
                                  ? "bg-amber-100/70 text-[#9E7B1D] border border-amber-300 font-extrabold"
                                  : "bg-[#FFFDF7] text-stone-800 border border-[#EAE3D2]"
                              }`}
                            >
                              {row.status || "Inquiry"}
                            </span>
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEnquiry(row)}
                              title="View Details"
                              className="p-1.5 text-stone-400 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEditEnquiry(row)}
                              title="Edit Enquiry"
                              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteEnquiry(row._id)}
                              title="Delete Enquiry"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================= */}
        {/* PIPELINE / KANBAN VIEW (Golden Theme) */}
        {/* ============================================================= */}
        {viewMode === "pipeline" && (
          <div className="p-5 overflow-x-auto">
            <div className="flex items-start gap-4 min-w-[1200px]">
              {pipelineStages.map((stage) => {
                const stageLeads = enquiries.filter(
                  (l) => (l.status || "Inquiry") === stage.key
                );
                return (
                  <div
                    key={stage.key}
                    className="flex-1 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl p-3 space-y-3"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D2]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <h4 className="text-xs font-bold text-stone-800">{stage.label}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-[#9E7B1D] bg-white px-2 py-0.5 rounded-full border border-[#EAE3D2]">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                      {stageLeads.map((card) => (
                        <div
                          key={card._id}
                          onClick={() => setSelectedEnquiry(card)}
                          className="bg-white p-3.5 rounded-xl border border-[#EAE3D2] shadow-2xs hover:shadow-xs hover:border-[#D4AF37] transition cursor-pointer space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-stone-900 truncate">
                              {card.name}
                            </h5>
                            <span className="text-[10px] font-semibold text-stone-400">
                              {formatDate(card.enquiryDate || card.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-mono">
                            <Phone size={12} className="text-[#9E7B1D]" />
                            <span>{card.phone}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-[#F0EBE0]">
                            <span>{card.projectType || "Residential"}</span>
                            <span className="font-bold text-[#9E7B1D]">{card.budget || "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Pagination Bar (Screenshot 3 - Golden Theme) */}
        {viewMode === "list" && (
          <div className="px-5 py-3.5 border-t border-[#EAE3D2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 bg-[#FAF9F5]">
            {/* Left: Bulk actions count if selected */}
            <div>
              {selectedIds.length > 0 ? (
                <span className="font-bold text-[#9E7B1D]">
                  {selectedIds.length} enquiries selected
                </span>
              ) : (
                <span className="text-stone-400">
                  Showing {enquiries.length} of {pagination.total || enquiries.length} entries
                </span>
              )}
            </div>

            {/* Right: Items per page & Pagination controls */}
            <div className="flex items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      limit: parseInt(e.target.value),
                      page: 1
                    }))
                  }
                  className="h-8 px-2 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800 font-semibold focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              {/* 1 - 10 of 17 */}
              <div className="font-semibold text-stone-700">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total || enquiries.length)}{" "}
                of {pagination.total || enquiries.length}
              </div>

              {/* Navigation Arrows: |< < > >| */}
              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronsLeft size={15} />
                </button>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: pagination.pages }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DETAIL DRAWER / POPUP (Golden Theme) */}
      {/* ========================================================================= */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAE3D2] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#9E7B1D] flex items-center justify-center font-bold">
                  {selectedEnquiry.name?.charAt(0) || "E"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    {selectedEnquiry.name}
                    <span className="text-[10px] font-bold text-[#9E7B1D] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {selectedEnquiry.status || "Inquiry"}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">{selectedEnquiry.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-700">
              {/* Contact Information */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EAE3D2] space-y-3">
                <h4 className="font-bold text-[#9E7B1D] uppercase tracking-wider text-[11px]">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400 block mb-0.5">Email</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.email || "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Enquiry Date</span>
                    <span className="font-medium text-stone-800">
                      {formatDate(selectedEnquiry.enquiryDate || selectedEnquiry.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Occupation</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.occupation || "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Company</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.companyName || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Project & Site Details */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EAE3D2] space-y-3">
                <h4 className="font-bold text-[#9E7B1D] uppercase tracking-wider text-[11px]">
                  Project & Site Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400 block mb-0.5">Project Type</span>
                    <span className="font-bold text-stone-800">
                      {selectedEnquiry.projectType} ({selectedEnquiry.projectSubtype || "General"})
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Site Location</span>
                    <span className="font-medium text-stone-800">
                      {selectedEnquiry.siteLocation || selectedEnquiry.address || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Site Status</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.siteStatus || "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Site Size</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.siteSize || "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Estimated Budget</span>
                    <span className="font-bold text-[#9E7B1D]">{selectedEnquiry.budget || "-"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">Timeline</span>
                    <span className="font-medium text-stone-800">{selectedEnquiry.timeline || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {selectedEnquiry.remarks && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                  <span className="text-[#9E7B1D] font-bold block mb-1">Remarks</span>
                  <p className="text-stone-700">{selectedEnquiry.remarks}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <button
                onClick={() => {
                  handleEditEnquiry(selectedEnquiry);
                  setSelectedEnquiry(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-[#EAE3D2] rounded-xl hover:bg-amber-50 transition"
              >
                <Edit2 size={13} />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-5 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK CSV UPLOAD MODAL COMPONENT */}
      {/* ========================================================================= */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          fetchEnquiries();
          setSuccessToast("Bulk CSV import completed successfully!");
          setTimeout(() => setSuccessToast(""), 4000);
        }}
      />
    </div>
  );
}
