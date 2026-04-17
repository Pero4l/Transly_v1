"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Package, User, Phone, Mail, Calendar, Navigation, Banknote, Box, Truck, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { useSession } from "@/lib/sessionContext";
import { toast } from "sonner";

interface ShipmentDetailsProps {
  shipment: any;
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);

  const handleLatePayment = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://transly-wr1m.onrender.com/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipmentId: shipment.id })
      });
      const data = await res.json();
      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error || "Payment gateway offline.");
      }
    } catch(err) {
      toast.error("Failed to trigger payment portal.");
    } finally {
      setLoading(false);
    }
  };

  if (!shipment) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Shipment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-sm text-slate-500">Tracking Number</span>
              <span className="font-bold text-slate-900">{shipment.trackingNumber}</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-sm text-slate-500">Status</span>
              <Badge 
                variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'in_transit' ? 'warning' : 'default'}
                className="uppercase py-1"
              >
                {shipment.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-sm text-slate-500">Product Type</span>
              <span className="font-medium text-slate-800">{shipment.productType || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-sm text-slate-500">Price</span>
              <span className="font-bold text-orange-600 flex items-center">
                <span className="text-xs mr-0.5">₦</span>
                {parseFloat(shipment.price).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-1">
              <span className="text-sm text-slate-500">Payment Status</span>
              <Badge 
                variant={shipment.paymentStatus === 'paid' ? 'success' : 'outline'}
                className="uppercase py-1"
              >
                {shipment.paymentStatus || 'pending'}
              </Badge>
            </div>
            {shipment.description && (
              <div className="pt-2">
                <span className="text-sm text-slate-500 block mb-1">Description</span>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                  "{shipment.description}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Action for Customers */}
        {(!shipment.paymentStatus || shipment.paymentStatus === 'pending') ? (
             <Card className="border-0 shadow-lg bg-orange-600 text-white overflow-hidden relative md:col-span-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center gap-2 relative z-10 text-center">
                    <CreditCard className="h-8 w-8 text-white mb-2" />
                    <h3 className="text-xl font-bold text-white">Payment Outstanding</h3>
                    <p className="text-orange-400 text-sm mb-3">Please complete the payment to guarantee dispatch assignment for this shipment.</p>
                    <Button 
                      onClick={handleLatePayment} 
                      disabled={loading}
                      className="bg-white text-orange-600 hover:bg-slate-50 font-black shadow-xl uppercase"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {loading ? "Initializing Payment Gateway..." : "Pay Now"}
                    </Button>
                </CardContent>
             </Card>
        ) : null}

        {/* Parties Info */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* Customer */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <div className="h-1 w-1 bg-orange-500 rounded-full" /> Sender
              </h4>
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{shipment.customer?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" /> {shipment.customer?.email}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {shipment.customer?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <div className="h-1 w-1 bg-blue-500 rounded-full" /> Receiver
              </h4>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{shipment.receiverName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {shipment.receiverPhone}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {shipment.receiverAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver */}
            {shipment.driver && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full" /> Driver
                </h4>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{shipment.driver.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {shipment.driver.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Route Info */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Navigation className="h-4 w-4 text-orange-500" />
            Route & Logistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Pick Up</p>
                  <p className="text-sm font-bold text-slate-900">{shipment.origin}</p>
                </div>
              </div>
              
              <div className="flex items-center px-4 w-full md:w-32">
                <div className="h-[2px] bg-slate-200 w-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-slate-200">
                    <Truck className="h-3 w-3 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Drop Off</p>
                  <p className="text-sm font-bold text-slate-900">{shipment.destination}</p>
                </div>
                <div className="p-2 bg-orange-600 rounded-lg shadow-sm text-white">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Distance</p>
                    <p className="text-sm font-bold text-slate-900">{shipment.distance} km</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Time</p>
                  <p className="text-sm font-bold text-slate-900">Calculated on pick-up</p>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


