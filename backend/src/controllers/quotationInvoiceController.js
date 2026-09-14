import Invoice from "../models/Invoice.js";
import Quotation from "../models/Quotation.js";
import Client from "../models/Client.js";
import { logActivity } from "../services/auditService.js";
import { generatePdfDoc, generateInvoicePdfDoc } from "../services/exportService.js";

// GET /api/erp/invoices
export const getInvoices = async (req, res) => {
  try {
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
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    generateInvoicePdfDoc(res, invoice);
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
