import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Bell } from "lucide-react";

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:3000";
    const socket = io(socketUrl);
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
        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-medium text-xs">
            No new notifications in feed
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
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
          ))
        )}
      </div>
    </div>
  );
}
