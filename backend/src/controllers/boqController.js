import BOQ from "../models/BOQ.js";
import { logActivity } from "../services/auditService.js";
import { generatePdfDoc } from "../services/exportService.js";

export const getBOQs = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [{ boqNumber: new RegExp(search, "i") }, { clientName: new RegExp(search, "i") }];

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const boqs = await BOQ.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await BOQ.countDocuments(query);

    res.json({ success: true, data: boqs, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBOQ = async (req, res) => {
  try {
    const boqNumber = "BOQ-VEL-" + Math.floor(10000 + Math.random() * 90000);
    const boq = await BOQ.create({ ...req.body, boqNumber });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "BOQ", description: `Created BOQ ${boqNumber}` });
    res.status(201).json({ success: true, data: boq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const exportBOQPdf = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id);
    if (!boq) return res.status(404).json({ success: false, message: "BOQ not found" });

    const lines = [
      `BOQ Reference: ${boq.boqNumber || "N/A"}`,
      `Client Name: ${boq.clientName || "N/A"}`,
      `Status: ${boq.status || "Draft"}`,
      `Prepared By: ${boq.preparedBy || "Velora Team"}`,
      `------------------------------------------`,
      `Room Count: ${boq.rooms ? boq.rooms.length : 0}`,
      `Subtotal: ₹${(boq.subtotal || 0).toLocaleString("en-IN")}`,
      `GST Total (18%): ₹${(boq.gstTotal || 0).toLocaleString("en-IN")}`,
      `Grand Total: ₹${(boq.grandTotal || 0).toLocaleString("en-IN")}`
    ];

    generatePdfDoc(res, `Bill of Quantities (${boq.boqNumber || "BOQ"})`, lines);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
