import React, { useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function DataTable({
  title,
  subtitle,
  columns = [],
  data = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions = [],
  onExportExcel,
  onAddNew,
  addNewLabel = "Create Record",
  isLoading = false
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const itemsPerPage = 8;

  // Filter local data
  let processedData = [...data];
  if (search) {
    const query = search.toLowerCase();
    processedData = processedData.filter((item) =>
      Object.values(item).some((val) => String(val || "").toLowerCase().includes(query))
    );
  }

  if (statusFilter) {
    processedData = processedData.filter(
      (item) => String(item.status || item.stage || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // Sort local data
  if (sortField) {
    processedData.sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
            <span className="text-xs bg-[#FFFBF0] text-[#9E7B1D] px-2.5 py-0.5 rounded-full font-bold border border-[#E8D49E]">
              {processedData.length} records
            </span>
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#C5A059] hover:text-[#9E7B1D] transition shadow-xs cursor-pointer"
            >
              <Download size={14} className="text-[#9E7B1D]" />
              <span>Export Excel</span>
            </button>
          )}

          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] rounded-xl hover:opacity-95 transition shadow-sm cursor-pointer"
            >
              <span>+ {addNewLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls bar (Search & Filters) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={search || ""}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white"
          />
        </div>

        {statusOptions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#9E7B1D]" />
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter && setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Data Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3.5 select-none ${col.sortable ? "cursor-pointer hover:text-[#9E7B1D]" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown size={12} className="text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 font-medium">
                  Loading data...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row._id || idx} className="hover:bg-slate-50/80 transition">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className="px-4 py-3.5 font-medium text-slate-800">
                      {col.render ? (
                        col.render(row)
                      ) : col.key === "status" || col.key === "stage" ? (
                        <StatusBadge status={row[col.key]} />
                      ) : (
                        row[col.key] || "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
        <span>
          Showing page <strong className="text-slate-800">{currentPage}</strong> of{" "}
          <strong className="text-slate-800">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:border-[#C5A059]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:border-[#C5A059]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
