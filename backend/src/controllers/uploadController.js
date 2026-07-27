import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import fs from "fs-extra";
import path from "path";

const uploadStream = (fileBuffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(stream);
  });
};

const saveLocally = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await fs.ensureDir(uploadsDir);

    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, req.file.buffer);

    // Determine backend host dynamically
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log(`Saved file locally: ${filePath}. URL: ${imageUrl}`);

    return res.status(200).json({
      success: true,
      imageUrl,
      publicId: filename,
      originalName: req.file.originalname,
      isLocal: true,
    });
  } catch (err) {
    console.error("Local save error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image locally.",
    });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach an image under the 'image' field.",
      });
    }

    // Check for default placeholder Cloudinary credentials
    const isPlaceholder =
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "your_api_key" ||
      process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name";

    if (isPlaceholder) {
      console.warn("Placeholder Cloudinary keys detected. Saving file locally.");
      return await saveLocally(req, res);
    }

    try {
      const uploaded = await uploadStream(req.file.buffer, "uploads");

      return res.status(200).json({
        success: true,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        originalName: req.file.originalname,
        raw: uploaded,
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed, falling back to local file storage. Error:", cloudinaryError);
      return await saveLocally(req, res);
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Image upload failed.",
    });
  }
};
