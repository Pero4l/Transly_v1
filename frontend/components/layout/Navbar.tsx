"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, User, Menu, Bell, Check, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, PackageSearch, Users, MessageCircle, Truck, Send, Loader2 } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";
import Image from "next/image";


export function Navbar() {
  const { user, token, logout } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      apiFetch("/notifications", {}, token)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.notifications);
          }
        })
        .catch(console.error);

      // Socket for real-time notifications
      if (user) {
        const socket = getSocket();
        socket.emit("join_personal_room", user.id);

        socket.on("new_message_notification", (data) => {
          setNotifications(prev => [
            {
              id: `chat-${Date.now()}`,
              message: `New message from ${data.senderName || 'Support'}: ${data.text.substring(0, 30)}...`,
              read: false,
              createdAt: new Date().toISOString(),
              type: 'info'
            },
            ...prev
          ]);
        });

        socket.on("notification", (data) => {
          setNotifications(prev => [
            {
              id: `notif-${Date.now()}`,
              message: data.message,
              read: false,
              createdAt: data.createdAt || new Date().toISOString(),
              type: data.type || 'info'
            },
            ...prev
          ]);
        });

        socket.on("admin_notification", (data) => {
          if (user.role === 'admin') {
            setNotifications(prev => [
              {
                id: `admin-${Date.now()}`,
                message: `[ADMIN] ${data.message}`,
                read: false,
                createdAt: new Date().toISOString(),
                type: 'warning'
              },
              ...prev
            ]);
          }
        });

        return () => {
          socket.off("new_message_notification");
          socket.off("notification");
          socket.off("admin_notification");
        };
      }
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const res = await apiFetch("/notifications/read-all", {
        method: "PUT",
      }, token);
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) { console.error(err); }
  };


  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.jpeg" alt="Transly Logo" width={120} height={40} className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden lg:flex items-center space-x-4">
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
            <Link href="/food" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Food
            </Link>
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
              className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
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
                <div className="absolute left-[-180px] md:left-auto md:right-0 mt-2 w-72 md:w-80 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[100]">

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
                          <p className="text-slate-800 font-medium">{n.message}</p>
                          <span className="text-xs text-slate-500 mt-1 block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <Link href={user.role === 'admin' ? "/admin/notifications" : "/notifications"} onClick={() => setShowNotifications(false)} className="block text-center text-xs text-orange-600 font-bold hover:underline py-1">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {!user ? (
            <Link href="/login">
              <Button size="sm" className="hidden md:flex bg-slate-900 text-white font-bold px-6">
                Sign In
              </Button>
            </Link>

          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href={user.role === 'driver' ? '/driver' : '/profile'}>
                <Button size="sm" className="rounded-lg bg-slate-900 hover:bg-slate-800 border-none px-4">
                  <User className="h-4 w-4 mr-2 text-white" />
                  Profile
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={logout} className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 px-4">
                Logout
              </Button>


            </div>
          )}

          {user && (
            <Button onClick={toggleMenu} variant="ghost" size="icon" className="lg:hidden">
              {!mobileMenuOpen ? <Menu className="h-5 w-5 text-black" /> : <X className="h-5 w-5 text-orange-700" />}
            </Button>
          )}


        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1 px-4 pt-4 pb-6">
            <Link href={user?.role === 'admin' ? "/admin" : "/dashboard"} onClick={toggleMenu} className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <LayoutDashboard className="h-5 w-5 mr-3 text-slate-400" />
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
            </Link>

            <Link href={user?.role === 'driver' ? '/driver' : '/profile'} onClick={toggleMenu} className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <User className="h-5 w-5 mr-3 text-slate-400" />
              {user?.role === 'driver' ? 'Driver Portal' : 'Profile Settings'}
            </Link>

            {user?.role !== 'admin' && user?.role !== 'driver' && (
              <Link href="/request" onClick={toggleMenu} className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
                <Send className="h-5 w-5 mr-3 text-slate-400" />
                Send Package
              </Link>
            )}

            <Link href="/tracking" onClick={toggleMenu} className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <PackageSearch className="h-5 w-5 mr-3 text-slate-400" />
              Track Package
            </Link>

            <Link href="/food" onClick={toggleMenu} className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <Utensils className="h-5 w-5 mr-3 text-slate-400" />
              Order Food
            </Link>

            <Link href="/chat" onClick={toggleMenu} className="flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3 text-slate-400" />
                Support Chat
              </div>
              {/* Optional message counter logic could be injected here */}
            </Link>

            <Link href={user?.role === 'admin' ? '/admin/notifications' : '/notifications'} onClick={toggleMenu} className="flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-3 text-slate-400" />
                Notifications
              </div>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </Link>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button 
                onClick={() => { logout(); toggleMenu(); }}
                className="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <X className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </nav>
  );
}
