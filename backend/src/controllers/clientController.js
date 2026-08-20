import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";

const SEED_CLIENTS = [
  {
    clientCode: "VEL-CL-1001",
    name: "Rajeev Singhal",
    phone: "89482 74553",
    email: "rajeev.s@example.com",
    city: "Pune",
    address: "Koregaon Park, Pune",
    projectType: "4BHK Luxury Apartment",
    preferredStyle: "Minimalist Luxury & Gold Brass Accents",
    budgetRange: "₹40L - ₹60L",
    spaceRequirements: ["Entrance", "Living Room", "Modular Kitchen", "Dining Area", "Master Bedroom", "Puja Room"],
    status: "Active",
    notes: "High-end luxury Italian marble and soft-close hardware preferred."
  },
  {
    clientCode: "VEL-CL-1002",
    name: "Meenakshi Krishnani",
    phone: "91671 35606",
    email: "meenakshi@example.com",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    projectType: "3BHK Modern Villa",
    preferredStyle: "Modern Contemporary",
    budgetRange: "₹30L - ₹45L",
    spaceRequirements: ["Living Room", "Modular Kitchen", "Kids Bedroom", "Guest Bedroom"],
    status: "Active",
    notes: "Requires acoustic paneling and smart lighting integration."
  },
  {
    clientCode: "VEL-CL-1003",
    name: "PREM SHUKLA",
    phone: "78000 20496",
    email: "premshukla@gmail.com",
    city: "Pune",
    address: "Baner, Pune",
    projectType: "Penthouse",
    preferredStyle: "Neo-Classical Bespoke",
    budgetRange: "₹60L - ₹90L",
    spaceRequirements: ["Living Room", "Master Suite", "Home Theater", "Balcony Lounge"],
    status: "Active",
    notes: "Elite luxury specifications throughout with fluted wall panels."
  },
  {
    clientCode: "VEL-CL-1004",
    name: "Akash Jain",
    phone: "89778 99643",
    email: "akash.jain@example.com",
    city: "Pune",
    address: "Kalyani Nagar, Pune",
    projectType: "3BHK Apartment",
    preferredStyle: "Scandinavian Warm Wood",
    budgetRange: "₹25L - ₹35L",
    spaceRequirements: ["Entrance", "Living Room", "Modular Kitchen", "Master Bedroom"],
    status: "Active",
    notes: "Wants focus on storage optimization and modular kitchen."
  },
  {
    clientCode: "VEL-CL-1005",
    name: "WIPRO LINCRAFT AI PRIVATE LIMITED",
    phone: "96323 00992",
    email: "contact@wiprolincraft.com",
    city: "Bengaluru",
    address: "Electronic City, Bengaluru",
    projectType: "Commercial Executive Office",
    preferredStyle: "Modern Corporate Luxury",
    budgetRange: "₹1.2Cr - ₹1.5Cr",
    spaceRequirements: ["Reception", "Boardroom", "Executive Cabins", "Breakout Zone"],
    status: "Active",
    notes: "Executive interiors with acoustic partitions and biometric systems."
  }
];

export const getClients = async (req, res) => {
  try {
    const count = await Client.countDocuments();
    if (count === 0) {
      await Client.insertMany(SEED_CLIENTS);
    }

    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { clientCode: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { projectType: new RegExp(search, "i") }
      ];
    }
    if (status) query.status = status;

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
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Updated", module: "Clients", description: `Updated client profile & requirements for ${client.name}` });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Deleted", module: "Clients", description: `Deleted client ${client.name}` });
    res.json({ success: true, message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
