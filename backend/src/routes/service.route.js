import express from "express";
import serviceController from "../controllers/serviceController.js";

const serviceRouter = express.Router();

serviceRouter.get("/services", serviceController.getAllServices);
serviceRouter.get("/services/:slug", serviceController.getServiceBySlug);
serviceRouter.post("/admin/services", serviceController.createService);

export default serviceRouter;
