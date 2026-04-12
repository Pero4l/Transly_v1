"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Download, Filter, Search, X, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ShipmentDetails } from "@/components/shipments/ShipmentDetails";

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchShipments = async () => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("http://localhost:9400/admin/shipments", {
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
    fetchShipments();
  }, []);

  const handleViewDetails = async (id: string) => {
    setActionLoading(true);
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:9400/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedShipment(data.shipment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s: any) => 
    s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Shipments</h1>
          <p className="text-sm text-slate-500">View and assign all active, pending, and completed deliveries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2"/> Filter</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2"/> Export</Button>
        </div>
      </div>

      {selectedShipment ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setSelectedShipment(null)} className="flex items-center gap-2">
              <X className="h-4 w-4" /> Back to List
            </Button>
            <div className="flex gap-2">
               <Button variant="outline" size="sm">Edit Shipment</Button>
               <Button size="sm">Assign Driver</Button>
            </div>
          </div>
          <ShipmentDetails shipment={selectedShipment} />
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="py-4 border-b">
            <div className="flex justify-between items-center w-full">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  className="pl-9 bg-slate-50 border-transparent focus:bg-white" 
                  placeholder="Search by Tracking ID or Status..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto min-h-[400px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center p-20">
                    <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tracking ID</th>
                      <th className="px-6 py-4 font-medium">Route</th>
                      <th className="px-6 py-4 font-medium">Driver</th>
                      <th className="px-6 py-4 font-medium text-right">Status</th>
                      <th className="px-6 py-4 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">No shipments found matching your search.</td></tr>
                    ) : (
                      filteredShipments.map((req: any, i: number) => (
                        <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 tracking-tight">{req.trackingNumber}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{req.origin} → {req.destination}</td>
                          <td className="px-6 py-4 text-slate-500">{req.driverId ? 'Assigned' : 'Unassigned'}</td>
                          <td className="px-6 py-4 text-right">
                            <Badge 
                              variant={req.status === 'delivered' ? 'success' : req.status === 'in_transit' ? 'warning' : 'default'}
                            >
                              {req.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={actionLoading}
                              className="h-8 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold flex items-center gap-1 mx-auto transition-all"
                              onClick={() => handleViewDetails(req.id)}
                            >
                              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-4 w-4" />}
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
