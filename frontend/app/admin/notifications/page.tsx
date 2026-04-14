"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";
import { Bell, Check, Clock, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminNotificationsPage() {
  const { user, token, loading: sessionLoading } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/notifications", {}, token);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading && user?.role === 'admin') {
      fetchNotifications();
    }
  }, [sessionLoading, user]);

  const markAllRead = async () => {
    try {
      const res = await apiFetch("/notifications/read-all", { method: "PUT" }, token);
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (sessionLoading || loading) return <div className="p-10 text-center">Loading notifications...</div>;
  if (user?.role !== 'admin') return <div className="p-10 text-center text-red-500">Access Denied</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications Center</h1>
          <p className="text-slate-500">Manage all administrative updates and alerts.</p>
        </div>
        <Button onClick={markAllRead} variant="outline" className="rounded-full border-orange-200 text-orange-600">
           <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
             <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
             <p>No notifications yet.</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className={`border-l-4 transition-all ${n.read ? 'border-l-slate-200 opacity-75' : 'border-l-orange-500 shadow-md bg-orange-50/10'}`}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg ${
                  n.type === 'warning' ? 'bg-red-100 text-red-600' : 
                  n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-orange-100 text-orange-600'
                }`}>
                  {n.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
                   n.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : 
                   <Info className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.message}</p>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!n.read && <span className="inline-block h-2 w-2 bg-orange-500 rounded-full"></span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
