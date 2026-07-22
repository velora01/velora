import express from "express";
import {
  createProject,
  getProjects,
  getProjectBySlug,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

export default router;
