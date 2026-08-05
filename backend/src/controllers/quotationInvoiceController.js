import Invoice from "../models/Invoice.js";
import Quotation from "../models/Quotation.js";
import { logActivity } from "../services/auditService.js";
import { generatePdfDoc } from "../services/exportService.js";

// Invoices
export const getInvoices = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [{ invoiceNumber: new RegExp(search, "i") }, { clientName: new RegExp(search, "i") }];
    if (status) query.status = status;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const total = await Invoice.countDocuments(query);

    res.json({ success: true, data: invoices, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const invNum = "INV-VEL-" + Math.floor(1000 + Math.random() * 9000);
    const invoice = await Invoice.create({ ...req.body, invoiceNumber: invNum });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Invoices", description: `Created Invoice ${invNum}` });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const exportInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const lines = [
      `Invoice Number: ${invoice.invoiceNumber || "N/A"}`,
      `Client Name: ${invoice.clientName || "N/A"}`,
      `Status: ${invoice.status || "Pending"}`,
      `Issue Date: ${new Date(invoice.issueDate || Date.now()).toLocaleDateString()}`,
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
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuotation = async (req, res) => {
  try {
    const qNum = "QUOTE-VEL-" + Math.floor(1000 + Math.random() * 9000);
    const quote = await Quotation.create({ ...req.body, quotationNumber: qNum });
    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
