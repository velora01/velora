import express from "express";
import { createConsultation } from "../controllers/consultController.js";

const consultRoute = express.Router();

consultRoute.post("/", createConsultation);

export default consultRoute;