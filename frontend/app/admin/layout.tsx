"use client"
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, PackageSearch, Users, MessageCircle, Truck, Settings, LogOut, Bell, Check, User, Menu, X, Mail, Utensils } from "lucide-react";
import { useSession } from "@/lib/sessionContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, loading: sessionLoading, logout: sessionLogout } = useSession();
  const router = useRouter();
  const [menu, setMenu] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!sessionLoading) {
        if (!user || user.role !== 'admin') {
            router.push("/dashboard");
            return;
        }
        
        if (token) {
          fetch("https://transly-wr1m.onrender.com/notifications", {
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
    }
  }, [sessionLoading, user, token, router]);

  const allUnread = notifications.filter(n => !n.read);
  const unreadMessageCount = allUnread.filter(n => n.message.toLowerCase().includes('message')).length;
  const unreadCount = allUnread.length - unreadMessageCount;

  const markAllAsRead = async () => {
    try {
      const res = await fetch("https://transly-wr1m.onrender.com/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch(err) { console.error(err); }
  };

  function isMenu(){
    setMenu(!menu)
  }
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">


        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-white">
          <div className="font-bold text-orange-600 flex items-center">
            <span className="mr-2">Transly Admin</span>
          </div>

          <div className="flex gap-2">
            <Link href="/admin/chat">
              <Button variant="ghost" size="icon" className="relative group">
                <MessageCircle className="h-5 w-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                {unreadMessageCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold ring-2 ring-white">
                    {unreadMessageCount}
                  </span>
                )}
              </Button>
            </Link>
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative group" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute -left-53 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-orange-600 font-semibold hover:text-orange-700 transition-colors flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                         <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                         <p className="text-sm text-slate-500 font-medium">No system notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n: any) => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-default ${n.read ? 'opacity-60' : 'bg-orange-50/30'}`}>
                          <div className="flex gap-3">
                             <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-orange-600' : 'bg-transparent'}`} />
                             <div>
                                <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block uppercase tracking-wider">
                                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                      <Link href="/admin/notifications" className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">View all updates</Link>
                  </div>
                </div>
              )}
            </div>

          <Button onClick={isMenu} variant="ghost" size="icon">
            {!menu ? <Menu className="h-5 w-5 text-orange-600" /> : <X className="h-5 w-5 text-orange-600" />}
          </Button>
          </div>


        </header>

  
            {menu && (
              <div>
                  <nav className="space-y-2 px-3 pt-5 pb-5 bg-orange-600/30">
          <Link href="/admin" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/shipments" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <PackageSearch className="h-5 w-5 mr-3 text-orange-600" />
            Shipments
          </Link>
          <Link href="/admin/customers" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Users className="h-5 w-5 mr-3 text-orange-600" />
            Customers
          </Link>
          <Link href="/admin/chat" onClick={isMenu} className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-3 text-orange-600" />
              Messages
            </div>
            {unreadMessageCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadMessageCount}</span>}
          </Link>
          <Link href="/admin/notifications" onClick={isMenu} className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-orange-600" />
              Notifications
            </div>
            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </Link>
          <Link href="/admin/broadcast" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Mail className="h-5 w-5 mr-3 text-orange-600" />
            Broadcast
          </Link>
          <Link href="/admin/drivers" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Truck className="h-5 w-5 mr-3 text-orange-600" />
            Drivers
          </Link>
          <Link href="/tracking" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <PackageSearch className="h-5 w-5 mr-3 text-orange-600" />
            Track Product
          </Link>
          <Link href="/admin/settings" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="h-5 w-5 mr-3 text-orange-600" />
            Settings
          </Link>
          <Link href="/admin/food" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Utensils className="h-5 w-5 mr-3 text-orange-600" />
            Manage Food
          </Link>
          <button 
            onClick={sessionLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
              </div>
            )}
         
     

        {/* Topbar Desktop */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b bg-white shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">Admin Portal</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative group" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5 text-slate-600 group-hover:text-orange-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-orange-600 font-semibold hover:text-orange-700 transition-colors flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                         <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                         <p className="text-sm text-slate-500 font-medium">No system notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n: any) => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-default ${n.read ? 'opacity-60' : 'bg-orange-50/30'}`}>
                          <div className="flex gap-3">
                             <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-orange-600' : 'bg-transparent'}`} />
                             <div>
                                <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block uppercase tracking-wider">
                                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                      <Link href="/admin/notifications" className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">View all updates</Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 border-l pl-6">
              <Link href="/profile" className="h-9 w-9 rounded-full bg-orange-600/10 text-orange-600 flex items-center justify-center hover:bg-orange-600/20 transition-colors">
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
