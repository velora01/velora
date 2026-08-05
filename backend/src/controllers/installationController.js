import Installation from "../models/Installation.js";
import { logActivity } from "../services/auditService.js";

export const getInstallations = async (req, res) => {
  try {
    const items = await Installation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createInstallation = async (req, res) => {
  try {
    const code = "INS-" + Math.floor(1000 + Math.random() * 9000);
    const inst = await Installation.create({ ...req.body, installationCode: code });
    await logActivity({ userName: req.user?.name || "Project Manager", action: "Created", module: "Installation", description: `Scheduled installation ${code}` });
    res.status(201).json({ success: true, data: inst });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateInstallationStatus = async (req, res) => {
  try {
    const inst = await Installation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: inst });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
