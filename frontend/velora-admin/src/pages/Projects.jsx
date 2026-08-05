import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { ArrowRight } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const loadProjects = () => {
    erpApi.getProjects({ search, stage: stageFilter }).then((res) => {
      if (res?.data) setProjects(res.data);
    });
  };

  useEffect(() => {
    loadProjects();
  }, [search, stageFilter]);

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
    }
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
        <button
          onClick={() => handleStageAdvance(row)}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
        >
          <span>Advance</span>
          <ArrowRight size={12} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Projects Lifecycle</h1>
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
    </div>
  );
}
