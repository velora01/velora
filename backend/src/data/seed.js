import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import Gallery from "../models/Gallery.js";
import Guide from "../models/Guide.js";
import Review from "../models/Review.js";
import {
  projectsData,
  servicesData,
  galleryData,
  guidesData,
  reviewsData,
} from "./seedData.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/velora");
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");
    await connectDB();

    // Clear existing collections
    await Project.deleteMany({});
    await Service.deleteMany({});
    await Gallery.deleteMany({});
    await Guide.deleteMany({});
    await Review.deleteMany({});
    console.log("Cleared existing database collections");

    // Insert new data
    const projects = await Project.insertMany(projectsData);
    const services = await Service.insertMany(servicesData);
    const galleryItems = await Gallery.insertMany(galleryData);
    const guides = await Guide.insertMany(guidesData);
    const reviews = await Review.insertMany(reviewsData);

    console.log("\n✅ Database seeding completed successfully!");
    console.log(`📦 Created ${projects.length} projects`);
    console.log(`📦 Created ${services.length} services`);
    console.log(`📦 Created ${galleryItems.length} gallery items`);
    console.log(`📦 Created ${guides.length} design guides`);
    console.log(`📦 Created ${reviews.length} client reviews`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
