import React from "react";

export default function StatusBadge({ status }) {
  const getColors = (st) => {
    const s = String(st || "").toLowerCase();
    if (s.includes("delivered") || s.includes("won") || s.includes("completed") || s.includes("paid") || s.includes("approved")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("lost") || s.includes("cancelled") || s.includes("overdue") || s.includes("rejected")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("booking")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (s.includes("design phase")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("product work started")) {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }
    if (s.includes("production completed")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (s.includes("under installation")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    if (s.includes("warm") || s.includes("in progress") || s.includes("qualified") || s.includes("cutting")) {
      return "bg-[#FFFBF0] text-[#9E7B1D] border-[#E8D49E]";
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
