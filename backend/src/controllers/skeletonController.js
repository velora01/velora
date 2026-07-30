// Placeholder handlers for remaining modules to ensure a complete API collection.

// Project Status & Timeline
export const getTimeline = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Timeline milestones fetched successfully",
    data: [
      { id: "1", title: "Civil Work", status: "Completed", date: "2026-07-01" },
      { id: "2", title: "Electrical Wiring", status: "Completed", date: "2026-07-10" },
      { id: "3", title: "Modular Installation", status: "In Progress", date: "2026-07-25" },
      { id: "4", title: "Finishing & Handover", status: "Pending", date: "2026-08-15" }
    ]
  });
};

// Tasks
export const getTasks = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    data: [
      { id: "t1", title: "Finalize laminate color", priority: "High", done: false },
      { id: "t2", title: "Approve kitchen layout drawing", priority: "Medium", done: true }
    ]
  });
};

export const createTask = async (req, res) => {
  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: { id: "t3", title: req.body.title || "New Task", done: false }
  });
};

// Payments
export const getPayments = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Payment history fetched successfully",
    data: {
      totalBudget: "Not Disclosed (Luxury Tier)",
      paidAmount: "12,00,000 INR",
      pendingAmount: "8,00,000 INR",
      transactions: [
        { id: "tx1", date: "2026-06-15", amount: "5,00,000 INR", status: "Cleared", stage: "Booking Amount" },
        { id: "tx2", date: "2026-07-05", amount: "7,00,000 INR", status: "Cleared", stage: "Material Procurement" }
      ]
    }
  });
};

// Products
export const getProducts = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Design products/catalog fetched successfully",
    data: [
      { id: "p1", name: "Premium Soft-Close Hinges", category: "Hardware" },
      { id: "p2", name: "Quartz Kitchen Countertop", category: "Stone" }
    ]
  });
};

// Documents
export const getDocuments = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Project files and drawings fetched successfully",
    data: [
      { name: "Kitchen 2D Elevation.pdf", size: "1.4 MB", url: "https://cloudinary.com/velora/elev.pdf" },
      { name: "Wardrobe Specification sheet.pdf", size: "850 KB", url: "https://cloudinary.com/velora/specs.pdf" }
    ]
  });
};

// Notifications
export const getNotifications = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User notifications fetched successfully",
    data: [
      { id: "n1", type: "update", message: "Designer uploaded a new 3D render", read: false }
    ]
  });
};

// Meetings
export const getMeetings = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Meetings calendar fetched successfully",
    data: [
      { id: "m1", title: "Site Assessment & Measuring", date: "2026-08-01", time: "10:30 AM" }
    ]
  });
};

// Invoices
export const getInvoices = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Tax invoices fetched successfully",
    data: [
      { invoiceNumber: "INV-2026-004", date: "2026-07-05", amount: "7,00,000 INR" }
    ]
  });
};

// Support
export const submitTicket = async (req, res) => {
  return res.status(201).json({
    success: true,
    message: "Support ticket registered successfully",
    data: { ticketId: "TK-98712", query: req.body.query || "Site inquiry", status: "Open" }
  });
};

// Company
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

// Website CMS
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

// Admin Dashboard & Analytics
export const getAnalytics = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Analytics summary fetched successfully",
    data: {
      leadConversionRate: "24%",
      totalSalesRevenue: "48,50,000 INR",
      activeDesignerWorkload: [
        { designer: "Ar. Priya Sharma", projects: 3 },
        { designer: "Ar. Amit Verma", projects: 2 }
      ]
    }
  });
};
