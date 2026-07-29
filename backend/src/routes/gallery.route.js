import express from "express";
import { getGalleryItems, getGalleryItemById } from "../controllers/galleryController.js";

const router = express.Router();

router.get("/", getGalleryItems);
router.get("/:id", getGalleryItemById);

export default router;
