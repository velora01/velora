import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

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

export const uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach an image under the 'image' field.",
      });
    }

    const uploaded = await uploadStream(req.file.buffer, "uploads");

    return res.status(200).json({
      success: true,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      originalName: req.file.originalname,
      raw: uploaded,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Image upload failed.",
    });
  }
};
