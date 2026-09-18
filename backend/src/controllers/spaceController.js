import Space from "../models/Space.js";
import { logActivity } from "../services/auditService.js";

const DEFAULT_SPACES = [
  { name: "PUJA ROOM", description: "Pooja unit, spiritual and mandir area styling", visibility: true, sortOrder: 1 },
  { name: "KITCHEN", description: "Modular kitchen, base/wall cabinets and pantry storage", visibility: true, sortOrder: 2 },
  { name: "Parents Bedroom", description: "Parents room wardrobes, headboard & vanity", visibility: true, sortOrder: 3 },
  { name: "Foyer Area", description: "Entrance safety door, shoe rack & accent paneling", visibility: true, sortOrder: 4 },
  { name: "Bathroom", description: "Vanity counter, under-basin cabinet and mirror with LED", visibility: true, sortOrder: 5 },
  { name: "Wash Basin Area", description: "Handwash counter storage and quartz backdrop", visibility: true, sortOrder: 6 },
  { name: "Master Bedroom Bath", description: "En-suite master bathroom vanities and linen storage", visibility: true, sortOrder: 7 },
  { name: "All Area", description: "Universal components applicable to any zone", visibility: true, sortOrder: 8 },
  { name: "Dry Balcony", description: "Utility cabinet, washing machine ledge and overhead rack", visibility: true, sortOrder: 9 },
  { name: "Balcony", description: "Balcony bar ledge, artificial turf backdrop & seating", visibility: true, sortOrder: 10 },
  { name: "Master Bedroom", description: "King size hydraulic bed, 4-door wardrobe and dresser", visibility: true, sortOrder: 11 },
  { name: "Kids Bedroom", description: "Study table, bunk/single bed and multi-color wardrobe", visibility: true, sortOrder: 12 },
  { name: "Living Room", description: "TV unit, acoustic fluted panels and crockery display", visibility: true, sortOrder: 13 },
  { name: "Dining Area", description: "Dining buffet counter, bar unit and console", visibility: true, sortOrder: 14 },
  { name: "General", description: "General furniture and hardware items", visibility: true, sortOrder: 15 }
];

// GET /api/erp/spaces
export const getSpaces = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 50 } = req.query;

    const count = await Space.countDocuments();
    if (count === 0) {
      await Space.insertMany(DEFAULT_SPACES);
    }

    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const spaces = await Space.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Space.countDocuments(query);

    res.json({
      success: true,
      data: spaces,
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

// POST /api/erp/spaces
export const createSpace = async (req, res) => {
  try {
    const { name, description = "", visibility = true, sortOrder = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Space Name is required" });
    }

    const existing = await Space.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Space "${name.trim()}" already exists.` });
    }

    const space = await Space.create({
      name: name.trim(),
      description: description.trim(),
      visibility: visibility !== false,
      sortOrder: Number(sortOrder) || 0
    });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "Library",
      description: `Created Space ${space.name}`
    });

    res.status(201).json({ success: true, data: space });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/erp/spaces/:id
export const updateSpace = async (req, res) => {
  try {
    const { name, description, visibility, sortOrder } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (visibility !== undefined) updateData.visibility = visibility;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const space = await Space.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Library",
      description: `Updated Space ${space.name}`
    });

    res.json({ success: true, data: space });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/erp/spaces/:id
export const deleteSpace = async (req, res) => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Library",
      description: `Deleted Space ${space.name}`
    });

    res.json({ success: true, message: "Space deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
