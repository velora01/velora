import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { sendOtpEmail } from "../services/email.service.js";

const generateAccessToken = (customer) => {
  return jwt.sign(
    { id: customer._id, role: "Customer", type: "Customer" },
    process.env.JWT_SECRET || "supersecretjwtkey123",
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (customer) => {
  return jwt.sign(
    { id: customer._id, role: "Customer", type: "Customer" },
    process.env.JWT_REFRESH_SECRET || "supersecretjwtrefreshkey123",
    { expiresIn: "7d" }
  );
};

// Customer Login Initial Step (POST /customer/login)
export const customerLogin = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Login ID (uniqueLoginId, clientCode, or email) and password are required",
      });
    }

    // Find customer by uniqueLoginId, clientCode, or email
    const customer = await Customer.findOne({
      $or: [
        { uniqueLoginId: loginId },
        { clientCode: loginId },
        { email: loginId.toLowerCase() },
      ],
    });

    if (!customer || customer.status === "Inactive") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or customer is inactive",
      });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    customer.otp = { code: otp, expiresAt };
    await customer.save();

    // Send OTP email (async)
    await sendOtpEmail(customer.email, otp);

    return res.status(200).json({
      success: true,
      message: "Credentials verified. An OTP has been sent to your registered email.",
      data: {
        email: customer.email,
        uniqueLoginId: customer.uniqueLoginId,
        // Include OTP in the response for direct testing in Postman
        testOtp: otp,
      },
    });
  } catch (error) {
    console.error("Customer Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Customer OTP (POST /customer/verify-otp)
export const verifyOtp = async (req, res) => {
  try {
    const { loginId, otp } = req.body;

    if (!loginId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Login ID and OTP are required",
      });
    }

    const customer = await Customer.findOne({
      $or: [
        { uniqueLoginId: loginId },
        { clientCode: loginId },
        { email: loginId.toLowerCase() },
      ],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Verify OTP code and expiry
    if (!customer.otp || customer.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    if (new Date() > customer.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Clear OTP details upon success
    customer.otp = undefined;
    await customer.save();

    const accessToken = generateAccessToken(customer);
    const refreshToken = generateRefreshToken(customer);

    // Hide password
    customer.password = undefined;

    return res.status(200).json({
      success: true,
      message: "OTP verification successful. Login completed.",
      data: {
        customer,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Customer Logout (POST /customer/logout)
export const customerLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Customer logged out successfully",
  });
};

// Customer Register (POST /customer/register)
export const customerRegister = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      occupation,
      budget,
      houseType,
      flatNumber,
      uniqueLoginId,
      password,
    } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email, and password are required fields",
      });
    }

    // Check if email already exists
    const emailExists = await Customer.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email already exists",
      });
    }

    // Generate Client Code
    const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastCustomer && lastCustomer.clientCode) {
      const match = lastCustomer.clientCode.match(/VEL(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const clientCode = `VEL${String(nextNum).padStart(4, "0")}`;

    // Default uniqueLoginId to clientCode if not provided
    const finalLoginId = uniqueLoginId || clientCode;

    // Check if uniqueLoginId already exists
    const loginIdExists = await Customer.findOne({ uniqueLoginId: finalLoginId });
    if (loginIdExists) {
      return res.status(400).json({
        success: false,
        message: `Unique Login ID '${finalLoginId}' is already taken`,
      });
    }

    const customer = await Customer.create({
      clientCode,
      name,
      phone,
      email: email.toLowerCase(),
      address: address || "",
      occupation: occupation || "",
      budget: budget || "",
      houseType: houseType || "",
      flatNumber: flatNumber || "",
      status: "Active",
      uniqueLoginId: finalLoginId,
      password,
    });

    const responseData = customer.toObject();
    delete responseData.password;

    return res.status(201).json({
      success: true,
      message: "Customer account created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Customer Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

