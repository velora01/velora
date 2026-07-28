import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";

const optimizeImage = async (fileBuffer) => {
  try {
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    // Only process standard formats that sharp supports
    if (!["jpeg", "png", "webp", "tiff", "gif"].includes(metadata.format)) {
      return fileBuffer;
    }

    let pipeline = image.rotate(); // Auto-rotate based on EXIF data

    // Resize if dimensions exceed 2560px (Retina/2K resolution max size)
    if (metadata.width > 2560 || metadata.height > 2560) {
      pipeline = pipeline.resize({
        width: 2560,
        height: 2560,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress based on format while maintaining high visual quality
    if (metadata.format === "jpeg" || metadata.format === "jpg") {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    } else if (metadata.format === "png") {
      pipeline = pipeline.png({ compressionLevel: 8, quality: 85 });
    } else if (metadata.format === "webp") {
      pipeline = pipeline.webp({ quality: 85 });
    }

    const optimizedBuffer = await pipeline.toBuffer();
    console.log(`Optimized image from ${fileBuffer.length} bytes to ${optimizedBuffer.length} bytes.`);
    return optimizedBuffer;
  } catch (err) {
    console.error("Image optimization failed, using original buffer:", err);
    return fileBuffer;
  }
};

const uploadStream = (fileBuffer, folder = "uploads", resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
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
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log(`Saved file locally: ${filePath}. URL: ${fileUrl}`);

    return res.status(200).json({
      success: true,
      imageUrl: fileUrl,
      videoUrl: fileUrl,
      url: fileUrl,
      publicId: filename,
      originalName: req.file.originalname,
      isLocal: true,
    });
  } catch (err) {
    console.error("Local save error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file locally.",
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

    // Optimize image buffer using sharp before storing or uploading
    req.file.buffer = await optimizeImage(req.file.buffer);

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
      const uploaded = await uploadStream(req.file.buffer, "uploads", "image");

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

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a video under the 'video' field.",
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
      const uploaded = await uploadStream(req.file.buffer, "uploads", "video");

      return res.status(200).json({
        success: true,
        videoUrl: uploaded.secure_url,
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
      message: error.message || "Video upload failed.",
    });
  }
};
