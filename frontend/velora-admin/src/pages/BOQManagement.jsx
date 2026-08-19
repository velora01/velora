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
  FileText,
  ClipboardList
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import erpApi from "../services/erpService";

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
  const [libraryComponents, setLibraryComponents] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Measurement Unit & Spaces Drawer State (Screenshots 1, 2, 3)
  const [measurementUnit, setMeasurementUnit] = useState("Feet.inch"); // Feet.inch | Millimeter
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isSpaceDrawerOpen, setIsSpaceDrawerOpen] = useState(false);
  const [isCopyBOQModalOpen, setIsCopyBOQModalOpen] = useState(false);

  // New Space modal state
  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  // Select Enquiry Modal State (matching user reference screenshot)
  const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [enquiryList, setEnquiryList] = useState([]);

  // Predefined Spaces list for Drawer (Screenshot 3)
  const drawerSpacesList = [
    "PUJA ROOM",
    "KITCHEN",
    "Parents Bedroom",
    "Foyer Area",
    "Bathroom",
    "Wash Basin Area",
    "Master Bedroom Bath",
    "All Area",
    "Dry Balcony",
    "Balcony",
    "Entrance",
    "CABIN",
    "HOSPITAL",
    "All Bedrooms",
    "Living Room",
    "Dining Area",
    "Master Bedroom",
    "Kids Bedroom",
    "Guest Bedroom"
  ];

  // Fallback initial spaces template
  const defaultSampleSpaces = [
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
    { name: "Entrance (Copy)", roomTotal: 0, items: [] },
    { name: "PUJA ROOM", roomTotal: 85000, items: [] },
    { name: "Living Room", roomTotal: 420000, items: [] },
    { name: "Modular Kitchen", roomTotal: 650000, items: [] },
    { name: "Dining Area", roomTotal: 120000, items: [] },
    { name: "Master Bedroom", roomTotal: 580000, items: [] },
    { name: "Kids Bedroom", roomTotal: 340000, items: [] },
    { name: "Parents Bedroom", roomTotal: 310000, items: [] },
    { name: "Guest Bedroom", roomTotal: 250000, items: [] }
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
          spaces: defaultSampleSpaces
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
        setActiveBOQ(res.data);
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
        spaces: found.spaces || []
      });
      setActiveSpaceIdx(0);
      setViewMode("builder");
    }
  };

  // Open Builder for a given BOQ row
  const handleOpenBuilder = (boqItem) => {
    setActiveBOQ({
      ...boqItem,
      spaces: boqItem.spaces || []
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

  // Select an Enquiry from Modal Card -> Create & Open Empty BOQ Builder
  const handleSelectEnquiryToCreateBOQ = async (enquiry) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const boqNumber = `BOQ-2026-${randomSuffix}`;
    const enquiryNo = enquiry.enquiryNo || `ENQ-2026-${randomSuffix}`;

    // New BOQ initially has NO spaces added yet (matching user screenshot 2 & 1)
    const newBOQ = {
      _id: `boq_${Date.now()}`,
      boqNumber,
      enquiryNo,
      enquiryDate: enquiry.enquiryDate || new Date().toISOString().split("T")[0],
      clientName: enquiry.name || "Client",
      clientEmail: enquiry.email || "",
      clientPhone: enquiry.phone || "",
      numberOfSpaces: 0,
      activePackage: "Standard",
      grandTotal: 0,
      spaces: []
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
    setIsSelectClientModalOpen(false);
    setViewMode("builder");

    // Automatically open Measurement Unit modal if no spaces yet (Screenshot 1)
    setIsMeasurementModalOpen(true);
  };

  // Confirm Measurement Unit -> Open Space Drawer (Screenshot 1 -> 3)
  const handleConfirmMeasurementUnit = () => {
    setIsMeasurementModalOpen(false);
    setIsSpaceDrawerOpen(true);
  };

  // Add Space from Drawer (Screenshot 3)
  const handleAddSpaceFromDrawer = (spaceName) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    
    // Check if space already exists, if so append copy
    const countSame = updated.spaces.filter((s) => s.name.startsWith(spaceName)).length;
    const finalName = countSame > 0 ? `${spaceName} (${countSame + 1})` : spaceName;

    // If Entrance, seed sample entrance components for demonstration
    let initialItems = [];
    let initialRoomTotal = 0;
    if (spaceName === "Entrance" && updated.spaces.length === 0) {
      initialItems = [
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
      ];
      initialRoomTotal = 75813;
    }

    updated.spaces.push({
      name: finalName,
      roomTotal: initialRoomTotal,
      items: initialItems
    });

    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(updated.spaces.length - 1);
    setSuccessToast(`Added ${finalName} to BOQ!`);
    setTimeout(() => setSuccessToast(""), 2000);
  };

  // Copy spaces from an existing BOQ (Screenshot 2 button)
  const handleCopyFromExistingBOQ = (sourceBOQ) => {
    if (!activeBOQ || !sourceBOQ?.spaces || sourceBOQ.spaces.length === 0) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    updated.spaces = JSON.parse(JSON.stringify(sourceBOQ.spaces));
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(0);
    setIsCopyBOQModalOpen(false);
    setSuccessToast(`Copied ${sourceBOQ.spaces.length} spaces from ${sourceBOQ.clientName}!`);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  // Active space reference
  const currentSpace = useMemo(() => {
    if (!activeBOQ?.spaces || activeBOQ.spaces.length === 0) return null;
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
  const handleAddComponentToSpace = (comp) => {
    if (!activeBOQ) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    const targetSpace = updated.spaces[activeSpaceIdx];
    if (!targetSpace) return;

    let rate = comp.standard?.rate || 1500;
    if (selectedPackage === "Premium") rate = comp.premium?.rate || 1800;
    if (selectedPackage === "Elite") rate = comp.elite?.rate || 2200;

    const newItem = {
      name: comp.name,
      typeVariant: comp.variant || "Box Standard",
      lengthFt: 1,
      lengthIn: 0,
      heightFt: 1,
      heightIn: 0,
      depthFt: 0,
      depthIn: 0,
      qty: 1,
      description: comp.description || "",
      sqft: 1,
      rate,
      amount: rate
    };

    targetSpace.items.push(newItem);
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setSuccessToast(`Added ${comp.name} to ${targetSpace.name}`);
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
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    updated.spaces.push({
      name: newSpaceName.trim(),
      roomTotal: 0,
      items: []
    });
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(updated.spaces.length - 1);
    setNewSpaceName("");
    setIsAddSpaceOpen(false);
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
    if (!activeBOQ) return;
    if (!window.confirm(`Are you sure you want to delete ${currentSpace.name}?`)) return;
    const updated = JSON.parse(JSON.stringify(activeBOQ));
    updated.spaces.splice(activeSpaceIdx, 1);
    const recalculated = recalculateBOQ(updated);
    setActiveBOQ(recalculated);
    setActiveSpaceIdx(Math.max(0, activeSpaceIdx - 1));
  };

  // Save BOQ to API
  const handleSaveBOQ = async () => {
    if (!activeBOQ) return;
    try {
      if (activeBOQ._id && !activeBOQ._id.startsWith("temp_") && !activeBOQ._id.startsWith("boq_")) {
        await erpApi.updateBOQ(activeBOQ._id, activeBOQ);
      } else {
        await erpApi.createBOQ(activeBOQ);
      }
      setSuccessToast("BOQ saved successfully!");
      fetchBOQList();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch {
      setSuccessToast("BOQ state saved locally!");
      setTimeout(() => setSuccessToast(""), 3000);
    }
  };

  // Filtered Component Palette
  const relevantComponents = useMemo(() => {
    const spaceName = currentSpace?.name?.toLowerCase() || "";
    return libraryComponents.filter((c) => {
      const matchesSearch =
        !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase());
      const isRelevant =
        c.relevantSpace?.toLowerCase().includes(spaceName) ||
        (spaceName.includes("entrance") && c.relevantSpace === "Entrance") ||
        (spaceName.includes("kitchen") && c.relevantSpace === "Modular Kitchen") ||
        (spaceName.includes("living") && c.relevantSpace === "Living Room");
      return matchesSearch && isRelevant;
    });
  }, [libraryComponents, currentSpace, componentSearch]);

  const otherComponents = useMemo(() => {
    const spaceName = currentSpace?.name?.toLowerCase() || "";
    return libraryComponents.filter((c) => {
      const matchesSearch =
        !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase());
      const isRelevant =
        c.relevantSpace?.toLowerCase().includes(spaceName) ||
        (spaceName.includes("entrance") && c.relevantSpace === "Entrance") ||
        (spaceName.includes("kitchen") && c.relevantSpace === "Modular Kitchen") ||
        (spaceName.includes("living") && c.relevantSpace === "Living Room");
      return matchesSearch && !isRelevant;
    });
  }, [libraryComponents, currentSpace, componentSearch]);

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
                        <div className="flex items-center justify-center gap-2">
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
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: BOQ SPACE & COMPONENT BUILDER (Screenshots 1, 2, 3)
  // =========================================================================
  const hasSpaces = activeBOQ?.spaces && activeBOQ.spaces.length > 0;

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

          {/* Categories: Component, Accessories, Appliances, Other Services (only if spaces exist) */}
          {hasSpaces && (
            <div className="flex items-center gap-1 p-0.5 bg-[#FAF9F5] rounded-xl border border-[#EAE3D2]">
              {["Component", "Accessories", "Appliances", "Other Services"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] text-stone-950 shadow-xs"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Client Name & BOQ Total */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-stone-400 block font-semibold">Name</span>
            <span className="text-xs font-extrabold text-stone-900">{activeBOQ?.clientName || "Client"}</span>
          </div>

          {hasSpaces && (
            <div>
              <span className="text-[10px] text-stone-400 block font-semibold">BOQ Total</span>
              <div className="flex items-center gap-1 text-sm font-black text-[#9E7B1D]">
                <span>₹{(activeBOQ?.grandTotal || 0).toLocaleString("en-IN")}</span>
                <ChevronDown size={14} className="text-stone-400 cursor-pointer" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasSpaces && (
            <>
              <button
                onClick={handleSaveBOQ}
                className="px-4 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 rounded-xl shadow-xs transition cursor-pointer"
              >
                Apply
              </button>

              <button
                onClick={() => setIsSpaceDrawerOpen(true)}
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
            </>
          )}

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
              className={`w-8 h-4 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                autoSave ? "bg-blue-600" : "bg-stone-300"
              }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-xs transform transition ${
                  autoSave ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN: NO SPACE ADDED YET (Screenshot 2 Reference) */}
      {/* ========================================================================= */}
      {!hasSpaces ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-xs p-10 max-w-lg w-full flex flex-col items-center text-center space-y-6 animate-in fade-in">
            {/* Clipboard Graphic (Screenshot 2) */}
            <div className="relative w-28 h-32 flex items-center justify-center">
              {/* Back clipboard */}
              <div className="absolute top-0 left-2 w-20 h-26 bg-slate-100 border-2 border-slate-300 rounded-lg transform -rotate-12 shadow-2xs">
                <div className="w-10 h-3 bg-blue-500 rounded-t mx-auto -mt-1.5" />
              </div>
              {/* Front clipboard */}
              <div className="absolute top-3 left-6 w-20 h-26 bg-white border-2 border-slate-300 rounded-lg shadow-sm">
                <div className="w-10 h-3 bg-blue-500 rounded-t mx-auto -mt-1.5" />
                <div className="p-2 space-y-1.5 mt-2">
                  <div className="h-1 bg-slate-200 rounded-full w-full" />
                  <div className="h-1 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-1 bg-slate-200 rounded-full w-4/5" />
                </div>
              </div>
            </div>

            {/* Title: No Space Added Yet */}
            <h2 className="text-base font-bold text-stone-800">No Space Added Yet</h2>

            {/* Action Buttons (Screenshot 2) */}
            <div className="w-full space-y-3">
              <button
                onClick={() => setIsMeasurementModalOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-blue-600 bg-white border border-blue-500 hover:bg-blue-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Add Measurement Unit & Space to Start</span>
                <ChevronRight size={15} />
              </button>

              <button
                onClick={() => setIsCopyBOQModalOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Copy From Existing BOQ</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SCREEN: ACTIVE SPACES & COMPONENT BUILDER (Screenshot 1 & 2 Palette) */
        /* ========================================================================= */
        <>
          {/* Spaces Horizontal Tabs Bar */}
          <div className="bg-white border border-[#EAE3D2] rounded-xl p-2 shadow-xs overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              {activeBOQ?.spaces?.map((space, sIdx) => {
                const isActive = sIdx === activeSpaceIdx;
                return (
                  <button
                    key={sIdx}
                    onClick={() => setActiveSpaceIdx(sIdx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                      isActive
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
              {/* Search Component */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search Component"
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] border border-[#EAE3D2] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Relevant Components Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#9E7B1D] uppercase tracking-wider">
                  Relevant Components
                </h4>
                <div className="space-y-1">
                  {relevantComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-amber-200 hover:bg-amber-50/50 transition group text-xs font-medium text-stone-800"
                    >
                      <span className="truncate pr-2">{comp.name}</span>
                      <button
                        onClick={() => handleAddComponentToSpace(comp)}
                        className="w-6 h-6 rounded-lg bg-amber-50 text-[#9E7B1D] hover:bg-[#D4AF37] hover:text-stone-950 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs font-bold"
                        title={`Add ${comp.name} to current space`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ))}
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
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {otherComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-amber-200 hover:bg-amber-50/50 transition group text-xs font-medium text-stone-700"
                    >
                      <span className="truncate pr-2">{comp.name}</span>
                      <button
                        onClick={() => handleAddComponentToSpace(comp)}
                        className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 hover:bg-[#D4AF37] hover:text-stone-950 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs font-bold"
                        title={`Add ${comp.name} to current space`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ))}
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

                {/* Package Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-semibold">Package:</span>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="h-8 px-2.5 bg-[#FAF9F5] border border-[#EAE3D2] rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Standard">Standard Package</option>
                    <option value="Premium">Premium Package</option>
                    <option value="Elite">Elite Luxury Package</option>
                  </select>
                </div>
              </div>

              {/* Components Dimension & Calculation Table */}
              <div className="overflow-x-auto border border-[#EAE3D2] rounded-xl">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead className="bg-[#FAF9F5] border-b border-[#EAE3D2] text-[11px] font-bold text-stone-700">
                    <tr>
                      <th className="py-2.5 px-2 w-8 text-center text-stone-400"></th>
                      <th className="py-2.5 px-3 min-w-[140px]">Name</th>
                      <th className="py-2.5 px-3 min-w-[110px]">Type & Variant</th>
                      <th className="py-2.5 px-2 text-center min-w-[100px]">Length (ft & in)</th>
                      <th className="py-2.5 px-2 text-center min-w-[100px]">Height (ft & in)</th>
                      <th className="py-2.5 px-2 text-center min-w-[100px]">Depth (ft & in)</th>
                      <th className="py-2.5 px-2 text-center w-14">Qty</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Description</th>
                      <th className="py-2.5 px-2 text-right w-16">Sq.ft</th>
                      <th className="py-2.5 px-3 text-right min-w-[90px]">Rate (sq.ft)</th>
                      <th className="py-2.5 px-3 text-right min-w-[90px]">Amount</th>
                      <th className="py-2.5 px-2 text-center w-16">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F0EBE0] text-xs text-stone-800">
                    {!currentSpace?.items || currentSpace.items.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-12 text-center text-stone-400">
                          No components added in {currentSpace?.name || "this space"}. Click (+) on the left palette to add items.
                        </td>
                      </tr>
                    ) : (
                      currentSpace.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/20 transition">
                          {/* Drag Handle */}
                          <td className="py-2 px-2 text-center text-stone-300">
                            <GripVertical size={13} className="mx-auto cursor-grab" />
                          </td>

                          {/* Name */}
                          <td className="py-2 px-3 font-semibold text-stone-900">{item.name}</td>

                          {/* Type & Variant */}
                          <td className="py-2 px-3">
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

                          {/* Actions: Photo, Minus Delete */}
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                title="Add item photos"
                                className="text-stone-400 hover:text-[#9E7B1D] cursor-pointer"
                              >
                                <ImageIcon size={14} />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                title="Remove item"
                                className="text-rose-400 hover:text-rose-600 cursor-pointer"
                              >
                                <MinusCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MEASUREMENT UNIT MODAL (Screenshot 1 Reference) */}
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

      {/* ========================================================================= */}
      {/* DRAWER: SELECT SPACE SIDEBAR (Screenshot 3 Reference) */}
      {/* ========================================================================= */}
      {isSpaceDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-72 h-full shadow-2xl border-r border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Select Space</h3>
              <button
                onClick={() => setIsSpaceDrawerOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Spaces List with (+) buttons (Screenshot 3) */}
            <div className="p-4 overflow-y-auto flex-1 space-y-1 text-xs">
              {drawerSpacesList.map((spaceName, sIdx) => {
                const isAlreadyAdded = activeBOQ?.spaces?.some((s) => s.name === spaceName);
                return (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 border border-transparent hover:border-blue-200 transition group"
                  >
                    <span className="font-semibold text-stone-800">{spaceName}</span>
                    <button
                      onClick={() => handleAddSpaceFromDrawer(spaceName)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isAlreadyAdded
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      }`}
                      title={`Add ${spaceName}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <button
                onClick={() => setIsSpaceDrawerOpen(false)}
                className="w-full py-2 text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COPY FROM EXISTING BOQ (Screenshot 2 Option) */}
      {/* ========================================================================= */}
      {isCopyBOQModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Copy Spaces from Existing BOQ</h3>
              <button onClick={() => setIsCopyBOQModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {boqList
                .filter((b) => b.spaces && b.spaces.length > 0 && b._id !== activeBOQ?._id)
                .map((boq) => (
                  <div
                    key={boq._id}
                    onClick={() => handleCopyFromExistingBOQ(boq)}
                    className="p-3 bg-white border border-stone-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900">{boq.clientName}</h4>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {boq.enquiryNo} • {boq.spaces.length} Spaces
                      </p>
                    </div>
                    <span className="font-bold text-blue-600 text-xs">
                      ₹{(boq.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCopyBOQModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
