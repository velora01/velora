import React, { useState, useEffect } from "react";
import KanbanBoard from "../components/KanbanBoard";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { List, LayoutGrid } from "lucide-react";

export default function TaskManagement() {
  const [viewMode, setViewMode] = useState("kanban");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const loadTasks = () => {
    erpApi.getTasks({ search }).then((res) => {
      if (res?.data) setTasks(res.data);
    });
  };

  useEffect(() => {
    loadTasks();
  }, [search]);

  const columns = [
    { id: "Todo", title: "To-Do" },
    { id: "In Progress", title: "In Progress" },
    { id: "Review", title: "Under Review" },
    { id: "Completed", title: "Completed" }
  ];

  const tableCols = [
    { header: "Task Title", key: "title", sortable: true },
    { header: "Assignee", key: "assigneeName" },
    { header: "Priority", key: "priority" },
    { header: "Status", key: "status", sortable: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Management Kanban</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Assign designer, factory, and site installation work items</p>
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
          columns={columns}
          items={tasks}
          onStatusChange={async (id, newStatus) => {
            await erpApi.updateTask(id, { status: newStatus });
            loadTasks();
          }}
        />
      ) : (
        <DataTable title="All Tasks List" columns={tableCols} data={tasks} search={search} setSearch={setSearch} />
      )}
    </div>
  );
}
