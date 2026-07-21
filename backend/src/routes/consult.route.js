import express from "express";
import { createConsultation } from "../controllers/consultController.js";
import { getConsultations } from "../controllers/consultController.js";

const consultRoute = express.Router();

consultRoute.post("/", createConsultation);
consultRoute.get("/", getConsultations);

export default consultRoute;