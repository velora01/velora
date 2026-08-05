import Lead from "../models/Lead.js";
import WebsiteLead from "../models/WebsiteLead.js";
import { logActivity } from "../services/auditService.js";
import { generateExcelReport, generatePdfDoc } from "../services/exportService.js";

// GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const { search = "", status = "", source = "", page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (status) query.status = status;
    if (source) query.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const leads = await Lead.find(query).sort(sort).skip(skip).limit(parseInt(limit)).populate("assignedTo", "name email");
    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/leads
export const createLead = async (req, res) => {
  try {
    const existing = await Lead.findOne({ phone: req.body.phone });
    const isDuplicate = !!existing;

    const lead = await Lead.create({
      ...req.body,
      isDuplicate,
      timeline: [{ stage: req.body.status || "Warm", note: "Lead Created", updatedBy: req.user?.name || "Admin" }]
    });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "Leads",
      description: `Created lead ${lead.name} (${lead.phone})`,
      targetId: lead._id
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/leads/:id
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    if (req.body.status && req.body.status !== lead.status) {
      lead.timeline.push({
        stage: req.body.status,
        note: req.body.note || `Status changed to ${req.body.status}`,
        updatedBy: req.user?.name || "Admin"
      });
    }

    Object.assign(lead, req.body);
    await lead.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Leads",
      description: `Updated lead ${lead.name}`,
      targetId: lead._id
    });

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Leads",
      description: `Deleted lead ${lead.name}`,
      targetId: req.params.id
    });

    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leads/export/excel
export const exportLeadsExcel = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Source", key: "source", width: 15 },
      { header: "Property Type", key: "propertyType", width: 20 },
      { header: "Budget", key: "budget", width: 15 }
    ];
    await generateExcelReport(res, "Velora_Leads_Report", columns, leads);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leads/:id
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/leads/assign
export const assignLead = async (req, res) => {
  try {
    const { leadId, userId } = req.body;
    const lead = await Lead.findById(leadId || req.body.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    lead.assignedTo = userId;
    lead.timeline.push({
      stage: lead.status || "Assigned",
      note: `Assigned lead to user`,
      updatedBy: req.user?.name || "Admin"
    });
    await lead.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Leads",
      description: `Assigned lead ${lead.name}`,
      targetId: lead._id
    });

    res.json({ success: true, data: lead, message: "Lead assigned successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/leads/convert
export const convertLead = async (req, res) => {
  try {
    const { leadId, convertTo = "Client" } = req.body;
    const lead = await Lead.findById(leadId || req.body.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    lead.status = "Converted";
    lead.timeline.push({
      stage: "Converted",
      note: `Lead converted to ${convertTo}`,
      updatedBy: req.user?.name || "Admin"
    });
    await lead.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Converted",
      module: "Leads",
      description: `Converted lead ${lead.name}`,
      targetId: lead._id
    });

    res.json({ success: true, data: lead, message: `Lead successfully converted` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

