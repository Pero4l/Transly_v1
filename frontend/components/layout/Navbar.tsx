"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, User, Menu, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("transly_token");
    const savedUser = JSON.parse(localStorage.getItem("transly_user") || "null");
    
    if (savedUser) {
      setUser(savedUser);
    }

    if (token) {
      fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      })
      .catch(console.error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch(err) { console.error(err); }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-orange-600 font-bold text-xl">
            <Package className="h-6 w-6" />
            <span>Transly</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'driver' && (
              <Link href="/driver" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
                Driver Portal
              </Link>
            )}
            {user?.role !== 'driver' && (
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/tracking" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Track Package
            </Link>
            {user?.role !== 'driver' && user?.role !== 'admin' && (
              <Link href="/request" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
                Send Package
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tracking number..."
              className="h-9 w-64 rounded-full border border-slate-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
            />
          </div>
          
          {user && (
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-orange-600 hover:underline flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 10).map((n: any) => (
                        <div key={n.id} className={`p-3 border-b border-slate-50 text-sm ${n.read ? 'opacity-60 bg-white' : 'bg-orange-50/50'}`}>
                          <p className="text-slate-800">{n.message}</p>
                          <span className="text-xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!user ? (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex text-orange-600 font-semibold hover:bg-orange-50">
                Sign In
              </Button>
            </Link>
          ) : (
             <Link href={user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/dashboard'}>
               <Button size="sm" className="hidden md:flex rounded-full bg-slate-800 hover:bg-slate-900 border-none px-4">
                 <User className="h-4 w-4 mr-2 text-orange-400" />
                 {user.name.split(' ')[0]}
               </Button>
             </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
             <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
