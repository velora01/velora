import Client from "../models/Client.js";
import BOQ from "../models/BOQ.js";
import { logActivity } from "../services/auditService.js";

export const getClients = async (req, res) => {
  try {

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

export const addClientDocument = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    const newDoc = {
      title: req.body.title || req.body.name || "Untitled Document",
      name: req.body.name || req.body.title || "Untitled Document",
      fileName: req.body.fileName || req.body.title || "document.pdf",
      url: req.body.url || "",
      fileType: req.body.fileType || "PDF",
      category: req.body.category || "Floor Plans",
      fileSize: req.body.fileSize || "1.2 MB",
      uploadedBy: req.user?.name || "Admin",
      uploadedAt: new Date()
    };

    if (!client.documents) client.documents = [];
    client.documents.push(newDoc);
    await client.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Uploaded",
      module: "Clients",
      description: `Uploaded document '${newDoc.title}' for client ${client.name}`
    });

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteClientDocument = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    const docId = req.params.docId;
    client.documents = (client.documents || []).filter(
      (d) => String(d._id) !== String(docId) && String(d.id) !== String(docId)
    );
    await client.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Clients",
      description: `Deleted document from client ${client.name}`
    });

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};