import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", routes);
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});