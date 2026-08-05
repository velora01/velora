import React from "react";

export default function StatusBadge({ status }) {
  const getColors = (st) => {
    const s = String(st || "").toLowerCase();
    if (s.includes("won") || s.includes("completed") || s.includes("paid") || s.includes("approved")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("lost") || s.includes("cancelled") || s.includes("overdue") || s.includes("rejected")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("hot") || s.includes("urgent") || s.includes("critical")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (s.includes("warm") || s.includes("in progress") || s.includes("qualified") || s.includes("cutting")) {
      return "bg-[#FFFBF0] text-[#9E7B1D] border-[#E8D49E]";
    }
    if (s.includes("cold") || s.includes("new") || s.includes("draft") || s.includes("todo")) {
      return "bg-slate-100 text-slate-700 border-slate-200";
    }
    return "bg-slate-100 text-[#9E7B1D] border-slate-200";
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border transition-all shadow-xs ${getColors(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status || "Default"}
    </span>
  );
}
