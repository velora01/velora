import mongoose from "mongoose";
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import { projectsData, servicesData } from "./seedData.js";

// Database connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/velora");
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Seed projects
const seedProjects = async () => {
  try {
    // Clear existing projects
    await Project.deleteMany({});
    console.log("Cleared existing projects");

    // Insert new projects
    const createdProjects = await Project.insertMany(projectsData);
    console.log(`Successfully created ${createdProjects.length} projects`);
    return createdProjects;
  } catch (error) {
    console.error("Error seeding projects:", error);
    throw error;
  }
};

// Seed services
const seedServices = async () => {
  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log("Cleared existing services");

    // Insert new services
    const createdServices = await Service.insertMany(servicesData);
    console.log(`Successfully created ${createdServices.length} services`);
    return createdServices;
  } catch (error) {
    console.error("Error seeding services:", error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");
    await connectDB();

    const projects = await seedProjects();
    const services = await seedServices();

    console.log("\n✅ Database seeding completed successfully!");
    console.log(`📦 Created ${projects.length} projects`);
    console.log(`📦 Created ${services.length} services`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
