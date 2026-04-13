"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    BASE_FARE: "1500",
    PRICE_PER_MILE: "500"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("https://transly-wr1m.onrender.com/admin/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettings({
          BASE_FARE: data.settings.BASE_FARE || "1500",
          PRICE_PER_MILE: data.settings.PRICE_PER_MILE || "500"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setLoading(true);
    const token = localStorage.getItem("transly_token");
    try {
        const res = await fetch("https://transly-wr1m.onrender.com/admin/settings", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ key, value })
        });
        if (res.ok) {
            alert(`${key.replace('_', ' ')} updated successfully`);
        }
    } catch (err) {
        alert("Failed to update settings");
    } finally {
        setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500">Configure global platform behavior.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Pricing Model</CardTitle>
          <CardDescription>Configure the base rates for parcel deliveries (Current Currency: ₦).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Base Fare (₦)</label>
               <div className="flex gap-2">
                <Input 
                    value={settings.BASE_FARE} 
                    onChange={(e) => setSettings({...settings, BASE_FARE: e.target.value})}
                    placeholder="1500"
                />
                <Button size="sm" onClick={() => handleUpdate('BASE_FARE', settings.BASE_FARE)} disabled={loading}>
                    <Save className="h-4 w-4" />
                </Button>
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Per Mile Rate (₦)</label>
               <div className="flex gap-2">
                <Input 
                    value={settings.PRICE_PER_MILE}
                    onChange={(e) => setSettings({...settings, PRICE_PER_MILE: e.target.value})}
                    placeholder="500"
                />
                <Button size="sm" onClick={() => handleUpdate('PRICE_PER_MILE', settings.PRICE_PER_MILE)} disabled={loading}>
                    <Save className="h-4 w-4" />
                </Button>
               </div>
             </div>
          </div>
          <p className="text-xs text-slate-400 italic">Example: A 10 mile delivery will cost ₦{parseInt(settings.BASE_FARE) + (10 * parseInt(settings.PRICE_PER_MILE))}</p>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600 text-md">Danger Zone</CardTitle>
          <CardDescription>Irreversible and critical system actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-sm">Clear System Global Cache</Button>
        </CardContent>
      </Card>
    </div>
  );
}
