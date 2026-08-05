import User from "../models/User.js";
import Role from "../models/Role.js";
import { logActivity } from "../services/auditService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    await logActivity({ userName: req.user?.name || "Super Admin", action: "Created", module: "Users", description: `Created user ${user.name} (${user.role})` });
    const responseData = user.toObject();
    delete responseData.password;
    res.status(201).json({ success: true, data: responseData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    await logActivity({ userName: req.user?.name || "Super Admin", action: "Updated", module: "Users", description: `Updated role for ${user.name} to ${role}` });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
