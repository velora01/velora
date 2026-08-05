import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (req, res) => {
  try {
    const { module, action, page = 1, limit = 20 } = req.query;
    const query = {};
    if (module) query.module = module;
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(query);

    res.json({ success: true, data: logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
