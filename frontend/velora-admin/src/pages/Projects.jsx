import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import {
  ArrowRight,
  FolderOpen,
  X,
  Download,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import EstimateBuilder from "../components/EstimateBuilder";
import { downloadBOQPdf } from "../utils/downloadHelper";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Drawer / Modal states
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("project");
  const [projectBOQs, setProjectBOQs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const stagesList = [
    "Lead",
    "Consultation",
    "Site Visit",
    "Quotation",
    "BOQ",
    "Design",
    "Approval",
    "Production",
    "Dispatch",
    "Installation",
    "Handover",
    "Completed"
  ];

  const initialFormData = {
    heading: "",
    tag: "Luxury Interior",
    clientName: "",
    address: "",
    budget: 2500000,
    priority: "Medium",
    stage: "Consultation",
    progressPercent: 15,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await erpApi.getProjects({
        search,
        stage: stageFilter,
        priority: priorityFilter
      });
      if (res?.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await erpApi.getClients();
      if (res?.data) setClientsList(res.data);
    } catch (err) {
      console.error("Failed to load clients list:", err);
    }
  };

  const loadProjectBOQs = async (projectId) => {
    try {
      const res = await erpApi.getBOQs({ projectId });
      if (res?.success) {
        setProjectBOQs(res.data || []);
      }
    } catch (err) {
      console.error("Error loading project BOQs:", err);
    }
  };

  useEffect(() => {
    loadProjects();
    loadClients();
  }, [search, stageFilter, priorityFilter]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectBOQs(selectedProject._id);
    }
  }, [selectedProject]);

  const handleOpenAddModal = () => {
    setEditingProjectId(null);
    setFormData(initialFormData);
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProjectId(proj._id);
    setFormData({
      heading: proj.heading || "",
      tag: proj.tag || "Luxury Interior",
      clientName: proj.clientName || "",
      address: proj.address || "",
      budget: proj.budget || 2500000,
      priority: proj.priority || "Medium",
      stage: proj.stage || "Consultation",
      progressPercent: proj.progressPercent || 15,
      startDate: proj.startDate ? new Date(proj.startDate).toISOString().split("T")[0] : "",
      endDate: proj.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "",
      description: proj.description || ""
    });
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      if (editingProjectId) {
        const res = await erpApi.updateProject(editingProjectId, formData);
        setSuccessToast(`Project "${formData.heading}" updated successfully!`);
        if (selectedProject && selectedProject._id === editingProjectId) {
          setSelectedProject((prev) => ({ ...prev, ...formData }));
        }
      } else {
        await erpApi.createProject(formData);
        setSuccessToast(`New Project "${formData.heading}" created successfully!`);
      }
      setIsEditModalOpen(false);
      loadProjects();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save project");
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await erpApi.deleteProject(id);
      setSuccessToast(`Project "${title}" deleted.`);
      if (selectedProject?._id === id) setSelectedProject(null);
      loadProjects();
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const handleStageAdvance = async (proj) => {
    const currentIdx = stagesList.indexOf(proj.stage);
    if (currentIdx < stagesList.length - 1) {
      const nextStage = stagesList[currentIdx + 1];
      const newProgress = Math.min(100, Math.round(((currentIdx + 2) / stagesList.length) * 100));
      await erpApi.updateProjectStage(proj._id, { stage: nextStage, progressPercent: newProgress });
      loadProjects();
      if (selectedProject && selectedProject._id === proj._id) {
        setSelectedProject({ ...selectedProject, stage: nextStage, progressPercent: newProgress });
      }
      setSuccessToast(`Project advanced to ${nextStage} stage!`);
      setTimeout(() => setSuccessToast(""), 2500);
    }
  };

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    setActiveDetailTab("project");
  };

  const columns = [
    {
      header: "Project Title & Scope",
      key: "heading",
      sortable: true,
      render: (row) => (
        <div>
          <span
            onClick={() => handleSelectProject(row)}
            className="font-extrabold text-stone-900 block hover:text-[#9E7B1D] transition cursor-pointer"
          >
            {row.heading}
          </span>
          <span className="text-[10px] text-stone-400 font-semibold">{row.tag || "Luxury Interior"}</span>
        </div>
      )
    },
    {
      header: "Client & Site",
      render: (row) => (
        <div>
          <span className="font-bold text-stone-800 block">{row.clientName}</span>
          <span className="text-[10px] text-stone-500 truncate max-w-[150px] block">{row.address}</span>
        </div>
      )
    },
    {
      header: "Budget Limit",
      render: (row) => (
        <span className="font-bold text-[#9E7B1D]">
          ₹{(row.budget || 2500000).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "Stage / Status",
      key: "stage",
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 bg-amber-50 text-[#9E7B1D] border border-amber-200 rounded-lg text-xs font-extrabold inline-block">
          {row.stage}
        </span>
      )
    },
    {
      header: "Progress Rate",
      render: (row) => (
        <div className="w-28 space-y-1">
          <div className="flex justify-between text-[10px] text-stone-500 font-bold">
            <span>{row.progressPercent || 20}%</span>
            <span>{row.stage}</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#9E7B1D] transition-all"
              style={{ width: `${row.progressPercent || 20}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleStageAdvance(row)}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer"
            title="Advance to Next Stage"
          >
            <span>Advance</span>
            <ArrowRight size={12} />
          </button>
          <button
            onClick={() => handleSelectProject(row)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:bg-[#D4AF37] hover:text-stone-950 transition cursor-pointer"
            title="Manage Project"
          >
            <FolderOpen size={12} />
            <span>Manage</span>
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-stone-400 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
            title="Edit Project"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteProject(row._id, row.heading)}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Delete Project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Project Management</h1>
            <span className="text-xs font-bold text-[#9E7B1D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {projects.length} Active
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Monitor and handle interior projects through all 12 enterprise design, production & execution stages
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B38E2D] hover:opacity-95 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Project</span>
        </button>
      </div>

      {/* 12-Stage Pipeline Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#EAE3D2] shadow-2xs space-y-2">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
          Stage Pipeline Filter:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStageFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              stageFilter === ""
                ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            All Stages ({projects.length})
          </button>
          {stagesList.map((st, idx) => {
            const count = projects.filter((p) => p.stage === st).length;
            return (
              <button
                key={st}
                onClick={() => setStageFilter(stageFilter === st ? "" : st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  stageFilter === st
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 border-[#D4AF37] shadow-2xs"
                    : "bg-white text-stone-700 border-stone-200 hover:border-amber-300"
                }`}
              >
                <span>{idx + 1}. {st}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    stageFilter === st ? "bg-stone-950 text-white" : "bg-amber-100 text-[#9E7B1D]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Active Projects Registry"
        columns={columns}
        data={projects}
        search={search}
        setSearch={setSearch}
        statusFilter={stageFilter}
        setStatusFilter={setStageFilter}
        statusOptions={stagesList}
      />

      {/* ========================================================================= */}
      {/* ADD / EDIT PROJECT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE3D2] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#9E7B1D]" />
                <h3 className="font-extrabold text-sm text-stone-900">
                  {editingProjectId ? "Modify Project Details" : "Initialize New Project"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProject} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Project Title / Heading <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Singhal Penthouse & Bespoke Residence"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="clients-datalist"
                    placeholder="Type or select client"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <datalist id="clients-datalist">
                    {clientsList.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.city ? `${c.name} (${c.city})` : c.name}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Project Category / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury 4BHK Penthouse"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Budget Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  >
                    {stagesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.progressPercent}
                    onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                    className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Site Address</label>
                <input
                  type="text"
                  placeholder="e.g. Koregaon Park, Pune"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-9 px-3 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Project Scope & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe scope of work, materials, automation requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#EAE3D2] rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE3D2]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 rounded-xl font-black shadow-xs hover:opacity-95 transition cursor-pointer"
                >
                  {editingProjectId ? "Save Project" : "Initialize Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECT DETAILS & BOQ WORKSPACE DRAWER */}
      {/* ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-screen max-w-2xl bg-white border-l border-[#EAE3D2] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#EAE3D2] flex items-center justify-between bg-[#FAF9F5]">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">{selectedProject.heading}</h3>
                <p className="text-[11px] text-[#9E7B1D] font-bold">
                  Client: {selectedProject.clientName} • Stage: {selectedProject.stage} ({selectedProject.progressPercent || 0}%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedProject)}
                  className="p-1.5 text-stone-500 hover:text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                  title="Edit Project"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#FAF9F5] border-b border-[#EAE3D2] px-6">
              {[
                { id: "project", label: "Project Overview" },
                { id: "boqs", label: `Cost Estimates (${projectBOQs.length})` },
                { id: "create_boq", label: "+ New Estimate" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveDetailTab(t.id)}
                  className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeDetailTab === t.id
                      ? "border-[#D4AF37] text-stone-900 font-extrabold"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeDetailTab === "project" && (
                <div className="space-y-5 text-xs">
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-3 bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE3D2]">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold mb-0.5">Client</span>
                      <span className="font-extrabold text-stone-900">{selectedProject.clientName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold mb-0.5">Site Location</span>
                      <span className="font-bold text-stone-800">{selectedProject.address}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold mb-0.5">Budget Limit</span>
                      <span className="font-black text-[#9E7B1D]">
                        ₹{(selectedProject.budget || 2500000).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold mb-0.5">Priority</span>
                      <span className="font-bold text-stone-800">{selectedProject.priority || "Medium"}</span>
                    </div>
                  </div>

                  {/* Stage Progress Card */}
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-800">Current Stage: {selectedProject.stage}</span>
                      <button
                        onClick={() => handleStageAdvance(selectedProject)}
                        className="px-3 py-1 bg-amber-50 hover:bg-[#D4AF37] text-[#9E7B1D] hover:text-stone-950 font-bold rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        Advance Stage →
                      </button>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B38E2D]"
                        style={{ width: `${selectedProject.progressPercent || 20}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Description */}
                  {selectedProject.description && (
                    <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Scope & Description:</span>
                      <p className="text-stone-700 leading-relaxed">{selectedProject.description}</p>
                    </div>
                  )}

                  {/* Quick Shortcut to BOQ */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        navigate("/admin/boq", {
                          state: { clientName: selectedProject.clientName, projectId: selectedProject._id }
                        });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition cursor-pointer"
                    >
                      <FileSpreadsheet size={15} />
                      <span>Open Full BOQ Workspace for this Project</span>
                    </button>
                  </div>
                </div>
              )}

              {activeDetailTab === "boqs" && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-stone-800">Project Estimates & Quotations</h4>
                    <button
                      onClick={() => setActiveDetailTab("create_boq")}
                      className="px-3 py-1 bg-amber-50 border border-amber-200 text-xs font-bold text-[#9E7B1D] rounded-xl hover:bg-[#D4AF37] hover:text-stone-950 transition cursor-pointer"
                    >
                      + Create New Estimate
                    </button>
                  </div>

                  {projectBOQs.length === 0 ? (
                    <div className="py-12 border border-dashed border-stone-200 rounded-2xl text-center text-stone-400 italic">
                      No cost estimates created yet for this project.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectBOQs.map((boq) => (
                        <div
                          key={boq._id}
                          className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs hover:border-[#D4AF37] transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-stone-800 text-xs">{boq.boqNumber}</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                boq.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                boq.status === "Pending Approval" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                "bg-stone-50 text-stone-600 border border-stone-200"
                              }`}>
                                {boq.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400">
                              Prepared by: {boq.preparedBy} • {new Date(boq.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <span className="text-stone-400 text-[10px] uppercase font-bold block text-right">Grand Total:</span>
                              <span className="font-black text-[#9E7B1D]">
                                ₹{Math.round(boq.grandTotal).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <button
                              onClick={() => downloadBOQPdf(boq)}
                              className="p-2 bg-stone-50 hover:bg-amber-50 text-stone-600 hover:text-[#9E7B1D] border border-stone-200 rounded-xl transition cursor-pointer"
                              title="Download Quotation PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === "create_boq" && (
                <div>
                  <EstimateBuilder
                    initialClientName={selectedProject.clientName}
                    projectId={selectedProject._id}
                    onSaveBOQ={async (boqData) => {
                      try {
                        const res = await erpApi.createBOQ(boqData);
                        if (res?.success) {
                          alert("Estimate saved successfully!");
                          loadProjectBOQs(selectedProject._id);
                          setActiveDetailTab("boqs");
                        }
                      } catch (err) {
                        alert("Failed to save Estimate: " + (err.response?.data?.message || err.message));
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
