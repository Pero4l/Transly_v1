"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, CheckCircle2, Clock, Truck, Package } from "lucide-react";
import { TRACKING_HISTORY } from "@/lib/dummy-data";

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("TRK-009841");
  const [searched, setSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
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
            <Button type="submit" size="lg" className="px-8 h-12">Track</Button>
          </form>
        </div>

        {searched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 py-2 border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{trackingNumber}</h2>
                    <p className="text-sm text-slate-500">Shipped via Standard Ground</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <Badge variant="success" className="w-fit mb-1 px-3 py-1 text-sm text-emerald-700 bg-emerald-100/50 border border-emerald-200">Delivered</Badge>
                    <p className="text-sm font-medium text-slate-700">April 8, 2026 at 2:30 PM</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 px-4 py-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Origin</p>
                      <p className="text-sm font-medium text-slate-900">San Francisco, CA</p>
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
                      <p className="text-sm font-medium text-slate-900">New York, NY</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pl-4 md:pl-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Tracking History</h3>
                  <div className="relative border-l border-slate-200 ml-3 space-y-8">
                    {TRACKING_HISTORY.map((event, index) => (
                      <div key={index} className="relative pl-8">
                        <span className={`absolute -left-[1.1rem] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${index === 0 ? 'bg-orange-600 text-white' : 'bg-slate-100 flex items-center justify-center'}`}>
                          {index === 0 ? <CheckCircle2 className="h-5 w-5 text-white" /> : <div className="h-3 w-3 bg-slate-300 rounded-full" />}
                        </span>
                        <div className="flex flex-col md:flex-row md:justify-between mb-1">
                          <h4 className="text-base font-medium text-slate-900">{event.status}</h4>
                          <span className="text-sm text-slate-500">{event.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">{event.location}</p>
                      </div>
                    ))}
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
