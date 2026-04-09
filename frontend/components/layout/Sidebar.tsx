import Link from "next/link";
import { LayoutDashboard, PackageSearch, Users, Truck, Settings } from "lucide-react";

export function Sidebar() {
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
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
