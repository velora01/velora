import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/rbac.middleware.js";

import { getLeads, createLead, updateLead, deleteLead, exportLeadsExcel, bulkUploadLeads } from "../controllers/leadController.js";
import { getWebsiteLeads, createWebsiteLead, convertWebsiteLead } from "../controllers/websiteLeadController.js";
import { getClients, createClient, updateClient, deleteClient, addClientCommunication } from "../controllers/clientController.js";
import { getProjects, createProject, updateProject, updateProjectStage, deleteProject } from "../controllers/projectController.js";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { getBOQs, getBOQById, createBOQ, updateBOQ, deleteBOQ, exportBOQPdf } from "../controllers/boqController.js";
import { getComponents, createComponent, updateComponent, deleteComponent } from "../controllers/componentController.js";
import { getInvoices, createInvoice, exportInvoicePdf, getQuotations, createQuotation, updateQuotation, deleteQuotation } from "../controllers/quotationInvoiceController.js";
import { getPayments, createPayment, exportReceiptPdf } from "../controllers/paymentController.js";
import { getMaterials, createMaterial, getVendors, createVendor } from "../controllers/inventoryController.js";
import { getProductionItems, createProductionOrder, updateProductionStatus } from "../controllers/productionController.js";
import { getInstallations, createInstallation, updateInstallationStatus } from "../controllers/installationController.js";
import { getSiteVisits, createSiteVisit, updateSiteVisit } from "../controllers/siteVisitController.js";
import { getEvents, createEvent } from "../controllers/calendarController.js";
import { getUsers, createUser, updateUserRole, getRoles } from "../controllers/userManagementController.js";
import { getActivityLogs } from "../controllers/activityLogController.js";
import { getDashboardAnalytics, exportReportExcel } from "../controllers/reportController.js";

const router = express.Router();

// Direct Export & PDF Download Endpoints (accessible directly from browser / <a> tags)
router.get("/boq/:id/pdf", exportBOQPdf);
router.get("/invoices/:id/pdf", exportInvoicePdf);
router.get("/payments/:id/receipt", exportReceiptPdf);
router.get("/leads/export/excel", exportLeadsExcel);
router.get("/reports/export/:type", exportReportExcel);

// Middleware: All other ERP management endpoints require JWT protection
router.use(protect);

// Dashboard Analytics
router.get("/dashboard/analytics", getDashboardAnalytics);

// Leads & Website Leads
router.get("/leads", getLeads);
router.post("/leads", checkRole(["Admin", "Sales", "Super Admin"]), createLead);
router.post("/leads/bulk-upload", checkRole(["Admin", "Sales", "Super Admin"]), bulkUploadLeads);
router.put("/leads/:id", checkRole(["Admin", "Sales", "Super Admin"]), updateLead);
router.delete("/leads/:id", checkRole(["Admin", "Super Admin"]), deleteLead);

router.get("/website-leads", getWebsiteLeads);
router.post("/website-leads", createWebsiteLead);
router.post("/website-leads/:id/convert", checkRole(["Admin", "Sales", "Super Admin"]), convertWebsiteLead);

// Clients
router.get("/clients", getClients);
router.post("/clients", checkRole(["Admin", "Sales", "Super Admin"]), createClient);
router.put("/clients/:id", checkRole(["Admin", "Sales", "Super Admin"]), updateClient);
router.delete("/clients/:id", checkRole(["Admin", "Super Admin"]), deleteClient);
router.post("/clients/:id/communication", addClientCommunication);

// Projects
router.get("/projects", getProjects);
router.post("/projects", checkRole(["Admin", "Project Manager", "Super Admin"]), createProject);
router.put("/projects/:id", checkRole(["Admin", "Project Manager", "Super Admin"]), updateProject);
router.put("/projects/:id/stage", checkRole(["Admin", "Project Manager", "Designer", "Super Admin"]), updateProjectStage);
router.delete("/projects/:id", checkRole(["Admin", "Super Admin"]), deleteProject);

// Tasks
router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

// BOQ & Quotations
router.get("/boq", getBOQs);
router.get("/boq/:id", getBOQById);
router.post("/boq", checkRole(["Admin", "Designer", "Super Admin"]), createBOQ);
router.put("/boq/:id", checkRole(["Admin", "Designer", "Super Admin"]), updateBOQ);
router.delete("/boq/:id", checkRole(["Admin", "Super Admin"]), deleteBOQ);

// Library Components
router.get("/components", getComponents);
router.post("/components", checkRole(["Admin", "Designer", "Super Admin"]), createComponent);
router.put("/components/:id", checkRole(["Admin", "Designer", "Super Admin"]), updateComponent);
router.delete("/components/:id", checkRole(["Admin", "Super Admin"]), deleteComponent);

router.get("/quotations", getQuotations);
router.post("/quotations", createQuotation);
router.put("/quotations/:id", updateQuotation);
router.delete("/quotations/:id", deleteQuotation);

// Invoices & Payments
router.get("/invoices", getInvoices);
router.post("/invoices", checkRole(["Admin", "Accountant", "Super Admin"]), createInvoice);

router.get("/payments", getPayments);
router.post("/payments", checkRole(["Admin", "Accountant", "Super Admin"]), createPayment);

// Inventory & Vendors
router.get("/materials", getMaterials);
router.post("/materials", createMaterial);
router.get("/vendors", getVendors);
router.post("/vendors", createVendor);

// Factory & Production
router.get("/production", getProductionItems);
router.post("/production", checkRole(["Admin", "Factory Manager", "Super Admin"]), createProductionOrder);
router.put("/production/:id/status", checkRole(["Admin", "Factory Manager", "Super Admin"]), updateProductionStatus);

// Installation
router.get("/installation", getInstallations);
router.post("/installation", checkRole(["Admin", "Project Manager", "Installation Team", "Super Admin"]), createInstallation);
router.put("/installation/:id/status", updateInstallationStatus);

// Site Visit
router.get("/site-visits", getSiteVisits);
router.post("/site-visits", createSiteVisit);
router.put("/site-visits/:id", updateSiteVisit);

// Calendar
router.get("/calendar", getEvents);
router.post("/calendar", createEvent);

// Users & Roles
router.get("/users", checkRole(["Admin", "Super Admin"]), getUsers);
router.post("/users", checkRole(["Admin", "Super Admin"]), createUser);
router.put("/users/:id/role", checkRole(["Admin", "Super Admin"]), updateUserRole);
router.get("/roles", getRoles);

// Activity & Reports
router.get("/activity-logs", getActivityLogs);
router.get("/reports/export/:type", exportReportExcel);

export default router;
