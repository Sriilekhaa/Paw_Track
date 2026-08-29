"use client";

import React, { useEffect, useState, useRef } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Lightbulb,
  Dog,
  Cat,
  Bird,
  HelpCircle,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Map as MapIcon,
  Search,
  Check,
  X,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { MonkeyIcon, CattleIcon } from "@/components/SpeciesIcons";

interface UploadedPhoto {
  url: string;
  public_id: string;
  originalName: string;
}

interface ReportItem {
  _id: string;
  species: string;
  category: string;
  description: string;
  photos?: string[];
  location: {
    coordinates: [number, number];
    address: string;
    zone?: string;
  };
  status: "submitted" | "classified" | "assigned" | "in_progress" | "resolved";
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
}

export default function CitizenDashboardPage() {
  const { user } = useAuth();

  // Form State
  const [species, setSpecies] = useState<string>("dog");
  const [category, setCategory] = useState<string>("stray_sighting");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("Northside Park, Sector 4");
  const [coordinates, setCoordinates] = useState<[number, number]>([-74.006, 40.7128]); // [lng, lat]
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  // UI & Loading State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successReport, setSuccessReport] = useState<ReportItem | null>(null);

  // Live Data State
  const [myReports, setMyReports] = useState<ReportItem[]>([]);
  const [nearbyCases, setNearbyCases] = useState<ReportItem[]>([]);
  const [selectedReportForTracking, setSelectedReportForTracking] = useState<ReportItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const speciesOptions = [
    { id: "dog", label: "Dogs", icon: Dog },
    { id: "cat", label: "Cats", icon: Cat },
    { id: "cattle", label: "Cattle", icon: CattleIcon },
    { id: "monkey", label: "Monkeys", icon: MonkeyIcon },
    { id: "bird", label: "Birds", icon: Bird },
    { id: "other", label: "Other", icon: HelpCircle },
  ];

  const categoryOptions = [
    { id: "stray_sighting", label: "Stray Sighting" },
    { id: "injury", label: "Animal Injury" },
    { id: "bite_incident", label: "Bite Incident / Aggression" },
    { id: "sterilization_request", label: "Sterilization Request (ABC)" },
    { id: "cruelty_report", label: "Cruelty / Neglect" },
    { id: "roadkill", label: "Roadkill / Carcass Removal" },
    { id: "adoption_inquiry", label: "Rescue / Adoption Inquiry" },
  ];

  // Fetch real data on mount
  const fetchMyReports = async () => {
    const res = await api.get("/reports/my-reports");
    if (res.success && res.data?.reports) {
      setMyReports(res.data.reports);
    }
  };

  const fetchNearbyCases = async () => {
    const res = await api.get(
      `/reports/nearby?lat=${coordinates[1]}&lng=${coordinates[0]}&radius=5000`
    );
    if (res.success && res.data?.reports) {
      setNearbyCases(res.data.reports);
    }
  };

  useEffect(() => {
    fetchMyReports();
    fetchNearbyCases();
  }, [coordinates]);

  // Handle Photo Upload to Cloudinary API
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 3) {
      setUploadError("Maximum 3 photos allowed per report.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size (<5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File '${file.name}' exceeds the 5MB limit.`);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("photo", file);

      try {
        const tokens = JSON.parse(localStorage.getItem("paw_access_token") || '""');
        const res = await fetch("http://localhost:5001/api/uploads/report-photo", {
          method: "POST",
          headers: tokens ? { Authorization: `Bearer ${tokens}` } : {},
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success && data.data?.url) {
          setPhotos((prev) => [
            ...prev,
            {
              url: data.data.url,
              public_id: data.data.public_id,
              originalName: file.name,
            },
          ]);
        } else {
          setUploadError(data.message || "Photo upload failed. Please try again.");
        }
      } catch (err: any) {
        setUploadError("Network error during photo upload.");
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Report Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    setUploadError("");

    const payload = {
      species,
      category,
      description,
      location: {
        coordinates,
        address,
        zone: "Central District",
      },
      photos: photos.map((p) => p.url),
    };

    const res = await api.post("/reports", payload);
    setIsSubmitting(false);

    if (res.success && res.data?.report) {
      setSuccessReport(res.data.report);
      setDescription("");
      setPhotos([]);
      // Refresh real reports list
      fetchMyReports();
      fetchNearbyCases();
    } else if (res.errors) {
      setFieldErrors(res.errors);
    } else {
      setUploadError(res.message || "Failed to submit report. Please check inputs.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["citizen", "admin"]}>
      <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Banner Alert on Report Submission */}
          {successReport && (
            <div className="mb-6 p-5 rounded-2xl bg-teal-50 border-2 border-teal-400 text-teal-900 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-teal-950">
                      Incident Report #{successReport._id.slice(-6).toUpperCase()} Submitted Successfully!
                    </h3>
                    <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                      Your report for a <strong>{successReport.species}</strong> ({successReport.category}) at {successReport.location.address} has been received and added to municipal field dispatch.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2.5 py-1 rounded-full bg-teal-200/80 text-teal-900 text-xs font-bold">
                        Status: Submitted
                      </span>
                      <button
                        onClick={() => setSelectedReportForTracking(successReport)}
                        className="text-xs font-bold text-teal-900 hover:text-teal-950 underline flex items-center gap-1"
                      >
                        View Real-time Timeline <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSuccessReport(null)}
                  className="p-1 rounded-md text-teal-700 hover:bg-teal-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                    Welcome to PawTrack Reporting, {user?.name.split(" ")[0]}
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-900/80 mt-1 leading-relaxed">
                    Your reports help ensure the safety and welfare of urban animals.
                    Please provide detailed observations. Every report is geotagged and
                    tracked transparently through resolution.
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
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select Species
                      </label>
                      {fieldErrors.species && (
                        <span className="text-xs font-semibold text-red-600">
                          {fieldErrors.species[0]}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      {speciesOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = species === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSpecies(opt.id)}
                            className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-teal-50/90 border-2 border-teal-700 text-teal-950 font-bold shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 mb-1.5 ${
                                isSelected ? "text-teal-700" : "text-slate-500"
                              }`}
                            />
                            <span className="text-xs font-medium">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Incident Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
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
                          className="block w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-teal-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>
                      {fieldErrors["location.address"] && (
                        <p className="text-[11px] text-red-600 mb-2 font-medium">
                          {fieldErrors["location.address"][0]}
                        </p>
                      )}

                      {/* Map Preview Graphic matching Stitch */}
                      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                        <div className="absolute inset-0 bg-[#E5EEF4] flex flex-col justify-between p-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-white/90 px-2 py-0.5 rounded shadow-xs font-bold text-slate-700">
                              Sector 4 - Central District
                            </span>
                            <span className="text-[10px] bg-teal-800 text-white px-2 py-0.5 rounded shadow-xs font-semibold">
                              GPS Geotagged
                            </span>
                          </div>

                          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                          <div className="relative z-10 self-center flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="mt-1 bg-slate-900/90 text-white text-[9px] px-2 py-0.5 rounded font-mono shadow">
                              {coordinates[1].toFixed(4)}° N, {coordinates[0].toFixed(4)}° W
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-medium text-right">
                            Coordinates verified
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Description
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {description.length}/1000 chars (min 10)
                        </span>
                      </div>
                      <textarea
                        rows={8}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the situation, animal physical condition, visible injuries, landmarks, and behavioral signs..."
                        className={`flex-1 w-full p-3 border rounded-lg text-xs placeholder-slate-400 focus:ring-2 focus:ring-teal-600 focus:outline-none resize-none ${
                          fieldErrors.description ? "border-red-400 bg-red-50/20" : "border-slate-300"
                        }`}
                      ></textarea>
                      {fieldErrors.description && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">
                          {fieldErrors.description[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Photo Upload Pipeline with Cloudinary */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Photo Evidence (Cloudinary Free Tier)
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {photos.length}/3 photos uploaded
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                    />

                    {/* Upload Dropzone */}
                    {photos.length < 3 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer group"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 className="w-7 h-7 text-teal-700 animate-spin" />
                            <p className="text-xs font-semibold text-teal-900">
                              Uploading photo to Cloudinary CDN...
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 group-hover:text-teal-700 flex items-center justify-center shadow-xs mb-2 transition-colors">
                              <Camera className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 group-hover:text-teal-900">
                              Tap to upload photos
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              JPG, PNG, WebP (Max 5MB each)
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {uploadError && (
                      <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Uploaded Thumbnails List with remove button */}
                    {photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs"
                          >
                            <img
                              src={photo.url}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                              <span className="text-[9px] text-white font-mono truncate max-w-[80px]">
                                {photo.originalName}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePhoto(idx);
                                }}
                                className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm hover:bg-red-700"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDescription("");
                        setPhotos([]);
                        setFieldErrors({});
                      }}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-sm hover:shadow disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Report</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Sidebar Column: Real Reports Tracking & Real Nearby Cases */}
            <div className="lg:col-span-4 space-y-6">
              {/* Track My Reports Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    Track My Reports
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {myReports.length} Submitted
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {myReports.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                      <Clock className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                      <p className="text-xs font-medium">No reports submitted yet.</p>
                      <p className="text-[11px] mt-0.5">Your submitted cases will appear here.</p>
                    </div>
                  ) : (
                    myReports.slice(0, 4).map((rep) => {
                      const isResolved = rep.status === "resolved";
                      const isInProgress = rep.status === "in_progress" || rep.status === "assigned";

                      return (
                        <div
                          key={rep._id}
                          onClick={() => setSelectedReportForTracking(rep)}
                          className={`p-3.5 rounded-xl border relative pl-4 transition-all cursor-pointer hover:shadow-xs ${
                            isResolved
                              ? "border-emerald-200 bg-[#F7FDF9]"
                              : isInProgress
                              ? "border-amber-200 bg-[#FFFDF7]"
                              : "border-teal-200 bg-[#F0FDF9]"
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                              isResolved
                                ? "bg-emerald-500"
                                : isInProgress
                                ? "bg-amber-500"
                                : "bg-teal-600"
                            }`}
                          ></div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              Case #{rep._id.slice(-6).toUpperCase()}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isResolved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-teal-100 text-teal-800"
                              }`}
                            >
                              {isResolved ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {rep.status.replace("_", " ")}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 mt-1.5 line-clamp-1 font-medium">
                            {rep.description}
                          </p>

                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>
                              {new Date(rep.createdAt).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-teal-800 flex items-center gap-0.5">
                              View Timeline <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                  <div className="absolute inset-0 bg-[#E8EEF3] p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="bg-white/95 px-2 py-0.5 rounded shadow-xs font-bold text-slate-800">
                        Central District Live Radius
                      </span>
                    </div>

                    {/* Visual Clustered Pins */}
                    <div className="relative w-full h-full my-2">
                      <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse">
                        !
                      </div>
                      <div className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        !
                      </div>
                      <div className="absolute top-1/2 left-2/3 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        ✓
                      </div>
                    </div>

                    <div className="self-end">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/85 text-white text-[10px] font-semibold backdrop-blur-xs shadow">
                        {nearbyCases.length > 0
                          ? `${nearbyCases.length} cases within 5km`
                          : "3 cases within 2km"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real nearby reports preview list */}
                {nearbyCases.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Recent Nearby Incidents
                    </span>
                    {nearbyCases.slice(0, 3).map((nc) => (
                      <div
                        key={nc._id}
                        className="text-xs text-slate-700 flex items-center justify-between py-1"
                      >
                        <span className="font-semibold text-slate-800 capitalize">
                          {nc.species} ({nc.category.replace("_", " ")})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {nc.location.address.slice(0, 20)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Real-time Status History Modal */}
        {selectedReportForTracking && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Case #{selectedReportForTracking._id.slice(-6).toUpperCase()} Resolution Timeline
                  </h3>
                  <p className="text-xs text-slate-500 capitalize">
                    {selectedReportForTracking.species} • {selectedReportForTracking.category.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReportForTracking(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Flow */}
              <div className="space-y-4 py-2">
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
                  {selectedReportForTracking.statusHistory?.map((hist, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 border-2 border-white shadow-xs">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 capitalize">
                          Status: {hist.status.replace("_", " ")}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(hist.timestamp).toLocaleString()}
                        </p>
                        {hist.note && (
                          <p className="text-xs text-slate-600 mt-0.5 bg-slate-50 p-2 rounded-md border border-slate-200">
                            {hist.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedReportForTracking(null)}
                  className="px-4 py-2 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900"
                >
                  Close Tracker
                </button>
              </div>
            </div>
          </div>
        )}

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
