import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Trash2,
  MoreVertical,
  GripVertical,
  Copy,
  PlusCircle,
  Download,
  Image as ImageIcon,
  MinusCircle,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronDown,
  User,
  Phone,
  Mail,
  Building,
  Check,
  X,
  AlertCircle,
  SlidersHorizontal,
  Eye,
  Upload,
  Loader2,
  FileText,
  Printer,
  Camera,
  Zap
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import erpApi from "../services/erpService";
import { downloadBOQPdf } from "../utils/downloadHelper";

const STANDARD_SPACE_SUGGESTIONS = [
  "Living Room",
  "Master Bedroom",
  "Modular Kitchen",
  "Dining Room",
  "Entrance / Foyer",
  "Guest Bedroom",
  "Kids Bedroom",
  "Balcony / Terrace",
  "Pooja Room",
  "Home Theater",
  "Study / Home Office",
  "Walk-in Wardrobe / Dressing Area"
];

export default function BOQManagement() {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // Mode: "list" | "builder"
  const [viewMode, setViewMode] = useState("list");

  // BOQ List State
  const [boqList, setBoqList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  // Builder Active State
  const [activeBOQ, setActiveBOQ] = useState(null);
  const [activeSpaceIdx, setActiveSpaceIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Component"); // Component | Accessories | Appliances | Other Services
  const [selectedPackage, setSelectedPackage] = useState("Standard"); // Standard | Premium | Elite
  const [componentSearch, setComponentSearch] = useState("");
  const [isComponentSearchFocused, setIsComponentSearchFocused] = useState(false);
  const [libraryComponents, setLibraryComponents] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Quotation Modal State
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationBOQ, setQuotationBOQ] = useState(null);

  // Measurement Unit State (Screenshot 1)
  const [measurementUnit, setMeasurementUnit] = useState("Feet.inch"); // Feet.inch | Millimeter
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [pendingSelectedEnquiry, setPendingSelectedEnquiry] = useState(null);

  // Custom Mix Modal State
  const [isCustomMixModalOpen, setIsCustomMixModalOpen] = useState(false);
  const [customMixComponent, setCustomMixComponent] = useState(null);
  const [customMixState, setCustomMixState] = useState({
    dimSource: "Elite",
    typeSource: "Elite",
    rateSource: "Elite",
    descSource: "Elite",
    lengthFt: 1,
    lengthIn: 0,
    heightFt: 1,
    heightIn: 0,
    depthFt: 0,
    depthIn: 0,
    type: "Box",
    rate: 2200,
    qty: 1,
    description: "",
    selectedPhotos: []
  });

  // Image Picker Modal State
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  const [activeItemImageIdx, setActiveItemImageIdx] = useState(null);
  const [availableLibraryImages, setAvailableLibraryImages] = useState([]);
  const [selectedItemPhotos, setSelectedItemPhotos] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [syncToLibrary, setSyncToLibrary] = useState(true);

  // Direct upload tracking state
  const [uploadingRowIdx, setUploadingRowIdx] = useState(null);
  const [uploadingCompId, setUploadingCompId] = useState(null);

  // New Space modal state
  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  // Select Enquiry Modal State (matching user reference screenshot)
  const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [enquiryList, setEnquiryList] = useState([]);

  // Get Default Components & Preset Prices for any space name
  const getDefaultItemsForSpace = (spaceName) => {
    const s = (spaceName || "").toLowerCase();

    if (s.includes("living")) {
      return [
        {
          name: "Living Room TV Unit & Paneling",
          typeVariant: "Box Standard",
          lengthFt: 8,
          lengthIn: 0,
          heightFt: 7,
          heightIn: 0,
          depthFt: 1,
          depthIn: 6,
          qty: 1,
          description: "Providing of TV Unit with Panelling & Storage Drawers",
          sqft: 56,
          rate: 1800,
          amount: 100800,
          packageVariant: "Standard"
        },
        {
          name: "Living Room Wall Louver Paneling",
          typeVariant: "Panel",
          lengthFt: 10,
          lengthIn: 0,
          heightFt: 9,
          heightIn: 0,
          depthFt: 0,
          depthIn: 4,
          qty: 1,
          description: "Fluted Charcoal/WPC Panel Accent Wall",
          sqft: 90,
          rate: 1600,
          amount: 144000,
          packageVariant: "Standard"
        }
      ];
    } else if (s.includes("kitchen")) {
      return [
        {
          name: "Kitchen Base Cabinet",
          typeVariant: "Box",
          lengthFt: 12,
          lengthIn: 0,
          heightFt: 2,
          heightIn: 8,
          depthFt: 2,
          depthIn: 0,
          qty: 1,
          description: "Modular Kitchen Base Units with Marine Ply & Tandem Baskets",
          sqft: 32,
          rate: 1800,
          amount: 57600,
          packageVariant: "Standard"
        },
        {
          name: "Kitchen Overhead Storage",
          typeVariant: "Box",
          lengthFt: 12,
          lengthIn: 0,
          heightFt: 2,
          heightIn: 0,
          depthFt: 1,
          depthIn: 3,
          qty: 1,
          description: "Overhead Cabinets with Hydraulic Lift-Up Doors",
          sqft: 24,
          rate: 1600,
          amount: 38400,
          packageVariant: "Standard"
        }
      ];
    } else if (s.includes("bed") || s.includes("room")) {
      return [
        {
          name: "King Size Hydraulic Bed",
          typeVariant: "Bed",
          lengthFt: 6,
          lengthIn: 6,
          heightFt: 4,
          heightIn: 0,
          depthFt: 6,
          depthIn: 0,
          qty: 1,
          description: "King Size Bed with Cushioned Headboard & Hydraulic Storage",
          sqft: 26,
          rate: 2200,
          amount: 57200,
          packageVariant: "Standard"
        },
        {
          name: "4-Door Openable Wardrobe",
          typeVariant: "Wardrobe",
          lengthFt: 7,
          lengthIn: 0,
          heightFt: 9,
          heightIn: 6,
          depthFt: 2,
          depthIn: 0,
          qty: 1,
          description: "Floor-to-Ceiling Wardrobe with Inner Drawers & Loft",
          sqft: 66.5,
          rate: 1900,
          amount: 126350,
          packageVariant: "Standard"
        }
      ];
    } else if (s.includes("dining")) {
      return [
        {
          name: "Crockery & Display Console",
          typeVariant: "Glass Box",
          lengthFt: 5,
          lengthIn: 0,
          heightFt: 7,
          heightIn: 0,
          depthFt: 1,
          depthIn: 6,
          qty: 1,
          description: "Crockery Unit with Glass Fluted Doors & Warm LED Profile",
          sqft: 35,
          rate: 2100,
          amount: 73500,
          packageVariant: "Standard"
        }
      ];
    } else if (s.includes("puja") || s.includes("pooja")) {
      return [
        {
          name: "Custom Mandir Unit with CNC Jali",
          typeVariant: "Custom Box",
          lengthFt: 4,
          lengthIn: 0,
          heightFt: 7,
          heightIn: 0,
          depthFt: 1,
          depthIn: 6,
          qty: 1,
          description: "Teak Wood Finished Pooja Mandir with Backlit CNC Jali & Brass Bells",
          sqft: 28,
          rate: 2500,
          amount: 70000,
          packageVariant: "Standard"
        }
      ];
    } else {
      return [
        {
          name: "Shoe Rack",
          typeVariant: "Box Standard",
          lengthFt: 4,
          lengthIn: 0,
          heightFt: 3,
          heightIn: 0,
          depthFt: 1,
          depthIn: 3,
          qty: 1,
          description: "Foyer Storage Cabinet with Seating Cushion",
          sqft: 12,
          rate: 1600,
          amount: 19200,
          packageVariant: "Standard"
        }
      ];
    }
  };

  // Full default standard spaces template with pre-priced components
  const defaultStandardSpaces = [
    {
      name: "Entrance",
      roomTotal: 75813,
      items: [
        {
          name: "Shoe Rack",
          typeVariant: "Box Standard",
          lengthFt: 1,
          lengthIn: 6,
          heightFt: 9,
          heightIn: 3,
          depthFt: 0,
          depthIn: 0,
          qty: 1,
          description: "Providing of size (4ft x 3ft) shoe rack",
          sqft: 13.875,
          rate: 1500,
          amount: 20813
        },
        {
          name: "Entrance Safety Door",
          typeVariant: "Frame Standard",
          lengthFt: 1,
          lengthIn: 0,
          heightFt: 1,
          heightIn: 0,
          depthFt: 0,
          depthIn: 0,
          qty: 1,
          description: "entrance area - Category Grill",
          sqft: 1,
          rate: 40000,
          amount: 40000
        },
        {
          name: "Smart Lock",
          typeVariant: "Box Standard",
          lengthFt: 1,
          lengthIn: 0,
          heightFt: 1,
          heightIn: 0,
          depthFt: 0,
          depthIn: 0,
          qty: 1,
          description: "Smart digital biometric lock",
          sqft: 1,
          rate: 15000,
          amount: 15000
        }
      ]
    },
    {
      name: "Living Room",
      roomTotal: 244800,
      items: getDefaultItemsForSpace("Living Room")
    },
    {
      name: "Modular Kitchen",
      roomTotal: 96000,
      items: getDefaultItemsForSpace("Modular Kitchen")
    },
    {
      name: "Dining Area",
      roomTotal: 73500,
      items: getDefaultItemsForSpace("Dining Area")
    },
    {
      name: "Master Bedroom",
      roomTotal: 183550,
      items: getDefaultItemsForSpace("Master Bedroom")
    },
    {
      name: "Kids Bedroom",
      roomTotal: 183550,
      items: getDefaultItemsForSpace("Kids Bedroom")
    },
    {
      name: "Puja Room",
      roomTotal: 70000,
      items: getDefaultItemsForSpace("Puja Room")
    }
  ];

  // Fetch BOQ List
  const fetchBOQList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await erpApi.getBOQs({ search, page: pagination.page, limit: pagination.limit });
      if (res?.success) {
        setBoqList(res.data || []);
        if (res.pagination) {
          setPagination((p) => ({
            ...p,
            total: res.pagination.total || 0,
            pages: res.pagination.pages || 1
          }));
        }
      }
    } catch {
      // Fallback mock BOQ list (Screenshot 1)
      const mockList = [
        {
          _id: "boq18",
          enquiryNo: "ENQ-2026-018",
          enquiryDate: "2026-08-08",
          clientName: "Rajeev Singhal",
          clientEmail: "rajeev.s@example.com",
          clientPhone: "89482 74553",
          numberOfSpaces: 10,
          grandTotal: 3964567,
          spaces: defaultStandardSpaces
        },
        {
          _id: "boq17",
          enquiryNo: "ENQ-2026-017",
          enquiryDate: "2026-07-11",
          clientName: "Rasid sir",
          clientEmail: "rasid@example.com",
          clientPhone: "84128 52592",
          numberOfSpaces: 1,
          grandTotal: 185000,
          spaces: [{ name: "Showroom Front", roomTotal: 185000, items: [] }]
        },
        {
          _id: "boq16",
          enquiryNo: "ENQ-2026-016",
          enquiryDate: "2026-06-21",
          clientName: "Meenakshi Krishnani",
          clientEmail: "meenakshi@example.com",
          clientPhone: "91671 35606",
          numberOfSpaces: 5,
          grandTotal: 1450000,
          spaces: []
        },
        {
          _id: "boq15",
          enquiryNo: "ENQ-2026-015",
          enquiryDate: "2026-06-18",
          clientName: "Khushi",
          clientEmail: "khushi@example.com",
          clientPhone: "73551 23408",
          numberOfSpaces: 1,
          grandTotal: 95000,
          spaces: []
        },
        {
          _id: "boq14",
          enquiryNo: "ENQ-2026-014",
          enquiryDate: "2026-05-25",
          clientName: "Akash Jain",
          clientEmail: "abc@gmail.com",
          clientPhone: "89778 99643",
          numberOfSpaces: 8,
          grandTotal: 2200000,
          spaces: []
        },
        {
          _id: "boq13",
          enquiryNo: "ENQ-2026-013",
          enquiryDate: "2026-08-13",
          clientName: "PREM SHUKLA",
          clientEmail: "PREMSHUKLA@GMAIL.COM",
          clientPhone: "78000 20496",
          numberOfSpaces: 1,
          grandTotal: 4500000,
          spaces: []
        },
        {
          _id: "boq12",
          enquiryNo: "ENQ-2026-012",
          enquiryDate: "2026-05-19",
          clientName: "Dr Saurabh",
          clientEmail: "abc@gmail.com",
          clientPhone: "77090 19535",
          numberOfSpaces: 2,
          grandTotal: 850000,
          spaces: []
        },
        {
          _id: "boq11",
          enquiryNo: "ENQ-2026-011",
          enquiryDate: "2026-04-28",
          clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
          clientEmail: "contact@wiprolincraft.com",
          clientPhone: "96323 00992",
          numberOfSpaces: 1,
          grandTotal: 12000000,
          spaces: []
        }
      ];
      setBoqList(mockList);
      setPagination((p) => ({ ...p, total: mockList.length }));
    } finally {
      setLoadingList(false);
    }
  }, [search, pagination.page, pagination.limit]);

  // Fetch Available Enquiries for the "Select Enquiry" Modal
  const fetchAvailableEnquiries = useCallback(async () => {
    let list = [];
    try {
      const res = await erpApi.getLeads({ limit: 100 });
      if (res?.success && res.data && res.data.length > 0) {
        list = res.data;
      }
    } catch {
      // Fallback
    }

    // Merge with any freshly created local enquiries
    const localSaved = JSON.parse(localStorage.getItem("velora_custom_enquiries") || "[]");

    // Default reference list matching user's exact demo
    const referenceList = [
      {
        _id: "enq_rohan",
        name: "rohan",
        enquiryNo: "ENQ-2026-019",
        phone: "98220 12345",
        email: "rohan@example.com",
        projectType: "Residential",
        siteLocation: "Pune"
      },
      {
        _id: "enq_rajeev",
        name: "Rajeev Singhal",
        enquiryNo: "ENQ-2026-018",
        phone: "89482 74553",
        email: "rajeev.s@example.com",
        projectType: "Renovation",
        siteLocation: "Sushant Golf City"
      },
      {
        _id: "enq_rasid",
        name: "Rasid sir",
        enquiryNo: "ENQ-2026-017",
        phone: "84128 52592",
        email: "rasid@example.com",
        projectType: "Commercial",
        siteLocation: "Wakad"
      },
      {
        _id: "enq_meenakshi",
        name: "Meenakshi Krishnani",
        enquiryNo: "ENQ-2026-016",
        phone: "91671 35606",
        email: "meenakshi@example.com",
        projectType: "Residential",
        siteLocation: "Kalyani Nagar"
      },
      {
        _id: "enq_prem",
        name: "PREM SHUKLA",
        enquiryNo: "ENQ-2026-013",
        phone: "78000 20496",
        email: "prem.shukla@example.com",
        projectType: "Commercial",
        siteLocation: "PHASE 2"
      },
      {
        _id: "enq_saurabh",
        name: "Dr Saurabh",
        enquiryNo: "ENQ-2026-012",
        phone: "77090 19535",
        email: "saurabh.clinic@example.com",
        projectType: "Commercial",
        siteLocation: "Hinjewadi Phase 2"
      }
    ];

    // Combine avoiding duplicate IDs
    const combined = [...localSaved, ...list, ...referenceList];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      const key = item.enquiryNo || item._id || item.name;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    setEnquiryList(Array.from(uniqueMap.values()));
  }, []);

  // Fetch Library Components for Palette
  const fetchLibraryComponents = useCallback(async () => {
    try {
      const res = await erpApi.getComponents({ limit: 100 });
      if (res?.success && res.data) {
        setLibraryComponents(res.data);
      }
    } catch {
      // Local fallback
      setLibraryComponents([
        { name: "Shoe Rack", relevantSpace: "Entrance", variant: "Box Standard", standard: { rate: 1500 } },
        { name: "Entrance Safety Door", relevantSpace: "Entrance", variant: "Frame Standard", standard: { rate: 40000 } },
        { name: "Entrance Paneling", relevantSpace: "Entrance", variant: "Panel", standard: { rate: 1600 } },
        { name: "Name Plate", relevantSpace: "Entrance", variant: "Custom", standard: { rate: 3500 } },
        { name: "Smart Lock", relevantSpace: "Entrance", variant: "Box Standard", standard: { rate: 15000 } },
        { name: "Shoe Rack Seating", relevantSpace: "Entrance", variant: "Box", standard: { rate: 2200 } },
        { name: "Living Room TV Unit & Paneling", relevantSpace: "Living Room", variant: "Box Standard", standard: { rate: 1800 } },
        { name: "Living Room Wall Louver Paneling", relevantSpace: "Living Room", variant: "Panel", standard: { rate: 1600 } },
        { name: "Crockery & Display Console", relevantSpace: "Living Room", variant: "Glass Box", standard: { rate: 2100 } },
        { name: "Living Room Foyer Divider Partition", relevantSpace: "Living Room", variant: "Partition", standard: { rate: 2400 } },
        { name: "Bar Counter & Storage Cabinet", relevantSpace: "Living Room", variant: "Luxury Box", standard: { rate: 2800 } },
        { name: "King Size Hydraulic Bed", relevantSpace: "Master Bedroom", variant: "Bed", standard: { rate: 45000 } },
        { name: "4-Door Openable Wardrobe", relevantSpace: "Master Bedroom", variant: "Wardrobe", standard: { rate: 1900 } },
        { name: "Dressing Unit with LED Mirror", relevantSpace: "Master Bedroom", variant: "Dresser", standard: { rate: 2200 } },
        { name: "Bedside Tables (Pair)", relevantSpace: "Master Bedroom", variant: "Side Table", standard: { rate: 8500 } },
        { name: "Kitchen Base Cabinet", relevantSpace: "Modular Kitchen", variant: "Box", standard: { rate: 1500 } },
        { name: "Loft", relevantSpace: "Modular Kitchen", variant: "Box", standard: { rate: 1500 } },
        { name: "Kitchen SS Trolly", relevantSpace: "Modular Kitchen", variant: "Box", standard: { rate: 6000 } },
        { name: "Kitchen Overhead Storage", relevantSpace: "Modular Kitchen", variant: "Box", standard: { rate: 1500 } },
        { name: "Kitchen Wall Unit- Open", relevantSpace: "Modular Kitchen", variant: "Open Box", standard: { rate: 1500 } }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchBOQList();
    fetchAvailableEnquiries();
    fetchLibraryComponents();
  }, [fetchBOQList, fetchAvailableEnquiries, fetchLibraryComponents]);

  // Check URL param or initialize builder
  useEffect(() => {
    if (urlId) {
      loadSpecificBOQ(urlId);
    }
  }, [urlId]);

  const loadSpecificBOQ = async (idOrEnquiry) => {
    try {
      const res = await erpApi.getBOQById(idOrEnquiry);
      if (res?.success && res.data) {
        setActiveBOQ({
          ...res.data,
          spaces: res.data.spaces && res.data.spaces.length > 0 ? res.data.spaces : defaultStandardSpaces
        });
        setActiveSpaceIdx(0);
        setViewMode("builder");
        return;
      }
    } catch {
      // Look up locally
    }
    const found = boqList.find((b) => b._id === idOrEnquiry || b.enquiryNo === idOrEnquiry);
    if (found) {
      setActiveBOQ({
        ...found,
        spaces: found.spaces && found.spaces.length > 0 ? found.spaces : defaultStandardSpaces
      });
      setActiveSpaceIdx(0);
      setViewMode("builder");
    }
  };

  // Open Builder for a given BOQ row
  const handleOpenBuilder = (boqItem) => {
    setActiveBOQ({
      ...boqItem,
      spaces: boqItem.spaces && boqItem.spaces.length > 0 ? boqItem.spaces : defaultStandardSpaces
    });
    setActiveSpaceIdx(0);
    setViewMode("builder");
  };

  // Open "Select Enquiry" Modal (Matching User Reference Image)
  const handleOpenCreateBOQModal = () => {
    fetchAvailableEnquiries();
    setClientSearchQuery("");
    setIsSelectClientModalOpen(true);
  };

  // When user clicks an Enquiry Card in the "Select Enquiry" modal -> Open Measurement Unit Modal
  const handleSelectEnquiryToCreateBOQ = (enquiry) => {
    setPendingSelectedEnquiry(enquiry);
    setIsSelectClientModalOpen(false);
    setIsMeasurementModalOpen(true);
  };

  // When user selects Measurement Unit (Feet.inch / Millimeter) -> DIRECTLY Open full BOQ UI!
  const handleConfirmMeasurementUnit = async () => {
    const enquiry = pendingSelectedEnquiry || { name: "Client", enquiryNo: `ENQ-2026-019` };
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const boqNumber = `BOQ-2026-${randomSuffix}`;
    const enquiryNo = enquiry.enquiryNo || `ENQ-2026-${randomSuffix}`;

    // Create BOQ populated with all standard spaces & components ready to use
    const newBOQ = {
      _id: `boq_${Date.now()}`,
      boqNumber,
      enquiryNo,
      enquiryDate: enquiry.enquiryDate || new Date().toISOString().split("T")[0],
      clientName: enquiry.name || "Client",
      clientEmail: enquiry.email || "",
      clientPhone: enquiry.phone || "",
      numberOfSpaces: defaultStandardSpaces.length,
      activePackage: "Standard",
      grandTotal: 3964567,
      spaces: JSON.parse(JSON.stringify(defaultStandardSpaces))
    };

    // Save to Backend API & update local list
    try {
      const res = await erpApi.createBOQ(newBOQ);
      if (res?.data) {
        newBOQ._id = res.data._id;
      }
    } catch {
      // Keep local newBOQ
    }

    setBoqList((prev) => [newBOQ, ...prev.filter((b) => b.enquiryNo !== enquiryNo)]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    setActiveBOQ(newBOQ);
    setActiveSpaceIdx(0);
    setIsMeasurementModalOpen(false);
    setPendingSelectedEnquiry(null);
    setViewMode("builder");
    setSuccessToast(`BOQ created for ${enquiry.name}!`);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  // Open Quotation Preview & Export Modal from BOQ
  const handleOpenQuotationModal = async (boqTarget = null) => {
    const target = boqTarget || activeBOQ;
    if (!target) return;
    setQuotationBOQ(target);
    setIsQuotationModalOpen(true);

    // Sync / record Quotation in DB
    try {
      await erpApi.createQuotation({
        clientName: target.clientName,
        clientPhone: target.clientPhone,
        clientEmail: target.clientEmail,
        boqRef: target._id?.startsWith("boq_") ? null : target._id,
        amount: target.subtotal || Math.round((target.grandTotal || 0) / 1.18),
        gstAmount: target.gstTotal || Math.round((target.grandTotal || 0) - ((target.grandTotal || 0) / 1.18)),
        netTotal: target.grandTotal || 0,
        status: "Draft",
        notes: `Generated from BOQ ${target.boqNumber || target.enquiryNo}`
      });
    } catch {
      // Background sync, non-blocking
    }
  };

  // Active space reference
  const currentSpace = useMemo(() => {
    if (!activeBOQ?.spaces || activeBOQ.spaces.length === 0) return defaultStandardSpaces[0];
    return activeBOQ.spaces[activeSpaceIdx] || activeBOQ.spaces[0];
  }, [activeBOQ, activeSpaceIdx]);

  // Recalculate Sqft, Amount, Space Total and Grand Total
  const recalculateBOQ = (updatedBOQ) => {
    let grand = 0;
    const spaces = updatedBOQ.spaces.map((sp) => {
      let spaceSum = 0;
      const items = sp.items.map((item) => {
        const l = (Number(item.lengthFt) || 0) + (Number(item.lengthIn) || 0) / 12;
        const h = (Number(item.heightFt) || 0) + (Number(item.heightIn) || 0) / 12;
        const qty = Number(item.qty) || 1;
        const rate = Number(item.rate) || 0;

        let calculatedSqft = l > 0 && h > 0 ? Number((l * h * qty).toFixed(3)) : item.sqft || 1;
        if (calculatedSqft <= 0) calculatedSqft = 1;

        let amount = Math.round(calculatedSqft * rate);
        if (amount <= 0 && rate > 0) amount = rate * qty;

        spaceSum += amount;
        return { ...item, sqft: calculatedSqft, amount };
      });
      grand += spaceSum;
      return { ...sp, roomTotal: spaceSum, items };
    });

    return {
      ...updatedBOQ,
      spaces,
      numberOfSpaces: spaces.length,
      grandTotal: grand
    };
  };

  // Update item field in active space
  const handleUpdateItemField = (itemIdx, field, value) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    const targetSpace = updated.spaces[activeSpaceIdx];
    if (targetSpace && targetSpace.items[itemIdx]) {
      targetSpace.items[itemIdx][field] = value;
      const recalculated = recalculateBOQ(updated);
      setActiveBOQ(recalculated);
    }
  };

  // Add Component from Left Palette into Active Space
  const handleAddComponentToSpace = (comp, customConfig = null, targetVariant = null) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    const targetSpace = updated.spaces[activeSpaceIdx];
    if (!targetSpace) return;

    if (customConfig) {
      targetSpace.items.push(customConfig);
    } else {
      const availableVariants = comp.selectedVariants?.length
        ? comp.selectedVariants
        : ["Elite", "Premium", "Standard"];

      let chosenVariant = targetVariant;
      if (!chosenVariant) {
        if (availableVariants.includes(selectedPackage)) {
          chosenVariant = selectedPackage;
        } else {
          chosenVariant = availableVariants[0] || "Standard";
        }
      }

      const key = chosenVariant.toLowerCase();
      const vConfig = comp[key] || {};
      const unit = vConfig.unit || comp.standard?.unit || comp.unit || {};

      const lengthFt = unit.lengthFt !== undefined && (unit.lengthFt > 0 || unit.lengthIn > 0) ? unit.lengthFt : 1;
      const lengthIn = unit.lengthIn || 0;
      const heightFt = unit.heightFt !== undefined && (unit.heightFt > 0 || unit.heightIn > 0) ? unit.heightFt : 1;
      const heightIn = unit.heightIn || 0;
      const depthFt = unit.depthFt || 0;
      const depthIn = unit.depthIn || 0;

      // Base rate from standard tier or component root
      const baseRate = comp.standard?.rate || comp.rate || 1500;
      let rate = vConfig.rate || vConfig.unit?.rate || unit.rate;

      if (!rate) {
        if (chosenVariant === "Elite") {
          rate = comp.elite?.rate || Math.round(baseRate * 1.65);
        } else if (chosenVariant === "Premium") {
          rate = comp.premium?.rate || Math.round(baseRate * 1.30);
        } else {
          rate = baseRate;
        }
      }

      const typeVariant = vConfig.type || (chosenVariant === "Elite" ? "Elite Acrylic & HDMR" : chosenVariant === "Premium" ? "Premium Laminate & BWP" : "Standard MR & Matte");
      const description = vConfig.description || comp.description || `Providing of ${comp.name} (${chosenVariant} specification)`;
      const photos = (vConfig.images || comp.images || []).map((img) => ({
        url: typeof img === "string" ? img : img.url,
        caption: img.name || comp.name
      }));

      const l = lengthFt + lengthIn / 12;
      const h = heightFt + heightIn / 12;
      const sqft = parseFloat((l * h || 1).toFixed(3));
      const amount = Math.round(sqft * rate);

      const newItem = {
        name: comp.name,
        packageVariant: chosenVariant,
        typeVariant,
        lengthFt,
        lengthIn,
        heightFt,
        heightIn,
        depthFt,
        depthIn,
        qty: 1,
        description,
        sqft,
        rate,
        amount,
        photos
      };
      targetSpace.items.push(newItem);
    }

    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setSuccessToast(`Added ${customConfig?.name || comp.name} (${customConfig?.packageVariant || targetVariant || selectedPackage}) to ${targetSpace.name}!`);
    setTimeout(() => setSuccessToast(""), 2000);
  };

  // Change Item Package Variant dynamically (e.g. Standard -> Elite)
  const handleChangeItemPackageVariant = (itemIdx, newVariant) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    const targetSpace = updated.spaces[activeSpaceIdx];
    if (!targetSpace || !targetSpace.items[itemIdx]) return;

    const item = targetSpace.items[itemIdx];
    item.packageVariant = newVariant;

    if (newVariant !== "Custom") {
      const matchedComp = libraryComponents.find(
        (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
      );
      const baseRate = matchedComp?.standard?.rate || matchedComp?.rate || item.rate || 1500;
      const key = newVariant.toLowerCase();
      const vConfig = matchedComp ? matchedComp[key] : null;

      if (vConfig && (vConfig.rate || vConfig.unit?.rate)) {
        item.rate = vConfig.rate || vConfig.unit?.rate;
        if (vConfig.type) item.typeVariant = vConfig.type;
        if (vConfig.description) item.description = vConfig.description;
        if (vConfig.images?.length) {
          item.photos = vConfig.images.map((img) => ({
            url: typeof img === "string" ? img : img.url,
            caption: img.name || item.name
          }));
        }
      } else {
        if (newVariant === "Elite") {
          item.rate = Math.round(baseRate * 1.65);
          item.typeVariant = "Elite Acrylic & HDMR";
          item.description = `Elite Luxury specification for ${item.name}`;
        } else if (newVariant === "Premium") {
          item.rate = Math.round(baseRate * 1.30);
          item.typeVariant = "Premium Laminate & BWP";
          item.description = `Premium specification for ${item.name}`;
        } else {
          item.rate = baseRate;
          item.typeVariant = "Standard MR & Matte";
          item.description = `Standard specification for ${item.name}`;
        }
      }

      // Recalculate item amount and sqft
      const l = (Number(item.lengthFt) || 0) + (Number(item.lengthIn) || 0) / 12;
      const h = (Number(item.heightFt) || 0) + (Number(item.heightIn) || 0) / 12;
      const qty = Number(item.qty) || 1;
      item.sqft = l > 0 && h > 0 ? Number((l * h * qty).toFixed(3)) : item.sqft || 1;
      item.amount = Math.round(item.sqft * item.rate);
    }

    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setSuccessToast(`Switched ${item.name} to ${newVariant} (Rate: ₹${item.rate}/sqft)`);
    setTimeout(() => setSuccessToast(""), 2000);
  };

  // Bulk Apply Package Variant to active space or all rooms
  const handleApplyPackageToSpace = (newPkg, applyToAllSpaces = false) => {
    setSelectedPackage(newPkg);
    if (!activeBOQ) return;

    const updated = JSON.parse(JSON.stringify(activeBOQ));
    
    const updateSpaceItems = (sp) => {
      sp.items = sp.items.map((item) => {
        const matchedComp = libraryComponents.find(
          (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        const baseRate = matchedComp?.standard?.rate || matchedComp?.rate || item.rate || 1500;
        const key = newPkg.toLowerCase();
        const vConfig = matchedComp ? matchedComp[key] : null;

        let rate = item.rate;
        let typeVariant = item.typeVariant || "Box Standard";

        if (vConfig && (vConfig.rate || vConfig.unit?.rate)) {
          rate = vConfig.rate || vConfig.unit?.rate;
          if (vConfig.type) typeVariant = vConfig.type;
        } else {
          if (newPkg === "Elite") {
            rate = Math.round(baseRate * 1.65);
            typeVariant = "Elite Acrylic & HDMR";
          } else if (newPkg === "Premium") {
            rate = Math.round(baseRate * 1.30);
            typeVariant = "Premium Laminate & BWP";
          } else {
            rate = baseRate;
            typeVariant = "Standard MR & Matte";
          }
        }

        const l = (Number(item.lengthFt) || 0) + (Number(item.lengthIn) || 0) / 12;
        const h = (Number(item.heightFt) || 0) + (Number(item.heightIn) || 0) / 12;
        const qty = Number(item.qty) || 1;
        const sqft = l > 0 && h > 0 ? Number((l * h * qty).toFixed(3)) : item.sqft || 1;
        const amount = Math.round(sqft * rate);

        return {
          ...item,
          packageVariant: newPkg,
          typeVariant,
          rate,
          sqft,
          amount
        };
      });
    };

    if (applyToAllSpaces) {
      updated.spaces.forEach((sp) => updateSpaceItems(sp));
      updated.activePackage = newPkg;
      setSuccessToast(`Applied ${newPkg} Package to ALL spaces in BOQ!`);
    } else {
      if (updated.spaces[activeSpaceIdx]) {
        updateSpaceItems(updated.spaces[activeSpaceIdx]);
      }
      setSuccessToast(`Applied ${newPkg} Package to ${currentSpace.name}!`);
    }

    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setTimeout(() => setSuccessToast(""), 2500);
  };

  // Open Custom Mix Modal for a palette component
  const handleOpenCustomMix = (comp) => {
    setCustomMixComponent(comp);

    const eliteUnit = comp.elite?.unit || {};
    const eliteType = comp.elite?.type || "Box";
    const eliteRate = comp.elite?.rate || 2200;
    const eliteDesc = comp.elite?.description || comp.description || "";

    // Gather all candidate images
    const candidatePhotos = [
      ...(comp.elite?.images || []).map((i) => ({ ...i, variant: "Elite" })),
      ...(comp.premium?.images || []).map((i) => ({ ...i, variant: "Premium" })),
      ...(comp.standard?.images || []).map((i) => ({ ...i, variant: "Standard" })),
      ...(comp.images || []).map((i) => ({ ...i, variant: "General" }))
    ];

    setCustomMixState({
      dimSource: "Elite",
      typeSource: "Elite",
      rateSource: "Elite",
      descSource: "Elite",
      lengthFt: eliteUnit.lengthFt || 2,
      lengthIn: eliteUnit.lengthIn || 0,
      heightFt: eliteUnit.heightFt || 2,
      heightIn: eliteUnit.heightIn || 8,
      depthFt: eliteUnit.depthFt || 2,
      depthIn: eliteUnit.depthIn || 0,
      type: eliteType,
      rate: eliteRate,
      qty: 1,
      description: eliteDesc,
      selectedPhotos: candidatePhotos.slice(0, 1).map((p) => ({ url: p.url, caption: p.name || comp.name }))
    });
    setIsCustomMixModalOpen(true);
  };

  // Apply Custom Mix to Space
  const handleApplyCustomMix = () => {
    if (!customMixComponent || !activeBOQ) return;
    const sqft = parseFloat(
      (
        (customMixState.lengthFt + customMixState.lengthIn / 12) *
        (customMixState.heightFt + customMixState.heightIn / 12) || 1
      ).toFixed(3)
    );


    const amount = Math.round(sqft * customMixState.rate * (customMixState.qty || 1));

    const mixedItem = {
      name: customMixComponent.name,
      typeVariant: customMixState.type,
      lengthFt: customMixState.lengthFt,
      lengthIn: customMixState.lengthIn,
      heightFt: customMixState.heightFt,
      heightIn: customMixState.heightIn,
      depthFt: customMixState.depthFt,
      depthIn: customMixState.depthIn,
      qty: customMixState.qty || 1,
      description: customMixState.description,
      sqft,
      rate: customMixState.rate,
      amount,
      photos: customMixState.selectedPhotos
    };

    handleAddComponentToSpace(customMixComponent, mixedItem);
    setIsCustomMixModalOpen(false);
    
  };

  // Open Image Picker Modal for an existing line item in active space
  const handleOpenImagePicker = (itemIdx) => {
    const item = activeBOQ?.spaces?.[activeSpaceIdx]?.items?.[itemIdx];
    if (!item) return;

    setActiveItemImageIdx(itemIdx);
    setSelectedItemPhotos(item.photos ? [...item.photos] : []);

    // Look for matching component in library to suggest all its variant images
    const matchedComp = libraryComponents.find(
      (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
    );

    const collected = [];
    if (matchedComp) {
      (matchedComp.elite?.images || []).forEach((img) =>
        collected.push({ url: typeof img === "string" ? img : img.url, name: img.name, variant: "Elite" })
      );
      (matchedComp.premium?.images || []).forEach((img) =>
        collected.push({ url: typeof img === "string" ? img : img.url, name: img.name, variant: "Premium" })
      );
      (matchedComp.standard?.images || []).forEach((img) =>
        collected.push({ url: typeof img === "string" ? img : img.url, name: img.name, variant: "Standard" })
      );
      (matchedComp.images || []).forEach((img) =>
        collected.push({ url: typeof img === "string" ? img : img.url, name: img.name, variant: "General" })
      );
    }

    // Also include any photos currently on the item that might not be in library
    (item.photos || []).forEach((p) => {
      if (!collected.some((c) => c.url === p.url)) {
        collected.push({ url: p.url, name: p.caption || "Attached photo", variant: "Line Item" });
      }
    });

    setAvailableLibraryImages(collected);
    setIsImagePickerModalOpen(true);
  };

  // Toggle selection of photo in Image Picker modal
  const handleToggleSelectPhoto = (photoObj) => {
    setSelectedItemPhotos((prev) => {
      const exists = prev.some((p) => p.url === photoObj.url);
      if (exists) {
        return prev.filter((p) => p.url !== photoObj.url);
      } else {
        return [...prev, { url: photoObj.url, caption: photoObj.name || photoObj.variant || "Attached photo" }];
      }
    });
  };

  // Upload a new photo on-the-spot in Image Picker modal
  const handleUploadNewPhotoForItem = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await erpApi.uploadImage(file);
      const newPhoto = {
        url: res.imageUrl || res.url,
        caption: res.originalName || file.name
      };
      setAvailableLibraryImages((prev) => [
        { url: newPhoto.url, name: newPhoto.caption, variant: "Uploaded" },
        ...prev
      ]);
      setSelectedItemPhotos((prev) => [...prev, newPhoto]);
    } catch (err) {
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = null;
    }
  };

  // Direct upload photo for a specific BOQ table row item
  const handleDirectUploadItemPhoto = async (itemIdx, file) => {
    if (!file || !activeBOQ) return;
    setUploadingRowIdx(itemIdx);
    try {
      const res = await erpApi.uploadImage(file);
      const photoUrl = res.imageUrl || res.url;
      const caption = res.originalName || file.name;
      const newPhoto = { url: photoUrl, caption };

      const updated = JSON.parse(JSON.stringify(activeBOQ));
      const targetSpace = updated.spaces[activeSpaceIdx];
      if (targetSpace && targetSpace.items[itemIdx]) {
        const item = targetSpace.items[itemIdx];
        if (!item.photos) item.photos = [];
        item.photos.push(newPhoto);

        // Also sync photo to library component if found
        const matchedComp = libraryComponents.find(
          (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        if (matchedComp) {
          const pkgKey = (item.packageVariant || selectedPackage || "standard").toLowerCase();
          const compCopy = JSON.parse(JSON.stringify(matchedComp));
          if (compCopy[pkgKey]) {
            if (!compCopy[pkgKey].images) compCopy[pkgKey].images = [];
            compCopy[pkgKey].images.push({ url: photoUrl, name: caption });
          }
          if (!compCopy.images) compCopy.images = [];
          compCopy.images.push({ url: photoUrl, name: caption });

          if (compCopy._id && !compCopy._id.startsWith("comp")) {
            try {
              await erpApi.updateComponent(compCopy._id, compCopy);
            } catch {
              // Ignore DB sync error
            }
          }
          setLibraryComponents((prev) =>
            prev.map((c) => (c.name === compCopy.name ? compCopy : c))
          );
        }

        const recalculated = recalculateBOQ(updated);
        setActiveBOQ(recalculated);
        setSuccessToast(`Photo uploaded and attached to ${item.name}!`);
        setTimeout(() => setSuccessToast(""), 2500);
      }
    } catch (err) {
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setUploadingRowIdx(null);
    }
  };

  // Direct upload photo from Palette component card
  const handleDirectUploadComponentPhoto = async (comp, file) => {
    if (!file) return;
    const compId = comp._id || comp.name;
    setUploadingCompId(compId);
    try {
      const res = await erpApi.uploadImage(file);
      const photoUrl = res.imageUrl || res.url;
      const caption = res.originalName || file.name;
      const newImg = { url: photoUrl, name: caption };

      const updatedComp = JSON.parse(JSON.stringify(comp));
      const pkgKey = selectedPackage.toLowerCase();
      if (updatedComp[pkgKey]) {
        if (!updatedComp[pkgKey].images) updatedComp[pkgKey].images = [];
        updatedComp[pkgKey].images.push(newImg);
      }
      if (!updatedComp.images) updatedComp.images = [];
      updatedComp.images.push(newImg);

      if (updatedComp._id && !updatedComp._id.startsWith("comp")) {
        try {
          await erpApi.updateComponent(updatedComp._id, updatedComp);
        } catch {
          // Ignore
        }
      }

      setLibraryComponents((prev) =>
        prev.map((c) => (c.name === comp.name || c._id === comp._id ? updatedComp : c))
      );

      setSuccessToast(`Photo attached to ${comp.name} in library!`);
      setTimeout(() => setSuccessToast(""), 2500);
    } catch (err) {
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setUploadingCompId(null);
    }
  };

  // Upload photo inside Custom Mix modal
  const handleUploadCustomMixPhoto = async (file) => {
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await erpApi.uploadImage(file);
      const newPhoto = {
        url: res.imageUrl || res.url,
        caption: res.originalName || file.name
      };
      setCustomMixState((prev) => ({
        ...prev,
        selectedPhotos: [...prev.selectedPhotos, newPhoto]
      }));
      setSuccessToast("Photo attached to custom mix!");
      setTimeout(() => setSuccessToast(""), 2000);
    } catch (err) {
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save selected photos into line item
  const handleSaveSelectedPhotos = async () => {
    if (activeItemImageIdx === null || !activeBOQ) return;
    const item = activeBOQ?.spaces?.[activeSpaceIdx]?.items?.[activeItemImageIdx];
    handleUpdateItemField(activeItemImageIdx, "photos", selectedItemPhotos);

    // Sync to component library if enabled
    if (syncToLibrary && item && selectedItemPhotos.length > 0) {
      const matchedComp = libraryComponents.find(
        (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
      );
      if (matchedComp) {
        const compCopy = JSON.parse(JSON.stringify(matchedComp));
        const pkgKey = (item.packageVariant || selectedPackage || "standard").toLowerCase();
        if (!compCopy[pkgKey]) compCopy[pkgKey] = {};
        if (!compCopy[pkgKey].images) compCopy[pkgKey].images = [];

        selectedItemPhotos.forEach((p) => {
          if (!compCopy[pkgKey].images.some((i) => i.url === p.url)) {
            compCopy[pkgKey].images.push({ url: p.url, name: p.caption || item.name });
          }
        });

        if (compCopy._id && !compCopy._id.startsWith("comp")) {
          try {
            await erpApi.updateComponent(compCopy._id, compCopy);
          } catch {
            // Ignore
          }
        }
        setLibraryComponents((prev) =>
          prev.map((c) => (c.name === compCopy.name ? compCopy : c))
        );
      }
    }

    setIsImagePickerModalOpen(false);
    setActiveItemImageIdx(null);
    setSuccessToast("Updated item photos!");
    setTimeout(() => setSuccessToast(""), 2000);
  };

  // Remove Item from Space
  const handleRemoveItem = (itemIdx) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    updated.spaces[activeSpaceIdx].items.splice(itemIdx, 1);
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
  };

  // Add New Space / Room Tab manually
  const handleAddNewSpace = () => {
    if (!newSpaceName.trim() || !activeBOQ) return;
    const name = newSpaceName.trim();
    const updated = JSON.parse(JSON.stringify(activeBOQ));

    // Automatically populate preset pre-priced items for this room type
    const initialItems = getDefaultItemsForSpace(name);
    let spaceSum = 0;
    initialItems.forEach((item) => {
      spaceSum += (item.amount || 0);
    });

    updated.spaces.push({
      name,
      roomTotal: spaceSum,
      items: initialItems
    });

    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(updated.spaces.length - 1);
    setNewSpaceName("");
    setIsAddSpaceOpen(false);
    setSuccessToast(`Added ${name} space with pre-set items!`);
    setTimeout(() => setSuccessToast(""), 2500);
  };

  // Duplicate current space
  const handleDuplicateSpace = () => {
    if (!activeBOQ || !currentSpace) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    const cloned = JSON.parse(JSON.stringify(currentSpace));
    cloned.name = `${currentSpace.name} (Copy)`;
    updated.spaces.push(cloned);
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(updated.spaces.length - 1);
  };

  // Delete current space
  const handleDeleteCurrentSpace = () => {
    if (!activeBOQ || activeBOQ.spaces.length <= 1) {
      alert("At least one space is required in the BOQ.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${currentSpace.name}?`)) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    updated.spaces.splice(activeSpaceIdx, 1);
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(Math.max(0, activeSpaceIdx - 1));
  };

  // Save BOQ to API & return to list view
  const handleSaveBOQ = async () => {
    if (!activeBOQ) return;
    try {
      if (activeBOQ._id && !activeBOQ._id.startsWith("temp_") && !activeBOQ._id.startsWith("boq_")) {
        await erpApi.updateBOQ(activeBOQ._id, activeBOQ);
      } else {
        await erpApi.createBOQ(activeBOQ);
      }
      // Update local state list so it displays immediately
      setBoqList((prev) => {
        const idx = prev.findIndex((b) => b._id === activeBOQ._id || b.enquiryNo === activeBOQ.enquiryNo);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = activeBOQ;
          return copy;
        }
        return [activeBOQ, ...prev];
      });
      setSuccessToast("BOQ saved successfully!");
      fetchBOQList();
      setViewMode("list");
      setActiveBOQ(null);
      setTimeout(() => setSuccessToast(""), 3500);
    } catch {
      setBoqList((prev) => {
        const idx = prev.findIndex((b) => b._id === activeBOQ._id || b.enquiryNo === activeBOQ.enquiryNo);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = activeBOQ;
          return copy;
        }
        return [activeBOQ, ...prev];
      });
      setSuccessToast("BOQ saved successfully!");
      setViewMode("list");
      setActiveBOQ(null);
      setTimeout(() => setSuccessToast(""), 3500);
    }
  };

  // Live Component Search Autocomplete Suggestions
  const suggestedComponents = useMemo(() => {
    if (!componentSearch || !componentSearch.trim()) return [];
    const q = componentSearch.trim().toLowerCase();
    return libraryComponents.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const spaceMatch = c.relevantSpace?.toLowerCase().includes(q);
      const variantMatch = c.variant?.toLowerCase().includes(q);
      return nameMatch || spaceMatch || variantMatch;
    });
  }, [libraryComponents, componentSearch]);

  // Filtered Component Palette with Smart Fuzzy Room Matching
  const relevantComponents = useMemo(() => {
    const spaceName = (currentSpace?.name || "").toLowerCase();
    const matched = libraryComponents.filter((c) => {
      const matchesSearch =
        !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase());
      const relSpace = (c.relevantSpace || "").toLowerCase();

      const isRelevant =
        relSpace.includes(spaceName) ||
        spaceName.includes(relSpace) ||
        (spaceName.includes("entrance") && relSpace.includes("entrance")) ||
        (spaceName.includes("foyer") && relSpace.includes("entrance")) ||
        (spaceName.includes("kitchen") && relSpace.includes("kitchen")) ||
        (spaceName.includes("living") && relSpace.includes("living")) ||
        (spaceName.includes("bed") && relSpace.includes("bed")) ||
        (spaceName.includes("dining") && relSpace.includes("dining")) ||
        (spaceName.includes("puja") && relSpace.includes("puja")) ||
        (spaceName.includes("pooja") && relSpace.includes("pooja"));

      return matchesSearch && isRelevant;
    });

    // If no specific components match the current space name, return all library components
    if (matched.length === 0) {
      return libraryComponents.filter((c) =>
        !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase())
      );
    }

    return matched;
  }, [libraryComponents, currentSpace, componentSearch]);

  const otherComponents = useMemo(() => {
    const spaceName = (currentSpace?.name || "").toLowerCase();
    return libraryComponents.filter((c) => {
      const matchesSearch =
        !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase());
      const isAlreadyInRelevant = relevantComponents.some((r) => r.name === c.name);
      return matchesSearch && !isAlreadyInRelevant;
    });
  }, [libraryComponents, currentSpace, componentSearch, relevantComponents]);

  // Filtered Enquiries in Modal
  const filteredEnquiries = useMemo(() => {
    if (!clientSearchQuery) return enquiryList;
    const q = clientSearchQuery.toLowerCase();
    return enquiryList.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.enquiryNo?.toLowerCase().includes(q) ||
        c.projectType?.toLowerCase().includes(q)
    );
  }, [enquiryList, clientSearchQuery]);

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // =========================================================================
  // VIEW 1: BOQ LIST PAGE (Screenshot 1)
  // =========================================================================
  if (viewMode === "list") {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {successToast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#9E7B1D] text-white text-xs font-bold rounded-xl shadow-lg animate-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        <div className="bg-white border border-[#EAE3D2] rounded-2xl shadow-xs overflow-hidden">
          {/* Top Toolbar (Screenshot 1) */}
          <div className="p-4 sm:p-5 border-b border-[#EAE3D2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by Name, Phone, Email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:bg-white transition"
              />
            </div>

            {/* Total Count & + New BOQ Button */}
            <div className="flex items-center gap-4 justify-between sm:justify-end">
              <div className="text-xs font-bold text-stone-800 select-none">
                <span>{pagination.total || boqList.length}</span>{" "}
                <span className="text-stone-500 font-normal">BOQ</span>
              </div>

              <button
                onClick={handleOpenCreateBOQModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0088FF] bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>New BOQ</span>
              </button>
            </div>
          </div>

          {/* BOQ Data Table (Screenshot 1) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-stone-700 text-xs font-bold">
                <tr>
                  <th className="py-3.5 px-4">Enquiry No</th>
                  <th className="py-3.5 px-4">Enquiry Date</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 text-center">No. of Space</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EBE0] text-xs text-stone-700">
                {loadingList ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      Loading BOQ entries...
                    </td>
                  </tr>
                ) : boqList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No BOQ records found. Click "+ New BOQ" to create one.
                    </td>
                  </tr>
                ) : (
                  boqList.map((row) => (
                    <tr key={row._id} className="hover:bg-amber-50/20 transition">
                      {/* Enquiry No Link */}
                      <td className="py-3.5 px-4 font-bold text-teal-600 hover:text-teal-700 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenBuilder(row)}
                          className="hover:underline cursor-pointer font-mono"
                        >
                          {row.enquiryNo || row.boqNumber || "ENQ-2026-001"}
                        </button>
                      </td>

                      {/* Enquiry Date */}
                      <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap">
                        {formatDate(row.enquiryDate || row.createdAt)}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <span
                          className="hover:text-blue-600 cursor-pointer transition"
                          onClick={() => handleOpenBuilder(row)}
                        >
                          {row.clientName}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-stone-500 font-mono">
                        {row.clientEmail || "-"}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-stone-700 font-mono">
                        {row.clientPhone || "-"}
                      </td>

                      {/* No. of Space */}
                      <td className="py-3.5 px-4 text-center font-bold text-stone-800">
                        {String(row.spaces?.length || row.numberOfSpaces || 0).padStart(2, "0")}
                      </td>

                      {/* Actions (Screenshot 1) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenQuotationModal(row)}
                            title="Generate & View Official Quotation"
                            className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenBuilder(row)}
                            title="Edit Space & Components"
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenBuilder(row)}
                            title="More Options"
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-5 py-3.5 border-t border-[#EAE3D2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 bg-[#FAF9F5]">
            <span className="text-stone-400">
              Showing {boqList.length} of {pagination.total || boqList.length} entries
            </span>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                  className="h-8 px-2 bg-white border border-[#EAE3D2] rounded-lg text-xs text-stone-800 font-semibold focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="font-semibold text-stone-700">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total || boqList.length)} of{" "}
                {pagination.total || boqList.length}
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 transition"
                >
                  <ChevronsLeft size={15} />
                </button>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 transition"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: pagination.pages }))}
                  className="p-1 rounded-lg border border-[#EAE3D2] bg-white text-stone-600 hover:bg-amber-50 disabled:opacity-30 transition"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL: SELECT ENQUIRY TO CONTINUE (Exact Replica of User Reference Image) */}
        {/* ========================================================================= */}
        {isSelectClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-4">
              {/* Search by Name, Phone, Email Pill Input */}
              <div className="relative w-full">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, Email"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-stone-300 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              {/* Subtitle: Select Enquiry to continue */}
              <p className="text-center text-xs font-semibold text-stone-600">
                Select Enquiry to continue
              </p>

              {/* Enquiry Cards List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredEnquiries.map((enquiry) => (
                  <div
                    key={enquiry._id || enquiry.enquiryNo}
                    onClick={() => handleSelectEnquiryToCreateBOQ(enquiry)}
                    className="p-3.5 bg-white border border-stone-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl flex items-center gap-3.5 cursor-pointer transition shadow-2xs group"
                  >
                    {/* Circle Avatar with First Letter */}
                    <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm shrink-0 uppercase group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                      {enquiry.name ? enquiry.name.charAt(0) : "E"}
                    </div>

                    {/* Name and Enquiry Number */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-blue-600 transition">
                        {enquiry.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono truncate">
                        {enquiry.enquiryNo || "ENQ-2026-019"}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredEnquiries.length === 0 && (
                  <div className="p-6 text-center text-stone-400 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    No matching enquiries found.
                  </div>
                )}
              </div>

              {/* Bottom Right Close Button (Screenshot Reference) */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSelectClientModalOpen(false)}
                  className="px-6 py-1.5 text-xs font-bold text-blue-600 border border-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: MEASUREMENT UNIT (Screenshot 1 Reference) */}
        {/* ========================================================================= */}
        {isMeasurementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-5 animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 mx-auto">Measurement Unit</h3>
                <button
                  onClick={() => setIsMeasurementModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 -mr-2"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Radio Selection: Feet.inch vs Millimeter (Screenshot 1) */}
              <div className="space-y-3 pt-1">
                <span className="block text-xs font-semibold text-stone-700">Select Unit</span>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-stone-800 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="measurementUnit"
                      value="Feet.inch"
                      checked={measurementUnit === "Feet.inch"}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Feet.inch</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-stone-800 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="measurementUnit"
                      value="Millimeter"
                      checked={measurementUnit === "Millimeter"}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Millimeter</span>
                  </label>
                </div>

                {/* Note (Screenshot 1) */}
                <p className="text-[11px] text-stone-500 leading-relaxed pt-2">
                  Note: This unit will be applied to all the measurements and calculations in this BOQ.
                </p>
              </div>

              {/* Buttons (Screenshot 1) */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeasurementModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMeasurementUnit}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: BOQ SPACE & COMPONENT BUILDER (DIRECT WORKSPACE UI)
  // =========================================================================
  return (
    <div className="relative min-h-[calc(100vh-80px)] space-y-3 animate-in fade-in duration-150">
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[#9E7B1D] text-white text-xs font-bold rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border border-[#EAE3D2] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Back button & Category tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setViewMode("list")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-blue-600 bg-stone-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-stone-200 transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>BOQ</span>
          </button>

          {/* Categories: Component, Accessories, Appliances, Other Services */}
          <div className="flex items-center gap-1 p-0.5 bg-[#FAF9F5] rounded-xl border border-[#EAE3D2]">
            {["Component", "Accessories", "Appliances", "Other Services"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeCategory === cat
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-950"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Client Name & BOQ Total */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">Name</span>
            <span className="text-xs font-extrabold text-stone-900">{activeBOQ?.clientName || "Client"}</span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">BOQ Total</span>
            <div className="flex items-center gap-1 text-sm font-black text-[#9E7B1D]">
              <span>₹{(activeBOQ?.grandTotal || 0).toLocaleString("en-IN")}</span>
              <ChevronDown size={14} className="text-stone-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenQuotationModal(activeBOQ)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
            title="Generate & View Official Quotation"
          >
            <FileText size={13} />
            <span>Quotation</span>
          </button>

          <button
            onClick={handleSaveBOQ}
            className="px-4 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl shadow-xs transition cursor-pointer"
          >
            Apply
          </button>

          <button
            onClick={() => setIsAddSpaceOpen(true)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Space</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Clear all items in current space?")) {
                const updated = JSON.parse(JSON.stringify(activeBOQ));
                updated.spaces[activeSpaceIdx].items = [];
                setActiveBOQ(recalculateBOQ(updated));
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={handleSaveBOQ}
            className="inline-flex items-center gap-1.5 px-6 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save size={13} />
            <span>Save</span>
          </button>

          {/* Auto Save Toggle */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500">Auto Save</span>
            <button
              type="button"
              onClick={() => setAutoSave(!autoSave)}
              className={`w-8 h-4 flex items-center rounded-full p-0.5 transition cursor-pointer ${autoSave ? "bg-blue-600" : "bg-stone-300"
                }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-xs transform transition ${autoSave ? "translate-x-4" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Spaces Horizontal Tabs Bar */}
      <div className="bg-white border border-[#EAE3D2] rounded-xl p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {activeBOQ?.spaces?.map((space, sIdx) => {
            const isActive = sIdx === activeSpaceIdx;
            return (
              <button
                key={sIdx}
                onClick={() => setActiveSpaceIdx(sIdx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${isActive
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs"
                  : "bg-[#FAF9F5] text-stone-600 hover:bg-amber-50/60 hover:text-stone-900 border border-[#EAE3D2]"
                  }`}
              >
                <GripVertical size={12} className={isActive ? "text-stone-950/60" : "text-stone-400"} />
                <span>{space.name}</span>
                {space.roomTotal > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isActive ? "bg-stone-950/15 text-stone-950" : "bg-amber-50 text-[#9E7B1D]"}`}>
                    ₹{Math.round(space.roomTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Components Palette */}
        <div className="lg:col-span-3 bg-white border border-[#EAE3D2] rounded-2xl p-4 shadow-xs space-y-4">
          {/* Search Component with Live Autocomplete Suggestions */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search Component (e.g. living, shoe, bed)"
              value={componentSearch}
              onChange={(e) => {
                setComponentSearch(e.target.value);
                setIsComponentSearchFocused(true);
              }}
              onFocus={() => setIsComponentSearchFocused(true)}
              className="w-full pl-8 pr-8 py-2 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:bg-white transition"
            />
            {componentSearch && (
              <button
                type="button"
                onClick={() => setComponentSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}

            {/* Live Autocomplete Suggestions Dropdown */}
            {isComponentSearchFocused && componentSearch.trim().length > 0 && (
              <div
                className="absolute left-0 right-0 top-10 z-50 bg-white rounded-2xl shadow-2xl border border-amber-200 p-2 space-y-1.5 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsComponentSearchFocused(false)}
              >
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black text-amber-800 bg-amber-50 rounded-lg">
                  <span>SUGGESTED COMPONENTS FOR "{componentSearch.toUpperCase()}"</span>
                  <span>{suggestedComponents.length} Found</span>
                </div>

                {suggestedComponents.length === 0 ? (
                  <div className="p-3 text-center text-stone-400 text-xs">
                    No components found matching "{componentSearch}".
                  </div>
                ) : (
                  suggestedComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50/50 transition text-xs space-y-1 bg-white shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{comp.name}</span>
                        <span className="text-[9.5px] text-[#9E7B1D] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-extrabold">
                          {comp.relevantSpace || "General"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddComponentToSpace(comp, null, "Elite");
                            setIsComponentSearchFocused(false);
                          }}
                          className="px-2 py-0.5 text-[9.5px] font-black rounded bg-amber-100 text-amber-900 hover:bg-[#D4AF37] hover:text-stone-950 transition cursor-pointer"
                        >
                          + Elite
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddComponentToSpace(comp, null, "Premium");
                            setIsComponentSearchFocused(false);
                          }}
                          className="px-2 py-0.5 text-[9.5px] font-black rounded bg-sky-100 text-sky-900 hover:bg-sky-500 hover:text-white transition cursor-pointer"
                        >
                          + Premium
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddComponentToSpace(comp, null, "Standard");
                            setIsComponentSearchFocused(false);
                          }}
                          className="px-2 py-0.5 text-[9.5px] font-black rounded bg-stone-100 text-stone-700 hover:bg-stone-800 hover:text-white transition cursor-pointer"
                        >
                          + Standard
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Relevant Components Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#9E7B1D] uppercase tracking-wider">
              Relevant Components
            </h4>
            <div className="space-y-2">
              {relevantComponents.map((comp, idx) => {
                const availableVariants = comp.selectedVariants?.length
                  ? comp.selectedVariants
                  : ["Elite", "Premium", "Standard"];
                const imgCount = (comp.elite?.images?.length || 0) + (comp.premium?.images?.length || 0) + (comp.standard?.images?.length || 0) + (comp.images?.length || 0);

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 transition group text-xs bg-white shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {imgCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded shrink-0" title={`${imgCount} photos available`}>
                            <Camera size={9} />
                            <span>{imgCount}</span>
                          </span>
                        )}
                        <span className="font-semibold text-stone-900 truncate">{comp.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <label
                          className="p-1 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-[#9E7B1D] transition cursor-pointer shadow-2xs shrink-0"
                          title={`Upload image for ${comp.name}`}
                        >
                          {uploadingCompId === (comp._id || comp.name) ? (
                            <Loader2 size={12} className="animate-spin text-[#9E7B1D]" />
                          ) : (
                            <Upload size={12} />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingCompId === (comp._id || comp.name)}
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleDirectUploadComponentPhoto(comp, e.target.files[0]);
                              e.target.value = null;
                            }}
                          />
                        </label>

                        <button
                          onClick={() => handleOpenCustomMix(comp)}
                          className="p-1 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-[#9E7B1D] transition cursor-pointer shadow-2xs shrink-0"
                          title={`Custom Mix for ${comp.name}`}
                        >
                          <SlidersHorizontal size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Variant Specific Action Buttons based on component configuration */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {availableVariants.includes("Elite") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Elite")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-50 text-[#9E7B1D] hover:bg-[#D4AF37] hover:text-stone-950 border border-amber-200 transition cursor-pointer"
                          title={`Add Elite variant (₹${comp.elite?.rate || 2200})`}
                        >
                          + Elite
                        </button>
                      )}
                      {availableVariants.includes("Premium") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Premium")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-sky-50 text-sky-800 hover:bg-sky-500 hover:text-white border border-sky-200 transition cursor-pointer"
                          title={`Add Premium variant (₹${comp.premium?.rate || 1800})`}
                        >
                          + Premium
                        </button>
                      )}
                      {availableVariants.includes("Standard") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Standard")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-stone-100 text-stone-700 hover:bg-stone-800 hover:text-white border border-stone-300 transition cursor-pointer"
                          title={`Add Standard variant (₹${comp.standard?.rate || 1500})`}
                        >
                          + Standard
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {relevantComponents.length === 0 && (
                <p className="text-[11px] text-stone-400 italic py-1">No space-specific items</p>
              )}
            </div>
          </div>

          {/* Other Components Section */}
          <div className="space-y-2 pt-2 border-t border-[#EAE3D2]">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Other Components
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {otherComponents.map((comp, idx) => {
                const availableVariants = comp.selectedVariants?.length
                  ? comp.selectedVariants
                  : ["Elite", "Premium", "Standard"];
                const imgCount = (comp.elite?.images?.length || 0) + (comp.premium?.images?.length || 0) + (comp.standard?.images?.length || 0) + (comp.images?.length || 0);

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 transition group text-xs bg-white shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {imgCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded shrink-0" title={`${imgCount} photos available`}>
                            <Camera size={9} />
                            <span>{imgCount}</span>
                          </span>
                        )}
                        <span className="font-semibold text-stone-900 truncate">{comp.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <label
                          className="p-1 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-[#9E7B1D] transition cursor-pointer shadow-2xs shrink-0"
                          title={`Upload image for ${comp.name}`}
                        >
                          {uploadingCompId === (comp._id || comp.name) ? (
                            <Loader2 size={12} className="animate-spin text-[#9E7B1D]" />
                          ) : (
                            <Upload size={12} />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingCompId === (comp._id || comp.name)}
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleDirectUploadComponentPhoto(comp, e.target.files[0]);
                              e.target.value = null;
                            }}
                          />
                        </label>

                        <button
                          onClick={() => handleOpenCustomMix(comp)}
                          className="p-1 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-[#9E7B1D] transition cursor-pointer shadow-2xs shrink-0"
                          title={`Custom Mix for ${comp.name}`}
                        >
                          <SlidersHorizontal size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Variant Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {availableVariants.includes("Elite") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Elite")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-50 text-[#9E7B1D] hover:bg-[#D4AF37] hover:text-stone-950 border border-amber-200 transition cursor-pointer"
                          title={`Add Elite variant (₹${comp.elite?.rate || 2200})`}
                        >
                          + Elite
                        </button>
                      )}
                      {availableVariants.includes("Premium") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Premium")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-sky-50 text-sky-800 hover:bg-sky-500 hover:text-white border border-sky-200 transition cursor-pointer"
                          title={`Add Premium variant (₹${comp.premium?.rate || 1800})`}
                        >
                          + Premium
                        </button>
                      )}
                      {availableVariants.includes("Standard") && (
                        <button
                          onClick={() => handleAddComponentToSpace(comp, null, "Standard")}
                          className="px-2 py-0.5 text-[10px] font-black rounded-md bg-stone-100 text-stone-700 hover:bg-stone-800 hover:text-white border border-stone-300 transition cursor-pointer"
                          title={`Add Standard variant (₹${comp.standard?.rate || 1500})`}
                        >
                          + Standard
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Space Components Table */}
        <div className="lg:col-span-9 bg-white border border-[#EAE3D2] rounded-2xl p-4 shadow-xs space-y-4">
          {/* Room Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE3D2]">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-stone-900">{currentSpace?.name || "Space"}</h3>
              <span className="text-sm font-black text-[#9E7B1D]">
                ₹{(currentSpace?.roomTotal || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Room Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDuplicateSpace}
                title="Duplicate Space"
                className="p-1.5 text-stone-500 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
              >
                <Copy size={15} />
              </button>
              <button
                onClick={handleDeleteCurrentSpace}
                title="Delete Space"
                className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Subheader: Components Label & Package Variant Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-stone-800">Components</span>
              <button title="Copy Component Selection" className="text-stone-400 hover:text-[#9E7B1D]">
                <Copy size={13} />
              </button>
            </div>

            {/* Default Package Selector with Bulk Apply Action */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-semibold">Default Package:</span>
              <select
                value={selectedPackage}
                onChange={(e) => handleApplyPackageToSpace(e.target.value, false)}
                className="h-8 px-2.5 bg-[#FAF9F5] border border-[#EAE3D2] rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                title="Change package for items in this space"
              >
                <option value="Standard">Standard Package</option>
                <option value="Premium">Premium Package</option>
                <option value="Elite">Elite Luxury Package</option>
              </select>

              <button
                type="button"
                onClick={() => handleApplyPackageToSpace(selectedPackage, true)}
                className="h-8 px-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] hover:opacity-95 text-stone-950 font-black text-[10.5px] rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                title="Apply selected package tier to ALL rooms in this BOQ estimate"
              >
                <Zap size={11} className="fill-stone-950" />
                <span>Apply to All Rooms</span>
              </button>
            </div>
          </div>

          {/* Components Dimension & Calculation Table */}
          <div className="overflow-x-auto border border-[#EAE3D2] rounded-xl">
            <table className="w-full text-left border-collapse min-w-[1020px]">
              <thead className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-[11px] font-bold text-stone-700">
                <tr>
                  <th className="py-2.5 px-2 w-8 text-center text-stone-400"></th>
                  <th className="py-2.5 px-3 min-w-[130px]">Name</th>
                  <th className="py-2.5 px-2 min-w-[100px]">Package / Variant</th>
                  <th className="py-2.5 px-2 min-w-[90px]">Type</th>
                  <th className="py-2.5 px-2 text-center min-w-[95px]">Length (ft & in)</th>
                  <th className="py-2.5 px-2 text-center min-w-[95px]">Height (ft & in)</th>
                  <th className="py-2.5 px-2 text-center min-w-[95px]">Depth (ft & in)</th>
                  <th className="py-2.5 px-2 text-center w-12">Qty</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Description</th>
                  <th className="py-2.5 px-2 text-right w-14">Sq.ft</th>
                  <th className="py-2.5 px-2 text-right min-w-[85px]">Rate (sq.ft)</th>
                  <th className="py-2.5 px-2 text-right min-w-[85px]">Amount</th>
                  <th className="py-2.5 px-2 text-center w-16">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EBE0] text-xs text-stone-800">
                {!currentSpace?.items || currentSpace.items.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-stone-400">
                      No components added in {currentSpace?.name || "this space"}. Pick any variant from the left palette to add.
                    </td>
                  </tr>
                ) : (
                  currentSpace.items.map((item, idx) => {
                    const matchedComp = libraryComponents.find(
                      (c) => c.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
                    );
                    const itemVariants = matchedComp?.selectedVariants?.length
                      ? matchedComp.selectedVariants
                      : ["Elite", "Premium", "Standard"];

                    return (
                      <tr key={idx} className="hover:bg-amber-50/20 transition">
                        {/* Drag Handle */}
                        <td className="py-2 px-2 text-center text-stone-300">
                          <GripVertical size={13} className="mx-auto cursor-grab" />
                        </td>

                        {/* Name with Image Thumbnail Preview & Direct Upload Option */}
                        <td className="py-2 px-3 font-semibold text-stone-900">
                          <div className="flex items-center gap-2">
                            {item.photos && item.photos.length > 0 ? (
                              <div className="relative group/photo shrink-0">
                                <div
                                  onClick={() => handleOpenImagePicker(idx)}
                                  className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-300 bg-stone-100 cursor-pointer hover:opacity-85 shadow-2xs"
                                  title={`${item.photos.length} image(s) attached. Click to select/change.`}
                                >
                                  <img
                                    src={item.photos[0]?.url}
                                    alt="thumb"
                                    className="w-full h-full object-cover"
                                  />
                                  {item.photos.length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-stone-900/80 text-white text-[8px] px-1 font-bold rounded-tl">
                                      {item.photos.length}
                                    </span>
                                  )}
                                </div>

                                {/* Hover Quick Add Extra Photo */}
                                <label
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4AF37] hover:bg-[#b8952b] text-stone-950 rounded-full flex items-center justify-center cursor-pointer shadow-xs opacity-0 group-hover/photo:opacity-100 transition"
                                  title="Upload additional photo for this item"
                                >
                                  {uploadingRowIdx === idx ? (
                                    <Loader2 size={9} className="animate-spin" />
                                  ) : (
                                    <Plus size={9} />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingRowIdx === idx}
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleDirectUploadItemPhoto(idx, e.target.files[0]);
                                      e.target.value = null;
                                    }}
                                  />
                                </label>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Direct Instant Upload Button when no image is added */}
                                <label
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50/90 hover:bg-amber-100 text-[#9E7B1D] border border-dashed border-amber-300 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-2xs select-none"
                                  title="Product image not added. Click to directly upload an image from your device."
                                >
                                  {uploadingRowIdx === idx ? (
                                    <Loader2 size={11} className="animate-spin text-[#9E7B1D]" />
                                  ) : (
                                    <Upload size={11} />
                                  )}
                                  <span>+ Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingRowIdx === idx}
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleDirectUploadItemPhoto(idx, e.target.files[0]);
                                      e.target.value = null;
                                    }}
                                  />
                                </label>
                              </div>
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                        </td>

                        {/* Package / Variant Selector per line item */}
                        <td className="py-2 px-2">
                          <select
                            value={item.packageVariant || "Standard"}
                            onChange={(e) => handleChangeItemPackageVariant(idx, e.target.value)}
                            className={`w-full h-7 px-1.5 border rounded text-[11px] font-extrabold transition cursor-pointer ${item.packageVariant === "Elite"
                              ? "bg-amber-50 text-[#9E7B1D] border-amber-300"
                              : item.packageVariant === "Premium"
                                ? "bg-sky-50 text-sky-800 border-sky-300"
                                : item.packageVariant === "Custom"
                                  ? "bg-purple-50 text-purple-800 border-purple-300"
                                  : "bg-stone-50 text-stone-800 border-stone-300"
                              }`}
                          >
                            {itemVariants.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                            <option value="Custom">Custom</option>
                          </select>
                        </td>

                        {/* Type */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.typeVariant || "Box Standard"}
                            onChange={(e) => handleUpdateItemField(idx, "typeVariant", e.target.value)}
                            className="w-full h-7 px-2 bg-white border border-[#EAE3D2] rounded text-xs text-stone-700"
                          />
                        </td>

                        {/* Length (ft & inch) */}
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              value={item.lengthFt}
                              onChange={(e) => handleUpdateItemField(idx, "lengthFt", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Feet"
                            />
                            <input
                              type="number"
                              value={item.lengthIn}
                              onChange={(e) => handleUpdateItemField(idx, "lengthIn", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Inches"
                            />
                          </div>
                        </td>

                        {/* Height (ft & inch) */}
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              value={item.heightFt}
                              onChange={(e) => handleUpdateItemField(idx, "heightFt", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Feet"
                            />
                            <input
                              type="number"
                              value={item.heightIn}
                              onChange={(e) => handleUpdateItemField(idx, "heightIn", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Inches"
                            />
                          </div>
                        </td>

                        {/* Depth (ft & inch) */}
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              value={item.depthFt}
                              onChange={(e) => handleUpdateItemField(idx, "depthFt", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Feet"
                            />
                            <input
                              type="number"
                              value={item.depthIn}
                              onChange={(e) => handleUpdateItemField(idx, "depthIn", Number(e.target.value))}
                              className="w-10 h-7 text-center bg-white border border-[#EAE3D2] rounded text-xs"
                              title="Inches"
                            />
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={1}
                            value={item.qty || 1}
                            onChange={(e) => handleUpdateItemField(idx, "qty", Number(e.target.value))}
                            className="w-12 h-7 mx-auto text-center bg-white border border-[#EAE3D2] rounded text-xs"
                          />
                        </td>

                        {/* Description */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description || ""}
                            onChange={(e) => handleUpdateItemField(idx, "description", e.target.value)}
                            placeholder="Specification notes"
                            className="w-full h-7 px-2 bg-white border border-[#EAE3D2] rounded text-xs"
                          />
                        </td>

                        {/* Sq.ft (calculated) */}
                        <td className="py-2 px-2 text-right font-mono font-semibold text-stone-700">
                          {item.sqft || 1}
                        </td>

                        {/* Rate */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={item.rate || 0}
                            onChange={(e) => handleUpdateItemField(idx, "rate", Number(e.target.value))}
                            className="w-20 h-7 text-right px-1.5 bg-white border border-[#EAE3D2] rounded text-xs font-semibold text-stone-800"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-2 px-3 text-right font-black text-[#9E7B1D]">
                          ₹{(item.amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Actions: Photo Selector, Minus Delete */}
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenImagePicker(idx)}
                              title={
                                item.photos?.length
                                  ? `${item.photos.length} image(s) attached. Click to select/change.`
                                  : "Select/Upload Component Images"
                              }
                              className={`p-1 rounded-lg transition cursor-pointer relative ${item.photos?.length
                                ? "text-[#9E7B1D] bg-amber-50 hover:bg-amber-100"
                                : "text-stone-400 hover:text-[#9E7B1D] hover:bg-stone-100"
                                }`}
                            >
                              <ImageIcon size={14} />
                              {item.photos?.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4AF37] text-stone-950 font-extrabold text-[8px] rounded-full flex items-center justify-center">
                                  {item.photos.length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              title="Remove item"
                              className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <MinusCircle size={14} />
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
        </div>
      </div>

      {/* Add New Space Modal with Autocomplete Suggestions */}
      {isAddSpaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAE3D2] w-full max-w-sm overflow-hidden p-5 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Add New Space / Room</h3>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Space Name</label>
              <input
                type="text"
                placeholder="e.g. Living Room, Balcony, Home Theater"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                autoFocus
                className="w-full h-10 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
              />

              {/* Popular Space Suggestions Pill List */}
              <div className="pt-1 space-y-1.5">
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Suggested Spaces ({STANDARD_SPACE_SUGGESTIONS.filter((s) => !newSpaceName || s.toLowerCase().includes(newSpaceName.toLowerCase())).length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {STANDARD_SPACE_SUGGESTIONS.filter((s) =>
                    !newSpaceName || s.toLowerCase().includes(newSpaceName.toLowerCase())
                  ).map((spaceName) => (
                    <button
                      key={spaceName}
                      type="button"
                      onClick={() => {
                        setNewSpaceName(spaceName);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                        newSpaceName === spaceName
                          ? "bg-[#D4AF37] text-stone-950 border-amber-400 font-bold shadow-2xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-300"
                      }`}
                    >
                      + {spaceName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddSpaceOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-stone-50 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewSpace}
                className="px-5 py-2 text-xs font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs cursor-pointer"
              >
                Add Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM MIX & MATCH COMPONENT MODAL */}
      {/* ========================================================================= */}
      {isCustomMixModalOpen && customMixComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Custom Mix: {customMixComponent.name}</h3>
                <p className="text-[11px] text-[#9E7B1D] font-medium">
                  Combine parts from Elite, Premium, Standard or enter custom specifications
                </p>
              </div>
              <button
                onClick={() => setIsCustomMixModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* 1. Quick Presets Bar */}
              <div className="space-y-1.5">
                <span className="block font-semibold text-stone-700 text-[11px]">Preset Template</span>
                <div className="flex items-center gap-2">
                  {["Elite", "Premium", "Standard"].map((preset) => {
                    const key = preset.toLowerCase();
                    const vCfg = customMixComponent[key] || {};
                    const unit = vCfg.unit || {};
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCustomMixState((prev) => ({
                            ...prev,
                            dimSource: preset,
                            typeSource: preset,
                            rateSource: preset,
                            descSource: preset,
                            lengthFt: unit.lengthFt || 2,
                            lengthIn: unit.lengthIn || 0,
                            heightFt: unit.heightFt || 2,
                            heightIn: unit.heightIn || 8,
                            depthFt: unit.depthFt || 2,
                            depthIn: unit.depthIn || 0,
                            type: vCfg.type || "Box",
                            rate: vCfg.rate || 1800,
                            description: vCfg.description || customMixComponent.description || ""
                          }));
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-[#EAE3D2] bg-[#FAF9F5] hover:bg-amber-50 text-stone-800 font-bold text-xs transition cursor-pointer text-center"
                      >
                        Load {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dimensions Selection */}
              <div className="p-3.5 border border-[#EAE3D2] rounded-2xl bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">1. Dimensions (In Unit)</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {["Elite", "Premium", "Standard"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          const unit = customMixComponent[v.toLowerCase()]?.unit || {};
                          setCustomMixState((prev) => ({
                            ...prev,
                            dimSource: v,
                            lengthFt: unit.lengthFt || 0,
                            lengthIn: unit.lengthIn || 0,
                            heightFt: unit.heightFt || 0,
                            heightIn: unit.heightIn || 0,
                            depthFt: unit.depthFt || 0,
                            depthIn: unit.depthIn || 0
                          }));
                        }}
                        className={`px-2 py-0.5 rounded-md font-semibold ${customMixState.dimSource === v
                          ? "bg-[#D4AF37] text-stone-950"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                      Length (ft & in)
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        placeholder="ft"
                        value={customMixState.lengthFt}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            lengthFt: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        placeholder="in"
                        value={customMixState.lengthIn}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            lengthIn: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                      Height (ft & in)
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        placeholder="ft"
                        value={customMixState.heightFt}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            heightFt: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        placeholder="in"
                        value={customMixState.heightIn}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            heightIn: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold mb-1">
                      Depth (ft & in)
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        placeholder="ft"
                        value={customMixState.depthFt}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            depthFt: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        placeholder="in"
                        value={customMixState.depthIn}
                        onChange={(e) =>
                          setCustomMixState({
                            ...customMixState,
                            dimSource: "Custom",
                            depthIn: Number(e.target.value)
                          })
                        }
                        className="w-full h-8 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Type & Rate Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type Selection */}
                <div className="p-3.5 border border-[#EAE3D2] rounded-2xl bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs">2. Type / Finish</span>
                    <span className="text-[10px] text-[#9E7B1D] font-semibold">
                      {customMixState.typeSource}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customMixState.type}
                    onChange={(e) =>
                      setCustomMixState({ ...customMixState, type: e.target.value, typeSource: "Custom" })
                    }
                    className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs"
                  />
                </div>

                {/* Rate Selection */}
                <div className="p-3.5 border border-[#EAE3D2] rounded-2xl bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs">3. Rate (₹ per sq.ft)</span>
                    <span className="text-[10px] text-[#9E7B1D] font-semibold">
                      {customMixState.rateSource}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={customMixState.rate}
                    onChange={(e) =>
                      setCustomMixState({
                        ...customMixState,
                        rate: Number(e.target.value),
                        rateSource: "Custom"
                      })
                    }
                    className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* 4. Description & Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] text-stone-500 font-semibold">Description</label>
                  <input
                    type="text"
                    value={customMixState.description}
                    onChange={(e) =>
                      setCustomMixState({ ...customMixState, description: e.target.value })
                    }
                    placeholder="Custom mix notes"
                    className="w-full h-8 px-2.5 bg-white border border-[#EAE3D2] rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-500 font-semibold">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={customMixState.qty}
                    onChange={(e) =>
                      setCustomMixState({ ...customMixState, qty: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2.5 text-center bg-white border border-[#EAE3D2] rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* 5. Select Images for this Mixed Component */}
              <div className="space-y-2 pt-1 border-t border-[#F0EBE0]">
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-stone-900 text-xs">
                    4. Select Images to Attach ({customMixState.selectedPhotos.length} selected)
                  </span>

                  <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#9E7B1D] bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 rounded-lg cursor-pointer transition">
                    {isUploadingPhoto ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                    <span>{isUploadingPhoto ? "Uploading..." : "+ Upload Custom Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadCustomMixPhoto(e.target.files[0]);
                        e.target.value = null;
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    ...(customMixComponent.elite?.images || []).map((i) => ({ ...i, variant: "Elite" })),
                    ...(customMixComponent.premium?.images || []).map((i) => ({
                      ...i,
                      variant: "Premium"
                    })),
                    ...(customMixComponent.standard?.images || []).map((i) => ({
                      ...i,
                      variant: "Standard"
                    })),
                    ...(customMixComponent.images || []).map((i) => ({ ...i, variant: "General" }))
                  ].map((img, iIdx) => {
                    const isSelected = customMixState.selectedPhotos.some((p) => p.url === img.url);
                    return (
                      <div
                        key={iIdx}
                        onClick={() => {
                          setCustomMixState((prev) => {
                            const exists = prev.selectedPhotos.some((p) => p.url === img.url);
                            return {
                              ...prev,
                              selectedPhotos: exists
                                ? prev.selectedPhotos.filter((p) => p.url !== img.url)
                                : [
                                  ...prev.selectedPhotos,
                                  { url: img.url, caption: img.name || customMixComponent.name }
                                ]
                            };
                          });
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition ${isSelected ? "border-[#D4AF37] ring-2 ring-amber-200" : "border-stone-200 hover:border-amber-300"
                          }`}
                      >
                        <img src={img.url} alt="Variant" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-stone-900/80 text-white text-[8px] font-bold px-1 rounded">
                          {img.variant}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-[#D4AF37] text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EAE3D2] bg-[#FAF9F5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCustomMixModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-stone-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomMix}
                className="px-5 py-2 text-xs font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition"
              >
                Add Mixed Item to Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPONENT IMAGE PICKER & GALLERY SELECTOR MODAL */}
      {/* ========================================================================= */}
      {isImagePickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Select Photos for Item:{" "}
                  {activeBOQ?.spaces?.[activeSpaceIdx]?.items?.[activeItemImageIdx]?.name || "Component"}
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Pick from uploaded component gallery images or attach custom site images
                </p>
              </div>
              <button
                onClick={() => setIsImagePickerModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-50 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Upload extra photo button */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-xs">
                  Available Component Images ({availableLibraryImages.length})
                </span>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-[#D4AF37] bg-amber-50 hover:bg-amber-100 text-[#9E7B1D] font-bold text-xs rounded-xl cursor-pointer transition">
                  {isUploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>{isUploadingPhoto ? "Uploading..." : "+ Upload New Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPhoto}
                    onChange={handleUploadNewPhotoForItem}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Grid of Selectable Images */}
              {availableLibraryImages.length === 0 ? (
                <div className="py-12 text-center text-stone-400 border border-dashed border-stone-200 rounded-2xl">
                  <ImageIcon size={28} className="mx-auto text-stone-300 mb-2" />
                  <p>No gallery images uploaded for this component yet.</p>
                  <p className="text-[11px] text-stone-400">Click (+ Upload New Photo) above to attach photos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableLibraryImages.map((img, idx) => {
                    const isSelected = selectedItemPhotos.some((p) => p.url === img.url);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleSelectPhoto(img)}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition shadow-2xs ${isSelected
                          ? "border-[#D4AF37] ring-3 ring-amber-200"
                          : "border-stone-200 hover:border-amber-300"
                          }`}
                      >
                        <img src={img.url} alt={img.name || "Preview"} className="w-full h-full object-cover" />

                        {/* Top Right Checkbox Badge */}
                        <div
                          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition ${isSelected ? "bg-[#D4AF37] text-stone-950" : "bg-stone-900/40 text-white"
                            }`}
                        >
                          {isSelected ? "✓" : "+"}
                        </div>

                        {/* Bottom Variant / Name Tag */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/80 to-transparent p-2 flex items-center justify-between text-white text-[10px]">
                          <span className="font-bold truncate">{img.variant || "Gallery"}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImageModal(img.url);
                            }}
                            className="p-1 hover:text-[#D4AF37]"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EAE3D2] bg-[#FAF9F5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-700">
                  {selectedItemPhotos.length} photo(s) selected
                </span>

                {/* Sync to Component Library Toggle */}
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToLibrary}
                    onChange={(e) => setSyncToLibrary(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span>Save to Component Library</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImagePickerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-[#EAE3D2] hover:bg-stone-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSelectedPhotos}
                  className="px-5 py-2 text-xs font-black text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition"
                >
                  Attach to Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUOTATION PREVIEW & EXPORT MODAL */}
      {/* ========================================================================= */}
      {isQuotationModalOpen && quotationBOQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#9E7B1D]" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  Official Project Quotation • {quotationBOQ.boqNumber || quotationBOQ.enquiryNo}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadBOQPdf(quotationBOQ)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF6ED] border border-amber-300 text-xs font-bold text-[#9E7B1D] hover:bg-[#D4AF37] hover:text-stone-950 rounded-xl transition cursor-pointer"
                  title="Download PDF Quotation"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 rounded-xl transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Quotation Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-800 bg-white">
              {/* Brand Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-stone-900">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-[#9E7B1D]">VELORA LUXURY INTERIORS</h1>
                  <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">
                    Bespoke Turnkey Residential & Commercial Interiors
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Pune & Mumbai • info@velorainteriors.com • +91 98765 43210
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Quotation Reference</span>
                  <span className="text-sm font-black font-mono text-stone-900 block">
                    {quotationBOQ.boqNumber || "QUOTATION"}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    Date: {new Date(quotationBOQ.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Client & Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE3D2]">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block mb-1">Quotation Prepared For:</span>
                  <p className="font-extrabold text-stone-900 text-sm">{quotationBOQ.clientName || "Valued Client"}</p>
                  {quotationBOQ.clientPhone && (
                    <p className="text-stone-600">Phone: {quotationBOQ.clientPhone}</p>
                  )}
                  {quotationBOQ.clientEmail && (
                    <p className="text-stone-600">Email: {quotationBOQ.clientEmail}</p>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Specification Package:</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-[#9E7B1D] border border-amber-200">
                    {quotationBOQ.activePackage || "Standard"} Luxury Package
                  </span>
                  <p className="text-stone-500 text-[11px]">
                    Valid for: <b>30 Calendar Days</b>
                  </p>
                </div>
              </div>

              {/* Itemized Space Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Scope of Work & Space Breakdown
                </h4>

                {(quotationBOQ.spaces || []).map((space, sIdx) => (
                  <div key={sIdx} className="border border-[#EAE3D2] rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-[#FAF9F5] px-4 py-2 flex items-center justify-between border-b border-[#EAE3D2]">
                      <span className="font-extrabold text-stone-900">{space.name}</span>
                      <span className="font-black text-[#9E7B1D]">
                        ₹{(space.roomTotal || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="py-2 px-3">Item Name</th>
                          <th className="py-2 px-2">Type / Spec</th>
                          <th className="py-2 px-2 text-center">Dimensions</th>
                          <th className="py-2 px-2 text-right">Sq.ft</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-right">Rate</th>
                          <th className="py-2 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {(!space.items || space.items.length === 0) ? (
                          <tr>
                            <td className="py-2 px-3 font-semibold text-stone-900">
                              {space.roomTotal > 0 ? `${space.name} Turnkey Scope & Fitout` : `${space.name} Space`}
                            </td>
                            <td className="py-2 px-2 text-stone-600">Standard Spec</td>
                            <td className="py-2 px-2 text-center text-stone-500">-</td>
                            <td className="py-2 px-2 text-right font-mono">1</td>
                            <td className="py-2 px-2 text-center">1</td>
                            <td className="py-2 px-2 text-right font-mono">
                              ₹{(space.roomTotal || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-stone-900">
                              ₹{(space.roomTotal || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ) : (
                          space.items.map((it, itIdx) => (
                            <tr key={itIdx}>
                              <td className="py-2 px-3 font-semibold text-stone-900">{it.name}</td>
                              <td className="py-2 px-2 text-stone-600">{it.typeVariant || "Box"}</td>
                              <td className="py-2 px-2 text-center text-stone-500">
                                {it.lengthFt ? `${it.lengthFt}ft ${it.lengthIn || 0}in x ${it.heightFt || 0}ft` : "-"}
                              </td>
                              <td className="py-2 px-2 text-right font-mono">{it.sqft || 1}</td>
                              <td className="py-2 px-2 text-center">{it.qty || 1}</td>
                              <td className="py-2 px-2 text-right font-mono">₹{(it.rate || 0).toLocaleString("en-IN")}</td>
                              <td className="py-2 px-3 text-right font-bold text-stone-900">
                                ₹{(it.amount || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Commercial Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Milestone Payment Terms */}
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE3D2] space-y-2">
                  <h5 className="font-extrabold text-stone-900 text-xs">Payment Milestone Schedule</h5>
                  <div className="space-y-1.5 text-[11px] text-stone-700">
                    <div className="flex justify-between border-b border-stone-200 pb-1">
                      <span>1. Booking & Design Sign-off (50%):</span>
                      <span className="font-bold">₹{Math.round((quotationBOQ.grandTotal || 0) * 0.5).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-1">
                      <span>2. Production Commencement (40%):</span>
                      <span className="font-bold">₹{Math.round((quotationBOQ.grandTotal || 0) * 0.4).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Handover & Final Snag (10%):</span>
                      <span className="font-bold">₹{Math.round((quotationBOQ.grandTotal || 0) * 0.1).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                  <h5 className="font-extrabold text-stone-900 text-xs">Commercial Summary</h5>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal (Excl. GST):</span>
                      <span className="font-bold font-mono">
                        ₹{Math.round((quotationBOQ.grandTotal || 0) / 1.18).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Estimated GST (18%):</span>
                      <span className="font-bold font-mono">
                        ₹{Math.round((quotationBOQ.grandTotal || 0) - (quotationBOQ.grandTotal || 0) / 1.18).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#9E7B1D] border-t border-amber-300 pt-1.5">
                      <span>Grand Total:</span>
                      <span>₹{(quotationBOQ.grandTotal || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="pt-2 text-[10px] text-stone-400 space-y-0.5 border-t border-stone-100">
                <p>1. Rates quoted are subject to final site measurement verification.</p>
                <p>2. Delivery timeline: 45 working days from final sign-off of 2D/3D layouts and material selection.</p>
                <p>3. This is an electronically issued quotation from Velora ERP.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAE3D2] bg-[#FAF9F5] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadBOQPdf(quotationBOQ)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#9E7B1D] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Quotation PDF</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuotationModalOpen(false);
                    // Extract items for invoice
                    const invoiceItems = [];
                    (quotationBOQ.spaces || []).forEach((sp) => {
                      (sp.items || []).forEach((it) => {
                        invoiceItems.push({
                          productName: it.name || "Custom Component",
                          hsnSac: "HSN/SAC",
                          quantity: it.qty || 1,
                          unit: String(it.sqft || it.unit || "1"),
                          rate: it.rate || 0,
                          gstPercent: 0,
                          gstAmount: 0,
                          total: it.amount || (it.rate * (it.sqft || it.qty || 1))
                        });
                      });
                    });

                    navigate("/invoices", {
                      state: {
                        createFromBOQ: true,
                        boqData: {
                          projectName: quotationBOQ.clientName,
                          projectNumber: `PRJ-2026-${String(Math.floor(100 + Math.random() * 900))}`,
                          clientName: quotationBOQ.clientName,
                          clientEmail: quotationBOQ.clientEmail,
                          clientPhone: quotationBOQ.clientPhone,
                          subtotal: quotationBOQ.grandTotal || 0,
                          grandTotal: quotationBOQ.grandTotal || 0,
                          items: invoiceItems.length > 0 ? invoiceItems : [
                            {
                              productName: "Turnkey Interior Fitout Scope",
                              hsnSac: "HSN/SAC",
                              quantity: 1,
                              unit: "1",
                              rate: quotationBOQ.grandTotal || 0,
                              gstPercent: 0,
                              gstAmount: 0,
                              total: quotationBOQ.grandTotal || 0
                            }
                          ]
                        }
                      }
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Convert / Create Tax Invoice</span>
                </button>
              </div>

              <button
                onClick={() => setIsQuotationModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-stone-900 rounded-2xl overflow-hidden p-2 border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-950/70 text-white hover:bg-stone-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={previewImageModal}
              alt="Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

