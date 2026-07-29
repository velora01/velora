import express from "express";
import { calculateCost, createQuoteRequest } from "../controllers/estimatorController.js";

const router = express.Router();

router.post("/calculate", calculateCost);
router.post("/quote", createQuoteRequest);

export default router;
