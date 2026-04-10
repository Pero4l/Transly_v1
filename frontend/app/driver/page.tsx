"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Navigation, MapPin, Truck, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DriverDashboardPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchShipments = async () => {
      const token = localStorage.getItem("transly_token");
      const savedUser = JSON.parse(localStorage.getItem("transly_user") || "{}");
      if (!token) {
        router.push("/login");
        return;
      }
      
      if(savedUser.role !== 'driver') {
        router.push('/dashboard');
        return;
      }
      setUser(savedUser);

      try {
        const res = await fetch("http://localhost:5000/api/shipments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setShipments(data.shipments);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchShipments();
  }, [router]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:5000/api/shipments/${id}/status`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setShipments(shipments.map(s => s.id === id ? { ...s, status } : s));
      }
    } catch(err) {
      console.error(err);
    }
  }

  const activeDeliveries = shipments.filter(s => s.status === 'assigned' || s.status === 'picked_up' || s.status === 'in_transit');
  const completedDeliveries = shipments.filter(s => s.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10">
      <Navbar />
      
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 w-full pt-10 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-white">
            <h1 className="text-3xl font-bold tracking-tight">Driver Portal</h1>
            <p className="text-slate-400 mt-1">Manage your active routes and earnings.</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-5xl -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <Card className="border-0 shadow-md rounded-2xl glass">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Route</CardTitle>
               <div className="p-2 bg-blue-100/50 text-blue-600 rounded-xl">
                 <Truck className="h-5 w-5" />
               </div>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold text-slate-900">{activeDeliveries.length}</div>
               <p className="text-xs text-blue-600 font-medium mt-1">Pending action</p>
             </CardContent>
           </Card>

           <Card className="border-0 shadow-md rounded-2xl glass">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</CardTitle>
               <div className="p-2 bg-emerald-100/50 text-emerald-600 rounded-xl">
                 <CheckCircle className="h-5 w-5" />
               </div>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold text-slate-900">{completedDeliveries.length}</div>
               <p className="text-xs text-emerald-600 font-medium mt-1">Total delivered</p>
             </CardContent>
           </Card>

           <Card className="border-0 shadow-md rounded-2xl glass">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Earnings</CardTitle>
               <div className="p-2 bg-orange-100/50 text-orange-600 rounded-xl">
                 <Navigation className="h-5 w-5" />
               </div>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold text-slate-900">
                  ${completedDeliveries.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0).toFixed(2)}
               </div>
               <p className="text-xs text-orange-600 font-medium mt-1">Current payout</p>
             </CardContent>
           </Card>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">Current Assignments</h2>
        
        <div className="space-y-4">
          {activeDeliveries.length === 0 && <p className="text-slate-500 text-center py-10 bg-white rounded-2xl border border-slate-100">No active assignments. Chill out.</p>}
          
          {activeDeliveries.map(shipment => (
            <Card key={shipment.id} className="border-0 shadow-sm rounded-2xl flex flex-col md:flex-row justify-between gap-4 p-5 hover:border-orange-500 hover:ring-1 hover:ring-orange-500 transition-all">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <CardTitle className="text-lg font-bold text-slate-900">{shipment.trackingNumber}</CardTitle>
                  <Badge variant={shipment.status === 'in_transit' ? 'warning' : 'default'} className="md:hidden">
                    {shipment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                  <div className="font-medium text-slate-800">{shipment.origin}</div>
                  <Navigation className="h-4 w-4 text-orange-500 mx-3 flex-shrink-0" />
                  <div className="font-medium text-slate-800">{shipment.destination}</div>
                </div>

                <div className="text-sm font-medium text-slate-700 bg-orange-50 inline-flex px-3 py-1 rounded-md text-orange-600 border border-orange-100">
                  Total Distance: {shipment.distance} miles | Price: ${shipment.price}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 justify-center pl-6 border-l border-slate-100">
                <Badge variant={shipment.status === 'in_transit' ? 'warning' : 'default'} className="hidden md:inline-flex mb-2 px-3 py-1 text-sm">
                  {shipment.status.replace('_', ' ').toUpperCase()}
                </Badge>
                
                <div className="flex gap-2">
                  {shipment.status === 'assigned' && <Button className="bg-slate-800 hover:bg-slate-900 rounded-xl" onClick={() => updateStatus(shipment.id, 'picked_up')}>Pick Up</Button>}
                  {shipment.status === 'picked_up' && <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={() => updateStatus(shipment.id, 'in_transit')}>In Transit</Button>}
                  {shipment.status === 'in_transit' && <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={() => updateStatus(shipment.id, 'delivered')}>Mark Delivered</Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
