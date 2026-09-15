import User from "../models/User.js";
import Role from "../models/Role.js";
import { logActivity } from "../services/auditService.js";
import { sendAdminActivityNotification } from "../services/email.service.js";

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
    const { name, email, password, role, phone, avatar, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required fields",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${cleanEmail}" already exists`,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || "Designer",
      phone: phone ? phone.trim() : "",
      avatar: avatar || "",
      isActive: isActive !== false,
    });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Created",
      module: "Users",
      description: `Created user ${user.name} (${user.role})`
    });

    sendAdminActivityNotification({
      actionType: "New Staff Account Created",
      performedBy: req.user?.name || "Admin",
      role: req.user?.role || "Admin",
      clientName: user.name,
      details: `Created account for ${user.name} (${user.email}) with role ${user.role}`
    }).catch(() => {});

    const responseData = user.toObject();
    delete responseData.password;
    res.status(201).json({ success: true, data: responseData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.email) user.email = req.body.email.toLowerCase().trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role) user.role = req.body.role;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

    // Only update password if non-empty string provided
    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password.trim();
    }

    await user.save();

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Users",
      description: `Updated profile & role for ${user.name} (${user.role})`
    });

    const responseData = user.toObject();
    delete responseData.password;
    res.json({ success: true, data: responseData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Updated",
      module: "Users",
      description: `Updated role for ${user.name} to ${role}`
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await logActivity({
      userName: req.user?.name || "Admin",
      action: "Deleted",
      module: "Users",
      description: `Deleted user ${user.name} (${user.email})`
    });

    res.json({ success: true, message: `User ${user.name} deleted successfully` });
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
