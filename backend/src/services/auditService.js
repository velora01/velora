import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ userName = "System Admin", userRole = "Admin", action, module, description, targetId = "", ipAddress = "127.0.0.1" }) => {
  try {
    await ActivityLog.create({
      userName,
      userRole,
      action,
      module,
      description,
      targetId,
      ipAddress
    });
  } catch (err) {
    console.error("Failed to record activity log:", err.message);
  }
};
