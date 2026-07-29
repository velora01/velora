import express from "express";
import { getGuides, getGuideById } from "../controllers/guideController.js";

const router = express.Router();

router.get("/", getGuides);
router.get("/:id", getGuideById);

export default router;
