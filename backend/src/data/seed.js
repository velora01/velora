import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import Gallery from "../models/Gallery.js";
import Guide from "../models/Guide.js";
import Review from "../models/Review.js";
import CRMLead from "../models/crm.model.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";

import {
  projectsData,
  servicesData,
  galleryData,
  guidesData,
  reviewsData,
  crmLeadsData,
} from "./seedData.js";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/velora";
    await mongoose.connect(uri);
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
    await CRMLead.deleteMany({});
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    console.log("Cleared existing database collections");

    // Insert portfolio/showcase data
    const projects = await Project.insertMany(projectsData);
    const services = await Service.insertMany(servicesData);
    const galleryItems = await Gallery.insertMany(galleryData);
    const guides = await Guide.insertMany(guidesData);
    const reviews = await Review.insertMany(reviewsData);
    const crmLeads = await CRMLead.insertMany(crmLeadsData);

    console.log("\n📦 Portfolio data seeded:");
    console.log(`- Created ${projects.length} projects`);
    console.log(`- Created ${services.length} services`);
    console.log(`- Created ${galleryItems.length} gallery items`);
    console.log(`- Created ${guides.length} design guides`);
    console.log(`- Created ${reviews.length} client reviews`);
    console.log(`- Created ${crmLeads.length} CRM leads`);

    // Seed staff Users
    console.log("\n👤 Seeding staff Users...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@veloradesigns.com",
        password: "adminpassword",
        role: "Admin",
      },
      {
        name: "Sales Coordinator",
        email: "sales@veloradesigns.com",
        password: "salespassword",
        role: "Sales",
      },
      {
        name: "Priya Sharma (Designer)",
        email: "designer@veloradesigns.com",
        password: "designerpassword",
        role: "Designer",
      },
      {
        name: "Amit Verma (Project Manager)",
        email: "pm@veloradesigns.com",
        password: "pmpassword",
        role: "Project Manager",
      },
    ]);
    console.log(`- Created ${users.length} staff users with distinct roles.`);

    // Find design/sales users to link
    const designer = users.find((u) => u.role === "Designer");
    const sales = users.find((u) => u.role === "Sales");

    // Seed Sales pipeline Leads
    console.log("\n🎯 Seeding Sales Leads...");
    const leads = await Lead.create([
      {
        name: "Aarav Mehta",
        phone: "+91 98200 12345",
        email: "aarav.mehta@example.com",
        source: "Website",
        status: "Booking",
        projectCategory: "Full Home Interior",
        budget: "20L+",
        notes: "Wants premium minimal aesthetics for 3BHK flat in Mumbai.",
      },
      {
        name: "Neha Kulkarni",
        phone: "+91 91670 98765",
        email: "neha.k@example.com",
        source: "Instagram",
        status: "Design Phase",
        projectCategory: "Modular Kitchen",
        budget: "5-10L",
        notes: "Wants parallel matte black modular kitchen. Scheduled virtual call.",
        assignedTo: sales._id,
      },
      {
        name: "Rahul Sharma",
        phone: "+91 98110 54321",
        email: "rahul.sharma@example.com",
        source: "Google",
        status: "Delivered",
        projectCategory: "Living Room",
        budget: "10-20L",
        notes: "Shared 2D renderings and TV console quotation. Client agreed.",
        assignedTo: designer._id,
      },
    ]);
    console.log(`- Created ${leads.length} sales pipeline leads.`);

    // Seed active Customers (one linked to a designer/sales and portfolio project)
    console.log("\n👥 Seeding Customer Profiles...");
    const customer = await Customer.create({
      clientCode: "VEL0001",
      name: "Rohan Sharma",
      phone: "+91 98765 43210",
      email: "rohan.sharma@example.com",
      address: "Flat 402, Oberoi Splendor, Andheri East, Mumbai",
      occupation: "Software Architect",
      budget: "20L+",
      houseType: "3BHK Flat",
      flatNumber: "402",
      projectId: projects[0]._id, // Minimalist Penthouse
      assignedDesigner: designer._id,
      assignedSales: sales._id,
      status: "Active",
      uniqueLoginId: "VEL0001",
      password: "customerpassword",
    });
    console.log(`- Created customer ${customer.name} (${customer.clientCode}).`);

    console.log("\n✅ Database seeding completed successfully!");
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
