import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";

export default function ActivityAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const loadLogs = () => {
    erpApi.getActivityLogs({ search }).then((res) => {
      if (res?.data) setLogs(res.data);
    });
  };

  useEffect(() => {
    loadLogs();
  }, [search]);

  const columns = [
    { header: "User", key: "userName", sortable: true },
    { header: "Role", key: "userRole" },
    { header: "Action", key: "action", sortable: true },
    { header: "Module", key: "module" },
    { header: "Description", key: "description" },
    {
      header: "Timestamp",
      render: (row) => new Date(row.createdAt || Date.now()).toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit & Activity Trail</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Immutable audit records of all system mutations
           (Created, Updated, Deleted, Approved)</p>
      </div>
      <DataTable title="Audit Records Grid" columns={columns} data={logs} search={search} setSearch={setSearch} />
    </div>
  );
}
