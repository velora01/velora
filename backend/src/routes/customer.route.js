import express from "express";
import {
  customerLogin,
  verifyOtp,
  customerLogout,
  customerRegister
} from "../controllers/customerAuthController.js";
import {
  createCustomer,
  getCustomers,
  searchCustomers,
  getCustomerProject,
  getCustomerDashboard,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

export const customerAuthRouter = express.Router();
export const customerCrudRouter = express.Router();

// ==========================================
// CUSTOMER PORTAL AUTH ROUTES (Mounted at /api/customer)
// ==========================================
customerAuthRouter.post("/login", customerLogin);
customerAuthRouter.post("/verify-otp", verifyOtp);
customerAuthRouter.post("/logout", customerLogout);
customerAuthRouter.post("/register", customerRegister);


// ==========================================
// CUSTOMER MANAGEMENT CRUD ROUTES (Mounted at /api/customers)
// ==========================================

// Search (Must be placed before /:id)
customerCrudRouter.get("/search", protect, restrictTo("Admin", "Sales", "Designer"), searchCustomers);

// Customer specific project & dashboard
customerCrudRouter.get("/project", protect, getCustomerProject);
customerCrudRouter.get("/dashboard", protect, getCustomerDashboard);

// Standard CRUD operations
customerCrudRouter.post("/", protect, restrictTo("Admin", "Sales"), createCustomer);
customerCrudRouter.get("/", protect, restrictTo("Admin", "Sales", "Designer"), getCustomers);
customerCrudRouter.get("/:id", protect, restrictTo("Admin", "Sales", "Designer"), getCustomerById);
customerCrudRouter.put("/:id", protect, restrictTo("Admin", "Sales"), updateCustomer);
customerCrudRouter.delete("/:id", protect, restrictTo("Admin"), deleteCustomer);

export default {
  customerAuthRouter,
  customerCrudRouter
};
