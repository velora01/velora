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
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (s.includes("design phase") || s.includes("consultation")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("product work started") || s.includes("estimate")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (s.includes("production completed")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (s.includes("under installation") || s.includes("service")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
    if (s.includes("warm") || s.includes("in progress") || s.includes("qualified") || s.includes("cutting")) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
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
