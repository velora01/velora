import express from "express";
import * as skeletonController from "../controllers/skeletonController.js";
import { protect } from "../middleware/auth.middleware.js";

const skeletonRoute = express.Router();

// Public stub endpoints
skeletonRoute.get("/company", skeletonController.getCompanyInfo);
skeletonRoute.get("/website-cms", skeletonController.getCmsContent);

// Protected stub endpoints
skeletonRoute.get("/timeline", protect, skeletonController.getTimeline);
skeletonRoute.get("/tasks", protect, skeletonController.getTasks);
skeletonRoute.post("/tasks", protect, skeletonController.createTask);
skeletonRoute.get("/payments", protect, skeletonController.getPayments);
skeletonRoute.get("/products", protect, skeletonController.getProducts);
skeletonRoute.get("/documents", protect, skeletonController.getDocuments);
skeletonRoute.get("/notifications", protect, skeletonController.getNotifications);
skeletonRoute.get("/meetings", protect, skeletonController.getMeetings);
skeletonRoute.get("/invoices", protect, skeletonController.getInvoices);
skeletonRoute.post("/support", protect, skeletonController.submitTicket);
skeletonRoute.get("/analytics", protect, skeletonController.getAnalytics);

export default skeletonRoute;
