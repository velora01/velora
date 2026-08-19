import Component from "../models/Component.js";
import { logActivity } from "../services/auditService.js";

const DEFAULT_COMPONENTS = [
  {
    name: "Kitchen Base Cabinet",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "Standard modular kitchen base counter carcass with PVC edge banding",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Loft",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "Overhead ceiling-height loft storage unit",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Kitchen SS Trolly",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "High grade SS-304 soft-close pull-out baskets and organisers",
    visibility: true,
    elite: { type: "Box", rate: 6000 },
    premium: { type: "Box", rate: 6000 },
    standard: { type: "Box", rate: 6000 }
  },
  {
    name: "Kitchen Overhead Storage",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "Wall mounted upper storage cabinets with hydraulic lift-up fittings",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Kitchen Wall Unit- Open",
    relevantSpace: "Modular Kitchen",
    variant: "Open Box",
    description: "Open display cubby with moisture resistant laminate finish",
    visibility: true,
    elite: { type: "Open Box", rate: 2200 },
    premium: { type: "Open Box", rate: 1800 },
    standard: { type: "Open Box", rate: 1500 }
  },
  {
    name: "Kitchen Tall Pantry Unit",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "Full height tall pantry unit with multi-tier tandem drawers",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Wall Unit - Open",
    relevantSpace: "Living Room",
    variant: "Open Box",
    description: "Minimalist open wall accent niche with integrated LED profiles",
    visibility: true,
    elite: { type: "Open Box", rate: 2200 },
    premium: { type: "Open Box", rate: 1800 },
    standard: { type: "Open Box", rate: 1500 }
  },
  {
    name: "Kitchen Wall Cabinet",
    relevantSpace: "Modular Kitchen",
    variant: "Box",
    description: "Closed shutter wall cabinet unit",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "TV Unit Wall Back Paneling With Louvers",
    relevantSpace: "Living Room",
    variant: "Panel",
    description: "Architectural fluted louvered acoustic wall panel backdrop",
    visibility: true,
    elite: { type: "Panel", rate: 2200 },
    premium: { type: "Panel", rate: 1800 },
    standard: { type: "Panel", rate: 1500 }
  },
  {
    name: "Wall Unit Tinted Glass With Aluminium Profile Shutter",
    relevantSpace: "Living Room",
    variant: "Box",
    description: "Anodised champagne gold aluminium frame with fluted glass shutters",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Shoe Rack",
    relevantSpace: "Entrance",
    variant: "Box Standard",
    description: "Providing of size (4ft x 3ft) ventilated shoe cabinet with tier partitions",
    visibility: true,
    elite: { type: "Box", rate: 2200 },
    premium: { type: "Box", rate: 1800 },
    standard: { type: "Box", rate: 1500 }
  },
  {
    name: "Entrance Safety Door",
    relevantSpace: "Entrance",
    variant: "Frame Standard",
    description: "CNC designer grill heavy safety door with multi-point brass lock",
    visibility: true,
    elite: { type: "Frame", rate: 45000 },
    premium: { type: "Frame", rate: 40000 },
    standard: { type: "Frame", rate: 35000 }
  },
  {
    name: "Entrance Paneling",
    relevantSpace: "Entrance",
    variant: "Panel",
    description: "Decorative foyer stone veneer / fluted charcoal paneling",
    visibility: true,
    elite: { type: "Panel", rate: 2500 },
    premium: { type: "Panel", rate: 2000 },
    standard: { type: "Panel", rate: 1600 }
  },
  {
    name: "Name Plate",
    relevantSpace: "Entrance",
    variant: "Custom",
    description: "Laser cut backlit acrylic with warm LED letter embossing",
    visibility: true,
    elite: { type: "Custom", rate: 8000 },
    premium: { type: "Custom", rate: 5000 },
    standard: { type: "Custom", rate: 3500 }
  },
  {
    name: "Smart Lock",
    relevantSpace: "Entrance",
    variant: "Box Standard",
    description: "Digital fingerprint, RFID, and mobile app enabled security lock",
    visibility: true,
    elite: { type: "Hardware", rate: 22000 },
    premium: { type: "Hardware", rate: 18000 },
    standard: { type: "Hardware", rate: 15000 }
  },
  {
    name: "Shoe Rack Seating",
    relevantSpace: "Entrance",
    variant: "Box",
    description: "Upholstered bench seating with concealed drawer below",
    visibility: true,
    elite: { type: "Box", rate: 3500 },
    premium: { type: "Box", rate: 2800 },
    standard: { type: "Box", rate: 2200 }
  }
];

// GET /api/erp/components
export const getComponents = async (req, res) => {
  try {
    const { search = "", space = "", variant = "", page = 1, limit = 50 } = req.query;

    const count = await Component.countDocuments();
    if (count === 0) {
      await Component.insertMany(DEFAULT_COMPONENTS);
    }

    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { relevantSpace: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }
    if (space) query.relevantSpace = space;
    if (variant) query.variant = variant;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const components = await Component.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Component.countDocuments(query);

    res.json({
      success: true,
      data: components,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/erp/components
export const createComponent = async (req, res) => {
  try {
    const component = await Component.create(req.body);
    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "Library",
      description: `Created Component ${component.name}`
    });
    res.status(201).json({ success: true, data: component });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/erp/components/:id
export const updateComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!component) return res.status(404).json({ success: false, message: "Component not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Library",
      description: `Updated Component ${component.name}`
    });

    res.json({ success: true, data: component });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/erp/components/:id
export const deleteComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    if (!component) return res.status(404).json({ success: false, message: "Component not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Library",
      description: `Deleted Component ${component.name}`
    });

    res.json({ success: true, message: "Component deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
