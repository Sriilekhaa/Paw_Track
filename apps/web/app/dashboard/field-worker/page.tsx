"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
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
  Edit3,
  Bot,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
} from "lucide-react";

export default function FieldWorkerDashboardPage() {
  const [activeStep, setActiveStep] = useState<"in-transit" | "on-site" | "resolve">("in-transit");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  return (
    <ProtectedRoute allowedRoles={["field_worker", "admin"]}>
      <div className="min-h-screen flex bg-[#FAFBFD]">
        {/* Dark Sidebar matching Stitch */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {selectedCaseId ? (
            /* ============================================================ */
            /* CASE DETAIL VIEW MATCHING STITCH IMAGE 5                     */
            /* ============================================================ */
            <main className="p-6 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Top Navigation & Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-teal-300 text-teal-800 bg-teal-50/60 hover:bg-teal-100 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Queue</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert("Edit Incident Details modal opened")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      alert("Case marked as Resolved and synchronized to central database.");
                      setSelectedCaseId(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolve Case</span>
                  </button>
                </div>
              </div>

              {/* Case Header Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Case #{selectedCaseId}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold">
                    ! High Priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                    <Dog className="w-3.5 h-3.5 text-slate-500" />
                    Dog (Suspected Stray)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Northside Park
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Reported Today at 14:32 • 45 mins ago
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Evidence & Timeline */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Submitted Evidence Card matching Stitch Image 5 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                      Submitted Evidence
                    </h3>

                    {/* Image with Computer Vision bounding box mockup */}
                    <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video group">
                      <img
                        src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80"
                        alt="Submitted evidence"
                        className="w-full h-full object-cover opacity-90"
                      />
                      
                      {/* Bounding Box Visual Overlay */}
                      <div className="absolute top-1/4 left-1/3 w-48 h-48 border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start">
                        <span className="bg-teal-500 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider self-start rounded-br">
                          SUBJECT: CANINE (94%)
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-lg text-[10px] space-y-0.5 border border-white/10">
                        <p className="font-bold">Case #{selectedCaseId} | AI Analysis & Details</p>
                        <p className="text-slate-300">Central Park, Sector 7 • 11:48 AM</p>
                      </div>
                    </div>

                    {/* Reporter Description Quote */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs italic leading-relaxed">
                      &ldquo;Found this dog wandering near the north entrance of the park. Looks like it might have a slight limp. No collar visible. Seemed scared when I tried to approach.&rdquo;
                    </div>
                  </div>

                  {/* Update History Timeline */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight pb-4 border-b border-slate-100">
                      Update History
                    </h3>

                    <div className="mt-4 space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      <div className="flex items-start gap-4 relative">
                        <div className="w-5 h-5 rounded-full bg-teal-600 border-2 border-white shadow-xs shrink-0 mt-0.5 flex items-center justify-center text-white text-[9px] font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            14:45 — Automated AI Triage
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Priority elevated to High due to identified limp / mobility impairment cues.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-5 h-5 rounded-full bg-slate-400 border-2 border-white shadow-xs shrink-0 mt-0.5"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            14:32 — Citizen Reporter
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Initial incident report created via CivicPaws mobile portal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Insights & Details */}
                <div className="lg:col-span-4 space-y-6">
                  {/* AI Insights Card matching Stitch Image 5 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                        AI Insights
                      </h3>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Classification
                          </p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">
                            Stray Dog
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                          94% Conf.
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                            Urgency Signals
                          </p>
                          <p className="text-xs font-bold text-red-900 mt-0.5">
                            Possible Injury
                          </p>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                            Potential Duplicate
                          </span>
                          <span className="text-[10px] font-mono text-amber-700">
                            Score 0.88
                          </span>
                        </div>
                        <p className="text-xs text-amber-900">
                          Similar report logged 2 hrs ago in this sector.
                        </p>
                        <button
                          onClick={() => alert("Cross-referencing Match #REP-8930...")}
                          className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 mt-1"
                        >
                          Review Match (#REP-8930) <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Location Preview Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight pb-2">
                      Location Data
                    </h3>
                    <div className="relative h-28 rounded-xl overflow-hidden bg-[#E8EEF3] border border-slate-200 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-2.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      Northside Park, Sector 4
                    </p>
                  </div>

                  {/* Reporter Contact */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                      Reporter Details
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                          JS
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Jane Smith</p>
                          <p className="text-[11px] text-slate-500">555-019-3829</p>
                        </div>
                      </div>
                      <a
                        href="tel:5550193829"
                        className="p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          ) : (
            /* ============================================================ */
            /* FIELD WORKER MAIN QUEUE DASHBOARD MATCHING STITCH IMAGE 4    */
            /* ============================================================ */
            <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
              {/* Header with Live Sync Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Field Operations Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage active assignments and route priorities.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/80 border border-slate-300 text-xs font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Syncing Live Data</span>
                  </div>
                  <button
                    onClick={() => alert("Filter queue options")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Assigned Queue Cards matching Stitch Image 4 */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Assigned Queue
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      4 Active
                    </span>
                  </div>

                  {/* Case 1: High Urgency Stray Canine */}
                  <div className="bg-white border-2 border-red-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> HIGH
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Case #892-A
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> 15m ago
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">
                      Stray Canine - Aggressive Behavior
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      Northside Park, near West Entrance
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          <Dog className="w-3.5 h-3.5 text-slate-500" /> Dog
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          <Shield className="w-3.5 h-3.5 text-slate-500" /> Public Safety
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedCaseId("REP-8942")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors"
                      >
                        <span>Action</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Case 2: Med Urgency Injured Feline */}
                  <div className="bg-white border-2 border-amber-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                          ! MED
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Case #889-B
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> 1h 20m ago
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">
                      Injured Feline in Alleyway
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      4200 Block, Maple St. Alley
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          <Cat className="w-3.5 h-3.5 text-slate-500" /> Cat
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-500" /> Medical
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedCaseId("REP-889B")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors"
                      >
                        <span>Action</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Map & Active Case Control Widget */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Optimal Route Map Preview matching Stitch */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#E8EEF3] aspect-[16/10] shadow-sm">
                    {/* SVG Map Lines */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="bg-white/90 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs">
                          Metro Center Sector Route
                        </span>
                        <div className="flex flex-col gap-1">
                          <button className="w-7 h-7 bg-white rounded-md text-slate-700 text-xs font-bold shadow-xs flex items-center justify-center">
                            +
                          </button>
                          <button className="w-7 h-7 bg-white rounded-md text-slate-700 text-xs font-bold shadow-xs flex items-center justify-center">
                            -
                          </button>
                        </div>
                      </div>

                      {/* Route Waypoint Marker Visual */}
                      <div className="relative h-28 my-auto">
                        <svg className="w-full h-full" viewBox="0 0 400 150">
                          <path
                            d="M 50 120 L 150 40 L 280 90 L 350 30"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="3"
                            strokeDasharray="6,4"
                          />
                          <circle cx="50" cy="120" r="6" fill="#0f766e" />
                          <circle cx="150" cy="40" r="6" fill="#c2410c" />
                          <circle cx="280" cy="90" r="6" fill="#0284c7" />
                          <circle cx="350" cy="30" r="6" fill="#e11d48" />
                        </svg>
                      </div>

                      <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-900 flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-teal-700" />
                          Optimal Route Active
                        </span>
                        <span className="text-slate-500 font-semibold">
                          Est. 45m remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Case Control Card matching Stitch Image 4 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-teal-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Active Case Control
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-white text-[11px] font-bold">
                        Case #892-A
                      </span>
                    </div>

                    {/* Step Tabs: In-Transit, On-Site, Resolve */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep("in-transit")}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border ${
                          activeStep === "in-transit"
                            ? "bg-teal-50 border-2 border-teal-700 text-teal-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Car className="w-4 h-4" />
                        <span>In-Transit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStep("on-site")}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border ${
                          activeStep === "on-site"
                            ? "bg-teal-50 border-2 border-teal-700 text-teal-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        <span>On-Site</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStep("resolve")}
                        className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all border ${
                          activeStep === "resolve"
                            ? "bg-teal-50 border-2 border-teal-700 text-teal-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                    </div>

                    {/* Context Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Reporter Details
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-teal-700" /> 555-0198 (Jane D.)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Required Equipment
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Package className="w-3.5 h-3.5 text-teal-700" /> Catch Pole, Crate L
                        </span>
                      </div>
                    </div>

                    {/* Buttons matching Stitch */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => alert("Note editor opened")}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Update Notes
                      </button>
                      <button
                        onClick={() => alert("Backup requested for Sector 4 unit.")}
                        className="flex-1 py-2.5 px-4 rounded-lg border border-teal-800 text-teal-900 hover:bg-teal-50 text-xs font-bold transition-all"
                      >
                        Request Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
