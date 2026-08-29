"use client";

import dynamic from "next/dynamic";

export const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
        Loading Interactive Map...
      </div>
    ),
  }
);

export const NearbyCasesMap = dynamic(
  () => import("./NearbyCasesMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
        Loading Nearby Cases Map...
      </div>
    ),
  }
);
