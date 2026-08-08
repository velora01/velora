import React, { useState, useEffect } from "react";
import EstimateBuilder from "../components/EstimateBuilder";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { Download } from "lucide-react";

export default function EstimateManager() {
  const [activeTab, setActiveTab] = useState("builder");
  const [estimates, setEstimates] = useState([]);
  const [search, setSearch] = useState("");

  const loadEstimates = () => {
    erpApi.getBOQs({ search }).then((res) => {
      if (res?.data) setEstimates(res.data);
    });
  };

  useEffect(() => {
    loadEstimates();
  }, [search]);

  const handleSaveEstimate = async (estimateData) => {
    try {
      await erpApi.createBOQ(estimateData);
      alert("Estimate Saved successfully!");
      loadEstimates();
      setActiveTab("history");
    } catch (err) {
      alert("Failed to save estimate: " + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    { header: "Estimate #", key: "boqNumber", sortable: true },
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Estimates</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Create detailed room-wise cost estimates and export professional PDF quotes</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "builder" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
          >
            Create New Estimate
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "history" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
              }`}
          >
            View Saved Estimates
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <EstimateBuilder onSaveBOQ={handleSaveEstimate} />
      ) : (
        <DataTable title="Saved Estimates History" columns={columns} data={estimates} search={search} setSearch={setSearch} />
      )}
    </div>
  );
}
