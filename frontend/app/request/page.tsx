"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, User, Package, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestPage() {
  const [formData, setFormData] = useState({
    origin: "", destination: "", description: "", productType: "", 
    receiverName: "", receiverPhone: "", receiverAddress: ""
  });
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({ BASE_FARE: 1500, PRICE_PER_MILE: 500 });
  const router = useRouter();

  // Simple pseudo location distance mock
  const [distance] = useState(Math.floor(Math.random() * 50) + 10);

  useEffect(() => {
    const token = localStorage.getItem("transly_token");
    const user = JSON.parse(localStorage.getItem("transly_user") || "null");
    if (!token) {
      router.push("/login");
    } else if (!user?.phone || !user?.address) {
      router.push("/onboarding");
    }

    fetchRates();
  }, [router]);

  const fetchRates = async () => {
    try {
        const res = await fetch("http://localhost:9400/admin/settings", {
            headers: { Authorization: `Bearer ${localStorage.getItem("transly_token")}` }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("transly_token");
    
    try {
      const res = await fetch("http://localhost:9400/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, distance }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create request");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">Create New Shipment</h1>
          <p className="text-slate-500">Fast, reliable logistics directly to your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-2xl glass">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" /> Dispatch Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Pickup Location (Origin)</label>
                  <Input name="origin" placeholder="Enter full pickup address" value={formData.origin} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Destination City</label>
                  <Input name="destination" placeholder="Enter destination city/region" value={formData.destination} onChange={handleChange} required />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl glass">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-500" /> Package Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Product Type</label>
                  <Input name="productType" placeholder="e.g. Electronics, Documents, Fragile" value={formData.productType} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                  <Input name="description" placeholder="Brief details about the package" value={formData.description} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-2xl glass">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-500" /> Receiver Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Receiver Name</label>
                  <Input name="receiverName" placeholder="Full name of receiver" value={formData.receiverName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Receiver Phone Number</label>
                  <Input name="receiverPhone" placeholder="Contact number" value={formData.receiverPhone} onChange={handleChange} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Precise Delivery Address</label>
                  <Input name="receiverAddress" placeholder="Exact dropoff location" value={formData.receiverAddress} onChange={handleChange} required />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl bg-slate-900 text-white lg:sticky lg:top-24 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <CardHeader className="border-b border-white/10 pb-4 mb-4 relative z-10">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-500" /> Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-slate-300 text-sm">
                    <span>Estimated Distance:</span>
                    <span className="font-bold text-white">{distance} Mi</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-300 text-sm">Total Delivery Fee:</span>
                    <span className="text-2xl font-black text-orange-500">₦{calculatedPrice.toLocaleString()}</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-2 italic leading-tight">Base rate and mileage fees apply. Final price may vary slightly based on actual dispatch logistics.</p>
                <div className="pt-4 mt-6 border-t border-white/10">
                  <Button className="w-full h-12 text-md rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-950/20 hover:-translate-y-0.5 transition-transform font-bold border-0" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    {loading ? "Processing..." : "Confirm & Create Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
