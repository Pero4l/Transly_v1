"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  PackagePlus,
  Box,
  Clock,
  ShieldAlert,
  Navigation,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShipmentDetails } from "@/components/shipments/ShipmentDetails";

export default function DashboardPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  const fetchShipments = async () => {
    const token = localStorage.getItem("transly_token");
    const savedUser = JSON.parse(localStorage.getItem("transly_user") || "{}");
    if (!token) {
      router.push("/login");
      return;
    }
    setUser(savedUser);
    if (savedUser.role === "admin") {
      router.push("/admin");
      return;
    }
    try {
      const res = await fetch("http://localhost:9400/shipments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setShipments(data.shipments);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [router]);

  const handleViewDetails = async (id: string) => {
    setActionLoading(true);
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:9400/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(true);
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:9400/shipments/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setShipments(
          shipments.map((s: any) => (s.id === id ? { ...s, status } : s)),
        );
        if (selectedShipment && selectedShipment.id === id) {
          setSelectedShipment({ ...selectedShipment, status });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10">
      <Navbar />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 w-full pt-10 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="text-orange-100 mt-1">
                {user?.role === "driver"
                  ? "Here are your assigned deliveries."
                  : "Here is the latest status of your network."}
              </p>
            </div>
            {user?.role === "customer" && (
              <Link href="/request">
                <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg rounded-xl">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  New Shipment
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-7xl -mt-10">
        {selectedShipment ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <Button
                variant="ghost"
                onClick={() => setSelectedShipment(null)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Back to List
              </Button>
              {user?.role === "driver" &&
                selectedShipment.status !== "delivered" && (
                  <div className="flex gap-2 text-white">
                    {selectedShipment.status === "assigned" && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() =>
                          updateStatus(selectedShipment.id, "picked_up")
                        }
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Pick Up"
                        )}
                      </Button>
                    )}
                    {selectedShipment.status === "picked_up" && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() =>
                          updateStatus(selectedShipment.id, "in_transit")
                        }
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "In Transit"
                        )}
                      </Button>
                    )}
                    {selectedShipment.status === "in_transit" && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        variant="outline"
                        className="border-emerald-500 text-emerald-600"
                        onClick={() =>
                          updateStatus(selectedShipment.id, "delivered")
                        }
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Deliver"
                        )}
                      </Button>
                    )}
                  </div>
                )}
            </div>
            <ShipmentDetails shipment={selectedShipment} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-md rounded-2xl glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    In Transit
                  </CardTitle>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {
                      shipments.filter((s: any) => s.status === "in_transit")
                        .length
                    }
                  </div>
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Currently moving
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-2xl glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Delivered
                  </CardTitle>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                    <Box className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {
                      shipments.filter((s: any) => s.status === "delivered")
                        .length
                    }
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Total delivered
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-600 to-orange-800 text-white relative overflow-hidden rounded-2xl">
                <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-orange-100 relative z-10">
                  <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white">
                    {shipments.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Active Shipments
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 min-h-[200px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/50 rounded-2xl border-2 border-dashed border-slate-100">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-3" />
                  <p className="text-slate-500 font-bold tracking-tight">
                    Loading...
                  </p>
                </div>
              ) : shipments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 font-medium">
                    No shipments found in your record.
                  </p>
                </div>
              ) : (
                shipments.map((shipment: any) => (
                  <Card
                    key={shipment.id}
                    className="border-0 shadow-sm rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleViewDetails(shipment.id)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {shipment.trackingNumber}
                        </CardTitle>
                        <Badge
                          variant={
                            shipment.status === "delivered"
                              ? "success"
                              : shipment.status === "in_transit"
                                ? "warning"
                                : "default"
                          }
                          className="md:hidden"
                        >
                          {shipment.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50/50 rounded-xl p-3 border-2 border-slate-100">
                        <div className="font-semibold text-slate-800">
                          {shipment.origin}
                        </div>
                        <Navigation className="h-4 w-4 text-orange-500 mx-3 flex-shrink-0" />
                        <div className="font-semibold text-slate-800">
                          {shipment.destination}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 justify-center pl-6">
                      <Badge
                        variant={
                          shipment.status === "delivered"
                            ? "success"
                            : shipment.status === "in_transit"
                              ? "warning"
                              : "default"
                        }
                        className="hidden md:inline-flex mb-2 px-3 py-1 text-sm shadow-sm"
                      >
                        {shipment.status.replace("_", " ").toUpperCase()}
                      </Badge>

                      <div className="flex items-center text-orange-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            View Details <Eye className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
