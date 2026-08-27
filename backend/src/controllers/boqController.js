import mongoose from "mongoose";
import BOQ from "../models/BOQ.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";
import { generateBOQPdf } from "../services/exportService.js";

// Helper to sync BOQ data, full Client profile & generate/sync Invoice
export const syncClientCommercialsFromBOQ = async (boq) => {
  try {
    if (!boq || !boq.clientName) return null;

    let client = null;
    if (boq.client) {
      client = await Client.findById(boq.client);
    }
    if (!client && boq.clientPhone) {
      client = await Client.findOne({ phone: boq.clientPhone });
    }
    if (!client && boq.clientEmail) {
      client = await Client.findOne({ email: boq.clientEmail });
    }
    if (!client && boq.clientName) {
      client = await Client.findOne({ name: boq.clientName });
    }

    const spaceNames = (boq.spaces || []).map((s) => s.name);
    const grandTotal = boq.grandTotal || 0;
    const subtotal = boq.subtotal || Math.round(grandTotal / 1.18);
    const gstTotal = boq.gstTotal || Math.round(grandTotal - grandTotal / 1.18);
    const budgetRange =
      grandTotal > 5000000 ? "₹60L - ₹90L" : grandTotal > 2500000 ? "₹25L - ₹40L" : "₹15L - ₹25L";

    if (!client) {
      const cCount = await Client.countDocuments();
      const cCode = `VEL-CL-${String(cCount + 1001)}`;
      client = await Client.create({
        clientId: cCode,
        clientCode: cCode,
        name: boq.clientName,
        phone: boq.clientPhone || "9876543210",
        email: boq.clientEmail || `${boq.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.velora.com`,
        address: boq.address || boq.clientAddress || "Pune, Maharashtra",
        siteAddress: boq.siteAddress || boq.clientAddress || "Pune, Maharashtra",
        enquiryNo: boq.enquiryNo || "",
        enquiryDate: boq.enquiryDate || new Date(),
        projectType: `${boq.numberOfSpaces || spaceNames.length || 1}BHK Luxury Residence`,
        preferredStyle: boq.activePackage ? `${boq.activePackage} Luxury` : "Modern Contemporary",
        budgetRange,
        approximateBudget: grandTotal || 2500000,
        spaceRequirements: spaceNames.length ? spaceNames : ["Living Room", "Modular Kitchen", "Master Bedroom"],
        status: "Active",
        boqs: [boq._id],
        commercialSummary: {
          subtotal,
          discountTotal: boq.discountTotal || 0,
          additionalCharges: boq.additionalCharges || {
            installation: 0,
            transportation: 0,
            design: 0,
            labour: 0,
            other: 0,
            totalCharges: 0
          },
          taxGst: gstTotal,
          grandTotal,
          paidAmount: 0,
          balanceDue: grandTotal
        }
      });
    } else {
      if (!client.boqs.includes(boq._id)) {
        client.boqs.push(boq._id);
      }
      if (boq.clientPhone && (!client.phone || client.phone === "9876543210")) client.phone = boq.clientPhone;
      if (boq.clientEmail && (!client.email || client.email.includes("@client.velora.com"))) client.email = boq.clientEmail;
      if (spaceNames.length > 0) client.spaceRequirements = spaceNames;
      if (grandTotal > 0) {
        client.approximateBudget = grandTotal;
        client.budgetRange = budgetRange;
      }

      const paid = client.commercialSummary?.paidAmount || 0;
      client.commercialSummary = {
        subtotal,
        discountTotal: boq.discountTotal || 0,
        additionalCharges: boq.additionalCharges || {
          installation: 0,
          transportation: 0,
          design: 0,
          labour: 0,
          other: 0,
          totalCharges: 0
        },
        taxGst: gstTotal,
        grandTotal,
        paidAmount: paid,
        balanceDue: Math.max(0, grandTotal - paid)
      };
      await client.save();
    }

    // Ensure BOQ has client reference
    if (!boq.client || String(boq.client) !== String(client._id)) {
      boq.client = client._id;
      await BOQ.findByIdAndUpdate(boq._id, { client: client._id });
    }

    // Sync Invoice
    let invoice = await Invoice.findOne({
      $or: [
        { boq: boq._id },
        { boqNumber: boq.boqNumber },
        { invoiceNumber: `INV-${boq.boqNumber.replace(/^BOQ-?/i, "")}` },
        { invoiceNumber: `VLA-INV-${boq.boqNumber.replace(/^BOQ-?/i, "")}` }
      ]
    });

    const invoiceItems = [];
    (boq.spaces || []).forEach((sp) => {
      if (sp.items && sp.items.length > 0) {
        sp.items.forEach((item) => {
          invoiceItems.push({
            productId: item.productId || "",
            productName: item.name,
            category: sp.name || item.category || "Interior Component",
            image: item.image || (item.photos && item.photos[0] ? item.photos[0].url : ""),
            description: item.description || `${sp.name} - ${item.typeVariant || "Standard"}`,
            dimensions: item.customDimensions || (item.lengthFt ? `${item.lengthFt}'${item.lengthIn || 0}" x ${item.heightFt || 0}'${item.heightIn || 0}"` : ""),
            hsnSac: "995476",
            quantity: item.qty || 1,
            unit: item.unit || "sqft",
            rate: item.rate || 0,
            discount: item.discount || 0,
            gstPercent: item.taxPercent || 18,
            gstAmount: item.taxAmount || Math.round((item.amount || 0) * 0.18),
            total: item.amount || Math.round((item.sqft || 1) * (item.rate || 0)),
            notes: item.notes || ""
          });
        });
      } else if (sp.roomTotal > 0) {
        invoiceItems.push({
          productName: `${sp.name} Scope Execution`,
          category: "Interior Space",
          description: `Turnkey execution for ${sp.name}`,
          hsnSac: "995476",
          quantity: 1,
          unit: "Space",
          rate: sp.roomTotal,
          total: sp.roomTotal
        });
      }
    });

    const invNum = `VLA-INV-${boq.boqNumber.replace(/^BOQ-?/i, "")}`;

    if (!invoice) {
      invoice = await Invoice.create({
        invoiceNumber: invNum,
        client: client._id,
        clientId: client.clientId || client.clientCode,
        boq: boq._id,
        boqNumber: boq.boqNumber,
        invoiceType: "Turnkey Execution",
        projectName: `${boq.clientName} Residence`,
        clientName: boq.clientName,
        clientEmail: boq.clientEmail || client.email,
        clientPhone: boq.clientPhone || client.phone,
        clientAddress: client.address || "Pune",
        billTo: {
          name: boq.clientName,
          email: boq.clientEmail || client.email,
          phone: boq.clientPhone || client.phone,
          address: client.address || "Pune"
        },
        shipTo: {
          name: boq.clientName,
          email: boq.clientEmail || client.email,
          phone: boq.clientPhone || client.phone,
          address: client.siteAddress || client.address || "Pune"
        },
        sameAsBillTo: true,
        items: invoiceItems,
        subtotal,
        discountTotal: boq.discountTotal || 0,
        additionalCharges: boq.additionalCharges || {
          installation: 0,
          transportation: 0,
          design: 0,
          labour: 0,
          other: 0,
          totalCharges: 0
        },
        taxPercent: 18,
        gstTotal,
        grandTotal,
        paidAmount: client.commercialSummary?.paidAmount || 0,
        balanceDue: Math.max(0, grandTotal - (client.commercialSummary?.paidAmount || 0)),
        status: "Issued",
        issueDate: boq.enquiryDate || new Date()
      });
    } else {
      invoice.client = client._id;
      invoice.clientId = client.clientId || client.clientCode;
      invoice.clientName = boq.clientName;
      invoice.clientEmail = boq.clientEmail || client.email;
      invoice.clientPhone = boq.clientPhone || client.phone;
      invoice.items = invoiceItems;
      invoice.subtotal = subtotal;
      invoice.gstTotal = gstTotal;
      invoice.grandTotal = grandTotal;
      invoice.balanceDue = Math.max(0, grandTotal - (invoice.paidAmount || 0));
      await invoice.save();
    }

    if (!client.invoices.includes(invoice._id)) {
      client.invoices.push(invoice._id);
      await client.save();
    }

    return { client, invoice };
  } catch (e) {
    console.error("syncClientCommercialsFromBOQ error:", e);
    return null;
  }
};

const SEED_BOQS = [
  {
    boqNumber: "BOQ-2026-018",
    enquiryNo: "ENQ-2026-018",
    enquiryDate: new Date("2026-08-08"),
    clientName: "Rajeev Singhal",
    clientEmail: "rajeev.s@example.com",
    clientPhone: "89482 74553",
    numberOfSpaces: 10,
    activePackage: "Standard",
    activeCategory: "Component",
    grandTotal: 3964567,
    status: "Draft",
    spaces: [
      {
        name: "Entrance",
        roomTotal: 75813,
        items: [
          {
            name: "Shoe Rack",
            typeVariant: "Box Standard",
            lengthFt: 1,
            lengthIn: 6,
            heightFt: 9,
            heightIn: 3,
            depthFt: 0,
            depthIn: 0,
            qty: 1,
            description: "Providing of size (4ft x 3ft) shoe rack",
            sqft: 13.875,
            rate: 1500,
            amount: 20813
          },
          {
            name: "Entrance Safety Door",
            typeVariant: "Frame Standard",
            lengthFt: 1,
            lengthIn: 0,
            heightFt: 1,
            heightIn: 0,
            depthFt: 0,
            depthIn: 0,
            qty: 1,
            description: "Entrance area safety grill door",
            sqft: 1,
            rate: 40000,
            amount: 40000
          },
          {
            name: "Smart Lock",
            typeVariant: "Box Standard",
            lengthFt: 1,
            lengthIn: 0,
            heightFt: 1,
            heightIn: 0,
            depthFt: 0,
            depthIn: 0,
            qty: 1,
            description: "Digital smart security lock",
            sqft: 1,
            rate: 15000,
            amount: 15000
          }
        ]
      },
      {
        name: "Entrance (Copy)",
        roomTotal: 0,
        items: []
      },
      {
        name: "PUJA ROOM",
        roomTotal: 85000,
        items: []
      },
      {
        name: "Living Room",
        roomTotal: 420000,
        items: []
      },
      {
        name: "Modular Kitchen",
        roomTotal: 650000,
        items: []
      },
      {
        name: "Dining Area",
        roomTotal: 120000,
        items: []
      },
      {
        name: "Master Bedroom",
        roomTotal: 580000,
        items: []
      },
      {
        name: "Kids Bedroom",
        roomTotal: 340000,
        items: []
      },
      {
        name: "Parents Bedroom",
        roomTotal: 310000,
        items: []
      },
      {
        name: "Guest Bedroom",
        roomTotal: 250000,
        items: []
      }
    ]
  },
  {
    boqNumber: "BOQ-2026-017",
    enquiryNo: "ENQ-2026-017",
    enquiryDate: new Date("2026-07-11"),
    clientName: "Rasid sir",
    clientEmail: "rasid@example.com",
    clientPhone: "84128 52592",
    numberOfSpaces: 1,
    activePackage: "Standard",
    grandTotal: 185000,
    status: "Draft",
    spaces: [{ name: "Showroom Front", roomTotal: 185000, items: [] }]
  },
  {
    boqNumber: "BOQ-2026-016",
    enquiryNo: "ENQ-2026-016",
    enquiryDate: new Date("2026-06-21"),
    clientName: "Meenakshi Krishnani",
    clientEmail: "meenakshi@example.com",
    clientPhone: "91671 35606",
    numberOfSpaces: 5,
    activePackage: "Premium",
    grandTotal: 1450000,
    status: "Approved",
    spaces: []
  },
  {
    boqNumber: "BOQ-2026-015",
    enquiryNo: "ENQ-2026-015",
    enquiryDate: new Date("2026-06-18"),
    clientName: "Khushi",
    clientEmail: "khushi@example.com",
    clientPhone: "73551 23408",
    numberOfSpaces: 1,
    activePackage: "Standard",
    grandTotal: 95000,
    status: "Draft",
    spaces: []
  },
  {
    boqNumber: "BOQ-2026-014",
    enquiryNo: "ENQ-2026-014",
    enquiryDate: new Date("2026-05-25"),
    clientName: "Akash Jain",
    clientEmail: "abc@gmail.com",
    clientPhone: "89778 99643",
    numberOfSpaces: 8,
    activePackage: "Elite",
    grandTotal: 2200000,
    status: "Draft",
    spaces: []
  },
  {
    boqNumber: "BOQ-2026-013",
    enquiryNo: "ENQ-2026-013",
    enquiryDate: new Date("2026-08-13"),
    clientName: "PREM SHUKLA",
    clientEmail: "PREMSHUKLA@GMAIL.COM",
    clientPhone: "78000 20496",
    numberOfSpaces: 1,
    activePackage: "Elite",
    grandTotal: 4500000,
    status: "Draft",
    spaces: []
  },
  {
    boqNumber: "BOQ-2026-012",
    enquiryNo: "ENQ-2026-012",
    enquiryDate: new Date("2026-05-19"),
    clientName: "Dr Saurabh",
    clientEmail: "abc@gmail.com",
    clientPhone: "77090 19535",
    numberOfSpaces: 2,
    activePackage: "Standard",
    grandTotal: 850000,
    status: "Draft",
    spaces: []
  },
  {
    boqNumber: "BOQ-2026-011",
    enquiryNo: "ENQ-2026-011",
    enquiryDate: new Date("2026-04-28"),
    clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
    clientEmail: "contact@wiprolincraft.com",
    clientPhone: "96323 00992",
    numberOfSpaces: 1,
    activePackage: "Elite",
    grandTotal: 12000000,
    status: "Draft",
    spaces: []
  }
];

// GET /api/erp/boq
export const getBOQs = async (req, res) => {
  try {
    const { search = "", leadId = "", projectId = "", page = 1, limit = 10 } = req.query;

    const count = await BOQ.countDocuments();
    if (count === 0) {
      await BOQ.insertMany(SEED_BOQS);
    }

    const query = {};
    if (search) {
      query.$or = [
        { boqNumber: new RegExp(search, "i") },
        { enquiryNo: new RegExp(search, "i") },
        { clientName: new RegExp(search, "i") },
        { clientEmail: new RegExp(search, "i") },
        { clientPhone: new RegExp(search, "i") }
      ];
    }
    if (leadId) query.lead = leadId;
    if (projectId) query.project = projectId;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const boqs = await BOQ.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await BOQ.countDocuments(query);

    res.json({
      success: true,
      data: boqs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/erp/boq/:id
export const getBOQById = async (req, res) => {
  try {
    let boq = await BOQ.findById(req.params.id);
    if (!boq) {
      // Allow searching by enquiryNo or boqNumber
      boq = await BOQ.findOne({
        $or: [{ enquiryNo: req.params.id }, { boqNumber: req.params.id }]
      });
    }
    if (!boq) return res.status(404).json({ success: false, message: "BOQ not found" });

    res.json({ success: true, data: boq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/erp/boq
export const createBOQ = async (req, res) => {
  try {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const boqNumber = req.body.boqNumber || `BOQ-2026-${randomSuffix}`;
    const enquiryNo = req.body.enquiryNo || `ENQ-2026-${randomSuffix}`;

    const boq = await BOQ.create({
      ...req.body,
      boqNumber,
      enquiryNo
    });

    const synced = await syncClientCommercialsFromBOQ(boq);

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "BOQ",
      description: `Created BOQ ${boq.boqNumber} for ${boq.clientName}`
    });

    res.status(201).json({
      success: true,
      data: boq,
      client: synced?.client || null,
      invoice: synced?.invoice || null
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/erp/boq/:id
export const updateBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!boq) return res.status(404).json({ success: false, message: "BOQ not found" });

    const synced = await syncClientCommercialsFromBOQ(boq);

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "BOQ",
      description: `Updated BOQ ${boq.boqNumber}`
    });

    res.json({
      success: true,
      data: boq,
      client: synced?.client || null,
      invoice: synced?.invoice || null
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/erp/boq/:id
export const deleteBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndDelete(req.params.id);
    if (!boq) return res.status(404).json({ success: false, message: "BOQ not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "BOQ",
      description: `Deleted BOQ ${boq.boqNumber}`
    });

    res.json({ success: true, message: "BOQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/erp/boq/:id/pdf
export const exportBOQPdf = async (req, res) => {
  try {
    const param = req.params.id;
    let boq = null;

    if (param && mongoose.Types.ObjectId.isValid(param)) {
      boq = await BOQ.findById(param).populate("lead");
    }

    if (!boq && param) {
      boq = await BOQ.findOne({
        $or: [
          { boqNumber: param },
          { enquiryNo: param },
          { boqNumber: new RegExp(param.replace(/[^a-zA-Z0-9]/g, ""), "i") },
          { enquiryNo: new RegExp(param.replace(/[^a-zA-Z0-9]/g, ""), "i") }
        ]
      }).populate("lead");
    }

    // Check SEED_BOQS or fallback by number match (e.g. boq18 -> BOQ-2026-018)
    if (!boq) {
      const numMatch = param ? param.match(/\d+/) : null;
      const numStr = numMatch ? numMatch[0] : null;

      const foundSeed = SEED_BOQS.find((b) => {
        if (b.boqNumber === param || b.enquiryNo === param) return true;
        if (numStr && (b.boqNumber.includes(numStr) || b.enquiryNo.includes(numStr))) return true;
        return false;
      });

      boq = foundSeed || SEED_BOQS[0];
    }

    generateBOQPdf(res, boq);
  } catch (err) {
    console.error("exportBOQPdf Error:", err);
    try {
      generateBOQPdf(res, SEED_BOQS[0]);
    } catch (e) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
