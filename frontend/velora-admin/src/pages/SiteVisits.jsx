import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { MapPin } from "lucide-react";

export default function SiteVisits() {
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");

  const loadVisits = () => {
    erpApi.getSiteVisits({ search }).then((res) => {
      if (res?.data) setVisits(res.data);
    });
  };

  useEffect(() => {
    loadVisits();
  }, [search]);

  const columns = [
    { header: "Visit Code", key: "visitCode" },
    { header: "Client Name", key: "clientName", sortable: true },
    { header: "Site Address", key: "address" },
    { header: "Designer Assigned", key: "assignedDesigner" },
    { header: "Sales Assigned", key: "assignedSales" },
    {
      header: "GPS Location",
      render: (row) => (
        <span className="flex items-center gap-1 text-[#9E7B1D] font-bold">
          <MapPin size={12} />
          {row.gpsCoordinates || "18.5204, 73.8567"}
        </span>
      )
    },
    { header: "Status", key: "status" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Site Visit & Measurement Schedule</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Planner for initial consultation, site measurement, and GPS tracking</p>
      </div>

      <DataTable title="Scheduled Site Visits" columns={columns} data={visits} search={search} setSearch={setSearch} />
    </div>
  );
}
