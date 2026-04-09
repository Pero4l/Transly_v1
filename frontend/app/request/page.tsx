import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MapPin, User, Package, Calendar } from "lucide-react";
import Link from "next/link";

export default function RequestPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Shipment</h1>
          <p className="text-slate-500">Fill in the details below to arrange a secure delivery for your package.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" /> Origin Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Sender Name</label>
                  <Input placeholder="E.g. Jane Doe" defaultValue="Jane Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Pickup Address</label>
                  <Input placeholder="E.g. 123 Main St, New York, NY" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Time</label>
                    <Input type="time" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-emerald-500" /> Destination Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Recipient Name</label>
                  <Input placeholder="E.g. John Smith" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Address</label>
                  <Input placeholder="E.g. 456 Market St, San Francisco, CA" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Recipient Phone</label>
                  <Input type="tel" placeholder="(555) 123-4567" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm lg:sticky lg:top-24">
              <CardHeader className="border-b border-slate-100 pb-4 mb-4">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-violet-500" /> Package Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Package Type</label>
                  <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600">
                    <option>Standard Box</option>
                    <option>Document</option>
                    <option>Pallet</option>
                    <option>Fragile/Oversized</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Weight (kg)</label>
                    <Input type="number" placeholder="0.0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Dimensions (cm)</label>
                    <Input placeholder="L x W x H" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Special Instructions</label>
                  <textarea 
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                    placeholder="E.g. Handle with care, leave at back door..."
                  />
                </div>
                
                <div className="pt-4 mt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">Estimated Cost</span>
                    <span className="text-2xl font-bold text-slate-900">$45.00</span>
                  </div>
                  <Link href="/dashboard" className="block w-full">
                    <Button className="w-full h-12 text-md">Confirm & Pay</Button>
                  </Link>
                  <p className="text-xs text-center text-slate-500 mt-3">By confirming, you agree to our Terms of Service & Privacy Policy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
