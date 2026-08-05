import Task from "../models/Task.js";
import { logActivity } from "../services/auditService.js";

export const getTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = new RegExp(search, "i");

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Tasks", description: `Created task ${task.title}` });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
