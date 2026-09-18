import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import uploadRoutes from "./routes/uploadRoutes.route.js";
import path from "path";
import { initSocket } from "./services/socketService.js";
import { startKeepAlive } from "./services/keepAliveService.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Attach Socket.io
initSocket(server);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());

// Root health check endpoints for external monitors / Render health checks
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "velora-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use("/api/upload", uploadRoutes);

// Serve local static uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Velora ERP Server running on port ${PORT}`);
  // Start automatic self-ping every 5 minutes to prevent Render free-tier sleep
  startKeepAlive(5);
});