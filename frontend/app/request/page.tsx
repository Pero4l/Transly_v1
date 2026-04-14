"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, User, Package, CreditCard, Loader2, Navigation, Target, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/sessionContext";
import type { MapPickerProps } from "@/components/shipments/MapPicker";

const MapPicker = dynamic<MapPickerProps>(() => import("@/components/shipments/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Interactive Map...</div>
});

export default function RequestPage() {
  const [formData, setFormData] = useState({
    origin: "", destination: "", description: "", productType: "", 
    receiverName: "", receiverPhone: "", receiverAddress: ""
  });
  const [coords, setCoords] = useState<{ origin: [number, number] | null, destination: [number, number] | null }>({
    origin: null,
    destination: null
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]);
  const [activeType, setActiveType] = useState<'origin' | 'destination'>('origin');
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({ BASE_FARE: 1500, PRICE_PER_MILE: 500 });
  const { user, token, loading: sessionLoading } = useSession();
  const router = useRouter();

  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!sessionLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user?.phone || !user?.address || user.phone === "" || user.address === "") {
        router.push("/onboarding");
      }
      fetchRates();
    }
  }, [user, sessionLoading, router]);

  // Calculate distance when coords change
  useEffect(() => {
    if (coords.origin && coords.destination) {
        // Haversine formula (approximate)
        const R = 6371; // km
        const dLat = (coords.destination[0] - coords.origin[0]) * Math.PI / 180;
        const dLon = (coords.destination[1] - coords.origin[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coords.origin[0] * Math.PI / 180) * Math.cos(coords.destination[0] * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        setDistance(Math.ceil(d));
    } else {
        setDistance(0);
    }
  }, [coords]);

  const fetchRates = async () => {
    try {
        const res = await fetch("https://transly-wr1m.onrender.com/admin/settings", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.settings) {
            setRates({
                BASE_FARE: parseInt(data.settings.BASE_FARE || "1500"),
                PRICE_PER_MILE: parseInt(data.settings.PRICE_PER_MILE || "500")
            });
        }
    } catch (err) {
        console.error("Failed to fetch rates", err);
    }
  };

  const calculatedPrice = rates.BASE_FARE + (distance * rates.PRICE_PER_MILE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (lat: number, lng: number, type: 'origin' | 'destination', address?: string) => {
    setCoords(prev => ({ ...prev, [type]: [lat, lng] }));
    
    if (type === 'origin') {
        setFormData(prev => ({ ...prev, origin: address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }));
    } else {
        setFormData(prev => ({ ...prev, destination: address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`, receiverAddress: address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }));
    }
  };

  const [detecting, setDetecting] = useState(false);
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setCoords(prev => ({ ...prev, origin: [latitude, longitude] }));
            setFormData(prev => ({ ...prev, origin: `Current Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            
            // Try reverse geocoding
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data.display_name) {
                    setFormData(prev => ({ ...prev, origin: data.display_name }));
                }
            } catch (err) { console.error(err); }
            
            setActiveType('destination'); // Suggest setting destination next
            setDetecting(false);
        },
        (error) => {
            console.error(error);
            toast.error("Unable to retrieve your location. Please check your permissions.");
            setDetecting(false);
        }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords.origin || !coords.destination) {
        toast.error("Please set both Pickup and Destination on the map.");
        return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("https://transly-wr1m.onrender.com/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            ...formData, 
            distance,
            originCoords: coords.origin,
            destCoords: coords.destination
        }),
      });
      if (res.ok) {
        toast.success("Shipment request created successfully!");
        router.push("/dashboard");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create request");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden w-full">
      <Navbar />
      
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 font-display">New Delivery Request</h1>
            <p className="text-sm text-slate-500">Pick locations on the map for precision dispatch.</p>
          </div>
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner h-fit items-center gap-1 md:gap-2 flex-wrap">
            <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-white text-orange-600 hover:bg-orange-50 shadow-sm flex items-center gap-2"
            >
                {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Target className="h-3 w-3" />}
                {detecting ? "Locating..." : "My Location"}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1 hidden md:block" />
            <button 
                type="button"
                onClick={() => setActiveType('origin')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeType === 'origin' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Set Pickup
            </button>
            <button 
                type="button"
                onClick={() => setActiveType('destination')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeType === 'destination' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Set Destination
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Map Section */}
            <div className="lg:col-span-12">
                <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                   <CardContent className="p-0">
                      <MapPicker 
                        onLocationSelect={handleLocationSelect} 
                        origin={coords.origin} 
                        destination={coords.destination} 
                        activeType={activeType}
                        mapCenter={mapCenter}
                      />
                   </CardContent>
                </Card>
            </div>

            {/* Form Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4 relative">
            <div className="space-y-4 md:space-y-6">
                <Card className="border border-slate-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-orange-600" /> Dispatch Route
                        </div>
                        {distance > 0 && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">{distance} KM</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="group">
                        <label className="text-sm font-medium text-slate-700 block mb-1 flex items-center">
                            Pickup Address (Origin) 
                            {coords.origin && <CheckCircle2 className="h-3 w-3 ml-2 text-orange-500" />}
                        </label>
                        <div className="relative">
                            <Input name="origin" placeholder="Search or click map for pickup..." value={formData.origin} onChange={handleChange} required className={`pr-10 ${activeType === 'origin' ? 'border-orange-400' : ''}`} />
                            <MousePointer2 className={`absolute right-3 top-3 h-4 w-4 ${activeType === 'origin' ? 'text-orange-500 animate-pulse' : 'text-slate-300'}`} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1 flex items-center">
                            Delivery Destination 
                            {coords.destination && <CheckCircle2 className="h-3 w-3 ml-2 text-blue-500" />}
                        </label>
                        <div className="relative">
                            <Input name="destination" placeholder="Search or click map for destination..." value={formData.destination} onChange={handleChange} required className={`pr-10 ${activeType === 'destination' ? 'border-blue-400' : ''}`} />
                            <MousePointer2 className={`absolute right-3 top-3 h-4 w-4 ${activeType === 'destination' ? 'text-blue-500 animate-pulse' : 'text-slate-300'}`} />
                        </div>
                    </div>
                </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                    <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-emerald-500" /> Package Info
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Product Category</label>
                    <Input name="productType" placeholder="e.g. Health, Industrial, Food" value={formData.productType} onChange={handleChange} required />
                    </div>
                    <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Items Description</label>
                    <Input name="description" placeholder="Brief details about the package" value={formData.description} onChange={handleChange} />
                    </div>
                </CardContent>
                </Card>
            </div>

            <div className="space-y-4 md:space-y-6">
                <Card className="border border-slate-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                    <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-500" /> Receiver Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label>
                    <Input name="receiverName" placeholder="Full name of receiver" value={formData.receiverName} onChange={handleChange} required />
                    </div>
                    <div className="">
                        <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Phone Number</label>
                        <Input name="receiverPhone" placeholder="Contact number" value={formData.receiverPhone} onChange={handleChange} required />
                        </div>
                        {/* <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Instructions</label>
                        <Input placeholder="Optional gateway/apt" />
                        </div> */}
                    </div>
                    <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Verified Delivery Address</label>
                    <Input name="receiverAddress" placeholder="Synced from map selection" value={formData.receiverAddress} onChange={handleChange} required readOnly className="bg-slate-50" />
                    </div>
                </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-lg rounded-xl bg-slate-900 text-white lg:sticky lg:top-24 overflow-hidden mb-6 lg:mb-0 w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <CardHeader className="border-b border-white/10 pb-4 mb-4 relative z-10">
                    <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-orange-500" /> Booking Invoice
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-slate-500 text-sm">
                        <span>Base Handling Fee:</span>
                        <span className="font-bold text-white">₦{rates.BASE_FARE.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-sm">
                        <span>Mileage ({distance} KM):</span>
                        <span className="font-bold text-white">₦{(distance * rates.PRICE_PER_MILE).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-slate-500 text-md">Total Payable:</span>
                        <span className="text-3xl font-black text-orange-500">₦{calculatedPrice > rates.BASE_FARE ? calculatedPrice.toLocaleString() : rates.BASE_FARE.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-2 italic leading-tight">*Calculated based on real-time map distance. Taxes included.</p>
                    <div className="pt-6 pb-2">
                    <Button className="w-full h-14 text-lg rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-950/40 hover:-translate-y-1 transition-all font-black border-0 uppercase tracking-tighter" type="submit" disabled={loading || !coords.origin || !coords.destination}>
                        {loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
                        {loading ? "Initializing..." : "Proceed to Payment"}
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Reuse checkcircle (missing from lucide set in previously)
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
