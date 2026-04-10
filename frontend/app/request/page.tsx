"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, User, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simple pseudo location mock
  const distance = Math.floor(Math.random() * 50) + 10;

  useEffect(() => {
    if (!localStorage.getItem("transly_token")) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("transly_token");
    
    try {
      const res = await fetch("http://localhost:5000/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ origin, destination, distance }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to create request");
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Shipment</h1>
          <p className="text-slate-500">Fast, reliable logistics directly to your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-2xl glass">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" /> Origin Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Pickup Address</label>
                  <Input 
                    placeholder="Enter full address or city" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl glass">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-500" /> Destination Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Address</label>
                  <Input 
                    placeholder="Enter full destination address" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-2xl glass lg:sticky lg:top-24">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-violet-500" /> Confirm & Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-500 text-sm mb-4">Pricing is automatically estimated based on the distance between the origin and destination using the platform's standardized rate.</p>
                <div className="pt-4 mt-6 border-t border-slate-100">
                  <Button className="w-full h-12 text-md rounded-xl" type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Create Request"}
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
