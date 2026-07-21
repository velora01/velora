import express from "express";
import homeRoute from "./homeRoute.js";
import authRoute from "./auth.route.js";
import serviceRoute from "./service.route.js";
import consultRoute from "./consult.route.js"

const router = express.Router();

router.use("/", homeRoute);
router.use("/auth", authRoute);
router.use("/", serviceRoute);
router.use('/consult', consultRoute)

router.get("/", (req, res) => {
  res.send("Hello World!");
});

export default router;
