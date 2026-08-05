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
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]. Current role: ${userRole}`
      });
    }

    next();
  };
};
