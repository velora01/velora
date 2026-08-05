import Customer from "../models/Customer.js";
import Project from "../models/Project.js";
import TimelineMilestone from "../models/TimelineMilestone.js";
import Meeting from "../models/Meeting.js";
import Notification from "../models/Notification.js";
import PortalTask from "../models/PortalTask.js";
import PaymentTransaction from "../models/PaymentTransaction.js";
import Invoice from "../models/Invoice.js";

// Generate Unique Client Code (e.g. VEL0001, VEL0002)
const generateClientCode = async () => {
  const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
  let nextNum = 1;
  if (lastCustomer && lastCustomer.clientCode) {
    const match = lastCustomer.clientCode.match(/VEL(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  return `VEL${String(nextNum).padStart(4, "0")}`;
};

// Get Customer Count (GET /customers/count)
export const getCustomerCount = async (req, res)=>{
  try {
    const count = await Customer.countDocuments();
    return res.status(200).json({
      success: true,
      message: "Customer count fetched successfully",
      data: { count }
    });
  } catch (error) {
    console.error("Get Customer Count Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Get Customer by Unique Login ID (GET /customers/login/:loginId)
export const getCustomerByLoginId = async(req, res)=>{
  try{
    const { loginId } = req.params;
    const customer = await Customer.findOne({ uniqueLoginId: loginId })
      .populate("assignedDesigner", "name email role")
      .populate("assignedSales", "name email role")
      .populate("projectId");
      
    if(!customer){
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer
    });
  } catch (error) {
    console.error("Get Customer by Login ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Create Customer (POST /customers)
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      occupation,
      budget,
      houseType,
      flatNumber,
      projectId,
      assignedDesigner,
      assignedSales,
      status,
      uniqueLoginId,
      password,
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and email are required fields",
      });
    }

    // Check if email already exists
    const emailExists = await Customer.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email already exists",
      });
    }

    // Generate Client Code
    const clientCode = await generateClientCode();

    // Default uniqueLoginId to clientCode if not provided
    const finalLoginId = uniqueLoginId || clientCode;

    // Check if uniqueLoginId already exists
    const loginIdExists = await Customer.findOne({ uniqueLoginId: finalLoginId });
    if (loginIdExists) {
      return res.status(400).json({
        success: false,
        message: `Unique Login ID '${finalLoginId}' is already taken`,
      });
    }

    // Generate a default password if not provided
    const finalPassword = password || Math.random().toString(36).substring(2, 10);

    const customer = await Customer.create({
      clientCode,
      name,
      phone,
      email: email.toLowerCase(),
      address,
      occupation,
      budget,
      houseType,
      flatNumber,
      projectId: projectId || null,
      assignedDesigner: assignedDesigner || null,
      assignedSales: assignedSales || null,
      status: status || "Active",
      uniqueLoginId: finalLoginId,
      password: finalPassword,
    });

    // Don't output hashed password, but show plain generated password for testing/admin setup
    const responseData = customer.toObject();
    delete responseData.password;
    responseData.generatedPlainPassword = password ? undefined : finalPassword;

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Customers (GET /customers)
export const getCustomers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { clientCode: searchRegex },
      ];
    }

    const customers = await Customer.find(filter)
      .populate("assignedDesigner", "name email role")
      .populate("assignedSales", "name email role")
      .populate("projectId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search Customers (GET /customers/search)
export const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required",
      });
    }

    const searchRegex = new RegExp(q, "i");
    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { clientCode: searchRegex },
        { uniqueLoginId: searchRegex },
      ],
    })
      .populate("assignedDesigner", "name email role")
      .populate("assignedSales", "name email role")
      .populate("projectId");

    return res.status(200).json({
      success: true,
      message: "Customers searched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Search Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Customer Profile Project details (GET /customers/project)
export const getCustomerProject = async (req, res) => {
  try {
    if (req.userType !== "Customer") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to authenticated customers only",
      });
    }

    const customer = await Customer.findById(req.user._id).populate("projectId");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer project retrieved successfully",
      data: customer.projectId || null,
    });
  } catch (error) {
    console.error("Customer Project Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Customer Dashboard Statistics (GET /customers/dashboard)
export const getCustomerDashboard = async (req, res) => {
  try {
    if (req.userType !== "Customer") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to authenticated customers only",
      });
    }

    const customer = await Customer.findById(req.user._id)
      .populate("assignedDesigner", "name email role phone")
      .populate("assignedSales", "name email role phone")
      .populate("projectId");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 1. Fetch Timeline Milestones (and auto-seed if none exist)
    let milestones = await TimelineMilestone.find({ customerId: customer._id });
    if (milestones.length === 0) {
      milestones = await TimelineMilestone.create([
        { customerId: customer._id, title: "Civil Work", status: "Completed", date: new Date("2026-07-01"), comments: "Completed on schedule" },
        { customerId: customer._id, title: "Electrical Wiring", status: "Completed", date: new Date("2026-07-10"), comments: "Conduit wiring and socket boxes completed" },
        { customerId: customer._id, title: "Modular Installation", status: "In Progress", date: new Date("2026-07-25"), comments: "Carcass assembly ongoing in kitchen" },
        { customerId: customer._id, title: "Finishing & Handover", status: "Pending", date: new Date("2026-08-15"), comments: "Planned final cleaning and handover" }
      ]);
    }

    // Calculate progress based on milestones
    const completedCount = milestones.filter((m) => m.status === "Completed").length;
    const projectProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    // 2. Fetch Meetings (and auto-seed if none exist)
    let meetings = await Meeting.find({ customerId: customer._id });
    if (meetings.length === 0) {
      meetings = await Meeting.create([
        {
          customerId: customer._id,
          title: "Initial Design Discussion",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          time: "11:00 AM",
          status: "Scheduled"
        }
      ]);
    }

    // 3. Fetch Notifications (and auto-seed if none exist)
    let notifications = await Notification.find({ recipientId: customer._id, recipientType: "Customer" });
    if (notifications.length === 0) {
      notifications = await Notification.create([
        {
          recipientId: customer._id,
          recipientType: "Customer",
          type: "update",
          message: `${customer.assignedDesigner ? customer.assignedDesigner.name : "A designer"} has been assigned to your project.`,
          read: false
        }
      ]);
    }

    // 4. Fetch Tasks (and auto-seed if none exist)
    let tasks = await PortalTask.find({ customerId: customer._id });
    if (tasks.length === 0) {
      tasks = await PortalTask.create([
        { customerId: customer._id, title: "Finalize laminate color", priority: "High", done: false },
        { customerId: customer._id, title: "Approve kitchen layout drawing", priority: "Medium", done: true }
      ]);
    }

    // Format output meetings and notifications for display
    const formattedMeetings = meetings.map(m => ({
      title: m.title,
      date: m.date.toLocaleDateString(),
      time: m.time,
      status: m.status
    }));

    const formattedNotifications = notifications.map(n => ({
      title: n.type.toUpperCase(),
      message: n.message,
      date: n.createdAt ? n.createdAt.toLocaleDateString() : new Date().toLocaleDateString()
    }));

    return res.status(200).json({
      success: true,
      message: "Customer dashboard stats fetched successfully",
      data: {
        customerInfo: {
          clientCode: customer.clientCode,
          name: customer.name,
          email: customer.email,
          status: customer.status,
        },
        project: customer.projectId || null,
        assignedStaff: {
          designer: customer.assignedDesigner || null,
          sales: customer.assignedSales || null,
        },
        progress: projectProgress,
        milestones,
        tasks,
        meetings: formattedMeetings,
        notifications: formattedNotifications,
      },
    });
  } catch (error) {
    console.error("Customer Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Customer By ID (GET /customers/:id)
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("assignedDesigner", "name email role")
      .populate("assignedSales", "name email role")
      .populate("projectId");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Hide password
    const customerObj = customer.toObject();
    delete customerObj.password;

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customerObj,
    });
  } catch (error) {
    console.error("Get Customer ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Customer (PUT /customers/:id)
export const updateCustomer = async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Don't allow changing clientCode or uniqueLoginId directly through this general endpoint
    delete updateData.clientCode;
    delete updateData.uniqueLoginId;

    if (updateData.password) {
      // It will trigger pre-save hook on the save call, but findByIdAndUpdate does NOT trigger save pre-hooks by default
      // We will load the customer, change fields, and call save() if password is changed.
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      Object.keys(updateData).forEach((key) => {
        customer[key] = updateData[key];
      });

      await customer.save();
      const customerObj = customer.toObject();
      delete customerObj.password;

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customerObj,
      });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedDesigner", "name email role")
      .populate("assignedSales", "name email role")
      .populate("projectId");

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customerObj = updatedCustomer.toObject();
    delete customerObj.password;

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customerObj,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Customer (DELETE /customers/:id)
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
