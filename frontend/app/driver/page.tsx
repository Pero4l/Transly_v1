"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Navigation, PackageCheck, Phone, CheckCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DriverDashboardPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDriverShipments = async () => {
    const token = localStorage.getItem("transly_token");
    const user = JSON.parse(localStorage.getItem("transly_user") || "null");
    if (!token || user?.role !== "driver") {
      router.push("/login");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:9400/shipments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setShipments(data.shipments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverShipments();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:9400/shipments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDriverShipments();
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center">Loading Routes...</div>;

  const activeShipments = shipments.filter(s => s.status === 'assigned' || s.status === 'picked_up' || s.status === 'in_transit');
  const pastShipments = shipments.filter(s => s.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Driver Portal</h1>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Navigation className="mr-2 h-5 w-5 text-orange-600" /> Active Routes
          </h2>
          
          {activeShipments.length === 0 ? (
            <Card className="bg-white border-dashed border-2 text-center py-12 shadow-sm">
              <p className="text-slate-500 font-medium">No active deliveries currently assigned.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeShipments.map(s => (
                <Card key={s.id} className="border-l-4 border-l-orange-500 shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{s.trackingNumber}</CardTitle>
                        {/* <CardDescription className="font-medium text-orange-600">Earnings: ${s.price}</CardDescription> */}
                      </div>
                      <Badge className="uppercase tracking-wide" variant="default">
                        {s.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pickup</p>
                          <p className="text-sm font-semibold">{s.origin}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-slate-200">
                        <Navigation className="h-5 w-5 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Dropoff</p>
                          <p className="text-sm font-semibold">{s.receiverAddress || s.destination}</p>
                          {s.receiverName && (
                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {s.receiverName} ({s.receiverPhone})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-800">Package:</span> {s.productType || 'Standard Package'}</p>
                      {s.description && <p className="italic text-slate-500 mt-1">"{s.description}"</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {s.status === 'assigned' && (
                         <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(s.id, 'picked_up')}>
                           <Package className="mr-2 h-4 w-4" /> Picked Up
                         </Button>
                      )}
                      {s.status === 'picked_up' && (
                         <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => updateStatus(s.id, 'in_transit')}>
                           <Navigation className="mr-2 h-4 w-4" /> Start Transit
                         </Button>
                      )}
                      {s.status === 'in_transit' && (
                         <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(s.id, 'delivered')}>
                           <PackageCheck className="mr-2 h-4 w-4" /> Mark Delivered
                         </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-emerald-600" /> Completed Deliveries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {pastShipments.map(s => (
               <Card key={s.id} className="opacity-75 blur-[0.3px] hover:blur-none hover:opacity-100 transition-all">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{s.trackingNumber}</p>
                      <p className="text-xs text-slate-500">{s.origin} → {s.destination}</p>
                    </div>
                    <Badge variant="success" className="text-emerald-700 border-emerald-200 bg-emerald-50">Delivered</Badge>
                  </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
