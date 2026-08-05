import React from "react";
import erpApi from "../services/erpService";
import { Download, FileSpreadsheet } from "lucide-react";

export default function ReportsAnalytics() {
  const reportsList = [
    { title: "Sales & Inquiries Report", desc: "Complete log of sales funnel, conversion rates, and acquisition channels", type: "sales" },
    { title: "Projects Master Lifecycle", desc: "Detailed breakdown of all active, paused, and completed projects", type: "projects" },
    { title: "Financial Revenue & Ledger", desc: "Invoicing summary, GST collected, receivables, and net profit margins", type: "revenue" },
    { title: "Factory Production Efficiency", desc: "Manufacturing velocity, stage cycle times, and material consumption", type: "factory" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics & Report Center</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Export enterprise data workbooks in Excel (.xlsx) and PDF formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => (
          <div key={rep.type} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFFBF0] text-[#9E7B1D] rounded-xl border border-[#E8D49E]">
                  <FileSpreadsheet size={18} />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{rep.title}</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">{rep.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Format: Excel (.xlsx)</span>
              <a
                href={erpApi.getExportUrl(rep.type)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition"
              >
                <Download size={14} />
                <span>Export Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
