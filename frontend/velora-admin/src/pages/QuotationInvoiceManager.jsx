import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Drawer } from "../components/Modal";
import erpApi from "../services/erpService";
import {
  Download,
  Plus,
  FileText,
  Receipt,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Send,
  Eye,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuotationInvoiceManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quotations"); // "quotations" | "invoices"

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    clientName: "",
    clientEmail: "",
    subtotal: 1000000,
    gstPercent: 18
  });

  // Quotations state
  const [quotations, setQuotations] = useState([]);
  const [quotationSearch, setQuotationSearch] = useState("");
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    amount: 1500000,
    gstAmount: 270000,
    netTotal: 1770000,
    status: "Draft",
    notes: ""
  });

  const [toastMsg, setToastMsg] = useState("");

  const loadInvoices = async () => {
    try {
      const res = await erpApi.getInvoices({ search: invoiceSearch });
      if (res?.data) setInvoices(res.data);
    } catch (err) {
      console.error("Error loading invoices:", err);
    }
  };

  const loadQuotations = async () => {
    try {
      const res = await erpApi.getQuotations({ search: quotationSearch });
      if (res?.data) setQuotations(res.data);
    } catch (err) {
      console.error("Error loading quotations:", err);
    }
  };

  useEffect(() => {
    loadQuotations();
    loadInvoices();
  }, [invoiceSearch, quotationSearch]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const sub = Number(invoiceFormData.subtotal);
    const gst = sub * 0.18;
    const grand = sub + gst;

    try {
      await erpApi.createInvoice({
        clientName: invoiceFormData.clientName,
        clientEmail: invoiceFormData.clientEmail,
        subtotal: sub,
        gstTotal: gst,
        grandTotal: grand,
        balanceDue: grand,
        items: [{ description: "Interior Execution Stage Milestone", quantity: 1, unitPrice: sub, total: sub }]
      });

      setIsInvoiceDrawerOpen(false);
      loadInvoices();
      setToastMsg("Tax Invoice issued successfully!");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      alert("Failed to create invoice: " + err.message);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    const amt = Number(quoteFormData.amount);
    const gst = Math.round(amt * 0.18);
    const net = amt + gst;

    try {
      await erpApi.createQuotation({
        ...quoteFormData,
        amount: amt,
        gstAmount: gst,
        netTotal: net
      });

      setIsQuoteDrawerOpen(false);
      loadQuotations();
      setToastMsg("Project Quotation created successfully!");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      alert("Failed to create quotation: " + err.message);
    }
  };

  const handleDeleteQuotation = async (id, num) => {
    if (!window.confirm(`Delete quotation ${num}?`)) return;
    try {
      await erpApi.deleteQuotation(id);
      loadQuotations();
      setToastMsg(`Quotation ${num} deleted.`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      alert("Failed to delete quotation: " + err.message);
    }
  };

  const handleUpdateQuoteStatus = async (id, newStatus) => {
    try {
      await erpApi.updateQuotation(id, { status: newStatus });
      loadQuotations();
      setToastMsg(`Quotation marked as ${newStatus}`);
      setTimeout(() => setToastMsg(""), 2500);
    } catch (err) {
      alert("Failed to update quotation: " + err.message);
    }
  };

  // Columns for Quotations
  const quoteColumns = [
    {
      header: "Quotation #",
      key: "quotationNumber",
      render: (row) => <span className="font-mono font-bold text-stone-900">{row.quotationNumber}</span>
    },
    {
      header: "Client Name",
      key: "clientName",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-stone-900 block">{row.clientName}</span>
          <span className="text-[10px] text-stone-400 font-mono">{row.clientPhone || row.clientEmail || "-"}</span>
        </div>
      )
    },
    {
      header: "Subtotal (Excl. GST)",
      render: (row) => (
        <span className="font-mono text-stone-700">
          ₹{(row.amount || 0).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "GST (18%)",
      render: (row) => (
        <span className="font-mono text-stone-500">
          ₹{(row.gstAmount || 0).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "Grand Net Total",
      render: (row) => (
        <span className="font-black text-[#9E7B1D]">
          ₹{(row.netTotal || 0).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status || "Draft"}
          onChange={(e) => handleUpdateQuoteStatus(row._id, e.target.value)}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
            row.status === "Approved"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : row.status === "Sent"
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : row.status === "Declined"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>
      )
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-stone-500 text-[11px]">
          {new Date(row.createdAt || Date.now()).toLocaleDateString("en-IN")}
        </span>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.boqRef && (
            <a
              href={erpApi.exportBOQPdfUrl(row.boqRef)}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#9E7B1D] hover:bg-amber-50 rounded-lg transition"
              title="Download BOQ Quotation PDF"
            >
              <Download size={13} />
            </a>
          )}
          <button
            onClick={() => handleDeleteQuotation(row._id, row.quotationNumber)}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Delete Quotation"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  // Columns for Invoices
  const invoiceColumns = [
    {
      header: "Invoice #",
      key: "invoiceNumber",
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-stone-900">{row.invoiceNumber}</span>
    },
    { header: "Client Name", key: "clientName", sortable: true },
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
      render: (row) => (
        <span className="font-bold text-[#9E7B1D]">
          ₹{(row.grandTotal || 0).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
          row.status === "Paid" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
          row.status === "Partial" ? "bg-amber-50 text-amber-800 border-amber-200" :
          "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {row.status || "Pending"}
        </span>
      )
    },
    {
      header: "PDF",
      render: (row) => (
        <a
          href={erpApi.exportInvoicePdfUrl(row._id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059] transition"
        >
          <Download size={12} />
          <span>Tax Invoice</span>
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quotations & Billing Center</h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Manage project estimate quotations generated from BOQs, issue GST tax invoices, and track milestone billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "quotations" ? (
            <button
              onClick={() => setIsQuoteDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>New Quotation</span>
            </button>
          ) : (
            <button
              onClick={() => setIsInvoiceDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Tax Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-[#EAE3D2] pb-1">
        <button
          onClick={() => setActiveTab("quotations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "quotations"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <FileText size={14} />
          <span>Project Quotations ({quotations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "invoices"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Receipt size={14} />
          <span>Tax Invoices & Billing ({invoices.length})</span>
        </button>
      </div>

      {/* Content Table */}
      {activeTab === "quotations" ? (
        <DataTable
          title="Issued Quotations Registry"
          columns={quoteColumns}
          data={quotations}
          search={quotationSearch}
          setSearch={setQuotationSearch}
        />
      ) : (
        <DataTable
          title="GST Tax Invoices Registry"
          columns={invoiceColumns}
          data={invoices}
          search={invoiceSearch}
          setSearch={setInvoiceSearch}
        />
      )}

      {/* ========================================================================= */}
      {/* CREATE QUOTATION DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={isQuoteDrawerOpen}
        onClose={() => setIsQuoteDrawerOpen(false)}
        title="Create New Project Quotation"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-bold mb-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Malhotra"
              value={quoteFormData.clientName}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, clientName: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Client Email</label>
            <input
              type="email"
              placeholder="e.g. vikram@example.com"
              value={quoteFormData.clientEmail}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Client Phone</label>
            <input
              type="text"
              placeholder="e.g. 98765 43210"
              value={quoteFormData.clientPhone}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, clientPhone: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Quotation Subtotal (₹)</label>
            <input
              type="number"
              required
              value={quoteFormData.amount}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-stone-600">
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-bold text-stone-900">
                ₹{(Number(quoteFormData.amount || 0) * 0.18).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-1 font-bold text-[#9E7B1D]">
              <span>Grand Net Total:</span>
              <span>₹{(Number(quoteFormData.amount || 0) * 1.18).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Notes / Scope Summary</label>
            <textarea
              rows={2}
              placeholder="e.g. Turnkey modular woodwork, Italian marble and false ceiling scope"
              value={quoteFormData.notes}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Create Quotation Record
          </button>
        </form>
      </Drawer>

      {/* ========================================================================= */}
      {/* CREATE TAX INVOICE DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={isInvoiceDrawerOpen}
        onClose={() => setIsInvoiceDrawerOpen(false)}
        title="Create GST Tax Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-bold mb-1">Client Name</label>
            <input
              type="text"
              required
              value={invoiceFormData.clientName}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, clientName: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Client Email</label>
            <input
              type="email"
              value={invoiceFormData.clientEmail}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Milestone Subtotal (₹)</label>
            <input
              type="number"
              required
              value={invoiceFormData.subtotal}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, subtotal: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-stone-600">
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-bold text-stone-900">
                ₹{(Number(invoiceFormData.subtotal || 0) * 0.18).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-1 font-bold text-[#9E7B1D]">
              <span>Grand Total:</span>
              <span>₹{(Number(invoiceFormData.subtotal || 0) * 1.18).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38E2D] text-stone-950 font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Generate & Issue Invoice
          </button>
        </form>
      </Drawer>
    </div>
  );
}
