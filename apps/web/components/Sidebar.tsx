"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutGrid,
  ClipboardList,
  Map,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Flame,
  PawPrint,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = "dashboard",
  onSelectTab,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const isFieldWorker = user?.role === "field_worker";

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
      href: isFieldWorker ? "/dashboard/field-worker" : "/dashboard/admin",
    },
    {
      id: "queue",
      label: "Case Queue",
      icon: ClipboardList,
      href: isFieldWorker ? "/dashboard/field-worker" : "/dashboard/admin",
    },
    {
      id: "map",
      label: "Map View",
      icon: Map,
      href: isFieldWorker ? "/dashboard/field-worker" : "/dashboard/admin",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/admin",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "#settings",
    },
  ];

  return (
    <aside className="w-64 bg-[#1E293B] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-700/60 p-4 select-none">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900 shadow-md font-bold">
            <PawPrint className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-2xl text-teal-400 tracking-tight">
            Paw<span className="text-white">Track</span>
          </span>
        </Link>

        {/* User / Unit Badge Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-lg bg-teal-900/60 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {isAdmin ? "Admin Oversight" : "Field Operations"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-slate-400 truncate">
                {isAdmin ? "System Active" : "Unit 402 - Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === "analytics" && pathname === "/dashboard/admin") ||
              (item.id === "dashboard" &&
                pathname === "/dashboard/field-worker" &&
                currentTab === "dashboard");

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm font-semibold border-l-4 border-teal-300"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-6 border-t border-slate-700/60">
        {/* Emergency Dispatch Button */}
        <button
          onClick={() =>
            alert(
              "Emergency Dispatch Alert Broadcasted to Sector 4 Rapid Response Units."
            )
          }
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-98"
        >
          <Flame className="w-4 h-4" />
          <span>Emergency Dispatch</span>
        </button>

        <div className="space-y-1 pt-1">
          <Link
            href="#support"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Support</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
