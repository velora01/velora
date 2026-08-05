import SiteVisit from "../models/SiteVisit.js";
import { logActivity } from "../services/auditService.js";

export const getSiteVisits = async (req, res) => {
  try {
    const visits = await SiteVisit.find().sort({ createdAt: -1 });
    res.json({ success: true, data: visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSiteVisit = async (req, res) => {
  try {
    const code = "VISIT-" + Math.floor(1000 + Math.random() * 9000);
    const visit = await SiteVisit.create({ ...req.body, visitCode: code });
    await logActivity({ userName: req.user?.name || "Designer", action: "Created", module: "SiteVisit", description: `Scheduled site visit for ${visit.clientName}` });
    res.status(201).json({ success: true, data: visit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSiteVisit = async (req, res) => {
  try {
    const visit = await SiteVisit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: visit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
