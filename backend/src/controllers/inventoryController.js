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

    let materials = await Material.find(query).sort({ createdAt: -1 });

    // Auto-seed standard materials if database is empty
    if (materials.length === 0 && !search && !category) {
      const count = await Material.countDocuments();
      if (count === 0) {
        const defaults = [
          { itemCode: "MAT-PLY01", name: "Premium Commercial Plywood 19mm", category: "Plywood", brand: "CenturyPly", unit: "sq.ft", unitPrice: 150, stockQty: 500, vendorName: "Century Vendor" },
          { itemCode: "MAT-LAM01", name: "Glossy White Laminate 1mm", category: "Laminates", brand: "Greenlam", unit: "sq.ft", unitPrice: 95, stockQty: 300, vendorName: "Greenlam Pune" },
          { itemCode: "MAT-MAR01", name: "Italian Carrara Marble", category: "Marble", brand: "Imported", unit: "sq.ft", unitPrice: 480, stockQty: 150, vendorName: "Stones India" },
          { itemCode: "MAT-FIT01", name: "Sensys Soft-Close Hinge", category: "Fittings", brand: "Hettich", unit: "unit", unitPrice: 380, stockQty: 1000, vendorName: "Hettich Direct" },
          { itemCode: "MAT-FIT02", name: "Legrabox Drawer System", category: "Fittings", brand: "Blum", unit: "unit", unitPrice: 4200, stockQty: 200, vendorName: "Blum Pune" },
          { itemCode: "MAT-GLS01", name: "Toughened Fluted Glass 8mm", category: "Glass", brand: "Saint-Gobain", unit: "sq.ft", unitPrice: 220, stockQty: 180, vendorName: "Saint-Gobain Dist" },
          { itemCode: "MAT-PNT01", name: "Royale Luxury Shyne Emulsion", category: "Paint", brand: "Asian Paints", unit: "sq.ft", unitPrice: 48, stockQty: 400, vendorName: "Paints & Co" }
        ];
        await Material.insertMany(defaults);
        materials = await Material.find(query).sort({ createdAt: -1 });
      }
    }

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
