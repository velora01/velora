import React, { useState, useEffect } from "react";
import BOQBuilder from "../components/BOQBuilder";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { Download } from "lucide-react";

export default function BOQManager() {
  const [activeTab, setActiveTab] = useState("builder");
  const [boqs, setBoqs] = useState([]);
  const [search, setSearch] = useState("");

  const loadBOQs = () => {
    erpApi.getBOQs({ search }).then((res) => {
      if (res?.data) setBoqs(res.data);
    });
  };

  useEffect(() => {
    loadBOQs();
  }, [search]);

  const handleSaveBOQ = async (boqData) => {
    await erpApi.createBOQ(boqData);
    alert("BOQ Saved successfully!");
    loadBOQs();
    setActiveTab("history");
  };

  const columns = [
    { header: "BOQ #", key: "boqNumber", sortable: true },
    { header: "Client", key: "clientName" },
    { header: "Prepared By", key: "preparedBy" },
    {
      header: "Grand Total (₹)",
      render: (row) => `₹${(row.grandTotal || 0).toLocaleString("en-IN")}`
    },
    { header: "Status", key: "status" },
    {
      header: "PDF Export",
      render: (row) => (
        <a
          href={erpApi.exportBOQPdfUrl(row._id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
        >
          <Download size={12} />
          <span>Download PDF</span>
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Cost Estimates (BOQ)</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Create detailed room-wise cost estimates (BOQ) and export professional PDF quotes</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "builder" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Create New Estimate
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "history" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            View Saved Estimates
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <BOQBuilder onSaveBOQ={handleSaveBOQ} />
      ) : (
        <DataTable title="Saved Estimates History" columns={columns} data={boqs} search={search} setSearch={setSearch} />
      )}
    </div>
  );
}
