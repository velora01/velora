import express from "express";
import * as crmController from "../controllers/crmController.js";

const router = express.Router();

// Dashboard analytics
router.get("/stats", crmController.getDashboardStats);

// Unconverted consultations/contacts
router.get("/pending", crmController.getPendingSubmissions);

// General CRUD
router.get("/", crmController.getLeads);
router.post("/", crmController.createLead);
router.get("/:id", crmController.getLeadById);
router.put("/:id", crmController.updateLead);
router.patch("/:id/status", crmController.updateLeadStatus);
router.delete("/:id", crmController.deleteLead);

export default router;
