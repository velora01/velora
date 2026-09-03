import Project from "../models/Project.js";
import { logActivity } from "../services/auditService.js";
import { emitNotification } from "../services/socketService.js";

const SEED_PROJECTS = [
  {
    heading: "Prem Shukla Royal Baner Suite",
    projectNumber: "PRJ-2026-008",
    tag: "Neo-Classical Penthouse",
    clientName: "PREM SHUKLA",
    clientPhone: "+91 78000 20496",
    clientEmail: "PREMSHUKLA@GMAIL.COM",
    address: "402, WAKAD CHOWK, AUNDH HIJNEWADI ROAD, WAKAD, PUNE, MAHARASHTRA, 411057",
    budget: 468800,
    priority: "Urgent",
    stage: "Supply",
    progressPercent: 65,
    description: "Neo-classical luxury residence featuring custom modular woodwork, beds, wardrobes, study and shoe racks."
  },
  {
    heading: "The Singhal Penthouse & Bespoke Residence",
    projectNumber: "PRJ-2026-018",
    tag: "Luxury 4BHK Penthouse",
    clientName: "Rajeev Singhal",
    clientPhone: "+91 89482 74553",
    clientEmail: "rajeev.s@example.com",
    address: "Koregaon Park, Pune",
    budget: 4500000,
    priority: "Urgent",
    stage: "BOQ",
    progressPercent: 45,
    description: "Complete bespoke 4BHK interior renovation with Italian marble, fluted wall louvers, and smart home automation."
  },
  {
    heading: "Rashid sir Luxury Showroom",
    projectNumber: "PRJ-2026-005",
    tag: "Commercial Retail Boutique",
    clientName: "Rashid sir",
    clientPhone: "+91 84128 52592",
    clientEmail: "rasid@example.com",
    address: "Bafana Complex, Wakad, Pune",
    budget: 233640,
    priority: "High",
    stage: "Production",
    progressPercent: 50,
    description: "Modern retail interior display system with premium metal finishes and LED channel lighting."
  },
  {
    heading: "Dr Hardik Specialty Clinic",
    projectNumber: "PRJ-2026-004",
    tag: "Medical Clinic Luxury",
    clientName: "Dr Hardik",
    clientPhone: "+91 98220 14592",
    clientEmail: "drhardik@example.com",
    address: "Kothrud, Pune",
    budget: 405000,
    priority: "High",
    stage: "Installation",
    progressPercent: 75,
    description: "Acoustic consultation chambers, custom reception desk, and premium laminate storage."
  },
  {
    heading: "Krishnani Bandra Sea-facing Villa",
    projectNumber: "PRJ-2026-016",
    tag: "Modern Villa Interior",
    clientName: "Meenakshi Krishnani",
    clientPhone: "+91 91671 35606",
    clientEmail: "meenakshi@example.com",
    address: "Bandra West, Mumbai",
    budget: 3500000,
    priority: "High",
    stage: "Design",
    progressPercent: 30,
    description: "Sea-facing contemporary aesthetic with minimal clean lines and acoustic wall treatment."
  },
  {
    heading: "Akash Jain Kalyani Nagar Residence",
    projectNumber: "PRJ-2026-002",
    tag: "Scandinavian 3BHK",
    clientName: "Akash Jain",
    clientPhone: "+91 89778 99643",
    clientEmail: "akash.jain@example.com",
    address: "Kalyani Nagar, Pune",
    budget: 2800000,
    priority: "Medium",
    stage: "Quotation",
    progressPercent: 25,
    description: "Warm oak and Scandinavian storage integration with ergonomic kitchen."
  },
  {
    heading: "Dr Saurabh Wellness Clinic",
    projectNumber: "PRJ-2026-001",
    tag: "Healthcare & Wellness",
    clientName: "Dr Saurabh",
    clientPhone: "+91 77090 19535",
    clientEmail: "dr.saurabh@example.com",
    address: "Aundh, Pune",
    budget: 324950,
    priority: "Medium",
    stage: "Execution",
    progressPercent: 80,
    description: "Clean contemporary clinic fitout with partition walls and reception lounge."
  },
  {
    heading: "Wipro Lincraft Executive Tech Hub",
    projectNumber: "PRJ-2026-001",
    tag: "Commercial Luxury HQ",
    clientName: "WIPRO LINCRAFT AI PRIVATE LIMITED",
    clientPhone: "+91 96323 00992",
    clientEmail: "contact@wiprolincraft.com",
    address: "Electronic City, Bengaluru",
    budget: 12000000,
    priority: "High",
    stage: "Approval",
    progressPercent: 55,
    description: "High-tech corporate headquarters with luxury executive lounge and boardroom."
  }
];

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

