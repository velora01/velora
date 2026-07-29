import CRMLead from "../models/crm.model.js";
import Consult from "../models/consult.model.js";
import Contact from "../models/contact.model.js";

/**
 * Create a new lead manually or by promoting a submission
 */
export const createLead = async (data) => {
  const lead = new CRMLead(data);
  
  // If this lead was promoted from a consultation or contact form,
  // we update the source document's status to "Promoted".
  if (data.consultRef) {
    await Consult.findByIdAndUpdate(data.consultRef, { status: "Promoted" });
  } else if (data.contactRef) {
    await Contact.findByIdAndUpdate(data.contactRef, { status: "Promoted" });
  }

  return await lead.save();
};

/**
 * Retrieve leads with search and filtering
 */
export const getLeads = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.category) {
    query.projectCategory = filters.category;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { clientName: searchRegex },
      { clientPhone: searchRegex },
      { clientEmail: searchRegex },
      { propertyAddress: searchRegex },
    ];
  }

  return await CRMLead.find(query).sort({ updatedAt: -1 });
};

/**
 * Retrieve a single lead by ID
 */
export const getLeadById = async (id) => {
  return await CRMLead.findById(id)
    .populate("consultRef")
    .populate("contactRef");
};

/**
 * Update general details of a lead
 */
export const updateLead = async (id, updateData) => {
  return await CRMLead.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Transition status of a lead with a historical audit log comment
 */
export const updateLeadStatus = async (id, newStatus, comment) => {
  const lead = await CRMLead.findById(id);
  if (!lead) {
    throw new Error("Lead not found");
  }

  lead.status = newStatus;
  
  // Push status transition to history list
  lead.statusHistory.push({
    status: newStatus,
    updatedAt: new Date(),
    comment: comment || `Status changed to ${newStatus}`,
  });

  return await lead.save();
};

/**
 * Delete a lead
 */
export const deleteLead = async (id) => {
  return await CRMLead.findByIdAndDelete(id);
};

/**
 * Retrieve counts and statistics for CRM dashboard
 */
export const getCRMStats = async () => {
  // Total count
  const totalLeads = await CRMLead.countDocuments();

  // Active vs Completed
  const activeLeads = await CRMLead.countDocuments({
    status: { $nin: ["Completed", "Cancelled"] },
  });
  const completedLeads = await CRMLead.countDocuments({ status: "Completed" });
  const cancelledLeads = await CRMLead.countDocuments({ status: "Cancelled" });

  // Counts grouped by status
  const statusStats = await CRMLead.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Counts grouped by category
  const categoryStats = await CRMLead.aggregate([
    { $group: { _id: "$projectCategory", count: { $sum: 1 } } },
  ]);

  // Format the aggregate response
  const statusCounts = {
    Inquiry: 0,
    Consultation: 0,
    Proposal: 0,
    Booked: 0,
    Designing: 0,
    Production: 0,
    Installation: 0,
    Completed: 0,
    Cancelled: 0,
  };
  statusStats.forEach((item) => {
    if (statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
    }
  });

  const categoryCounts = {};
  categoryStats.forEach((item) => {
    if (item._id) {
      categoryCounts[item._id] = item.count;
    }
  });

  return {
    totalLeads,
    activeLeads,
    completedLeads,
    cancelledLeads,
    statusCounts,
    categoryCounts,
  };
};

/**
 * Retrieve unconverted Consultations and Contact form submissions
 */
export const getPendingSubmissions = async () => {
  // Consultations not promoted
  const pendingConsults = await Consult.find({ status: { $ne: "Promoted" } }).sort({ createdAt: -1 });

  // Contacts not promoted
  const pendingContacts = await Contact.find({ status: { $ne: "Promoted" } }).sort({ createdAt: -1 });

  return {
    consults: pendingConsults,
    contacts: pendingContacts,
  };
};
