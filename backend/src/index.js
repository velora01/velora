import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import uploadRoutes from "./routes/uploadRoutes.route.js";
import path from "path";
import { initSocket } from "./services/socketService.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Attach Socket.io
initSocket(server);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());
app.use("/api", routes);
app.use("/api/upload", uploadRoutes);

// Serve local static uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Velora ERP Server running on port ${PORT}`);
});