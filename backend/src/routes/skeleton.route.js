import express from "express";
import * as skeletonController from "../controllers/skeletonController.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const skeletonRoute = express.Router();

// Public endpoints
skeletonRoute.get("/company", skeletonController.getCompanyInfo);
skeletonRoute.get("/website-cms", skeletonController.getCmsContent);

// Protected endpoints for timeline & milestones
skeletonRoute.get("/timeline", protect, skeletonController.getTimeline);
skeletonRoute.post("/timeline", protect, restrictTo("Admin", "Designer", "Project Manager"), skeletonController.createMilestone);

// Protected endpoints for tasks & checklists
skeletonRoute.get("/tasks", protect, skeletonController.getTasks);
skeletonRoute.post("/tasks", protect, skeletonController.createTask);
skeletonRoute.patch("/tasks/:id", protect, skeletonController.updateTaskStatus);

// Protected endpoints for payments & transactions
skeletonRoute.get("/payments", protect, skeletonController.getPayments);
skeletonRoute.post("/payments", protect, restrictTo("Admin", "Accountant"), skeletonController.createPayment);

// Showroom products catalog (Public GET, Admin-only modifications)
skeletonRoute.get("/products", skeletonController.getProducts);
skeletonRoute.post("/products", protect, restrictTo("Admin"), skeletonController.createProduct);
skeletonRoute.put("/products/:id", protect, restrictTo("Admin"), skeletonController.updateProduct);
skeletonRoute.delete("/products/:id", protect, restrictTo("Admin"), skeletonController.deleteProduct);

// Project design files & documents
skeletonRoute.get("/documents", protect, skeletonController.getDocuments);
skeletonRoute.post("/documents", protect, restrictTo("Admin", "Designer", "Project Manager"), skeletonController.uploadDocument);

// User notifications
skeletonRoute.get("/notifications", protect, skeletonController.getNotifications);
skeletonRoute.post("/notifications", protect, restrictTo("Admin", "Designer", "Project Manager"), skeletonController.createNotification);

// Meetings & measurements calendar
skeletonRoute.get("/meetings", protect, skeletonController.getMeetings);
skeletonRoute.post("/meetings", protect, restrictTo("Admin", "Designer", "Project Manager"), skeletonController.createMeeting);

// Tax invoices
skeletonRoute.get("/invoices", protect, skeletonController.getInvoices);
skeletonRoute.post("/invoices", protect, restrictTo("Admin", "Accountant"), skeletonController.createInvoice);

// Client helpdesk support tickets
skeletonRoute.post("/support", protect, skeletonController.submitTicket);
skeletonRoute.patch("/support/:id/reply", protect, restrictTo("Admin", "Sales", "Designer", "Project Manager"), skeletonController.replyTicket);

// Admin dashboard analytical metrics
skeletonRoute.get("/analytics", protect, restrictTo("Admin", "Project Manager"), skeletonController.getAnalytics);

export default skeletonRoute;
