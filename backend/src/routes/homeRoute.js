import express, { Router } from "express";

// import { homeController } from "../controllers/homeController.js";
import homeController from "../controllers/homeController.js";

const homeRouter = express.Router();

homeRouter.get("/hello", homeController);

export default homeRouter;
