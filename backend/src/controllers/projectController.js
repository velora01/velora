import Project from "../models/Project.js";

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const createProject = async (req, res) => {
  try {
    const { tag, heading, description, image } = req.body;

    if (!tag || !heading || !description) {
      return res.status(400).json({
        success: false,
        message: "Tag, heading, and description are required.",
      });
    }

    const slug = makeSlug(heading);
    const existing = await Project.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A project with this heading already exists.",
      });
    }

    const project = await Project.create({
      tag,
      heading,
      description,
      image: image || "",
      slug,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await Project.findOne({ slug, isActive: true });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project by slug error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
