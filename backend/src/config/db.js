import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("MONGO_URI not set — skipping MongoDB connection (dev only)");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Do not exit the process; allow the app to run in degraded mode for local dev
  }
};

export default connectDB;