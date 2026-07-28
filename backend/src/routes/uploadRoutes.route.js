import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage, uploadVideo } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/image", upload.single("image"), uploadImage);
router.post("/video", upload.single("video"), uploadVideo);

export default router;