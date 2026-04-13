"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapPicker({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number) => void, initialPos?: [number, number] }) {
  const [position, setPosition] = useState<[number, number] | null>(initialPos || [6.5244, 3.3792]); // Default Lagos

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer center={position || [6.5244, 3.3792]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={handleSelect} position={position} />
        {position && <ChangeView center={position} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200">
        Click to select coordinate
      </div>
    </div>
  );
}
