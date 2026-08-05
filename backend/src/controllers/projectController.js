import Project from "../models/Project.js";
import { logActivity } from "../services/auditService.js";
import { emitNotification } from "../services/socketService.js";

export const getProjects = async (req, res) => {
  try {
    const { search = "", stage = "", page = 1, limit = 10, sortBy = "createdAt" } = req.query;
    const query = {};
    if (search) query.$or = [{ heading: new RegExp(search, "i") }, { clientName: new RegExp(search, "i") }];
    if (stage) query.stage = stage;

    const projects = await Project.find(query)
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Project.countDocuments(query);

    res.json({ success: true, data: projects, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    await logActivity({ userName: req.user?.name || "Admin", action: "Created", module: "Projects", description: `Created project ${project.heading}` });
    emitNotification("project-updated", { message: `New project ${project.heading} initialized`, project });
    res.status(201).json({ success: true, data: project });
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

