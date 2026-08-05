import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import { Download, Plus } from "lucide-react";

export default function QuotationInvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    subtotal: 1000000,
    gstPercent: 18
  });

  const loadInvoices = () => {
    erpApi.getInvoices({ search }).then((res) => {
      if (res?.data) setInvoices(res.data);
    });
  };

  useEffect(() => {
    loadInvoices();
  }, [search]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const sub = Number(formData.subtotal);
    const gst = sub * 0.18;
    const grand = sub + gst;

    await erpApi.createInvoice({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      subtotal: sub,
      gstTotal: gst,
      grandTotal: grand,
      balanceDue: grand,
      items: [{ description: "Interior Execution Stage Milestone", quantity: 1, unitPrice: sub, total: sub }]
    });

    setIsDrawerOpen(false);
    loadInvoices();
  };

  const columns = [
    { header: "Invoice #", key: "invoiceNumber", sortable: true },
    { header: "Client Name", key: "clientName" },
    {
      header: "Subtotal (₹)",
      render: (row) => `₹${(row.subtotal || 0).toLocaleString("en-IN")}`
    },
    {
      header: "GST (18%)",
      render: (row) => `₹${(row.gstTotal || 0).toLocaleString("en-IN")}`
    },
    {
      header: "Grand Total",
      render: (row) => `₹${(row.grandTotal || 0).toLocaleString("en-IN")}`
    },
    { header: "Status", key: "status", sortable: true },
    {
      header: "PDF",
      render: (row) => (
        <a
          href={erpApi.exportInvoicePdfUrl(row._id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
        >
          <Download size={12} />
          <span>Invoice</span>
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Invoices & Billing</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Issue GST compliant invoices, track milestones, and export PDFs</p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:opacity-95"
        >
          <Plus size={16} />
          <span>Create Tax Invoice</span>
        </button>
      </div>

      <DataTable title="All Issued Invoices" columns={columns} data={invoices} search={search} setSearch={setSearch} />

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Create GST Tax Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Client Name</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Client Email</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Milestone Subtotal (₹)</label>
            <input
              type="number"
              required
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-bold text-slate-900">
                ₹{(Number(formData.subtotal || 0) * 0.18).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#9E7B1D]">
              <span>Grand Total:</span>
              <span>₹{(Number(formData.subtotal || 0) * 1.18).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-bold rounded-xl"
          >
            Generate & Issue Invoice
          </button>
        </form>
      </Drawer>
    </div>
  );
}
