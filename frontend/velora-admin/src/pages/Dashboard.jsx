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
    totalLeads: 142,
    runningProjects: 24,
    completedProjects: 58,
    pendingPayments: 2450000,
    revenue: 16800000,
    monthlyRevenue: 4200000,
    conversionRate: "74.2%"
  });

  useEffect(() => {
    erpApi.getAnalytics().then((res) => {
      if (res) setAnalytics(res);
    });
  }, []);

  const salesData = [
    { month: "Jan", revenue: 2400000, leads: 28 },
    { month: "Feb", revenue: 3100000, leads: 34 },
    { month: "Mar", revenue: 2900000, leads: 30 },
    { month: "Apr", revenue: 4200000, leads: 45 },
    { month: "May", revenue: 3800000, leads: 40 },
    { month: "Jun", revenue: 5100000, leads: 52 }
  ];

  const projectStageData = [
    { stage: "Consultation", count: 8 },
    { stage: "Design", count: 12 },
    { stage: "Estimate", count: 6 },
    { stage: "Production", count: 9 },
    { stage: "Installation", count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Velora Executive Overview
            <span className="text-xs bg-[#FFFBF0] text-[#9E7B1D] px-3 py-1 rounded-full border border-[#E8D49E] font-bold">
              Live ERP Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time operations across Sales, Design Pipeline, Factory Production, and Financial Ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="text-slate-500 block font-semibold">Monthly Revenue Target</span>
            <span className="font-extrabold text-[#9E7B1D]">₹5,00,00,000 (84% Achieved)</span>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total CRM Leads</span>
            <div className="p-2 bg-[#FFFBF0] text-[#9E7B1D] rounded-xl border border-[#E8D49E]">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{analytics.totalLeads}</p>
          <div className="flex items-center text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight size={14} /> <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Running Projects</span>
            <div className="p-2 bg-[#FFFBF0] text-[#9E7B1D] rounded-xl border border-[#E8D49E]">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{analytics.runningProjects}</p>
          <p className="text-[11px] text-slate-500 font-medium">{analytics.completedProjects} Completed Handovers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Receivables</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">₹{analytics.pendingPayments.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500 font-medium">8 Milestone Invoices</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">YTD Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#9E7B1D] tracking-tight">₹{analytics.revenue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Conversion Rate: {analytics.conversionRate}</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Revenue & Lead Growth</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of gross revenue (₹)</p>
            </div>
            <span className="text-xs font-bold text-[#9E7B1D] bg-[#FFFBF0] px-3 py-1 rounded-lg border border-[#E8D49E]">
              2026 Financial Year
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#B38E2D" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Pipeline Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900">Active Project Stages</h3>
            <span className="text-xs text-slate-500 font-bold">40 Active</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStageData}>
                <XAxis dataKey="stage" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#C5A059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Follow-ups */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-[#9E7B1D]" />
              Today's Follow-ups
            </h4>
            <span className="text-xs text-amber-700 font-bold">3 Scheduled</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-800">Dr. Ananya Kulkarni (4BHK Villa)</p>
              <p className="text-slate-500">Discussion on Cost Estimate & Marble selection</p>
              <span className="text-[10px] text-[#9E7B1D] font-bold">11:30 AM • Sales Team</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-800">Mr. Vikramaditya Rao (Penthouse)</p>
              <p className="text-slate-500">Final Design Sign-off & Advance Receipt</p>
              <span className="text-[10px] text-[#9E7B1D] font-bold">03:00 PM • Senior Designer</span>
            </div>
          </div>
        </div>

        {/* Factory Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Factory size={16} className="text-[#9E7B1D]" />
              Factory Manufacturing Queue
            </h4>
            <span className="text-xs text-slate-500 font-semibold">Plant Chakan</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>The Crest Villa - Kitchen</span>
                <span className="text-amber-700 font-bold">Polishing</span>
              </div>
              <p className="text-slate-500">Est. Dispatch: Aug 08, 2026</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Solitaire Heights - Wardrobes</span>
                <span className="text-emerald-700 font-bold">Assembly</span>
              </div>
              <p className="text-slate-500">Est. Dispatch: Aug 10, 2026</p>
            </div>
          </div>
        </div>

        {/* Installation Schedule */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck size={16} className="text-[#9E7B1D]" />
              Site Installations
            </h4>
            <span className="text-xs text-slate-500 font-semibold">Active Crew</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-800">Koregaon Park Estate - False Ceiling</p>
              <p className="text-slate-500">Team Alpha • Progress: 80%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-800">Baler Royal Towers - Joinery Fitment</p>
              <p className="text-slate-500">Team Beta • Progress: 45%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
