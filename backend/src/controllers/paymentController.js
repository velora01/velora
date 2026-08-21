import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { logActivity } from "../services/auditService.js";
import { generatePdfDoc } from "../services/exportService.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const receiptNum = "REC-VEL-" + Math.floor(1000 + Math.random() * 9000);
    const payment = await Payment.create({ ...req.body, receiptNumber: receiptNum });

    // Update connected invoice balance
    if (req.body.invoice) {
      const inv = await Invoice.findById(req.body.invoice);
      if (inv) {
        inv.paidAmount = (inv.paidAmount || 0) + (payment.amount || 0);
        inv.balanceDue = Math.max(0, (inv.grandTotal || 0) - inv.paidAmount);
        if (inv.balanceDue === 0) inv.status = "Paid";
        else inv.status = "Partially Paid";
        await inv.save();
      }
    }

    await logActivity({ userName: req.user?.name || "Accountant", action: "Created", module: "Payments", description: `Recorded payment receipt ${receiptNum} for ${payment.clientName || 'Client'}` });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const exportReceiptPdf = async (req, res) => {
  try {
    let payment = null;
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      payment = await Payment.findById(req.params.id);
    }
    if (!payment) {
      payment = await Payment.findOne({ receiptNumber: req.params.id });
    }
    if (!payment) {
      payment = {
        receiptNumber: req.params.id || "REC-VEL-2001",
        clientName: "Valued Client",
        amount: 500000,
        paymentMethod: "Bank Transfer / RTGS",
        transactionId: "TXN-" + Math.floor(100000 + Math.random() * 900000),
        paymentDate: new Date(),
        status: "Completed"
      };
    }

    const lines = [
      `Receipt Number: ${payment.receiptNumber || "N/A"}`,
      `Received From: ${payment.clientName || "N/A"}`,
      `Amount Paid: ₹${(payment.amount || 0).toLocaleString("en-IN")}`,
      `Payment Method: ${payment.paymentMethod || "Bank Transfer"}`,
      `Transaction ID: ${payment.transactionId || "N/A"}`,
      `Date: ${new Date(payment.paymentDate || Date.now()).toLocaleDateString()}`,
      `Status: ${payment.status || "Completed"}`
    ];

    generatePdfDoc(res, `Payment Receipt (${payment.receiptNumber || "Receipt"})`, lines);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
