export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role || "Admin";

    // Super Admin has unrestricted access to all modules
    if (userRole === "Super Admin" || userRole === "Admin") {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Permission Denied: Only Admin can perform this action (requires [${allowedRoles.join(", ")}]). Your current role is: ${userRole}`
      });
    }

    next();
  };
};
