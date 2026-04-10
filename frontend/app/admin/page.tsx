"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, Truck, Package, Activity, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("transly_token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      try {
        const [shipRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/shipments", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const shipData = await shipRes.json();
        const userData = await userRes.json();

        if (shipData.success && userData.success) {
          setShipments(shipData.shipments);
          setUsers(userData.users);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const drivers = users.filter((u: any) => u.role === "driver");

  const assignDriver = async (shipmentId: number, driverId: string) => {
    if(!driverId) return;
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/assign-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipmentId, driverId })
      });
      if (res.ok) {
        setShipments(shipments.map((s: any) => s.id === shipmentId ? { ...s, driverId, status: "assigned" } : s));
      }
    } catch(err) {}
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Super Admin Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor shipments, users, and logistics in real-time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm rounded-2xl glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center justify-center p-3 bg-blue-100/50 rounded-xl text-blue-600 border border-blue-200/50">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-500">Active Deliveries</p>
                  <h3 className="text-2xl font-bold text-slate-900">{shipments.filter((s:any) => s.status !== 'delivered').length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm rounded-2xl glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center justify-center p-3 bg-emerald-100/50 rounded-xl text-emerald-600 border border-emerald-200/50">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-500">Platform Users</p>
                  <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center justify-center p-3 bg-amber-100/50 rounded-xl text-amber-600 border border-amber-200/50">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-500">Total Lifetime</p>
                  <h3 className="text-2xl font-bold text-slate-900">{shipments.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-2xl glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center justify-center p-3 bg-purple-100/50 rounded-xl text-purple-600 border border-purple-200/50">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-500">Est. Revenue</p>
                  <h3 className="text-2xl font-bold text-slate-900">${shipments.reduce((acc: number, s: any) => acc + (parseFloat(s.price) || 0), 0).toFixed(2)}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm rounded-2xl glass">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Latest delivery requests from customers that need attention.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Tracking</th>
                      <th className="px-6 py-3 font-medium">Route</th>
                      <th className="px-6 py-3 font-medium">Status / Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((req: any) => (
                      <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{req.trackingNumber}</td>
                        <td className="px-6 py-4 text-slate-500">{req.origin} → {req.destination}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <Badge 
                            variant={
                              req.status === 'delivered' ? 'success' : 
                              req.status === 'in_transit' ? 'info' : 
                              req.status === 'assigned' ? 'warning' : 'default'
                            }
                          >
                            {req.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {req.status === 'pending' && (
                            <select 
                              className="text-xs border rounded p-1"
                              onChange={(e) => assignDriver(req.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Assign Driver</option>
                              {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                    {shipments.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-slate-500">No shipments found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Admin Actions</CardTitle>
              <CardDescription className="text-white/80">Quick shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center font-medium text-left">
                <Truck className="h-5 w-5 mr-3 opacity-80" /> Manage Fleet ({drivers.length} Drivers)
              </button>
              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center font-medium text-left">
                <DollarSign className="h-5 w-5 mr-3 opacity-80" /> Edit Pricing Matrix
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
