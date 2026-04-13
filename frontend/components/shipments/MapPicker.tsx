"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OriginIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DestIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationClickHandler({ onLocationSelect, activeType }: { onLocationSelect: (lat: number, lng: number, type: 'origin' | 'destination') => void, activeType: 'origin' | 'destination' }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng, activeType);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, type: 'origin' | 'destination') => void;
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  activeType: 'origin' | 'destination';
}

export default function MapPicker({ onLocationSelect, origin, destination, activeType }: MapPickerProps) {
  const [center] = useState<[number, number]>([6.5244, 3.3792]); // Lagos

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-xl border-2 border-slate-100 relative z-0">
      <MapContainer center={origin || destination || center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {origin && (
          <Marker position={origin} icon={OriginIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={destination} icon={DestIcon}>
            <Popup>Delivery Destination</Popup>
          </Marker>
        )}

        <LocationClickHandler onLocationSelect={onLocationSelect} activeType={activeType} />
        
        {/* Auto center when active point changes if provided */}
        {activeType === 'origin' && origin && <ChangeView center={origin} />}
        {activeType === 'destination' && destination && <ChangeView center={destination} />}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border backdrop-blur-md transition-all ${activeType === 'origin' ? 'bg-orange-600 text-white border-orange-500 scale-105' : 'bg-white/90 text-slate-500 border-slate-200'}`}>
            {activeType === 'origin' ? '● Setting Pickup' : 'Setting Pickup'}
         </div>
         <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border backdrop-blur-md transition-all ${activeType === 'destination' ? 'bg-blue-600 text-white border-blue-500 scale-105' : 'bg-white/90 text-slate-500 border-slate-200'}`}>
            {activeType === 'destination' ? '● Setting Destination' : 'Setting Destination'}
         </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-[11px] font-medium shadow-2xl border border-white/10">
        Click on the map to place the {activeType} marker
      </div>
    </div>
  );
}
