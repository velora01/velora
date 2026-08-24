import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";

export default function InstallationManager() {
  const [installations, setInstallations] = useState([]);
  const [search, setSearch] = useState("");

  const loadInstallations = () => {
    erpApi.getInstallations({ search })
      .then((res) => {
        if (res?.data) setInstallations(res.data);
      })
      .catch(() => {
        setInstallations([]);
      });
  };

  useEffect(() => {
    loadInstallations();
  }, [search]);

  const columns = [
    { header: "Installation Code", key: "installationCode" },
    { header: "Project Name", key: "projectName", sortable: true },
    { header: "Assigned Team", key: "assignedTeam" },
    {
      header: "Scheduled Date",
      render: (row) => new Date(row.scheduledDate || Date.now()).toLocaleDateString()
    },
    { header: "Status", key: "status", sortable: true }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">On-Site Installation Crew Schedule</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Field team assignments, checklist progress, and sign-offs</p>
      </div>

      <DataTable title="Active Installations" columns={columns} data={installations} search={search} setSearch={setSearch} />
    </div>
  );
}
