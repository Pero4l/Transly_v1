import Link from "next/link";
import { Package, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-orange-600 font-bold text-xl">
            <Package className="h-6 w-6" />
            <span>Transly</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/tracking" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Track Package
            </Link>
            <Link href="/request" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Send Package
            </Link>
            <Link href="/settings" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
              Settings
            </Link>
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
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Sign In
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="sm" className="hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
