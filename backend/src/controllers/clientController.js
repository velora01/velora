import Client from "../models/Client.js";
import BOQ from "../models/BOQ.js";
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
  },
  {
    clientCode: "VEL-CL-1006",
    name: "Rashid sir",
    phone: "84128 52592",
    email: "rasid@example.com",
    city: "Pune",
    address: "Bafana Complex, Wakad, Pune",
    projectType: "Commercial Retail Boutique",
    preferredStyle: "Modern Retail Display",
    budgetRange: "₹15L - ₹25L",
    spaceRequirements: ["Showroom Front", "Display Racks", "Storage"],
    status: "Active",
    notes: "Commercial display units and custom shopfitting."
  },
  {
    clientCode: "VEL-CL-1007",
    name: "Dr Hardik",
    phone: "98220 14592",
    email: "drhardik@example.com",
    city: "Pune",
    address: "Kothrud, Pune",
    projectType: "Medical Clinic Luxury",
    preferredStyle: "Minimalist Modern Hygiene",
    budgetRange: "₹25L - ₹40L",
    spaceRequirements: ["Reception", "Consultation Cabin", "Waiting Lounge"],
    status: "Active",
    notes: "Clinic interior with acoustic wall panels and sleek laminate counters."
  },
  {
    clientCode: "VEL-CL-1008",
    name: "Dr Saurabh",
    phone: "77090 19535",
    email: "dr.saurabh@example.com",
    city: "Pune",
    address: "Aundh, Pune",
    projectType: "Wellness Clinic",
    preferredStyle: "Scandinavian Warm Wood",
    budgetRange: "₹20L - ₹35L",
    spaceRequirements: ["Waiting Lounge", "Doctor Suite", "Treatment Room"],
    status: "Active",
    notes: "Calming interior palette with warm LED lighting."
  },
  {
    clientCode: "VEL-CL-1009",
    name: "Khushi",
    phone: "73551 23408",
    email: "khushi@example.com",
    city: "Pune",
    address: "Kharadi, Pune",
    projectType: "2BHK Apartment",
    preferredStyle: "Modern Minimalist",
    budgetRange: "₹15L - ₹25L",
    spaceRequirements: ["Living Room", "Modular Kitchen", "Master Bedroom"],
    status: "Active",
    notes: "Compact modular smart storage solutions."
  }
];

export const getClients = async (req, res) => {
  try {
    const count = await Client.countDocuments();
    if (count === 0) {
      await Client.insertMany(SEED_CLIENTS);
    }

    // Auto-sync any BOQ clients into the Client collection
    try {
      const allBOQs = await BOQ.find();
      for (const b of allBOQs) {
        if (b.clientName) {
          let existing = await Client.findOne({
            $or: [
              { name: b.clientName },
              ...(b.clientPhone ? [{ phone: b.clientPhone }] : []),
              ...(b.clientEmail ? [{ email: b.clientEmail }] : [])
            ]
          });

          if (!existing) {
            const cCount = await Client.countDocuments();
            const cCode = `VEL-CL-${String(cCount + 1001)}`;
            await Client.create({
              clientId: cCode,
              clientCode: cCode,
              name: b.clientName,
              phone: b.clientPhone || "9876543210",
              email: b.clientEmail || `${b.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.velora.com`,
              enquiryNo: b.enquiryNo || "",
              status: "Active",
              boqs: [b._id],
              commercialSummary: {
                subtotal: b.subtotal || Math.round((b.grandTotal || 0) / 1.18),
                taxGst: b.gstTotal || Math.round((b.grandTotal || 0) - (b.grandTotal || 0) / 1.18),
                grandTotal: b.grandTotal || 0,
                paidAmount: 0,
                balanceDue: b.grandTotal || 0
              }
            });
          } else if (!existing.boqs.includes(b._id)) {
            existing.boqs.push(b._id);
            if (!existing.commercialSummary || !existing.commercialSummary.grandTotal) {
              existing.commercialSummary = {
                subtotal: b.subtotal || Math.round((b.grandTotal || 0) / 1.18),
                taxGst: b.gstTotal || Math.round((b.grandTotal || 0) - (b.grandTotal || 0) / 1.18),
                grandTotal: b.grandTotal || 0,
                paidAmount: existing.commercialSummary?.paidAmount || 0,
                balanceDue: b.grandTotal || 0
              };
            }
            await existing.save();
          }
        }
      }
    } catch (syncErr) {
      console.warn("BOQ client sync warning:", syncErr);
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

    const clients = await Client.find(query)
      .populate("boqs")
      .populate("invoices")
      .populate("enquiry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Client.countDocuments(query);

    res.json({ success: true, data: clients, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    let client = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      client = await Client.findById(req.params.id)
        .populate("boqs")
        .populate("invoices")
        .populate("enquiry");
    }
    if (!client) {
      client = await Client.findOne({
        $or: [{ clientCode: req.params.id }, { clientId: req.params.id }, { phone: req.params.id }]
      })
        .populate("boqs")
        .populate("invoices")
        .populate("enquiry");
    }
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    res.json({ success: true, data: client });
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
