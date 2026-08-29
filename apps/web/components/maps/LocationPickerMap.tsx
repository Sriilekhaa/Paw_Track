"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet Pin Icon
const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: {
    coordinates: [number, number]; // [lng, lat]
    address: string;
    zone: string;
  }) => void;
}

// Inner component to handle map clicks & center synchronization
function MapEventsHandler({
  position,
  setPosition,
  reverseGeocode,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  reverseGeocode: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      reverseGeocode(newPos[0], newPos[1]);
    },
  });

  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const latlng = marker.getLatLng();
          const newPos: [number, number] = [latlng.lat, latlng.lng];
          setPosition(newPos);
          reverseGeocode(newPos[0], newPos[1]);
        },
      }}
    />
  );
}

export default function LocationPickerMap({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat,
    initialLng,
  ]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced reverse geocoding via Nominatim
  const reverseGeocode = (lat: number, lng: number) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "PawTrack-Animal-Welfare-App/1.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          const road = addr.road || addr.pedestrian || addr.street || "";
          const neighbourhood =
            addr.neighbourhood || addr.suburb || addr.residential || "";
          const city =
            addr.city || addr.town || addr.municipality || addr.county || "";

          const formattedAddress =
            data.display_name?.split(",").slice(0, 3).join(", ") ||
            `${road ? road + ", " : ""}${neighbourhood || city || "Selected Location"}`;

          const zone =
            neighbourhood ||
            (city ? `${city} District` : "Central District");

          onLocationSelect({
            coordinates: [lng, lat],
            address: formattedAddress,
            zone: zone,
          });
        } else {
          onLocationSelect({
            coordinates: [lng, lat],
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            zone: "Central District",
          });
        }
      } catch {
        onLocationSelect({
          coordinates: [lng, lat],
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          zone: "Central District",
        });
      } finally {
        setIsGeocoding(false);
      }
    }, 400);
  };

  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler
          position={position}
          setPosition={setPosition}
          reverseGeocode={reverseGeocode}
        />
      </MapContainer>

      <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200 pointer-events-none">
        {isGeocoding ? "Resolving address..." : "Click or drag pin to set location"}
      </div>
    </div>
  );
}
