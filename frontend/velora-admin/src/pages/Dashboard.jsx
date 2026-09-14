import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  Factory,
  Truck,
  ArrowUpRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import erpApi from "../services/erpService";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    runningProjects: 0,
    completedProjects: 0,
    pendingPayments: 0,
    revenue: 0,
    monthlyRevenue: 0,
    conversionRate: "0%"
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentProduction, setRecentProduction] = useState([]);
  const [recentInstallations, setRecentInstallations] = useState([]);

  useEffect(() => {
    erpApi.getAnalytics().then((res) => {
      if (res?.data) setAnalytics(res.data);
      else if (res) setAnalytics((prev) => ({ ...prev, ...res }));
    }).catch(() => {});

    erpApi.getLeads({ limit: 5 }).then((res) => {
      if (res?.data) setRecentLeads(res.data);
    }).catch(() => {});

    erpApi.getProduction({ limit: 5 }).then((res) => {
      if (res?.data) setRecentProduction(res.data);
    }).catch(() => {});

    erpApi.getInstallations({ limit: 5 }).then((res) => {
      if (res?.data) setRecentInstallations(res.data);
    }).catch(() => {});
  }, []);

  const salesData = [
    { month: "Jan", revenue: 0, leads: 0 },
    { month: "Feb", revenue: 0, leads: 0 },
    { month: "Mar", revenue: 0, leads: 0 },
    { month: "Apr", revenue: 0, leads: 0 },
    { month: "May", revenue: 0, leads: 0 },
    { month: "Jun", revenue: analytics.revenue || 0, leads: analytics.totalLeads || 0 }
  ];

  const projectStageData = [
    { stage: "Consultation", count: 0 },
    { stage: "Design", count: 0 },
    { stage: "Estimate", count: 0 },
    { stage: "Production", count: 0 },
    { stage: "Installation", count: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Velora Executive Overview
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
              Live ERP Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time operations across Sales, Design Pipeline, Factory Production, and Financial Ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="text-slate-500 block font-semibold">Live System Status</span>
            <span className="font-extrabold text-emerald-600">Connected & Synced</span>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total CRM Leads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{analytics.totalLeads || 0}</p>
          <div className="flex items-center text-[11px] text-slate-500 font-medium">
            <span>Active database entries</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Running Projects</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{analytics.runningProjects || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium">{analytics.completedProjects || 0} Completed Handovers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Receivables</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">₹{(analytics.pendingPayments || 0).toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500 font-medium">Outstanding invoices</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">YTD Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">₹{(analytics.revenue || 0).toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Conversion Rate: {analytics.conversionRate || "0%"}</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Revenue & Lead Growth</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of gross revenue (₹)</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Current Financial Year
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Pipeline Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900">Active Project Stages</h3>
            <span className="text-xs text-slate-500 font-bold">{analytics.runningProjects || 0} Active</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStageData}>
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Follow-ups */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              Latest Inquiries
            </h4>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">{recentLeads.length} Available</span>
          </div>
          <div className="space-y-3 text-xs">
            {recentLeads.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No new inquiries yet</p>
            ) : (
              recentLeads.slice(0, 3).map((lead, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">{lead.name || lead.clientName || "Client"}</p>
                  <p className="text-slate-500">{lead.projectType || "Residential"} • {lead.siteLocation || lead.city || "Pune"}</p>
                  <span className="text-[10px] text-blue-600 font-bold">{lead.status || "Inquiry"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Factory Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Factory size={16} className="text-blue-600" />
              Factory Manufacturing Queue
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{recentProduction.length} Orders</span>
          </div>
          <div className="space-y-3 text-xs">
            {recentProduction.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No manufacturing orders in queue</p>
            ) : (
              recentProduction.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.projectName || item.productionCode}</span>
                    <span className="text-blue-600 font-bold">{item.status}</span>
                  </div>
                  <p className="text-slate-500">{item.factoryLocation || "Plant Floor"}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Installation Schedule */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              Site Installations
            </h4>
            <span className="text-xs text-slate-500 font-semibold">{recentInstallations.length} Active</span>
          </div>
          <div className="space-y-3 text-xs">
            {recentInstallations.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No active site installations scheduled</p>
            ) : (
              recentInstallations.slice(0, 3).map((inst, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">{inst.projectName || inst.installationCode}</p>
                  <p className="text-slate-500">{inst.assignedTeam || "Field Crew"} • {inst.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
