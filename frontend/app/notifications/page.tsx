"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCircle2, Info, AlertTriangle, Loader2, Check } from "lucide-react";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";

const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { user, token, loading: sessionLoading } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!sessionLoading && token) {
      fetchNotifications();
    }
    if (!sessionLoading && !user) {
        window.location.href = "/login";
    }
  }, [sessionLoading, token, user]);

  const fetchNotifications = async () => {
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

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await apiFetch("/notifications/read-all", {
        method: "PUT",
      }, token);
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
        // Optimistic
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        await apiFetch(`/notifications/${id}/read`, { method: "PUT" }, token);
    } catch (err) {
        console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        <p className="text-slate-500 animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-orange-600" />
              Notifications
            </h1>
            <p className="text-slate-500 mt-2">Personal alerts and system updates for your account.</p>
          </div>
          {notifications.some(n => !n.read) && (
            <Button 
                onClick={markAllRead} 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={markingAll}
            >
                {markingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-2xl p-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Notifications</h3>
              <p className="text-slate-500">You're all caught up! New updates will appear here.</p>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card 
                key={n.id} 
                className={`border-0 shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md cursor-pointer ${!n.read ? 'bg-white border-l-4 border-l-orange-500' : 'bg-white opacity-80'}`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider px-2 py-0 border border-slate-200">
                        {n.type || 'System'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(n.createdAt))}
                      </span>
                    </div>
                    <p className={`text-sm md:text-md ${!n.read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="h-2 w-2 bg-orange-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
