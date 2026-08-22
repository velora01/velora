import Invoice from "../models/Invoice.js";
import Quotation from "../models/Quotation.js";
import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";
import { generatePdfDoc } from "../services/exportService.js";

const SEED_INVOICES = [
  {
    invoiceNumber: "NCIA003",
    projectName: "PREM SHUKLA",
    projectNumber: "PRJ-2026-008",
    invoiceType: "Supply",
    clientName: "PREM SHUKLA",
    clientEmail: "PREMSHUKLA@GMAIL.COM",
    clientPhone: "+91 78000 20496",
    clientAddress: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, WAKAD, PUNE, MAHARASHTRA, 411057",
    billTo: {
      name: "PREM SHUKLA",
      email: "PREMSHUKLA@GMAIL.COM",
      phone: "+91 78000 20496",
      gstin: "",
      address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, WAKAD, PUNE, MAHARASHTRA, 411057"
    },
    shipTo: {
      name: "PREM SHUKLA",
      email: "PREMSHUKLA@GMAIL.COM",
      phone: "+91 78000 20496",
      gstin: "",
      address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, PIMPRI CHINCHWAD, WAKAD, PUNE, MAHARASHTRA, 411057"
    },
    sameAsBillTo: true,
    items: [
      {
        productName: "Queen Size Bed, With Cush",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "30",
        rate: 36000,
        gstPercent: 0,
        gstAmount: 0,
        total: 36000
      },
      {
        productName: "King Size Bed Hydrolic",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "45.5",
        rate: 64000,
        gstPercent: 0,
        gstAmount: 0,
        total: 64000
      },
      {
        productName: "Openable Wardrobe 1",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "42.5",
        rate: 55000,
        gstPercent: 0,
        gstAmount: 0,
        total: 55000
      },
      {
        productName: "Openable Wardrobe 2, Study",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "59.5",
        rate: 71400,
        gstPercent: 0,
        gstAmount: 0,
        total: 71400
      },
      {
        productName: "Openable Wardrobe 3, Study",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "34",
        rate: 40800,
        gstPercent: 0,
        gstAmount: 0,
        total: 40800
      },
      {
        productName: "Study Table",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "56",
        rate: 67200,
        gstPercent: 0,
        gstAmount: 0,
        total: 67200
      },
      {
        productName: "Side Table",
        hsnSac: "HSN/SAC",
        quantity: 4,
        unit: "1.96",
        rate: 5500,
        gstPercent: 0,
        gstAmount: 0,
        total: 22000
      },
      {
        productName: "Dressing",
        hsnSac: "HSN/SAC",
        quantity: 3,
        unit: "Unit",
        rate: 21000,
        gstPercent: 0,
        gstAmount: 0,
        total: 63000
      },
      {
        productName: "Shoe Rack, With Side Sitting",
        hsnSac: "HSN/SAC",
        quantity: 1,
        unit: "12",
        rate: 14400,
        gstPercent: 0,
        gstAmount: 0,
        total: 14400
      }
    ],
    subtotal: 468800,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 468800,
    paidAmount: 0,
    balanceDue: 468800,
    status: "Issued",
    issueDate: new Date("2026-08-13"),
    dueDate: null,
    termsAndConditions: "TERMS & CONDITIONS\nFor Interior Design & Turnkey Execution\n1. 50% advance along with work order confirmation.\n2. 40% upon material delivery at site or production clearance.\n3. Balance 10% on completion and final handover.",
    bankDetails: "Account Holder: NETTLE CREEK INTERIORS\nAccount Number: 50200073374185\nBank Name: HDFC Bank, Wakad Branch\nIFSC Code: HDFC0000123"
  },
  {
    invoiceNumber: "NCI005",
    projectName: "Rashid sir Showroom",
    projectNumber: "PRJ-2026-005",
    invoiceType: "Supply",
    clientName: "Rashid sir",
    clientEmail: "rasid@example.com",
    clientPhone: "+91 84128 52592",
    clientAddress: "Bafana Complex, Pune",
    billTo: { name: "Rashid sir", phone: "+91 84128 52592", email: "rasid@example.com", address: "Bafana Complex, Pune" },
    items: [{ productName: "Custom Display Units & Shelving", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 23364, gstPercent: 0, gstAmount: 0, total: 23364 }],
    subtotal: 23364,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 23364,
    balanceDue: 23364,
    status: "Issued",
    issueDate: new Date("2026-07-11")
  },
  {
    invoiceNumber: "NCI004",
    projectName: "Dr Hardik Clinic Phase 2",
    projectNumber: "PRJ-2026-004",
    invoiceType: "Supply",
    clientName: "Dr Hardik",
    clientEmail: "drhardik@example.com",
    clientPhone: "+91 98220 14592",
    clientAddress: "Kothrud, Pune",
    billTo: { name: "Dr Hardik", phone: "+91 98220 14592", email: "drhardik@example.com", address: "Kothrud, Pune" },
    items: [{ productName: "Reception Counter & Storage", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 194000, gstPercent: 0, gstAmount: 0, total: 194000 }],
    subtotal: 194000,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 194000,
    balanceDue: 194000,
    status: "Issued",
    issueDate: new Date("2026-06-05")
  },
  {
    invoiceNumber: "NCI003",
    projectName: "Dr Hardik Consultation Room",
    projectNumber: "PRJ-2026-004",
    invoiceType: "Supply",
    clientName: "Dr Hardik",
    clientEmail: "drhardik@example.com",
    clientPhone: "+91 98220 14592",
    clientAddress: "Kothrud, Pune",
    billTo: { name: "Dr Hardik", phone: "+91 98220 14592", email: "drhardik@example.com", address: "Kothrud, Pune" },
    items: [{ productName: "Doctor Consultation Cabin & Acoustic Panels", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 211000, gstPercent: 0, gstAmount: 0, total: 211000 }],
    subtotal: 211000,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 211000,
    balanceDue: 211000,
    status: "Issued",
    issueDate: new Date("2026-06-05")
  },
  {
    invoiceNumber: "NCI002",
    projectName: "Akash Jain 3BHK Residence",
    projectNumber: "PRJ-2026-002",
    invoiceType: "Supply",
    clientName: "Akash Jain",
    clientEmail: "akash.jain@example.com",
    clientPhone: "+91 89778 99643",
    clientAddress: "Kalyani Nagar, Pune",
    billTo: { name: "Akash Jain", phone: "+91 89778 99643", email: "akash.jain@example.com", address: "Kalyani Nagar, Pune" },
    items: [{ productName: "Living Room Wall Louvers & Console", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 0, gstPercent: 0, gstAmount: 0, total: 0 }],
    subtotal: 0,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 0,
    balanceDue: 0,
    status: "Paid",
    issueDate: new Date("2026-05-26")
  },
  {
    invoiceNumber: "NCI001",
    projectName: "Dr Saurabh Clinic",
    projectNumber: "PRJ-2026-001",
    invoiceType: "Supply",
    clientName: "Dr Saurabh",
    clientEmail: "dr.saurabh@example.com",
    clientPhone: "+91 77090 19535",
    clientAddress: "Aundh, Pune",
    billTo: { name: "Dr Saurabh", phone: "+91 77090 19535", email: "dr.saurabh@example.com", address: "Aundh, Pune" },
    items: [{ productName: "Modern Waiting Area & Partitions", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 324950, gstPercent: 0, gstAmount: 0, total: 324950 }],
    subtotal: 324950,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 324950,
    balanceDue: 324950,
    status: "Issued",
    issueDate: new Date("2026-05-19")
  },
  {
    invoiceNumber: "NCIA002",
    projectName: "Dr Hardik Phase 1",
    projectNumber: "PRJ-2026-004",
    invoiceType: "Supply",
    clientName: "Dr Hardik",
    clientEmail: "drhardik@example.com",
    clientPhone: "+91 98220 14592",
    clientAddress: "Kothrud, Pune",
    billTo: { name: "Dr Hardik", phone: "+91 98220 14592", email: "drhardik@example.com", address: "Kothrud, Pune" },
    items: [{ productName: "Initial Demolition & Framing Advance", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 0, gstPercent: 0, gstAmount: 0, total: 0 }],
    subtotal: 0,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 0,
    balanceDue: 0,
    status: "Paid",
    issueDate: new Date("2026-05-03")
  },
  {
    invoiceNumber: "NCIA001",
    projectName: "Wipro Executive Cabin",
    projectNumber: "PRJ-2026-001",
    invoiceType: "Supply",
    clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
    clientEmail: "contact@wiprolincraft.com",
    clientPhone: "+91 96323 00992",
    clientAddress: "Electronic City, Bengaluru",
    billTo: { name: "WIPRO LINCRAFT AI PRIVATE LIMITED", phone: "+91 96323 00992", email: "contact@wiprolincraft.com", address: "Electronic City, Bengaluru" },
    items: [{ productName: "Executive Ergonomic Desk & Partition", hsnSac: "HSN/SAC", quantity: 1, unit: "Unit", rate: 29000, gstPercent: 0, gstAmount: 0, total: 29000 }],
    subtotal: 29000,
    taxPercent: 0,
    gstTotal: 0,
    grandTotal: 29000,
    balanceDue: 29000,
    status: "Issued",
    issueDate: new Date("2026-04-30")
  }
];

// GET /api/erp/invoices
export const getInvoices = async (req, res) => {
  try {
    const count = await Invoice.countDocuments();
    if (count === 0) {
      await Invoice.insertMany(SEED_INVOICES);
    }

    const { search = "", status = "", page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: new RegExp(search, "i") },
        { clientName: new RegExp(search, "i") },
        { clientPhone: new RegExp(search, "i") },
        { clientEmail: new RegExp(search, "i") },
        { projectName: new RegExp(search, "i") }
      ];
    }
    if (status) query.status = status;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/erp/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    let invoice = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(req.params.id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    }
    if (!invoice) {
      // Fallback search seed
      invoice = SEED_INVOICES.find((inv) => inv.invoiceNumber === req.params.id) || null;
    }
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/erp/invoices
export const createInvoice = async (req, res) => {
  try {
    const invCount = await Invoice.countDocuments();
    const invNum = req.body.invoiceNumber || `VLA-INV-2026-${String(invCount + 1).padStart(4, "0")}`;
    
    // Auto-link client if not directly provided
    let clientId = req.body.client || null;
    let clientRecord = null;
    if (clientId) {
      clientRecord = await Client.findById(clientId);
    }
    if (!clientRecord && req.body.clientPhone) {
      clientRecord = await Client.findOne({ phone: req.body.clientPhone });
    }
    if (!clientRecord && req.body.clientName) {
      clientRecord = await Client.findOne({ name: req.body.clientName });
    }

    const invoice = await Invoice.create({
      ...req.body,
      client: clientRecord ? clientRecord._id : null,
      clientId: clientRecord ? (clientRecord.clientId || clientRecord.clientCode) : "",
      invoiceNumber: invNum
    });

    if (clientRecord) {
      if (!clientRecord.invoices.includes(invoice._id)) {
        clientRecord.invoices.push(invoice._id);
        await clientRecord.save();
      }
    }

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "Invoices",
      description: `Created Invoice ${invNum} for ${invoice.clientName}`
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/erp/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    let invoice = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
    if (!invoice) {
      invoice = await Invoice.findOneAndUpdate({ invoiceNumber: req.params.id }, req.body, { new: true });
    }
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    // Link to client if found
    if (invoice.clientName && !invoice.client) {
      const c = await Client.findOne({ name: invoice.clientName });
      if (c) {
        invoice.client = c._id;
        invoice.clientId = c.clientId || c.clientCode;
        await invoice.save();
        if (!c.invoices.includes(invoice._id)) {
          c.invoices.push(invoice._id);
          await c.save();
        }
      }
    }

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Invoices",
      description: `Updated Invoice ${invoice.invoiceNumber}`
    });

    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/erp/invoices/:id
export const deleteInvoice = async (req, res) => {
  try {
    let invoice = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findByIdAndDelete(req.params.id);
    }
    if (!invoice) {
      invoice = await Invoice.findOneAndDelete({ invoiceNumber: req.params.id });
    }
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Invoices",
      description: `Deleted Invoice ${invoice.invoiceNumber}`
    });

    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/erp/invoices/:id/pdf
export const exportInvoicePdf = async (req, res) => {
  try {
    let invoice = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(req.params.id);
    }
    if (!invoice) {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id });
    }
    if (!invoice) {
      invoice = SEED_INVOICES.find((inv) => inv.invoiceNumber === req.params.id) || SEED_INVOICES[0];
    }

    const lines = [
      `Invoice Number: ${invoice.invoiceNumber || "N/A"}`,
      `Project Name: ${invoice.projectName || invoice.clientName || "N/A"}`,
      `Client Name: ${invoice.clientName || "N/A"}`,
      `Status: ${invoice.status || "Pending"}`,
      `Issue Date: ${new Date(invoice.issueDate || Date.now()).toLocaleDateString("en-IN")}`,
      `------------------------------------------`,
      `Subtotal: ₹${(invoice.subtotal || 0).toLocaleString("en-IN")}`,
      `GST Amount: ₹${(invoice.gstTotal || 0).toLocaleString("en-IN")}`,
      `Grand Total: ₹${(invoice.grandTotal || 0).toLocaleString("en-IN")}`,
      `Amount Paid: ₹${(invoice.paidAmount || 0).toLocaleString("en-IN")}`,
      `Balance Due: ₹${(invoice.balanceDue || 0).toLocaleString("en-IN")}`
    ];

    generatePdfDoc(res, `Tax Invoice (${invoice.invoiceNumber || "Invoice"})`, lines);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Quotations
export const getQuotations = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [{ quotationNumber: new RegExp(search, "i") }, { clientName: new RegExp(search, "i") }];
    }
    if (status) query.status = status;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const quotations = await Quotation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await Quotation.countDocuments(query);

    res.json({ success: true, data: quotations, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuotation = async (req, res) => {
  try {
    const qNum = req.body.quotationNumber || "QUOTE-VEL-" + Math.floor(1000 + Math.random() * 9000);
    const quote = await Quotation.create({ ...req.body, quotationNumber: qNum });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Quotations", description: `Created Quotation ${qNum} for ${quote.clientName}` });
    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const quote = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quote) return res.status(404).json({ success: false, message: "Quotation not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Updated", module: "Quotations", description: `Updated Quotation ${quote.quotationNumber}` });
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const quote = await Quotation.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: "Quotation not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Deleted", module: "Quotations", description: `Deleted Quotation ${quote.quotationNumber}` });
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
