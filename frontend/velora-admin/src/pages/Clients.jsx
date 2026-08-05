import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import { PhoneCall } from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [newLog, setNewLog] = useState("");

  const loadClients = () => {
    erpApi.getClients({ search }).then((res) => {
      if (res?.data) setClients(res.data);
    });
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleAddLog = async () => {
    if (!selectedClient || !newLog) return;
    await erpApi.addClientCommunication(selectedClient._id, { summary: newLog, channel: "Call" });
    setNewLog("");
    loadClients();
    setSelectedClient((c) => ({
      ...c,
      communicationHistory: [...(c.communicationHistory || []), { summary: newLog, channel: "Call", timestamp: new Date() }]
    }));
  };

  const columns = [
    { header: "Client Code", key: "clientCode" },
    { header: "Name", key: "name", sortable: true },
    { header: "Phone", key: "phone" },
    { header: "Email", key: "email" },
    { header: "City", key: "city" },
    { header: "GSTIN", key: "gstin" },
    { header: "Status", key: "status" },
    {
      header: "360 Profile",
      render: (row) => (
        <button
          onClick={() => setSelectedClient(row)}
          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clients Directory</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">360-degree client management, history logs, and linked financial records</p>
        </div>
      </div>

      <DataTable title="All Active Clients" columns={columns} data={clients} search={search} setSearch={setSearch} />

      {/* Client 360 Drawer */}
      <Drawer isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Client 360 Profile">
        {selectedClient && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-base text-slate-900">{selectedClient.name}</h3>
              <p className="text-slate-600">Code: {selectedClient.clientCode}</p>
              <p className="text-slate-600">Phone: {selectedClient.phone}</p>
              <p className="text-slate-600">Email: {selectedClient.email}</p>
              <p className="text-[#9E7B1D] font-bold">City: {selectedClient.city}</p>
            </div>

            {/* Communication History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <PhoneCall size={14} className="text-[#9E7B1D]" />
                Communication Logs
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record call summary..."
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
                <button
                  onClick={handleAddLog}
                  className="px-3 py-1.5 bg-[#D4AF37] text-slate-950 font-bold rounded-xl text-xs"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedClient.communicationHistory || []).map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50/80 border border-slate-200 rounded-lg">
                    <p className="font-semibold text-slate-800">{log.summary}</p>
                    <span className="text-[10px] text-slate-400">
                      {log.channel} • {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
