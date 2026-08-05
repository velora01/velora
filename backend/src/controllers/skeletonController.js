import TimelineMilestone from "../models/TimelineMilestone.js";
import PortalTask from "../models/PortalTask.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import ProjectDocument from "../models/ProjectDocument.js";
import Notification from "../models/Notification.js";
import Meeting from "../models/Meeting.js";
import Invoice from "../models/Invoice.js";
import SupportTicket from "../models/SupportTicket.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import StoreProduct from "../models/StoreProduct.js";

// Helper to determine customer context and handle fallback/dummy generation
const getCustomerContext = async (req) => {
  if (req.userType === "Customer") {
    return req.user._id;
  }

  const reqCustomerId = req.query.customerId || req.body.customerId;
  if (reqCustomerId) {
    return reqCustomerId;
  }

  // Return the first actual customer if exists
  const firstCustomer = await Customer.findOne();
  if (firstCustomer) {
    return firstCustomer._id;
  }

  // Fallback: Check if dummy customer exists
  const dummyCustomer = await Customer.findOne({ email: "test.customer@velora.com" });
  if (dummyCustomer) {
    return dummyCustomer._id;
  }

  // Auto-generate test customer if DB is empty
  const newDummy = await Customer.create({
    clientCode: "VEL9999",
    name: "Test Customer (Auto Generated)",
    phone: "+91 99999 99999",
    email: "test.customer@velora.com",
    uniqueLoginId: "testcustomer",
    password: "password123",
    status: "Active",
  });
  return newDummy._id;
};

// ==========================================
// 1. PROJECT TIMELINE & MILESTONES
// ==========================================
export const getTimeline = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let milestones = await TimelineMilestone.find({ customerId });
    if (milestones.length === 0) {
      milestones = await TimelineMilestone.create([
        { customerId, title: "Civil Work", status: "Completed", date: new Date("2026-07-01"), comments: "Completed on schedule" },
        { customerId, title: "Electrical Wiring", status: "Completed", date: new Date("2026-07-10"), comments: "Conduit wiring and socket boxes completed" },
        { customerId, title: "Modular Installation", status: "In Progress", date: new Date("2026-07-25"), comments: "Carcass assembly ongoing in kitchen" },
        { customerId, title: "Finishing & Handover", status: "Pending", date: new Date("2026-08-15"), comments: "Planned final cleaning and handover" }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Timeline milestones fetched successfully",
      data: milestones
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { title, status, date, comments } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Milestone title is required" });
    }

    const milestone = await TimelineMilestone.create({
      customerId,
      title,
      status: status || "Pending",
      date: date ? new Date(date) : undefined,
      comments: comments || ""
    });

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      data: milestone
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. TASKS & CHECKLISTS
// ==========================================
export const getTasks = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let tasks = await PortalTask.find({ customerId });
    if (tasks.length === 0) {
      tasks = await PortalTask.create([
        { customerId, title: "Finalize laminate color", priority: "High", done: false },
        { customerId, title: "Approve kitchen layout drawing", priority: "Medium", done: true }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { title, priority, done, assignedTo, assignedModel } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    const task = await PortalTask.create({
      customerId,
      title,
      priority: priority || "Medium",
      done: done || false,
      assignedTo: assignedTo || undefined,
      assignedModel: assignedModel || "User"
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { done, priority, title } = req.body;

    const task = await PortalTask.findByIdAndUpdate(
      id,
      { ...(done !== undefined && { done }), ...(priority && { priority }), ...(title && { title }) },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. PAYMENTS & FINANCIAL TRANSACTIONS
// ==========================================
export const getPayments = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let txs = await PaymentTransaction.find({ customerId });
    if (txs.length === 0) {
      txs = await PaymentTransaction.create([
        { customerId, stage: "Booking Amount", amount: 500000, status: "Cleared", date: new Date("2026-06-15") },
        { customerId, stage: "Material Procurement", amount: 700000, status: "Cleared", date: new Date("2026-07-05") },
        { customerId, stage: "Fabrication Commencement", amount: 800000, status: "Pending", date: new Date("2026-08-01") }
      ]);
    }

    // Calculate totals
    const totalBudget = txs.reduce((acc, t) => acc + t.amount, 0);
    const paidAmount = txs.filter((t) => t.status === "Cleared").reduce((acc, t) => acc + t.amount, 0);
    const pendingAmount = txs.filter((t) => t.status === "Pending").reduce((acc, t) => acc + t.amount, 0);

    const formattedTxs = txs.map((t) => ({
      id: t._id,
      date: t.date.toISOString().split("T")[0],
      amount: `${t.amount.toLocaleString("en-IN")} INR`,
      status: t.status,
      stage: t.stage
    }));

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: {
        totalBudget: `${totalBudget.toLocaleString("en-IN")} INR`,
        paidAmount: `${paidAmount.toLocaleString("en-IN")} INR`,
        pendingAmount: `${pendingAmount.toLocaleString("en-IN")} INR`,
        transactions: formattedTxs
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { stage, amount, status, date } = req.body;

    if (!stage || !amount) {
      return res.status(400).json({ success: false, message: "Payment stage and amount are required" });
    }

    const tx = await PaymentTransaction.create({
      customerId,
      stage,
      amount,
      status: status || "Pending",
      date: date ? new Date(date) : undefined
    });

    return res.status(201).json({
      success: true,
      message: "Payment transaction logged successfully",
      data: tx
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. SHOWROOM & STORE PRODUCTS
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }

    // Auto-seed if empty (global showroom store catalog)
    let products = await StoreProduct.find(filter);
    if (products.length === 0 && !category && !search) {
      products = await StoreProduct.create([
        {
          name: "Luxury Velvet L-Shape Sofa",
          category: "Sofa",
          description: "Premium velvet sectional sofa with high density foam cushions and teak wood understructure.",
          price: 125000,
          designs: ["Italian Modern", "Classic Imperial"],
          materials: ["Teak Wood Frame", "Premium Velvet Fabric"],
          dimensions: "9ft x 6ft",
          images: ["https://cloudinary.com/velora/sofa1.jpg"],
          isAvailable: true
        },
        {
          name: "Marble Top 6-Seater Dining Table",
          category: "Dining Table",
          description: "Stunning Carrara marble dining table supported by a champagne gold electroplated stainless steel base.",
          price: 185000,
          designs: ["Minimalist Gold", "Bespoke Luxury"],
          materials: ["Champagne Gold SS Base", "Carrara Marble Top"],
          dimensions: "6ft x 3.5ft",
          images: ["https://cloudinary.com/velora/dining1.jpg"],
          isAvailable: true
        },
        {
          name: "Bespoke Walk-in Wardrobe",
          category: "Wardrobe",
          description: "Floor-to-ceiling modern walk-in wardrobe with built-in LED lighting profile and tinted glass doors.",
          price: 295000,
          designs: ["Contemporary Glass", "Gold Trims"],
          materials: ["High-Grade MDF", "Tinted Tempered Glass"],
          dimensions: "8ft x 10ft",
          images: ["https://cloudinary.com/velora/wardrobe1.jpg"],
          isAvailable: true
        }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Showroom store products fetched successfully",
      data: products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, images, designs, materials, dimensions, isAvailable } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: "Product name, category, and price are required fields." });
    }

    const product = await StoreProduct.create({
      name,
      category,
      description: description || "",
      price,
      images: images || [],
      designs: designs || [],
      materials: materials || [],
      dimensions: dimensions || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    return res.status(201).json({
      success: true,
      message: "Showroom store product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await StoreProduct.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Store product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Showroom store product updated successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await StoreProduct.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Store product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Showroom store product deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. PROJECT DOCUMENTS & DRAWINGS
// ==========================================
export const getDocuments = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let docs = await ProjectDocument.find({ customerId });
    if (docs.length === 0) {
      docs = await ProjectDocument.create([
        { customerId, name: "Kitchen 2D Elevation.pdf", size: "1.4 MB", url: "https://cloudinary.com/velora/elev.pdf" },
        { customerId, name: "Wardrobe Specification sheet.pdf", size: "850 KB", url: "https://cloudinary.com/velora/specs.pdf" }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Project files and drawings fetched successfully",
      data: docs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { name, size, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ success: false, message: "Document name and URL are required" });
    }

    const doc = await ProjectDocument.create({
      customerId,
      name,
      size: size || "Unknown",
      url,
      uploadedBy: req.userType === "User" ? req.user._id : undefined
    });

    return res.status(201).json({
      success: true,
      message: "Document registered successfully",
      data: doc
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. NOTIFICATIONS
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const recipientType = req.userType;

    // Auto-seed if empty for this user
    let notifs = await Notification.find({ recipientId, recipientType });
    if (notifs.length === 0) {
      notifs = await Notification.create([
        { recipientId, recipientType, type: "update", message: "Designer uploaded a new 3D render", read: false },
        { recipientId, recipientType, type: "alert", message: "Payment milestone invoice INV-2026-003 generated", read: false }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "User notifications fetched successfully",
      data: notifs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { recipientId, recipientType, type, message } = req.body;

    if (!recipientId || !recipientType || !message) {
      return res.status(400).json({ success: false, message: "recipientId, recipientType, and message are required" });
    }

    const notif = await Notification.create({
      recipientId,
      recipientType,
      type: type || "update",
      message
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notif
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. MEETINGS & CALENDAR
// ==========================================
export const getMeetings = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let meetings = await Meeting.find({ customerId });
    if (meetings.length === 0) {
      meetings = await Meeting.create([
        { customerId, title: "Site Assessment & Measuring", date: new Date("2026-08-01"), time: "10:30 AM", status: "Scheduled" }
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Meetings calendar fetched successfully",
      data: meetings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { title, date, time } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: "Meeting title, date, and time are required" });
    }

    const meeting = await Meeting.create({
      customerId,
      title,
      date: new Date(date),
      time,
      status: "Scheduled"
    });

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      data: meeting
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. TAX INVOICES
// ==========================================
export const getInvoices = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);

    // Auto-seed if empty for this customer
    let invoices = await Invoice.find({ customerId });
    if (invoices.length === 0) {
      invoices = await Invoice.create([
        { customerId, invoiceNumber: "INV-2026-004", amount: 700000, date: new Date("2026-07-05"), status: "Paid" }
      ]);
    }

    const formattedInvoices = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: inv.date.toISOString().split("T")[0],
      amount: `${inv.amount.toLocaleString("en-IN")} INR`,
      status: inv.status
    }));

    return res.status(200).json({
      success: true,
      message: "Tax invoices fetched successfully",
      data: formattedInvoices
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { invoiceNumber, amount, date, status } = req.body;

    if (!invoiceNumber || !amount || !date) {
      return res.status(400).json({ success: false, message: "invoiceNumber, amount, and date are required" });
    }

    const invoice = await Invoice.create({
      customerId,
      invoiceNumber,
      amount,
      date: new Date(date),
      status: status || "Unpaid"
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. CLIENT SUPPORT HELPDESK TICKETS
// ==========================================
export const submitTicket = async (req, res) => {
  try {
    const customerId = await getCustomerContext(req);
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: "Ticket query details are required" });
    }

    // Auto-generate ticket code: TK-<timestamp>
    const ticketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await SupportTicket.create({
      customerId,
      ticketId,
      query,
      status: "Open"
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket registered successfully",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { reply, status: status || "Resolved" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. COMPREHENSIVE CRM ANALYTICS (DASHBOARD)
// ==========================================
export const getAnalytics = async (req, res) => {
  try {
    // 1. Calculate lead conversion rate (leads converted to customer / total leads)
    const totalLeads = await Customer.countDocuments() + await Customer.countDocuments({ status: "Inactive" }); // rough lead estimation
    const convertedLeads = await Customer.countDocuments();
    
    // Fallback if no data
    let conversionRate = "24%";
    if (totalLeads > 0) {
      conversionRate = `${Math.round((convertedLeads / totalLeads) * 100)}%`;
    }

    // 2. Aggregate Sales Revenue from all payment transactions
    const revenueAggregate = await PaymentTransaction.aggregate([
      { $match: { status: "Cleared" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const salesRevenueNum = revenueAggregate.length > 0 ? revenueAggregate[0].total : 4850000;
    const totalSalesRevenue = `${salesRevenueNum.toLocaleString("en-IN")} INR`;

    // 3. Active Designer Workloads (group active customers by designer)
    const designerStats = await Customer.aggregate([
      { $match: { status: "Active", assignedDesigner: { $exists: true, $ne: null } } },
      { $group: { _id: "$assignedDesigner", count: { $sum: 1 } } }
    ]);

    // Populate designer user names
    const designerWorkload = [];
    if (designerStats.length > 0) {
      for (const stat of designerStats) {
        const designer = await User.findById(stat._id);
        if (designer) {
          designerWorkload.push({
            designer: designer.name,
            projects: stat.count
          });
        }
      }
    } else {
      // Default fallback
      designerWorkload.push(
        { designer: "Ar. Priya Sharma", projects: 3 },
        { designer: "Ar. Amit Verma", projects: 2 }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Analytics summary fetched successfully",
      data: {
        leadConversionRate: conversionRate,
        totalSalesRevenue,
        activeDesignerWorkload: designerWorkload
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. COMPANY & CMS INFORMATION
// ==========================================
export const getCompanyInfo = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Company details fetched successfully",
    data: {
      name: "Velora Interior Designs",
      location: "Pune, India",
      tagline: "Ultra-premium, bespoke interior design and execution",
      email: "info@veloradesigns.com"
    }
  });
};

export const getCmsContent = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CMS content blocks loaded",
    data: {
      heroTitle: "Crafting Exquisite Living Spaces",
      heroSubtitle: "Luxury, custom-built modular kitchens and home interiors in Pune"
    }
  });
};
