"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, CheckCircle2, Clock, Truck, Package, AlertCircle, Loader2 } from "lucide-react";

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;
    
    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const res = await fetch(`https://transly-wr1m.onrender.com/shipments/track/${trackingNumber}`);
      const data = await res.json();
      if (data.success) {
        setShipment(data.shipment);
      } else {
        setError(data.error || "Tracking number not found");
      }
    } catch (err) {
      setError("Failed to fetch tracking information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Track your package</h1>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2">
            <Input 
              value={trackingNumber} 
              onChange={(e) => setTrackingNumber(e.target.value)} 
              placeholder="Enter tracking number (e.g. TRK-123456)" 
              className="h-12 text-md"
            />
            <Button type="submit" size="lg" className="px-8 h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "Searching..." : "Track"}
            </Button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {shipment && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-sm mb-6 overflow-hidden">
               <div className="bg-orange-600 h-2 w-full" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 py-2 border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{shipment.trackingNumber}</h2>
                    <p className="text-sm text-slate-500">Standard Delivery</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <Badge 
                      variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'in_transit' ? 'warning' : 'default'} 
                      className="w-fit mb-1 px-3 py-1 text-sm uppercase tracking-wider"
                    >
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm font-medium text-slate-700">Last updated: {new Date(shipment.updatedAt).toLocaleDateString()} {new Date(shipment.updatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 px-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Origin</p>
                      <p className="text-sm font-medium text-slate-900">{shipment.origin}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center px-4 w-full max-w-[200px]">
                    <div className="h-px bg-slate-300 w-full" />
                    <Truck className="h-5 w-5 text-slate-400 mx-2 flex-shrink-0" />
                    <div className="h-px bg-slate-300 w-full" />
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Destination</p>
                      <p className="text-sm font-medium text-slate-900">{shipment.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pl-4 md:pl-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Status Update</h3>
                  <div className="relative border-l border-slate-200 ml-3 py-1">
                    <div className="relative pl-8 mb-2">
                       <span className="absolute -left-[1.1rem] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white bg-orange-600 text-white shadow-md">
                          <CheckCircle2 className="h-5 w-5" />
                       </span>
                       <div className="flex flex-col">
                          <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">{shipment.status.replace('_', ' ')}</h4>
                          <span className="text-xs text-slate-500">{new Date(shipment.updatedAt).toLocaleString()}</span>
                          <p className="text-sm text-slate-600 mt-1">Package is currently {shipment.status.replace('_', ' ')}.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
