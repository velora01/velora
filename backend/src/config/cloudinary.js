import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(
    `Missing Cloudinary environment variables: ${missing.join(", ")}`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


cloudinary.analysis = {
  async getImageTags(imageUrl) {
    try {
      const result = await cloudinary.api.resource(imageUrl, {
        colors: true,
        image_metadata: true,
      });
      return result.colors || [];
    }
    catch (error) {
      console.error("Error fetching image tags from Cloudinary:", error);
      return [];
    }
  },
};






cloudinary.uploader.async = {
  
}
export default cloudinary;