"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import {
  Download,
  FileText,
  AlertCircle,
  Clock,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Layers,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("analytics");

  const reports = [
    {
      id: "#CP-4029",
      category: "Stray Dog (Aggressive)",
      zone: "Northside District",
      worker: "Sarah O.",
      workerOrg: "(NGO)",
      workerInitials: "SO",
      status: "In Progress",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      id: "#CP-4028",
      category: "Injured Feline",
      zone: "Central Business District",
      worker: "Alex Rivera",
      workerOrg: "(Unit 402)",
      workerInitials: "AR",
      status: "Resolved",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      id: "#CP-4027",
      category: "Cattle Road Hazard",
      zone: "East Ring Road",
      worker: "Municipal Dispatch",
      workerOrg: "(Rapid 1)",
      workerInitials: "MD",
      status: "Assigned",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "#CP-4026",
      category: "Sterilization Request",
      zone: "Westside Colony",
      worker: "PawsCare NGO",
      workerOrg: "(Partner)",
      workerInitials: "PC",
      status: "Submitted",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  const filteredReports = reports.filter(
    (r) =>
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen flex bg-[#FAFBFD]">
        {/* Dark Sidebar matching Stitch */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
          {/* Header with Export Actions matching Stitch Image 3 */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Analytics Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Citywide Animal Welfare Metrics (Last 30 Days)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Exporting Citywide Welfare CSV dataset...")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => alert("Compiling Executive PDF Report...")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>
            </div>
          </div>

          {/* Top 3 Metric Cards matching Stitch Image 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Metric 1: Active Cases */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Cases
                </span>
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  342
                </h3>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-12% vs last month</span>
                </p>
              </div>
            </div>

            {/* Metric 2: Resolution Efficiency */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resolution Efficiency
                </span>
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  4.2<span className="text-lg font-bold text-slate-500">hrs</span>
                </h3>
                <p className="text-xs text-teal-700 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Improved by 45m</span>
                </p>
              </div>
            </div>

            {/* Metric 3: Community Reports */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Community Reports
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  1,208
                </h3>
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+5% vs last month</span>
                </p>
              </div>
            </div>
          </div>

          {/* Middle Row: Heatmap & Species Focus matching Stitch Image 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Incident Heatmap (8 columns) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  Incident Heatmap
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  Live Feed
                </span>
              </div>

              {/* Thermal Heatmap Mockup matching Stitch */}
              <div className="mt-4 relative rounded-xl overflow-hidden bg-slate-900 aspect-[16/9] border border-slate-800 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start z-10">
                  <div className="bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-700">
                    City Operations Dashboard | Thermal Geo-Index
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/80 text-white rounded text-[10px] font-bold">
                    Zone 7 Alert: Normal
                  </span>
                </div>

                {/* Heatmap Blobs Visual */}
                <div className="absolute inset-0 flex items-center justify-center opacity-85">
                  <div className="w-48 h-48 rounded-full bg-red-600/30 blur-2xl absolute -top-4 left-1/3 animate-pulse"></div>
                  <div className="w-36 h-36 rounded-full bg-amber-500/40 blur-xl absolute bottom-6 right-1/4"></div>
                  <div className="w-28 h-28 rounded-full bg-teal-400/20 blur-lg absolute top-10 right-1/3"></div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                </div>

                {/* Legend Pill matching Stitch Image 3 */}
                <div className="self-end z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-4 text-[10px] text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>High Density</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Medium Density</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Species Focus (4 columns) matching Stitch Image 3 */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                Species Focus
              </h3>

              <div className="space-y-4 pt-1">
                {/* Canine */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">Canine (Strays)</span>
                    <span className="text-slate-900 font-bold">45%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-700 rounded-full w-[45%]"></div>
                  </div>
                </div>

                {/* Feline */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">Feline (Feral Colonies)</span>
                    <span className="text-slate-900 font-bold">30%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[30%]"></div>
                  </div>
                </div>

                {/* Wildlife */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">Wildlife (Urban Encounters)</span>
                    <span className="text-slate-900 font-bold">15%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full w-[15%]"></div>
                  </div>
                </div>

                {/* Avian */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">Avian (Injured)</span>
                    <span className="text-slate-900 font-bold">10%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full w-[10%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Table: Recent Field Reports matching Stitch Image 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Recent Field Reports
              </h3>

              <div className="flex items-center gap-3">
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reports..."
                    className="block w-48 sm:w-64 pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <button
                  onClick={() => alert("Filter table options")}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
                  title="Filter options"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4">Assigned Worker</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-800">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {report.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {report.zone}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                            {report.workerInitials}
                          </span>
                          <span className="font-medium text-slate-800">
                            {report.worker} <span className="text-slate-400 font-normal">{report.workerOrg}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${report.statusColor}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Actions for ${report.id}`)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
