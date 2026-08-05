import Material from "../models/Inventory.js";
import Vendor from "../models/Vendor.js";
import { logActivity } from "../services/auditService.js";

// Materials
export const getMaterials = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, "i") }, { brand: new RegExp(search, "i") }, { itemCode: new RegExp(search, "i") }];
    if (category) query.category = category;

    const materials = await Material.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const code = "MAT-" + Math.floor(1000 + Math.random() * 9000);
    const mat = await Material.create({ ...req.body, itemCode: req.body.itemCode || code });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Inventory", description: `Added material ${mat.name}` });
    res.status(201).json({ success: true, data: mat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Vendors
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
