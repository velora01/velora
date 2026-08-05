import WebsiteLead from "../models/WebsiteLead.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";

export const getWebsiteLeads = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    }
    if (status) query.status = status;

    const leads = await WebsiteLead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await WebsiteLead.countDocuments(query);

    res.json({ success: true, data: leads, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createWebsiteLead = async (req, res) => {
  try {
    const webLead = await WebsiteLead.create(req.body);
    await logActivity({ userName: "Public Web", action: "Created", module: "WebsiteLeads", description: `Website inquiry from ${webLead.name}` });
    res.status(201).json({ success: true, data: webLead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const convertWebsiteLead = async (req, res) => {
  try {
    const webLead = await WebsiteLead.findById(req.params.id);
    if (!webLead) return res.status(404).json({ success: false, message: "Inquiry not found" });

    // Convert to CRM Lead
    const newLead = await Lead.create({
      name: webLead.name,
      phone: webLead.phone,
      email: webLead.email,
      city: webLead.city,
      propertyType: webLead.propertyType,
      budget: webLead.budget,
      source: "Website",
      status: "Qualified",
      notes: webLead.message
    });

    webLead.status = "Converted to Lead";
    webLead.convertedLeadId = newLead._id;
    await webLead.save();

    res.json({ success: true, data: newLead, message: "Successfully converted to CRM Lead" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
