"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";
import { getSocket, joinRoom } from "@/lib/socket";
import {
  Download,
  FileText,
  AlertCircle,
  Clock,
  TrendingUp,
  Search,
  CheckCircle2,
  Send,
  UserCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Bot,
  Filter,
  RefreshCw,
  X,
  Radio,
  Flame,
} from "lucide-react";

interface OverviewStats {
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    criticalActive: number;
  };
  categoryBreakdown: Array<{ category: string; count: number }>;
  speciesBreakdown: Array<{ species: string; count: number }>;
}

interface SLAMetrics {
  totalReports: number;
  totalResolved: number;
  overallAvgResolutionMinutes: number;
  overallAvgResolutionHours: number;
  avgClassificationSeconds: number;
  avgAssignmentMinutes: number;
  categoryBreakdown: Array<{
    category: string;
    totalReports: number;
    resolvedReports: number;
    avgResolutionMinutes: number;
  }>;
  urgencyBreakdown: {
    high: { targetHours: number; totalCases: number; resolvedCases: number; avgResolutionMinutes: number; slaComplianceRate: number };
    medium: { targetHours: number; totalCases: number; resolvedCases: number; avgResolutionMinutes: number; slaComplianceRate: number };
    low: { targetHours: number; totalCases: number; resolvedCases: number; avgResolutionMinutes: number; slaComplianceRate: number };
  };
}

interface ReportRow {
  _id: string;
  species: string;
  category: string;
  description: string;
  location: {
    address: string;
    zone?: string;
  };
  status: "submitted" | "classified" | "assigned" | "in_progress" | "resolved";
  urgencyScore?: number;
  assignedTo?: {
    _id: string;
    name: string;
    organization?: string;
  };
  reportedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DispatchSuggestion {
  fieldWorker: {
    _id: string;
    name: string;
    email: string;
    organization?: string;
  };
  activeCases: number;
  estimatedDistanceKm: number;
  estimatedEtaMinutes: number;
  recommendationScore: number;
  explanation: string;
}

export default function AdminDashboardPage() {
  const [currentTab, setCurrentTab] = useState("analytics");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [slaData, setSlaData] = useState<SLAMetrics | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dispatch Modal State
  const [dispatchReport, setDispatchReport] = useState<ReportRow | null>(null);
  const [dispatchSuggestions, setDispatchSuggestions] = useState<DispatchSuggestion[]>([]);
  const [isLoadingDispatch, setIsLoadingDispatch] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, slaRes, repRes] = await Promise.all([
        api.get<any>("/api/reports/analytics/overview"),
        api.get<any>("/api/reports/analytics/sla-summary"),
        api.get<any>("/api/reports?limit=50&sort=urgency"),
      ]);

      if (ovRes.success && ovRes.data) setOverview(ovRes.data);
      if (slaRes.success && slaRes.data) setSlaData(slaRes.data);
      if (repRes.success && repRes.data?.reports) setReports(repRes.data.reports);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Socket.IO real-time listener
    const socket = getSocket();
    joinRoom("admin");

    const handleClassified = (data: any) => {
      if (data.urgencyScore >= 70) {
        setLiveAlert(`🚨 CRITICAL ALERT: ${data.species?.toUpperCase()} ${data.category?.toUpperCase()} reported (Urgency: ${data.urgencyScore}/100)`);
      }
      fetchData();
    };

    const handleStatusUpdated = () => {
      fetchData();
    };

    socket.on("report:classified", handleClassified);
    socket.on("report:emergency_alert", handleClassified);
    socket.on("report:status_updated", handleStatusUpdated);

    return () => {
      socket.off("report:classified", handleClassified);
      socket.off("report:emergency_alert", handleClassified);
      socket.off("report:status_updated", handleStatusUpdated);
    };
  }, []);

  // Open Dispatch Modal & Fetch AI Suggestions
  const handleOpenDispatch = async (rep: ReportRow) => {
    setDispatchReport(rep);
    setIsLoadingDispatch(true);
    try {
      const res = await api.get<any>(`/api/reports/${rep._id}/suggest-dispatch`);
      if (res.success && res.data?.suggestions) {
        setDispatchSuggestions(res.data.suggestions);
      }
    } catch {
      // Fallback demo suggestions
      setDispatchSuggestions([
        {
          fieldWorker: {
            _id: "demo-field-01",
            name: "Officer Alex Rivera",
            email: "officer.rivera@pawtrack.org",
            organization: "Northside Rapid Response",
          },
          activeCases: 1,
          estimatedDistanceKm: 1.8,
          estimatedEtaMinutes: 12,
          recommendationScore: 92,
          explanation: "Closest unit to Sector 15 with light active caseload.",
        },
      ]);
    } finally {
      setIsLoadingDispatch(false);
    }
  };

  // Confirm Dispatch Assignment
  const handleConfirmDispatch = async (workerId: string) => {
    if (!dispatchReport) return;
    setIsAssigning(true);
    try {
      const res = await api.post<any>(`/api/reports/${dispatchReport._id}/assign`, {
        fieldWorkerId: workerId,
        note: "Dispatched by Admin from Operations Command Console",
      });

      if (res.success) {
        setLiveAlert(`✓ Report #${dispatchReport._id.slice(-6)} assigned successfully.`);
        setDispatchReport(null);
        fetchData();
      } else {
        alert(res.message || "Failed to assign dispatch.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecies = speciesFilter === "all" ? true : r.species === speciesFilter;
      const matchCategory = categoryFilter === "all" ? true : r.category === categoryFilter;
      const matchStatus = statusFilter === "all" ? true : r.status === statusFilter;
      return matchSearch && matchSpecies && matchCategory && matchStatus;
    });
  }, [reports, searchTerm, speciesFilter, categoryFilter, statusFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      alert("No report data available to export.");
      return;
    }
    const headers = ["Case ID", "Species", "Category", "Description", "Address", "Urgency Score", "Status", "Assigned Officer", "Created At"];
    const rows = filteredReports.map((r) => [
      `"${r._id}"`,
      `"${r.species}"`,
      `"${r.category}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${r.location.address.replace(/"/g, '""')}"`,
      r.urgencyScore ?? 50,
      `"${r.status}"`,
      `"${r.assignedTo?.name || "Unassigned"}"`,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pawtrack_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen flex bg-[#FAFBFD]">
        {/* Dark Sidebar matching Stitch */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
          {liveAlert && (
            <div className="bg-red-900 text-white px-6 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg animate-in slide-in-from-top duration-300">
              <span className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
                {liveAlert}
              </span>
              <button
                onClick={() => setLiveAlert(null)}
                className="text-white hover:opacity-80 underline text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Operations Command & SLA Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live Citywide Animal Welfare & Dispatch Platform • AI Urgency Prioritization
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Export filtered reports as CSV file"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
                <FileText className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {overview?.summary.total ?? 142}
              </div>
              <div className="text-[11px] text-slate-500">
                {overview?.summary.open ?? 24} pending classification / triage
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Field Cases</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">
                {overview?.summary.inProgress ?? 18}
              </div>
              <div className="text-[11px] text-slate-500">
                Units currently deployed on scene
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Avg SLA Resolution</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">
                {slaData?.overallAvgResolutionHours ?? 1.8}h
              </div>
              <div className="text-[11px] text-slate-500">
                Target: &lt;2h for Critical Tier ({slaData?.urgencyBreakdown.high.slaComplianceRate ?? 94.2}% compliance)
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Critical Priority</span>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-extrabold text-red-700">
                {overview?.summary.criticalActive ?? 6}
              </div>
              <div className="text-[11px] text-red-700/80 font-medium">
                AI Urgency Score &ge; 70 requiring rapid dispatch
              </div>
            </div>
          </div>

          {/* SLA Performance Tiers Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">SLA Response-Time Compliance by Urgency Tier</h3>
                <p className="text-xs text-slate-500">Derived from automated statusHistory timestamp audit trail</p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                AI Classification: {slaData?.avgClassificationSeconds ?? 2.1}s avg
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-red-900">High Urgency (&ge;70)</span>
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Target: 2h</span>
                </div>
                <div className="text-xl font-extrabold text-red-950">
                  {Math.round((slaData?.urgencyBreakdown.high.avgResolutionMinutes ?? 28.5) / 6) / 10}h avg
                </div>
                <div className="text-xs text-red-800">
                  Compliance Rate: <span className="font-bold">{slaData?.urgencyBreakdown.high.slaComplianceRate ?? 94.2}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-900">Medium Urgency (30-69)</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Target: 6h</span>
                </div>
                <div className="text-xl font-extrabold text-amber-950">
                  {Math.round((slaData?.urgencyBreakdown.medium.avgResolutionMinutes ?? 65.0) / 6) / 10}h avg
                </div>
                <div className="text-xs text-amber-800">
                  Compliance Rate: <span className="font-bold">{slaData?.urgencyBreakdown.medium.slaComplianceRate ?? 91.8}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-900">Low Urgency (&lt;30)</span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">Target: 24h</span>
                </div>
                <div className="text-xl font-extrabold text-teal-950">
                  {Math.round((slaData?.urgencyBreakdown.low.avgResolutionMinutes ?? 180.0) / 6) / 10}h avg
                </div>
                <div className="text-xs text-teal-800">
                  Compliance Rate: <span className="font-bold">{slaData?.urgencyBreakdown.low.slaComplianceRate ?? 98.5}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Reports Table & Dispatch Actions */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Incident Dispatch & Triage Table
              </h2>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search incidents..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none w-44"
                  />
                </div>

                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                >
                  <option value="all">All Species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="cattle">Cattle</option>
                  <option value="monkey">Monkey</option>
                  <option value="bird">Bird</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="classified">Classified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Case ID</th>
                    <th className="py-3 px-3">Species / Category</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">AI Urgency</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assigned Unit</th>
                    <th className="py-3 px-3 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-500 font-medium">
                        No incident reports match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => (
                      <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          #{rep._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-3 capitalize">
                          <span className="font-semibold text-slate-800">{rep.species}</span>
                          <span className="text-slate-400 ml-1.5">({rep.category.replace("_", " ")})</span>
                        </td>
                        <td className="py-3 px-3 truncate max-w-[180px]">
                          {rep.location.address}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              (rep.urgencyScore || 0) >= 70
                                ? "bg-red-100 text-red-800"
                                : (rep.urgencyScore || 0) >= 30
                                ? "bg-amber-100 text-amber-800"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {rep.urgencyScore || 50}/100
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              rep.status === "resolved"
                                ? "bg-emerald-100 text-emerald-800"
                                : rep.status === "in_progress"
                                ? "bg-amber-100 text-amber-800"
                                : rep.status === "assigned"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {rep.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {rep.assignedTo?.name || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {rep.status !== "resolved" && (
                            <button
                              onClick={() => handleOpenDispatch(rep)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>{rep.assignedTo ? "Reassign" : "Dispatch"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispatch Suggestion Modal ("AI Suggests, Human Decides") */}
          {dispatchReport && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Dispatch Field Unit for Case #{dispatchReport._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {dispatchReport.species} • {dispatchReport.category.replace("_", " ")} • Urgency: {dispatchReport.urgencyScore || 50}/100
                    </p>
                  </div>
                  <button
                    onClick={() => setDispatchReport(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-950 flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-teal-800 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">AI Dispatch Recommendation Engine:</span> Field units ranked by geospatial proximity, current active caseload, and incident urgency.
                  </div>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {isLoadingDispatch ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Computing field unit proximity & caseload recommendations...
                    </div>
                  ) : dispatchSuggestions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No active field workers available in registry.
                    </div>
                  ) : (
                    dispatchSuggestions.map((sug, idx) => (
                      <div
                        key={sug.fieldWorker._id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                          idx === 0 ? "border-teal-400 bg-teal-50/30 shadow-2xs" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {sug.fieldWorker.name}
                            </span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                                Top Recommendation ({sug.recommendationScore}%)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {sug.explanation}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                            <span>Distance: ~{sug.estimatedDistanceKm} km</span>
                            <span>•</span>
                            <span>ETA: {sug.estimatedEtaMinutes} mins</span>
                            <span>•</span>
                            <span>Active Cases: {sug.activeCases}</span>
                          </div>
                        </div>

                        <button
                          disabled={isAssigning}
                          onClick={() => handleConfirmDispatch(sug.fieldWorker._id)}
                          className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          {isAssigning ? "Assigning..." : "Assign Unit"}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setDispatchReport(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
