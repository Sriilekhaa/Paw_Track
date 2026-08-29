"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface NearbyReport {
  _id: string;
  species: string;
  category: string;
  description: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
    address: string;
    zone?: string;
  };
  status: string;
  urgencyScore?: number;
  createdAt: string;
}

interface NearbyCasesMapProps {
  reports: NearbyReport[];
  centerLat?: number;
  centerLng?: number;
  onSelectCase?: (report: NearbyReport) => void;
}

// Function to generate styled SVG markers by urgency
const createUrgencyIcon = (urgencyScore: number = 50) => {
  const isHigh = urgencyScore >= 70;
  const isMedium = urgencyScore >= 30 && urgencyScore < 70;

  const color = isHigh ? "#DC2626" : isMedium ? "#D97706" : "#0D9488";
  const bgColor = isHigh ? "#FEE2E2" : isMedium ? "#FEF3C7" : "#CCFBF1";

  const svgHtml = `
    <div style="
      background-color: ${bgColor};
      border: 2px solid ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      font-size: 11px;
      font-weight: 800;
      color: ${color};
    ">
      ${urgencyScore}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-urgency-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function NearbyCasesMap({
  reports,
  centerLat = 12.9716,
  centerLng = 77.5946,
  onSelectCase,
}: NearbyCasesMapProps) {
  const center: [number, number] = [centerLat, centerLng];

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeMapCenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((rep) => {
          const lat = rep.location.coordinates[1];
          const lng = rep.location.coordinates[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={rep._id}
              position={[lat, lng]}
              icon={createUrgencyIcon(rep.urgencyScore)}
            >
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 capitalize text-xs">
                      {rep.species} • {rep.category.replace("_", " ")}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (rep.urgencyScore || 0) >= 70
                          ? "bg-red-100 text-red-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      Score: {rep.urgencyScore || 50}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="text-[10px] text-slate-400 font-medium">
                    {rep.location.address}
                  </div>

                  {onSelectCase && (
                    <button
                      onClick={() => onSelectCase(rep)}
                      className="w-full mt-1 px-2 py-1 rounded bg-teal-800 text-white text-[10px] font-bold hover:bg-teal-900 transition-colors"
                    >
                      Track Incident
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-600 shadow-xs border border-slate-200 pointer-events-none flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-600" /> High Urgency (&ge;70)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (30-69)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-teal-600" /> Low (&lt;30)
        </span>
      </div>
    </div>
  );
}
