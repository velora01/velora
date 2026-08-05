import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { ArrowRightLeft } from "lucide-react";

export default function WebsiteLeads() {
  const [websiteLeads, setWebsiteLeads] = useState([]);
  const [search, setSearch] = useState("");

  const loadLeads = () => {
    erpApi.getWebsiteLeads({ search }).then((res) => {
      if (res?.data) setWebsiteLeads(res.data);
    });
  };

  useEffect(() => {
    loadLeads();
  }, [search]);

  const handleConvert = async (id) => {
    await erpApi.convertWebsiteLead(id);
    loadLeads();
  };

  const columns = [
    { header: "Name", key: "name", sortable: true },
    { header: "Phone", key: "phone" },
    { header: "Email", key: "email" },
    { header: "City", key: "city" },
    { header: "Property", key: "propertyType" },
    { header: "Budget", key: "budget" },
    { header: "Status", key: "status", sortable: true },
    {
      header: "Action",
      render: (row) =>
        row.status === "Converted to Lead" ? (
          <span className="text-[10px] text-emerald-700 font-bold">Converted</span>
        ) : (
          <button
            onClick={() => handleConvert(row._id)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
          >
            <ArrowRightLeft size={12} />
            <span>Convert</span>
          </button>
        )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Direct Inquiries</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Automatically captured inquiries submitted from velora website</p>
      </div>

      <DataTable
        title="Incoming Web Submissions"
        columns={columns}
        data={websiteLeads}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}
