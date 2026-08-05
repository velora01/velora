import React from "react";
import StatusBadge from "./StatusBadge";

export default function KanbanBoard({ columns = [], items = [], onStatusChange, onItemClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colItems = items.filter((item) => (item.status || item.stage) === col.id);
        return (
          <div key={col.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col min-w-[260px] h-[580px] shadow-sm">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">{col.title}</h3>
              </div>
              <span className="text-xs bg-slate-100 text-[#9E7B1D] px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                {colItems.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {colItems.length === 0 ? (
                <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                  No items
                </div>
              ) : (
                colItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onItemClick && onItemClick(item)}
                    className="bg-slate-50 border border-slate-200 hover:border-[#C5A059] rounded-xl p-3.5 shadow-xs hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#9E7B1D] transition leading-snug">
                        {item.title || item.name || item.heading || item.projectName}
                      </h4>
                      <StatusBadge status={item.priority || item.status} />
                    </div>

                    {item.clientName && (
                      <p className="text-[11px] text-slate-500 font-medium truncate">Client: {item.clientName}</p>
                    )}

                    {item.budget && (
                      <p className="text-[11px] text-[#9E7B1D] font-bold">₹{item.budget.toLocaleString ? item.budget.toLocaleString("en-IN") : item.budget}</p>
                    )}

                    {/* Stage quick move select */}
                    {onStatusChange && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Move Stage:</span>
                        <select
                          value={item.status || item.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onStatusChange(item._id, e.target.value)}
                          className="bg-white border border-slate-200 text-slate-800 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
