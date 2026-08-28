"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, LogOut, PawPrint, User as UserIcon } from "lucide-react";

export const Navbar: React.FC<{ activeTab?: string }> = ({ activeTab = "" }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/dashboard/citizen";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "field_worker") return "/dashboard/field-worker";
    return "/dashboard/citizen";
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <PawPrint className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-teal-800 tracking-tight">
            Paw<span className="text-teal-600">Track</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/#reports"
            className={`hover:text-teal-700 transition-colors ${
              activeTab === "reports" ? "text-teal-800 font-semibold" : ""
            }`}
          >
            Public Reports
          </Link>
          <Link
            href="/#resources"
            className={`hover:text-teal-700 transition-colors ${
              activeTab === "resources" ? "text-teal-800 font-semibold" : ""
            }`}
          >
            Resources
          </Link>
          <Link
            href="/#community"
            className={`hover:text-teal-700 transition-colors ${
              activeTab === "community" ? "text-teal-800 font-semibold" : ""
            }`}
          >
            Community
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user.name.split(" ")[0]} ({user.role})</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-md hover:bg-slate-100"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              Login
            </Link>
          )}

          <Link
            href="/dashboard/citizen"
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold shadow-sm transition-all hover:shadow"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
