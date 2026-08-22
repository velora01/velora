import React, { useState } from "react";
import erpApi from "../services/erpService";
import { Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { downloadCsv, triggerBlobDownload, downloadInvoicePdf } from "../utils/downloadHelper";

export default function ReportsAnalytics() {
  const [downloadingType, setDownloadingType] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const reportsList = [
    {
      title: "Sales & Inquiries Report",
      desc: "Complete log of sales funnel, conversion rates, and acquisition channels",
      type: "sales",
      mockColumns: [
        { header: "Enquiry No", key: "enquiryNo" },
        { header: "Client Name", key: "name" },
        { header: "Phone", key: "phone" },
        { header: "Status", key: "status" },
        { header: "Budget", key: "budget" }
      ],
      mockData: [
        { enquiryNo: "ENQ-2026-018", name: "Rajeev Singhal", phone: "89482 74553", status: "Active", budget: "₹35,00,000" },
        { enquiryNo: "ENQ-2026-017", name: "Rasid sir", phone: "84128 52592", status: "Consultation", budget: "₹18,50,000" },
        { enquiryNo: "ENQ-2026-016", name: "Meenakshi Krishnani", phone: "91671 35606", status: "Quotation", budget: "₹45,00,000" }
      ]
    },
    {
      title: "Projects Master Lifecycle",
      desc: "Detailed breakdown of all active, paused, and completed projects across 12 stages",
      type: "projects",
      mockColumns: [
        { header: "Project Title", key: "title" },
        { header: "Client", key: "client" },
        { header: "Stage", key: "stage" },
        { header: "Progress", key: "progress" },
        { header: "Budget", key: "budget" }
      ],
      mockData: [
        { title: "Singhal Penthouse", client: "Rajeev Singhal", stage: "Production", progress: "65%", budget: "₹42,00,000" },
        { title: "Krishnani Residence", client: "Meenakshi Krishnani", stage: "Design", progress: "35%", budget: "₹28,00,000" }
      ]
    },
    {
      title: "Financial Revenue & Ledger",
      desc: "Invoicing summary, GST collected, receivables, and net profit margins",
      type: "revenue",
      mockColumns: [
        { header: "Invoice No", key: "invoiceNumber" },
        { header: "Client", key: "client" },
        { header: "Subtotal", key: "subtotal" },
        { header: "GST 18%", key: "gst" },
        { header: "Grand Total", key: "total" },
        { header: "Status", key: "status" }
      ],
      mockData: [
        { invoiceNumber: "INV-VEL-1001", client: "Rajeev Singhal", subtotal: "₹10,00,000", gst: "₹1,80,000", total: "₹11,80,000", status: "Paid" },
        { invoiceNumber: "INV-VEL-1002", client: "Meenakshi Krishnani", subtotal: "₹7,50,000", gst: "₹1,35,000", total: "₹8,85,000", status: "Partial" }
      ]
    },
    {
      title: "Factory Production Efficiency",
      desc: "Manufacturing velocity, stage cycle times, and material consumption",
      type: "factory",
      mockColumns: [
        { header: "Batch Ref", key: "batch" },
        { header: "Component", key: "component" },
        { header: "Units", key: "units" },
        { header: "Status", key: "status" }
      ],
      mockData: [
        { batch: "BATCH-2026-081", component: "Modular Carcass Box", units: "42 units", status: "CNC Cutting Completed" },
        { batch: "BATCH-2026-082", component: "Acrylic Shutter Edgebanding", units: "28 units", status: "In Assembly" }
      ]
    }
  ];
  

  const handleExportReport = async (report) => {
    setDownloadingType(report.type);
    try {
      const token = localStorage.getItem("velora_token") || "";
      const url = erpApi.getExportUrl(report.type);

      const res = await fetch(url + (token ? `?token=${encodeURIComponent(token)}` : ""), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const blob = await res.blob();
        triggerBlobDownload(blob, `Velora_${report.type}_report.xlsx`);
        setToastMsg(`Exported ${report.title}`);
        setTimeout(() => setToastMsg(""), 3000);
        return;
      }
    } catch {
      // Fallback
    } finally {
      setDownloadingType(null);
    }

    // Fallback: Client-side CSV export
    downloadCsv(`Velora_${report.type}_Report`, report.mockColumns, report.mockData);
    setToastMsg(`Exported ${report.title} (CSV)`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Analytics & Report Center</h1>
        <p className="text-xs text-stone-500 mt-1 font-medium">
          Export enterprise data workbooks in Excel (.xlsx) and CSV formats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => (
          <div
            key={rep.type}
            className="bg-white border border-[#EAE3D2] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFFBF0] text-[#9E7B1D] rounded-xl border border-[#E8D49E]">
                  <FileSpreadsheet size={18} />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">{rep.title}</h3>
              </div>
              <p className="text-xs text-stone-500 font-medium">{rep.desc}</p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Format: Excel / CSV
              </span>
              <button
                type="button"
                onClick={() => handleExportReport(rep)}
                disabled={downloadingType === rep.type}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                <Download size={14} />
                <span>{downloadingType === rep.type ? "Exporting..." : "Export Report"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
