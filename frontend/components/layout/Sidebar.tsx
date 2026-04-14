"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, PackageSearch, Users, Truck, Settings, MessageCircle, LogOut } from "lucide-react";
import { useSession } from "@/lib/sessionContext";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export function Sidebar() {
  const { user, token, logout } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();

      const socket = getSocket();
      socket.emit("join_personal_room", user.id);

      const handleNewMessage = (data: any) => {
        // Increment count if message is for us
        setUnreadCount(prev => prev + 1);
      };

      socket.on("new_message_notification", handleNewMessage);
      
      // We also need to clear count when messages are read, 
      // but simpler to just refetch or rely on socket events
      // For now, let's keep it simple.

      return () => {
        socket.off("new_message_notification", handleNewMessage);
      };
    }
  }, [user, token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiFetch("/chat/conversations", {}, token);
      const data = await res.json();
      if (data.success) {
        const total = data.conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-64 border-r bg-white h-screen flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2 text-orange-600 font-bold text-xl">
          <Truck className="h-6 w-6" />
          <span>Transly Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/shipments" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            <PackageSearch className="h-5 w-5 mr-3 text-slate-400" />
            Shipments
          </Link>
          <Link href="/admin/customers" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            <Users className="h-5 w-5 mr-3 text-slate-400" />
            Customers
          </Link>
          <Link href="/admin/chat" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-3 text-slate-400" />
              Messages
            </div>
            {unreadCount > 0 && (
              <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/admin/drivers" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            <Truck className="h-5 w-5 mr-3 text-slate-400" />
            Drivers
          </Link>
          <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="h-5 w-5 mr-3 text-slate-400" />
            Settings
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
            {user?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "Admin User"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "System Admin"}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
