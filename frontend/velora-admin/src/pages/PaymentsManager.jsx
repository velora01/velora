import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import erpApi from "../services/erpService";
import { Download } from "lucide-react";

export default function PaymentsManager() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");

  const loadPayments = () => {
    erpApi.getPayments({ search }).then((res) => {
      if (res?.data) setPayments(res.data);
    });
  };

  useEffect(() => {
    loadPayments();
  }, [search]);

  const columns = [
    { header: "Receipt #", key: "receiptNumber", sortable: true },
    { header: "Client Name", key: "clientName" },
    {
      header: "Amount (₹)",
      render: (row) => `₹${(row.amount || 0).toLocaleString("en-IN")}`
    },
    { header: "Payment Method", key: "paymentMethod" },
    { header: "Transaction ID", key: "transactionId" },
    {
      header: "Payment Date",
      render: (row) => new Date(row.paymentDate || Date.now()).toLocaleDateString()
    },
    { header: "Status", key: "status", sortable: true },
    {
      header: "Receipt",
      render: (row) => (
        <a
          href={erpApi.exportReceiptPdfUrl(row._id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#9E7B1D] hover:border-[#C5A059]"
        >
          <Download size={12} />
          <span>Receipt</span>
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Ledger & Receipts</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Track client advance deposits, milestone payments, and transaction receipts</p>
      </div>

      <DataTable title="All Payment Transactions" columns={columns} data={payments} search={search} setSearch={setSearch} />
    </div>
  );
}
