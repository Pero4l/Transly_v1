"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("transly_user") || "null");
    if(!user) {
      router.push("/login");
    } else if (user.phone && user.address) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("http://localhost:9400/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone, address })
      });
      const data = await res.json();
      if(data.success) {
        const user = JSON.parse(localStorage.getItem("transly_user") || "{}");
        localStorage.setItem("transly_user", JSON.stringify({...user, ...data.user}));
        window.location.href = "/request";
      } else {
        alert(data.error);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden rounded-2xl glass bg-white">
        <div className="bg-orange-500 h-2 w-full"></div>
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Nearly there!</CardTitle>
          <CardDescription className="text-slate-600 font-medium text-md mt-2">
            Please complete your profile details before continuing to the platform. We need this information for logistics routing.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Phone Number</label>
              <Input 
                placeholder="+1 234 567 8900" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                className="h-12 bg-slate-50 border-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Primary Address</label>
              <Input 
                placeholder="Full Home or Business Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                className="h-12 bg-slate-50 border-slate-200"
              />
            </div>
            <Button type="submit" className="w-full h-12 shadow-lg mt-4 shadow-orange-500/20 hover:-translate-y-0.5 transition-transform" disabled={loading}>
              {loading ? "Validating..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
