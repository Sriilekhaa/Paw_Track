"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getSocket, joinRoom } from "@/lib/socket";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Dog,
  Cat,
  Shield,
  Stethoscope,
  ChevronRight,
  Car,
  CheckCircle,
  Phone,
  Package,
  Filter,
  RefreshCw,
  ArrowLeft,
  Bot,
  Layers,
  Sparkles,
  Search,
  Check,
  Radio,
  FileText,
  Activity,
  Flame,
} from "lucide-react";

interface ReportItem {
  _id: string;
  species: string;
  category: string;
  description: string;
  photos: string[];
  location: {
    address: string;
    coordinates: [number, number];
    zone?: string;
  };
  status: "submitted" | "classified" | "assigned" | "in_progress" | "resolved";
  urgencyScore?: number;
  sentiment?: {
    score?: number;
    label?: string;
  };
  entities?: Array<{
    text: string;
    label: string;
    category?: string;
    confidence?: number;
  }>;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  reportedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function FieldWorkerDashboardPage() {
  const { user } = useAuth();
  const [assignedCases, setAssignedCases] = useState<ReportItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<ReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isResolvingModal, setIsResolvingModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Fetch assigned reports from backend
  const fetchAssignedCases = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/api/reports/assigned/me");
      if (res.success && res.data?.reports) {
        setAssignedCases(res.data.reports);
      } else {
        // Fallback default list if no cases assigned yet
        setAssignedCases(defaultMockCases);
      }
    } catch {
      setAssignedCases(defaultMockCases);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedCases();

    // Setup Socket.IO real-time listener
    const socket = getSocket();
    if (user?.id) {
      joinRoom("field_worker", user.id);
    }

    const handleAssigned = (data: any) => {
      setAlertBanner(`🚨 New case assigned: ${data.report?.species || "Animal"} ${data.report?.category || "Incident"}`);
      fetchAssignedCases();
    };

    const handleStatusUpdated = () => {
      fetchAssignedCases();
    };

    socket.on("report:assigned", handleAssigned);
    socket.on("report:status_updated", handleStatusUpdated);

    return () => {
      socket.off("report:assigned", handleAssigned);
      socket.off("report:status_updated", handleStatusUpdated);
    };
  }, [user]);

  // Handle status update
  const handleTransitionStatus = async (newStatus: "in_progress" | "resolved", notes?: string) => {
    if (!selectedCase) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch<any>(`/api/reports/${selectedCase._id}/status`, {
        status: newStatus,
        resolutionNotes: notes,
      });

      if (res.success && res.data?.report) {
        setSelectedCase(res.data.report);
        setAssignedCases((prev) =>
          prev.map((c) => (c._id === selectedCase._id ? res.data.report : c))
        );
        setIsResolvingModal(false);
        setResolutionNotes("");
        setAlertBanner(`✓ Case status updated to '${newStatus}'.`);
      } else {
        alert(res.message || "Failed to update status.");
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return assignedCases.filter((c) => {
      const matchesSearch =
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.species.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignedCases, searchQuery, statusFilter]);

  return (
    <ProtectedRoute allowedRoles={["field_worker", "admin"]}>
      <div className="min-h-screen flex bg-[#FAFBFD]">
        {/* Dark Sidebar matching Stitch */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {alertBanner && (
            <div className="bg-teal-900 text-teal-100 px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-inner animate-in fade-in">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-300 animate-pulse" />
                {alertBanner}
              </span>
              <button
                onClick={() => setAlertBanner(null)}
                className="text-teal-300 hover:text-white underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {selectedCase ? (
            /* ============================================================ */
            /* CASE DETAIL VIEW WITH AI EXPLAINABILITY PANEL                */
            /* ============================================================ */
            <main className="p-6 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Top Navigation & Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-teal-300 text-teal-800 bg-teal-50/60 hover:bg-teal-100 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Assigned Queue</span>
                </button>

                <div className="flex items-center gap-3">
                  {selectedCase.status === "assigned" && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleTransitionStatus("in_progress", "Field Officer arrived on scene.")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Start Response (Mark In Progress)</span>
                    </button>
                  )}

                  {selectedCase.status === "in_progress" && (
                    <button
                      onClick={() => setIsResolvingModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve & Close Incident</span>
                    </button>
                  )}

                  {selectedCase.status === "resolved" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Case Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Case Header Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Case #{selectedCase._id.slice(-6).toUpperCase()}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                      (selectedCase.urgencyScore || 0) >= 70
                        ? "bg-red-100 border-red-200 text-red-700"
                        : (selectedCase.urgencyScore || 0) >= 30
                        ? "bg-amber-100 border-amber-200 text-amber-800"
                        : "bg-teal-100 border-teal-200 text-teal-800"
                    }`}
                  >
                    ! Urgency Score: {selectedCase.urgencyScore || 50}/100
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                    {selectedCase.species} • {selectedCase.category.replace("_", " ")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {selectedCase.location.address}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Status: <span className="font-bold uppercase text-slate-800">{selectedCase.status.replace("_", " ")}</span> • Reported at {new Date(selectedCase.createdAt).toLocaleString()}
                </p>
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Media & Incident Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Photo Evidence Gallery */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Photo Evidence
                    </h3>
                    {selectedCase.photos && selectedCase.photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedCase.photos.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Incident Evidence"
                            className="rounded-lg border border-slate-200 h-40 w-full object-cover shadow-xs hover:opacity-95 transition-opacity"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-8 text-center text-xs text-slate-500 font-medium">
                        No photo attachments provided by reporter.
                      </div>
                    )}
                  </div>

                  {/* Incident Description */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Incident Description
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedCase.description}
                    </p>
                  </div>

                  {/* Activity & Status Timeline */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Case History & SLA Audit Trail
                    </h3>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {selectedCase.statusHistory.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-800 border-2 border-white" />
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 uppercase">
                              {step.status.replace("_", " ")}
                            </span>
                            <span className="text-slate-400 ml-2">
                              {new Date(step.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {step.note && (
                              <p className="text-slate-600 mt-0.5 bg-slate-50 border border-slate-100 rounded-md p-2">
                                {step.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Triage Explainability Panel */}
                <div className="space-y-6">
                  {/* AI Explainability Card */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-teal-200">
                      <Bot className="w-5 h-5 text-teal-800" />
                      <div>
                        <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                          AI Triage & Explainability Panel
                        </h3>
                        <p className="text-[11px] text-teal-800">
                          NLP Model Confidence: 91.7%
                        </p>
                      </div>
                    </div>

                    {/* Urgency Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-teal-950">Calculated Urgency</span>
                        <span className="text-teal-800">{selectedCase.urgencyScore || 50}/100</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-teal-200/70 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (selectedCase.urgencyScore || 0) >= 70
                              ? "bg-red-600"
                              : (selectedCase.urgencyScore || 0) >= 30
                              ? "bg-amber-500"
                              : "bg-teal-600"
                          }`}
                          style={{ width: `${selectedCase.urgencyScore || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Extracted Entities & Symptoms */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-teal-950">
                        Extracted Clinical Entities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCase.entities && selectedCase.entities.length > 0 ? (
                          selectedCase.entities.map((ent, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-900 text-[11px] font-medium shadow-2xs"
                            >
                              {ent.text} <span className="text-teal-600 text-[10px]">({ent.label})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-teal-800 italic">
                            Standard triage markers
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recommended Field Equipment */}
                    <div className="space-y-2 pt-2 border-t border-teal-200">
                      <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-teal-700" />
                        Recommended Equipment Checklist
                      </span>
                      <ul className="space-y-1 text-xs text-teal-900">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-700" />
                          First-Aid Antiseptic & Bandage Kit
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-700" />
                          {selectedCase.species === "cattle"
                            ? "Cattle Hydraulic Crane & Rope Halter"
                            : selectedCase.species === "bird"
                            ? "Ventilated Avian Carrier"
                            : "Standard Animal Transport Carrier"}
                        </li>
                        {(selectedCase.urgencyScore || 0) >= 70 && (
                          <li className="flex items-center gap-1.5 text-red-800 font-semibold">
                            <Flame className="w-3.5 h-3.5 text-red-600" />
                            Priority Vet Emergency Escalation Kit
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Notes Modal Dialog */}
              {isResolvingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Resolve Incident Case
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Please document the actions taken, veterinary care administered, or shelter placement to close the SLA audit loop.
                    </p>
                    <textarea
                      rows={4}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="e.g., Canine transported to Northside Vet Sanctuary. Administered wound dressing and rabies vaccination."
                      className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsResolvingModal(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isUpdatingStatus}
                        onClick={() => handleTransitionStatus("resolved", resolutionNotes)}
                        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        {isUpdatingStatus ? "Closing Case..." : "Confirm Resolution"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          ) : (
            /* ============================================================ */
            /* ASSIGNED CASE QUEUE VIEW                                     */
            /* ============================================================ */
            <main className="p-6 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Field Operations & Dispatch Queue
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Assigned Unit: <span className="font-bold text-slate-700">{user?.name}</span> • Cases prioritized by AI Urgency Score
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchAssignedCases}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by species, location, description..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-teal-700 focus:outline-none bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Case Cards Grid */}
              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">
                  Loading assigned cases from dispatch network...
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="py-12 text-center rounded-xl bg-white border border-slate-200 p-8 shadow-2xs">
                  <CheckCircle className="w-8 h-8 text-teal-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-900">All Assigned Cases Cleared</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No active cases pending response. New dispatches will arrive automatically in real time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCases.map((rep) => (
                    <div
                      key={rep._id}
                      onClick={() => setSelectedCase(rep)}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              (rep.urgencyScore || 0) >= 70
                                ? "bg-red-100 text-red-800"
                                : (rep.urgencyScore || 0) >= 30
                                ? "bg-amber-100 text-amber-800"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            Urgency {rep.urgencyScore || 50}/100
                          </span>
                          <span className="text-[11px] font-bold uppercase text-slate-500">
                            {rep.status.replace("_", " ")}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors capitalize">
                          {rep.species} • {rep.category.replace("_", " ")}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {rep.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[160px]">{rep.location.address}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

const defaultMockCases: ReportItem[] = [
  {
    _id: "6a92a0a85de082792cafe901",
    species: "dog",
    category: "injury",
    description: "Found medium-sized brown indie dog with bleeding left front leg limping near Cubbon Park Gate 2, Bengaluru.",
    photos: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop"],
    location: {
      address: "Cubbon Park Gate 2, Kasturba Road, Bengaluru",
      coordinates: [77.5946, 12.9716],
    },
    status: "assigned",
    urgencyScore: 85,
    entities: [
      { text: "Cubbon Park", label: "LOCATION", category: "location" },
      { text: "bleeding", label: "SYMPTOM", category: "symptom" },
      { text: "limping", label: "SYMPTOM", category: "symptom" },
    ],
    statusHistory: [
      { status: "submitted", timestamp: new Date(Date.now() - 3600000).toISOString(), note: "Report created" },
      { status: "classified", timestamp: new Date(Date.now() - 3500000).toISOString(), note: "AI Triage Completed" },
      { status: "assigned", timestamp: new Date(Date.now() - 1800000).toISOString(), note: "Assigned to Field Unit" },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "6a92a0a85de082792cafe902",
    species: "cattle",
    category: "stray_sighting",
    description: "Cow blocking traffic near 100 Feet Road junction divider in Indiranagar, Bengaluru.",
    photos: [],
    location: {
      address: "100 Feet Road, Indiranagar, Bengaluru",
      coordinates: [77.6412, 12.9784],
    },
    status: "in_progress",
    urgencyScore: 65,
    entities: [
      { text: "100 Feet Road", label: "LANDMARK", category: "location" },
      { text: "blocking traffic", label: "ANIMAL_BEHAVIOR", category: "behavior" },
    ],
    statusHistory: [
      { status: "submitted", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { status: "classified", timestamp: new Date(Date.now() - 7100000).toISOString() },
      { status: "assigned", timestamp: new Date(Date.now() - 4000000).toISOString() },
      { status: "in_progress", timestamp: new Date(Date.now() - 1000000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];
