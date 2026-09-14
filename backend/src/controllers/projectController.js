import Project from "../models/Project.js";
import { logActivity } from "../services/auditService.js";
import { emitNotification } from "../services/socketService.js";



export const getProjects = async (req, res) => {
  try {
    const { search = "", stage = "", priority = "", page = 1, limit = 10, sortBy = "createdAt" } = req.query;
    const query = {};
    if (search) query.$or = [{ heading: new RegExp(search, "i") }, { projectNumber: new RegExp(search, "i") }, { clientName: new RegExp(search, "i") }, { address: new RegExp(search, "i") }];
    if (stage) query.stage = stage;
    if (priority) query.priority = priority;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limitNum);
    const total = await Project.countDocuments(query);

    res.json({ success: true, data: projects, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const pNum = req.body.projectNumber || "PRJ-2026-" + String(Math.floor(100 + Math.random() * 900)).padStart(3, "0");
    const project = await Project.create({ ...req.body, projectNumber: pNum });
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Projects", description: `Created project ${project.heading}` });
    emitNotification("project-updated", { message: `New project ${project.heading} initialized`, project });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Updated", module: "Projects", description: `Updated project ${project.heading}` });
    emitNotification("project-updated", { message: `Project ${project.heading} updated`, project });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProjectStage = async (req, res) => {
  try {
    const { stage, progressPercent } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    project.stage = stage || project.stage;
    if (progressPercent !== undefined) project.progressPercent = progressPercent;
    await project.save();

    await logActivity({ userName: req.user?.name || "Admin", action: "Updated", module: "Projects", description: `Project ${project.heading} moved to stage ${project.stage}` });
    emitNotification("project-updated", { message: `Project ${project.heading} moved to ${project.stage}`, project });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    await logActivity({ userName: req.user?.name || "Admin", action: "Deleted", module: "Projects", description: `Deleted project ${project.heading}` });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let project = await Project.findOne({ slug });
    if (!project && slug.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(slug);
    }
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

