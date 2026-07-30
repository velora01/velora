import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

// Create Lead (POST /leads)
export const createLead = async (req, res) => {
  try {
    const { name, phone, email, source, status, assignedTo, projectCategory, budget, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required fields",
      });
    }

    const lead = await Lead.create({
      name,
      phone,
      email: email ? email.toLowerCase() : undefined,
      source: source || "Website Inquiry",
      status: status || "New",
      assignedTo: assignedTo || null,
      projectCategory: projectCategory || "",
      budget: budget || "",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Leads (GET /leads)
export const getLeads = async (req, res) => {
  try {
    const { status, source, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (source) {
      filter.source = source;
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { notes: searchRegex },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Lead by ID (GET /leads/:id)
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email role");
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Get Lead By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Lead (PUT /leads/:id)
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Lead (DELETE /leads/:id)
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign Lead (POST /leads/assign)
export const assignLead = async (req, res) => {
  try {
    const { leadId, userId } = req.body;

    if (!leadId || !userId) {
      return res.status(400).json({
        success: false,
        message: "leadId and userId are required",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Assignee user not found",
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: userId },
      { new: true }
    ).populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Lead successfully assigned to ${user.name} (${user.role})`,
      data: lead,
    });
  } catch (error) {
    console.error("Assign Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Convert Lead to Customer (POST /leads/convert)
export const convertLead = async (req, res) => {
  try {
    const {
      leadId,
      address,
      occupation,
      budget,
      houseType,
      flatNumber,
      projectId,
      password,
      uniqueLoginId,
    } = req.body;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "leadId is required",
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!lead.email) {
      return res.status(400).json({
        success: false,
        message: "Lead must have an email address to be converted to a customer",
      });
    }

    // Check if customer email already exists
    const emailExists = await Customer.findOne({ email: lead.email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: `A customer with this email (${lead.email}) already exists`,
      });
    }

    // Helper: auto-generate client code
    const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastCustomer && lastCustomer.clientCode) {
      const match = lastCustomer.clientCode.match(/VEL(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const clientCode = `VEL${String(nextNum).padStart(4, "0")}`;

    // Default uniqueLoginId to clientCode if not provided
    const finalLoginId = uniqueLoginId || clientCode;

    // Check if uniqueLoginId exists
    const loginIdExists = await Customer.findOne({ uniqueLoginId: finalLoginId });
    if (loginIdExists) {
      return res.status(400).json({
        success: false,
        message: `Unique Login ID '${finalLoginId}' is already taken`,
      });
    }

    // Default password to phone number or random string
    const finalPassword = password || lead.phone || Math.random().toString(36).substring(2, 10);

    // Create Customer
    const customer = await Customer.create({
      clientCode,
      name: lead.name,
      phone: lead.phone,
      email: lead.email.toLowerCase(),
      address: address || "",
      occupation: occupation || "",
      budget: budget || lead.budget || "",
      houseType: houseType || "",
      flatNumber: flatNumber || "",
      projectId: projectId || null,
      assignedSales: lead.assignedTo || null,
      status: "Active",
      uniqueLoginId: finalLoginId,
      password: finalPassword,
    });

    // Update Lead Status to Won
    lead.status = "Won";
    await lead.save();

    // Prepare response data (omit hashed password)
    const customerData = customer.toObject();
    delete customerData.password;
    customerData.generatedPlainPassword = password ? undefined : finalPassword;

    return res.status(201).json({
      success: true,
      message: "Lead successfully converted to Customer",
      data: {
        customer: customerData,
        leadStatus: lead.status,
      },
    });
  } catch (error) {
    console.error("Convert Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
