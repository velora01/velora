import express from "express";
import homeRoute from "./homeRoute.js";
import authRoute from "./auth.route.js";
import serviceRoute from "./service.route.js";
import consultRoute from "./consult.route.js";
import projectRoute from "./project.route.js";

const router = express.Router();

router.use("/", homeRoute);
router.use("/auth", authRoute);
router.use("/", serviceRoute);
router.use("/projects", projectRoute);
router.use('/consult', consultRoute);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "velora-backend" });
});

export default router;
