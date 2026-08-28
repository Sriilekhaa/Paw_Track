"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  Lightbulb,
  Dog,
  Cat,
  Footprints,
  Bug,
  Bird,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Map as MapIcon,
  Search,
  Check,
} from "lucide-react";

export default function CitizenDashboardPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<string>("dog");
  const [address, setAddress] = useState<string>("Northside Park, Sector 4");
  const [description, setDescription] = useState<string>("");
  const [submittedAlert, setSubmittedAlert] = useState<boolean>(false);

  const speciesOptions = [
    { id: "dog", label: "Dogs", icon: Dog },
    { id: "cat", label: "Cats", icon: Cat },
    { id: "cattle", label: "Cattle", icon: Footprints },
    { id: "monkey", label: "Monkeys", icon: Bug },
    { id: "bird", label: "Birds", icon: Bird },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 5000);
  };

  return (
    <ProtectedRoute allowedRoles={["citizen", "admin"]}>
      <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {submittedAlert && (
            <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-sm">
                    Report Draft Validated (Foundation Mode)
                  </p>
                  <p className="text-xs text-teal-700">
                    Your form passed client schema checks. Report submission backend pipeline will be connected in Step 2!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedAlert(false)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Main Column: Form & Welcome */}
            <div className="lg:col-span-8 space-y-6">
              {/* Welcome Callout Banner matching Stitch Image 2 */}
              <div className="bg-[#E6F4F1] border border-[#BCE3DA] rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-teal-950 tracking-tight">
                    Welcome to CivicPaws Reporting
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-900/80 mt-1 leading-relaxed">
                    Your reports help us ensure the safety and welfare of urban
                    animals. Please provide as much detail as possible. Check
                    the map on the right for nearby active cases before submitting.
                  </p>
                </div>
              </div>

              {/* New Incident Report Card matching Stitch Image 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight pb-4 border-b border-slate-100">
                  New Incident Report
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Select Species */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Select Species
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {speciesOptions.map((species) => {
                        const Icon = species.icon;
                        const isSelected = selectedSpecies === species.id;
                        return (
                          <button
                            key={species.id}
                            type="button"
                            onClick={() => setSelectedSpecies(species.id)}
                            className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-teal-50/80 border-2 border-teal-700 text-teal-900 font-bold shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 mb-2 ${
                                isSelected ? "text-teal-700" : "text-slate-500"
                              }`}
                            />
                            <span className="text-xs font-medium">
                              {species.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location & Description Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Location
                      </label>
                      <div className="relative rounded-lg shadow-xs mb-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Search className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Search address or tap map"
                          className="block w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-teal-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Map Preview Graphic matching Stitch */}
                      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                        {/* Map Vector Mockup */}
                        <div className="absolute inset-0 bg-[#E5EEF4] flex flex-col justify-between p-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-white/90 px-2 py-0.5 rounded shadow-xs font-bold text-slate-700">
                              Sector 4 - Central District
                            </span>
                            <span className="text-[10px] bg-teal-800 text-white px-2 py-0.5 rounded shadow-xs font-semibold">
                              GPS Active
                            </span>
                          </div>

                          {/* Map Grid Lines */}
                          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                          {/* Geolocation Pin Marker */}
                          <div className="relative z-10 self-center flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="mt-1 bg-slate-900/90 text-white text-[9px] px-2 py-0.5 rounded font-mono shadow">
                              40.7128° N, 74.0060° W
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-medium text-right">
                            Tap map to fine-tune pin
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the situation, animal condition, visual landmarks, or behavioral signs..."
                        className="flex-1 w-full p-3 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Photo Upload Zone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Photo Upload
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 group-hover:text-teal-700 flex items-center justify-center shadow-xs mb-2 transition-colors">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-teal-900">
                        Tap to upload photos
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports JPG, PNG (Max 3 photos, 10MB each)
                      </p>
                    </div>
                  </div>

                  {/* Actions matching Stitch */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDescription("");
                        setAddress("");
                      }}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-sm hover:shadow transition-all"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Sidebar Column matching Stitch Image 2 */}
            <div className="lg:col-span-4 space-y-6">
              {/* Track My Reports Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    Track My Reports
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    2 Active
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Case 1: In Progress */}
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-[#FFFDF7] relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        Case #8402
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 font-medium">
                      Stray dog reported near Central Park.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Updated 2 hrs ago • Assigned to Unit 402
                    </p>
                  </div>

                  {/* Case 2: Resolved */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-[#F7FDF9] relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        Case #8391
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3" />
                        Resolved
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 font-medium">
                      Injured bird on 5th Ave.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Resolved Yesterday • Released to Sanctuary
                    </p>
                  </div>
                </div>
              </div>

              {/* Nearby Active Cases Card matching Stitch Image 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    Nearby Active Cases
                  </h3>
                  <MapIcon className="w-4 h-4 text-slate-400" />
                </div>

                <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                  {/* Map Mockup Background */}
                  <div className="absolute inset-0 bg-[#E8EEF3] p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-white/95 px-2 py-0.5 rounded shadow-xs font-bold text-slate-800">
                        Central District Live Feed
                      </span>
                    </div>

                    {/* Clustered Pins */}
                    <div className="relative w-full h-full my-2">
                      <div className="absolute top-1/4 left-1/3 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        !
                      </div>
                      <div className="absolute bottom-1/3 right-1/4 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        !
                      </div>
                      <div className="absolute top-1/2 left-2/3 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        ✓
                      </div>
                    </div>

                    <div className="self-end">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-xs shadow">
                        3 cases within 2km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-white border-t border-slate-200 py-5 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Urban Animal Welfare Division. A Municipal Public Safety Initiative.</p>
            <div className="flex items-center gap-5 text-slate-500">
              <span className="hover:text-teal-800 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-teal-800 cursor-pointer">Terms of Service</span>
              <span className="hover:text-teal-800 cursor-pointer">Contact Support</span>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
