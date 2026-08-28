"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Shield,
  ThumbsUp,
  Users,
  Compass,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalReportsHandled: 12450,
    resolutionRatePercentage: 94,
    avgResponseTimeHours: "< 2 Hrs",
  });

  useEffect(() => {
    // Fetch live public stats from backend
    api.get("/reports/public-stats").then((res) => {
      if (res.success && res.data) {
        setStats({
          totalReportsHandled: res.data.totalReportsHandled || 12450,
          resolutionRatePercentage: res.data.resolutionRatePercentage || 94,
          avgResponseTimeHours: "< 2 Hrs",
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Action Triggers */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Municipal Public Safety Initiative</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Empowering{" "}
                <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2">
                  Community
                </span>{" "}
                for Urban Animal Welfare
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                A modern, transparent platform connecting citizens, municipal
                services, and local organizations to protect and support our
                city&apos;s animals. Report incidents, track resolutions, and
                build a safer environment together.
              </p>

              {/* Action Buttons matching Stitch */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard/citizen"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-base shadow-sm hover:shadow transition-all"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Report an Incident</span>
                </Link>

                <Link
                  href="#resources"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-base border border-teal-300 transition-all"
                >
                  <BookOpen className="w-5 h-5 text-teal-700" />
                  <span>View Resources</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>24/7 Field Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>GPS Geotagged Reports</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Live Resolution Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Artwork */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-tr from-teal-900 to-slate-800 group">
                <div className="relative aspect-[4/3] w-full bg-slate-200 overflow-hidden">
                  {/* Photo illustration */}
                  <img
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
                    alt="Community officer and friendly urban dog"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-teal-200 font-bold">
                          Live Field Unit Active
                        </p>
                        <p className="text-sm font-semibold">
                          Sector 4 Patrol & Community Rescue
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-sm">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards Row Matching Stitch Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-slate-200">
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalReportsHandled.toLocaleString()}
              </h3>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mt-2">
                Total Reports Handled
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-inner">
                <ThumbsUp className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.resolutionRatePercentage}%
              </h3>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mt-2">
                Resolution Rate
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-inner">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.avgResponseTimeHours}
              </h3>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mt-2">
                Avg Response Time
              </p>
            </div>
          </div>

          {/* Quick Role Portal Access for pair programming demo */}
          <div className="mt-16 bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Explore Portals & RBAC
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-white">
                Multi-Role Platform Access
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Experience PawTrack through each stakeholder viewpoint with
                distinct role-gated interfaces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Link
                href="/dashboard/citizen"
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-5 rounded-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors">
                    Citizen Portal
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Submit geocoded incident reports, select animal species, and track resolution progress.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mt-4">
                  Open Citizen Shell <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                href="/dashboard/field-worker"
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-5 rounded-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    Field Worker Operations
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Dispatch routing, priority queues, status progression (In-Transit, On-Site, Resolved), and AI insights.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mt-4">
                  Open Field Shell <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                href="/dashboard/admin"
                className="bg-white/10 hover:bg-white/15 border border-white/15 p-5 rounded-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                    Admin Oversight
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Citywide analytics, incident heatmap visualization, species breakdown, and CSV/PDF reports.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-4">
                  Open Admin Shell <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer matching Stitch Layout */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600">
            © 2026 Urban Animal Welfare Division. A Municipal Public Safety Initiative.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-teal-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#terms" className="hover:text-teal-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="#accessibility" className="hover:text-teal-700 transition-colors">
              Accessibility
            </Link>
            <Link href="#contact" className="hover:text-teal-700 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
