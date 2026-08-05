import Lead from "../models/Lead.js";
import Project from "../models/Project.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Production from "../models/Production.js";
import { generateExcelReport } from "../services/exportService.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const runningProjects = await Project.countDocuments({ stage: { $ne: "Completed" } });
    const completedProjects = await Project.countDocuments({ stage: "Completed" });
    const pendingInvoices = await Invoice.find({ status: { $ne: "Paid" } });
    const pendingPayments = pendingInvoices.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);

    const payments = await Payment.find();
    const revenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        runningProjects,
        completedProjects,
        pendingPayments,
        revenue,
        monthlyRevenue: Math.round(revenue * 0.35),
        conversionRate: "74.2%"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportReportExcel = async (req, res) => {
  try {
    const { type } = req.params; // "sales", "revenue", "projects", "factory"
    
    if (type === "sales" || type === "leads") {
      const leads = await Lead.find();
      const columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Status", key: "status", width: 15 },
        { header: "Source", key: "source", width: 15 }
      ];
      return await generateExcelReport(res, "Velora_Sales_Report", columns, leads);
    }

    if (type === "projects") {
      const projects = await Project.find();
      const columns = [
        { header: "Project Title", key: "heading", width: 25 },
        { header: "Client", key: "clientName", width: 20 },
        { header: "Stage", key: "stage", width: 18 },
        { header: "Progress %", key: "progressPercent", width: 12 },
        { header: "Budget", key: "budget", width: 15 }
      ];
      return await generateExcelReport(res, "Velora_Projects_Report", columns, projects);
    }

    if (type === "revenue" || type === "invoices") {
      const invoices = await Invoice.find();
      const columns = [
        { header: "Invoice #", key: "invoiceNumber", width: 18 },
        { header: "Client", key: "clientName", width: 20 },
        { header: "Grand Total", key: "grandTotal", width: 15 },
        { header: "Paid Amount", key: "paidAmount", width: 15 },
        { header: "Balance Due", key: "balanceDue", width: 15 },
        { header: "Status", key: "status", width: 15 }
      ];
      return await generateExcelReport(res, "Velora_Financial_Revenue_Report", columns, invoices);
    }

    if (type === "factory" || type === "production") {
      const items = await Production.find();
      const columns = [
        { header: "Order Code", key: "productionCode", width: 18 },
        { header: "Project", key: "projectName", width: 22 },
        { header: "Factory Location", key: "factoryLocation", width: 18 },
        { header: "Manager", key: "assignedFactoryManager", width: 20 },
        { header: "Stage Status", key: "status", width: 16 }
      ];
      return await generateExcelReport(res, "Velora_Factory_Production_Report", columns, items);
    }

    res.status(400).json({ success: false, message: "Invalid report type specified" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
