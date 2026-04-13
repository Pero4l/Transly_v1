"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, Loader2, Navigation, MapPin } from "lucide-react";

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

function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, map, zoom]);
  return null;
}

export interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, type: 'origin' | 'destination', address?: string) => void;
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  activeType: 'origin' | 'destination';
  mapCenter?: [number, number];
}

export default function MapPicker({ onLocationSelect, origin, destination, activeType, mapCenter: externalCenter }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [internalCenter, setInternalCenter] = useState<[number, number]>([6.5244, 3.3792]); // Lagos

  const mapCenter = externalCenter || internalCenter;
  const setMapCenter = externalCenter ? () => {} : setInternalCenter; 

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        setMapCenter([newLat, newLon]);
        onLocationSelect(newLat, newLon, activeType, display_name);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-100 relative group z-0">
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <form onSubmit={handleSearch} className="pointer-events-auto max-w-md w-full mx-auto md:mx-0">
            <div className="relative group">
                <Search className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${isSearching ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                <input 
                    type="text" 
                    placeholder={`Search for ${activeType}...`} 
                    className="w-full h-12 pl-12 pr-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-0 focus:ring-2 focus:ring-orange-500/50 text-slate-800 text-sm font-medium transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                    <div className="absolute right-4 top-3.5">
                        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                    </div>
                )}
            </div>
        </form>
      </div>

      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {origin && (
          <Marker position={origin} icon={OriginIcon}>
            <Popup className="font-bold">Pickup Point</Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={destination} icon={DestIcon}>
            <Popup className="font-bold">Delivery Point</Popup>
          </Marker>
        )}

        {origin && destination && (
            <Polyline 
                positions={[origin, destination]} 
                color="#f97316" 
                weight={4} 
                opacity={0.6} 
                dashArray="10, 10"
                lineJoin="round"
            />
        )}

        <LocationClickHandler onLocationSelect={onLocationSelect} activeType={activeType} />
        <MapController center={mapCenter} />
      </MapContainer>
      
      {/* Navigation Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-[40] flex flex-col gap-2 pointer-events-none md:pointer-events-auto">
         <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md transition-all flex items-center gap-2 pointer-events-auto ${activeType === 'origin' ? 'bg-orange-600 text-white border-orange-500 scale-105' : 'bg-white/95 text-slate-500 border-slate-200'}`}>
            <MapPin className="h-3 w-3" /> {activeType === 'origin' ? 'Picking Origin' : 'Origin Selected'}
         </div>
         <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md transition-all flex items-center gap-2 pointer-events-auto ${activeType === 'destination' ? 'bg-blue-600 text-white border-blue-500 scale-105' : 'bg-white/95 text-slate-500 border-slate-200'}`}>
            <Navigation className="h-3 w-3" /> {activeType === 'destination' ? 'Picking Destination' : 'Destination Selected'}
         </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[40] bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold shadow-2xl border border-white/10 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></div>
        {activeType === 'origin' ? 'Click map to set Pickup location' : 'Click map to set Delivery location'}
      </div>
    </div>
  );
}
