import React, { useState, useEffect } from "react";
import erpApi from "../services/erpService";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    erpApi.getCalendarEvents().then((res) => {
      if (res?.data) setEvents(res.data);
    });
  }, []);

  const sampleEvents = [
    { title: "Client Consultation - Dr. Ananya Kulkarni", type: "Meeting", time: "10:30 AM", location: "Pune Showroom" },
    { title: "Site Measurement & Laser Scan", type: "Site Visit", time: "01:30 PM", location: "Koregaon Park Estate" },
    { title: "False Ceiling & Carpentry Fitment", type: "Installation", time: "03:00 PM", location: "Baler Royal Towers" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Unified Operations Calendar</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Master schedule combining meetings, site visits, and installation deadlines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#9E7B1D]" />
              August 2026 Operational Schedule
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 font-bold uppercase tracking-wider py-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between ${
                  i + 1 === 5
                    ? "bg-[#FFFBF0] border-[#D4AF37] text-slate-900 font-extrabold shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{i + 1}</span>
                {i + 1 === 5 && <span className="text-[9px] bg-[#D4AF37] text-slate-950 rounded px-1 font-extrabold">3 Tasks</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">Today's Agenda</h3>
          <div className="space-y-3">
            {sampleEvents.map((evt, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{evt.title}</span>
                  <span className="text-[10px] text-[#9E7B1D] font-bold bg-[#FFFBF0] px-2 py-0.5 rounded border border-[#E8D49E]">
                    {evt.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {evt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {evt.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}