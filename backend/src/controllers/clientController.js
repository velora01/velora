import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";

export const getClients = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }, { clientCode: new RegExp(search, "i") }];
    }

    const clients = await Client.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Client.countDocuments(query);

    res.json({ success: true, data: clients, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const code = "VEL-CL-" + Math.floor(1000 + Math.random() * 9000);
    const client = await Client.create({ ...req.body, clientCode: code });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Clients", description: `Created client profile ${client.name}` });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addClientCommunication = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    client.communicationHistory.push({
      channel: req.body.channel || "Call",
      summary: req.body.summary,
      performedBy: req.user?.name || "Staff"
    });
    await client.save();

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
