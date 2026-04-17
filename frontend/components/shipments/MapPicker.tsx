"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { Search, Loader2, Navigation, MapPin } from "lucide-react";

const containerStyle = {
  width: '100%',
  height: '100%'
};

export interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, type: 'origin' | 'destination', address?: string) => void;
  origin?: [number, number] | null;
  destination?: [number, number] | null;
  activeType: 'origin' | 'destination';
  mapCenter?: [number, number];
}

const libraries: "places"[] = ["places"];

export default function MapPicker({ onLocationSelect, origin, destination, activeType, mapCenter: externalCenter }: MapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [internalCenter, setInternalCenter] = useState({ lat: 6.5244, lng: 3.3792 });
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  const center = externalCenter ? { lat: externalCenter[0], lng: externalCenter[1] } : internalCenter;

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect(lat, lng, activeType);
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setInternalCenter({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        onLocationSelect(lat, lng, activeType, place.formatted_address || place.name);
      }
    }
  };

  useEffect(() => {
    if (origin && destination && isLoaded) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: { lat: origin[0], lng: origin[1] },
        destination: { lat: destination[0], lng: destination[1] },
        travelMode: google.maps.TravelMode.DRIVING
      }).then(result => {
        setDirectionsResponse(result);
      }).catch(e => {
        console.error("Directions request failed", e);
      });
    } else {
      setDirectionsResponse(null);
    }
  }, [origin, destination, isLoaded]);

  if (!isLoaded) {
    return <div className="h-[300px] md:h-[450px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-medium border-2 border-slate-200">Loading Google Maps...</div>;
  }

  return (
    <div className="h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-100 relative group z-0">
      {/* Search Overlay */}
      <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 z-[1000] flex flex-col gap-2">
        <div className="max-w-md w-full mx-auto md:mx-0 relative">
          <Autocomplete
            onLoad={(autocomplete: google.maps.places.Autocomplete) => { autocompleteRef.current = autocomplete; }}
            onPlaceChanged={onPlaceChanged}
          >
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 md:left-4 md:top-3.5 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Search for ${activeType}...`} 
                className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-4 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border-0 focus:ring-2 focus:ring-orange-500/50 text-slate-800 text-base font-medium transition-all"
              />
            </div>
          </Autocomplete>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {origin && !directionsResponse && (
          <Marker position={{ lat: origin[0], lng: origin[1] }} label="P" />
        )}
        
        {destination && !directionsResponse && (
          <Marker position={{ lat: destination[0], lng: destination[1] }} label="D" />
        )}

        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} options={{ suppressMarkers: false }} />
        )}
      </GoogleMap>
      
      {/* Navigation Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-[40] flex flex-col gap-2 pointer-events-none md:pointer-events-auto">
         <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md transition-all flex items-center gap-2 pointer-events-auto ${activeType === 'origin' ? 'bg-orange-600 text-white border-orange-500 scale-105' : 'bg-white/95 text-slate-500 border-slate-200'}`}>
            <MapPin className="h-3 w-3" /> {activeType === 'origin' ? 'Picking Origin' : 'Origin Selected'}
         </div>
         <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border backdrop-blur-md transition-all flex items-center gap-2 pointer-events-auto ${activeType === 'destination' ? 'bg-blue-600 text-white border-blue-500 scale-105' : 'bg-white/95 text-slate-500 border-slate-200'}`}>
            <Navigation className="h-3 w-3" /> {activeType === 'destination' ? 'Picking Destination' : 'Destination Selected'}
         </div>
      </div>

      <div className="absolute bottom-2 left-2 z-[40] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold shadow-2xl border border-white/10 flex items-center gap-2 max-w-[200px] md:max-w-none">
        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-500 animate-ping"></div>
        <span className="truncate">{activeType === 'origin' ? 'Set Pickup' : 'Set Delivery'}</span>
      </div>
    </div>
  );
}
