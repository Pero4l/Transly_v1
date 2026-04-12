"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        alert("Settings updated successfully");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500">Configure global platform behavior.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Pricing Model</CardTitle>
          <CardDescription>Configure the base rates for parcel deliveries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Base Fare ($)</label>
               <Input defaultValue="15.00" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Per Mile Rate ($)</label>
               <Input defaultValue="1.25" />
             </div>
          </div>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Update Pricing
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible and critical system actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Clear System Global Cache</Button>
        </CardContent>
      </Card>
    </div>
  );
}
