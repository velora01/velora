import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    // Placeholder: Implement real authentication with DB
    return res.status(200).json({ success: true, message: "Login endpoint (not fully implemented)", data: { email } });
};

export const logout = async (req, res)=>{

}

export const updateUser = async (req, res)=>{
    
}

export default { register, login };