"use client"
import { Sidebar } from "@/components/layout/Sidebar";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, PackageSearch, Users, MessageCircle, Truck, Settings } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menu, setMenu] = useState(false)
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
          <Button onClick={isMenu} variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

  
            {menu && (
              <div>
                  <nav className="space-y-1 px-3 pt-5 pb-5 bg-orange-600/30">
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
          <Link href="/admin/chat" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <MessageCircle className="h-5 w-5 mr-3 text-orange-600" />
            Messages
          </Link>
          <Link href="/admin/drivers" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Truck className="h-5 w-5 mr-3 text-orange-600" />
            Drivers
          </Link>
          <Link href="/admin/settings" onClick={isMenu} className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600/10 text-orange-600 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="h-5 w-5 mr-3 text-orange-600" />
            Settings
          </Link>
        </nav>
              </div>
            )}
         
     

        {/* Topbar Desktop */}
        {/* <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b bg-white shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">Admin Portal</h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              View Site
            </Button>
            <div className="h-8 w-8 rounded-full bg-orange-600/10 text-orange-600 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header> */}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
