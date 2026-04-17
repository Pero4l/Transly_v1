"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Activity, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/sessionContext";
import { toast } from "sonner";

export default function AdminBroadcastPage() {
  const { user, token, loading: sessionLoading } = useSession();
  const router = useRouter();

  const [broadcastData, setBroadcastData] = useState({ subject: '', messageBody: '' });
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    if (!sessionLoading) {
        if (!user || user.role !== 'admin') {
            router.push("/dashboard");
        }
    }
  }, [sessionLoading, user, router]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setBroadcastLoading(true);
    try {
      const res = await fetch("https://transly-wr1m.onrender.com/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(broadcastData)
      });
      const data = await res.json();
      if(data.success) {
        toast.success("Broadcast dispatched to network successfully!");
        setBroadcastData({ subject: '', messageBody: '' });
      } else toast.error(data.error);
    } catch(err) { toast.error("Error sending global broadcast."); }
    setBroadcastLoading(false);
  };

  if (sessionLoading) return (
    <div className="min-h-[400px] flex items-center justify-center p-10"><Loader2 className="h-10 w-10 animate-spin text-orange-600" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
            <Mail className="h-8 w-8 mr-3 text-orange-600" /> Global Dispatch Broadcast
        </h1>
        <p className="text-sm text-slate-500 mt-1">Send a synchronized, critical mass email to every registered user and driver natively.</p>
      </div>

      <Card className="border-orange-500 ring-1 ring-orange-500/20 shadow-xl glass overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-orange-900 flex items-center text-xl">
             <Activity className="mr-2 h-6 w-6 text-orange-600" /> Compose Broadcast
          </CardTitle>
          <CardDescription>Messages will be instantly queued to all active emails in the Transly network. Use responsibly.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 relative z-10">
          <form onSubmit={handleBroadcast} className="flex flex-col gap-6">
             <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Subject Line</label>
                <Input 
                  placeholder="Important System Update..." 
                  required 
                  value={broadcastData.subject} 
                  onChange={e => setBroadcastData({...broadcastData, subject: e.target.value})} 
                  className="h-12 text-lg shadow-sm" 
                />
             </div>
             <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Message Content</label>
                <textarea 
                  required 
                  value={broadcastData.messageBody} 
                  onChange={e => setBroadcastData({...broadcastData, messageBody: e.target.value})} 
                  className="w-full flex min-h-[200px] rounded-xl border border-slate-200 bg-white px-4 py-4 text-base ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-all shadow-sm resize-y leading-relaxed" 
                  placeholder="Type your official full email message transmission here..."
                ></textarea>
             </div>
             <div className="flex justify-end mt-4 pt-6 border-t border-slate-100">
               <Button type="submit" disabled={broadcastLoading} className="bg-orange-600 hover:bg-orange-700 font-bold px-10 h-14 text-base rounded-xl shadow-lg shadow-orange-600/20">
                 {broadcastLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Mail className="h-5 w-5 mr-2" />}
                 {broadcastLoading ? "DISPATCHING TO NETWORK..." : "AUTHORIZE & SEND GLOBAL BROADCAST"}
               </Button>
             </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
