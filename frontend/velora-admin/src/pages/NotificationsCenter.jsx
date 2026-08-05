import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Web Lead Assigned", message: "Inquiry from Dr. Ananya Kulkarni assigned to Sales Team", timestamp: "5 mins ago", type: "lead" },
    { id: 2, title: "Milestone Invoice Paid", message: "Tax Invoice INV-VEL-8419 marked as Paid (₹4,50,000)", timestamp: "1 hour ago", type: "invoice" },
    { id: 3, title: "Factory Production Stage Update", message: "Koregaon Park Estate Kitchen Cabinets moved to Polishing", timestamp: "3 hours ago", type: "factory" }
  ]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("project-updated", (data) => {
      setNotifications((prev) => [
        { id: Date.now(), title: "Project Status Updated", message: data.message, timestamp: "Just now", type: "project" },
        ...prev
      ]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Real-Time Notification Feed</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Live updates pushed via Socket.io across Sales, Factory, and Finance</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
            <div className="p-2 bg-[#FFFBF0] text-[#9E7B1D] rounded-xl border border-[#E8D49E]">
              <Bell size={16} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
