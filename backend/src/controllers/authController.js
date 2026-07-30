import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const generateAccessToken = (entity, type) => {
  const payload = {
    id: entity._id,
    role: type === "Customer" ? "Customer" : entity.role,
    type,
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "supersecretjwtkey123",
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (entity, type) => {
  const payload = {
    id: entity._id,
    role: type === "Customer" ? "Customer" : entity.role,
    type,
  };
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "supersecretjwtrefreshkey123",
    { expiresIn: "7d" }
  );
};

// Staff Register (Optional but useful)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Admin",
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin Register (Specifically forced to Admin role)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "Admin",
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Staff Login (POST /auth/login)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user, "User");
    const refreshToken = generateRefreshToken(user, "User");

    // Hide password
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Staff Logout (POST /auth/logout)
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Refresh Token (POST /auth/refresh-token)
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "supersecretjwtrefreshkey123"
    );

    let entity;
    if (decoded.type === "Customer") {
      entity = await Customer.findById(decoded.id);
    } else {
      entity = await User.findById(decoded.id);
    }

    if (!entity) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or expired. Please login again.",
      });
    }

    const newAccessToken = generateAccessToken(entity, decoded.type);
    const newRefreshToken = generateRefreshToken(entity, decoded.type);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Change Password (POST /auth/change-password)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot Password (POST /auth/forgot-password)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Try finding staff User
    let user = await User.findOne({ email });
    let userType = "User";

    // If not found, try finding Customer
    if (!user) {
      user = await Customer.findOne({ email });
      userType = "Customer";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user or customer found with this email",
      });
    }

    // Generate crypto reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const protocol = req.secure ? "https" : "http";
    const resetUrl = `${protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      // Include token for easy development testing
      testResetToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset Password (POST /auth/reset-password or POST /auth/reset-password/:token)
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Search staff User
    let user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // Search Customer
    if (!user) {
      user = await Customer.findOne({
        passwordResetToken: hashedResetToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset completed successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Profile (GET /profile or GET /auth/profile)
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Hide password
    req.user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      userType: req.userType,
      data: req.user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile (PUT /profile or PUT /auth/profile)
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, occupation } = req.body;

    let updatedEntity;
    if (req.userType === "Customer") {
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (occupation) updateData.occupation = occupation;

      updatedEntity = await Customer.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const updateData = {};
      if (name) updateData.name = name;

      updatedEntity = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    updatedEntity.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedEntity,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
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
};