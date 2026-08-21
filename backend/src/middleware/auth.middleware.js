import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey123");

    // Check user type
    if (decoded.type === "Customer") {
      const customer = await Customer.findById(decoded.id);
      if (!customer || customer.status === "Inactive") {
        return res.status(401).json({
          success: false,
          message: "The customer belonging to this token no longer exists or is inactive.",
        });
      }
      req.user = customer;
      req.userType = "Customer";
      req.userRole = "Customer";
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "The user belonging to this token no longer exists.",
        });
      }
      req.user = user;
      req.userType = "User";
      req.userRole = user.role;
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Token is invalid or expired.",
    });
  }
};

// Restrict access to specific roles (only for standard Users, Customer is a separate role)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.userRole || "unknown"}) is not authorized to access this resource.`,
      });
    }
    // next();

    next();
  };
};






