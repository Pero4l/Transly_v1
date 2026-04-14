"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { User, Mail, Phone, MapPin, Shield, Camera, Save, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { useSession } from "@/lib/sessionContext";

export default function ProfilePage() {
  const { user, token, loading: sessionLoading, refreshSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: ""
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (!sessionLoading) {
        if (!user) {
            window.location.href = "/login";
            return;
        }
        setFormData({
            phone: user.phone || "",
            address: user.address || ""
        });
        setLoading(false);
    }
  }, [sessionLoading, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", content: "" });

    try {
      // Optimistic Update
      const oldData = { ...user };
      setUserData(formData);

      const res = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      }, token);
      
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        // Final sync
        await refreshSession();
      } else {
        // Rollback on failure
        if (oldData) setUserData(oldData);
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Personal Profile</h1>
          <p className="text-slate-500">Manage your account information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-0 shadow-xl glass bg-white/50 overflow-hidden h-fit">
          <div className="h-24 bg-orange-600"></div>
          <CardContent className="pt-0 relative">
            <div className="flex flex-col items-center -mt-12">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative group">
                <User className="h-12 w-12" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="h-4 w-4 mr-3 text-orange-500" />
                  {user?.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Shield className="h-4 w-4 mr-3 text-orange-500" />
                  {/* ID: {user?.id.substring(0, 3)}... */}
                  Verified
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white rounded-2xl">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your contact information below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input value={user?.name} disabled className="bg-slate-50 text-slate-500 border-slate-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <Input value={user?.email} disabled className="bg-slate-50 text-slate-500 border-slate-100" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        id="phone"
                        className="pl-10"
                        placeholder="09012345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-slate-700">Home Address</label>
                   <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        id="address"
                        className="pl-10"
                        placeholder="123 Lagos St, Nigeria"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button disabled={saving} className="bg-slate-900 hover:bg-slate-800 h-11 px-8">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}