import express from "express";
import homeRoute from "./homeRoute.js";
import authRoute from "./auth.route.js";
import serviceRoute from "./service.route.js";
import consultRoute from "./consult.route.js";
import projectRoute from "./project.route.js";
import galleryRoute from "./gallery.route.js";
import guideRoute from "./guide.route.js";
import reviewRoute from "./review.route.js";
import estimatorRoute from "./estimator.route.js";
import contactRoute from "./contact.route.js";
import crmRoute from "./crm.route.js";

// New router imports
import { customerAuthRouter, customerCrudRouter } from "./customer.route.js";
import leadRoute from "./lead.route.js";
import skeletonRoute from "./skeleton.route.js";
import { getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Mount existing routes
router.use("/", homeRoute);
router.use("/auth", authRoute);
router.use("/", serviceRoute);
router.use("/projects", projectRoute);
router.use("/consult", consultRoute);
router.use("/gallery", galleryRoute);
router.use("/guides", guideRoute);
router.use("/reviews", reviewRoute);
router.use("/estimator", estimatorRoute);
router.use("/contact", contactRoute);
router.use("/crm", crmRoute); // Keeps existing crm endpoint functional

// Mount new routes
router.use("/customer", customerAuthRouter);
router.use("/customers", customerCrudRouter);
router.use("/leads", leadRoute);
router.use("/", skeletonRoute);

// Map /profile directly as requested
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "velora-backend" });
});

export default router;
