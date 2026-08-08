import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { ArrowRight, FolderOpen, X, Download, FileSpreadsheet, Plus, ClipboardList } from "lucide-react";
import EstimateBuilder from "../components/EstimateBuilder";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  
  // Drawer states
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("project");
  const [projectBOQs, setProjectBOQs] = useState([]);

  const loadProjects = () => {
    erpApi.getProjects({ search, stage: stageFilter }).then((res) => {
      if (res?.data) setProjects(res.data);
    });
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
  }, [search, stageFilter]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectBOQs(selectedProject._id);
    }
  }, [selectedProject]);

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
    }
  };

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    setActiveDetailTab("project");
  };

  const columns = [
    { header: "Project Title", key: "heading", sortable: true },
    { header: "Client", key: "clientName" },
    { header: "Address", key: "address" },
    {
      header: "Budget (₹)",
      render: (row) => `₹${(row.budget || 2500000).toLocaleString("en-IN")}`
    },
    { header: "Current Stage", key: "stage", sortable: true },
    {
      header: "Progress",
      render: (row) => (
        <div className="w-28 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>{row.progressPercent || 20}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059]"
              style={{ width: `${row.progressPercent || 20}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Action",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStageAdvance(row)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059] cursor-pointer"
          >
            <span>Advance</span>
            <ArrowRight size={12} />
          </button>
          <button
            onClick={() => handleSelectProject(row)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF6ED] border border-[#E8DCC4] rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#D4AF37] hover:bg-white transition cursor-pointer"
          >
            <FolderOpen size={12} />
            <span>Manage</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Management</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Monitor projects progressing through all 12 enterprise interior design stages
        </p>
      </div>

      {/* Stage pipeline pills overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stagesList.map((st, idx) => (
          <button
            key={st}
            onClick={() => setStageFilter(stageFilter === st ? "" : st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              stageFilter === st
                ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
            }`}
          >
            {idx + 1}. {st}
          </button>
        ))}
      </div>

      <DataTable
        title="Projects Registry"
        columns={columns}
        data={projects}
        search={search}
        setSearch={setSearch}
        statusFilter={stageFilter}
        setStatusFilter={setStageFilter}
        statusOptions={stagesList}
      />

      {/* PROJECT DETAILS & BOQ WORKSPACE DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-xl flex flex-col h-full">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FFFDF9]">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedProject.heading}</h3>
                <p className="text-[10px] text-[#9E7B1D] font-extrabold uppercase tracking-wider">
                  Client: {selectedProject.clientName} • Stage: {selectedProject.stage}
                </p>
              </div>
              <button 
                onClick={() => setSelectedProject(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#FAF9F5] border-b border-slate-150 px-6">
              {[
                { id: "project", label: "Project Details" },
                { id: "boqs", label: "Estimates" },
                { id: "create_boq", label: "Create Estimate" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveDetailTab(t.id)}
                  className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    activeDetailTab === t.id
                      ? "border-[#D4AF37] text-slate-900 font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t.id === "create_boq" ? "⚡ " : ""}{t.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeDetailTab === "project" && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F5] p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Client Name</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedProject.clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Site Address</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedProject.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Budget Limit</span>
                      <span className="font-bold text-[#9E7B1D] text-xs">₹{(selectedProject.budget || 2500000).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Current Stage</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedProject.stage}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Priority Status</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedProject.priority || "Medium"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Progress Rate</span>
                      <span className="font-bold text-slate-800 text-xs">{selectedProject.progressPercent || 0}%</span>
                    </div>
                  </div>

                  {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-800 text-xs">Project Milestones</h4>
                      <div className="space-y-2">
                        {selectedProject.milestones.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                            <span className="font-medium text-slate-700">{m.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.completed ? "bg-emerald-50 text-emerald-700 border border-emerald-250" : "bg-amber-50 text-amber-700 border border-amber-250"}`}>
                              {m.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === "boqs" && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-800 text-xs">Project Cost Estimates</h4>
                    <button
                      onClick={() => setActiveDetailTab("create_boq")}
                      className="px-3 py-1 bg-[#FAF6ED] border border-[#E8DCC4] text-xs font-bold text-[#9E7B1D] rounded-xl hover:bg-white hover:border-[#D4AF37] transition cursor-pointer"
                    >
                      + Create New Estimate
                    </button>
                  </div>

                  {projectBOQs.length === 0 ? (
                    <div className="py-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 italic text-xs">
                      No cost estimates created yet for this project.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectBOQs.map((boq) => (
                        <div key={boq._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-[#D4AF37] transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800 text-xs">{boq.boqNumber}</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                boq.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                boq.status === "Pending Approval" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}>
                                {boq.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Prepared by: {boq.preparedBy} • {new Date(boq.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block text-right">Estimate:</span>
                              <span className="font-bold text-[#9E7B1D]">₹{Math.round(boq.grandTotal).toLocaleString("en-IN")}</span>
                            </div>
                            <a
                              href={erpApi.exportBOQPdfUrl(boq._id)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </a>
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
