import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  convertLead,
  bulkUploadLeads
} from "../controllers/leadController.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const leadRoute = express.Router();

// All lead routes require authentication
leadRoute.use(protect);

// Admin, Sales, and Designers can view leads
leadRoute.get("/", restrictTo("Admin", "Sales", "Designer"), getLeads);
leadRoute.get("/:id", restrictTo("Admin", "Sales", "Designer"), getLeadById);

// Admin and Sales can modify leads
leadRoute.post("/", restrictTo("Admin", "Sales"), createLead);
leadRoute.post("/bulk-upload", restrictTo("Admin", "Sales"), bulkUploadLeads);
leadRoute.put("/:id", restrictTo("Admin", "Sales"), updateLead);
leadRoute.delete("/:id", restrictTo("Admin"), deleteLead);

// Assign and Convert
leadRoute.post("/assign", restrictTo("Admin", "Sales"), assignLead);
leadRoute.post("/convert", restrictTo("Admin", "Sales"), convertLead);

export default leadRoute;
