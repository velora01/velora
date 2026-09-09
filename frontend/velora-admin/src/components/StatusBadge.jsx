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
    if (s.includes("booking") || s.includes("warm") || s.includes("in progress") || s.includes("qualified")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s.includes("design phase") || s.includes("consultation") || s.includes("estimate")) {
      return "bg-amber-100/70 text-amber-800 border-amber-300/80";
    }
    if (s.includes("product work started") || s.includes("cutting") || s.includes("under installation")) {
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    }
    if (s.includes("production completed") || s.includes("service")) {
      return "bg-emerald-50/80 text-emerald-800 border-emerald-200";
    }
    return "bg-amber-50/40 text-slate-700 border-amber-100";
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
