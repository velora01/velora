import React, { useState, useEffect } from "react";
import KanbanBoard from "../components/KanbanBoard";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { LayoutGrid, List } from "lucide-react";

export default function ProductionFactory() {
  const [viewMode, setViewMode] = useState("kanban");
  const [productionItems, setProductionItems] = useState([]);
  const [search, setSearch] = useState("");

  const loadProduction = () => {
    erpApi.getProduction({ search }).then((res) => {
      if (res?.data) setProductionItems(res.data);
    });
  };

  useEffect(() => {
    loadProduction();
  }, [search]);

  const factoryColumns = [
    { id: "Queued", title: "Queued" },
    { id: "Cutting", title: "CNC & Cutting" },
    { id: "Polishing", title: "Sanding & Polishing" },
    { id: "Painting", title: "PU & Painting" },
    { id: "Assembly", title: "Sub-Assembly" },
    { id: "Packaging", title: "Packaging" },
    { id: "Dispatch", title: "Dispatched to Site" }
  ];

  const tableCols = [
    { header: "Order Code", key: "productionCode", sortable: true },
    { header: "Project Name", key: "projectName" },
    { header: "Factory Location", key: "factoryLocation" },
    { header: "Manager", key: "assignedFactoryManager" },
    { header: "Stage Status", key: "status", sortable: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Factory Manufacturing Queue</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Real-time factory floor tracking across 6 manufacturing stages</p>
        </div>

        <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "kanban" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "table" ? "bg-[#D4AF37] text-slate-950" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <KanbanBoard
          columns={factoryColumns}
          items={productionItems}
          onStatusChange={async (id, newStatus) => {
            await erpApi.updateProductionStatus(id, { status: newStatus });
            loadProduction();
          }}
        />
      ) : (
        <DataTable title="Production Orders List" columns={tableCols} data={productionItems} search={search} setSearch={setSearch} />
      )}
    </div>
  );
}
