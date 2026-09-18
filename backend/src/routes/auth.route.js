import express from "express";
import { body } from "express-validator";
import {
  register,
  registerAdmin,
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

// Public routes
authRoute.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

authRoute.post(
  "/register-admin",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  registerAdmin
);

authRoute.post(
  "/login",
  [
    body("email").trim().notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

authRoute.post("/logout", logout);

authRoute.post("/refresh-token", refreshToken);

authRoute.post("/forgot-password", forgotPassword);

authRoute.post("/reset-password", resetPassword);
authRoute.post("/reset-password/:token", resetPassword);

// Protected routes
authRoute.post("/change-password", protect, changePassword);

authRoute.get("/profile", protect, getProfile);
authRoute.put("/profile", protect, updateProfile);

export default authRoute;
