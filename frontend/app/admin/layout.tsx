import { Sidebar } from "@/components/layout/Sidebar";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-white">
          <div className="font-bold text-orange-600 flex items-center">
            <span className="mr-2">Transly Admin</span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Topbar Desktop */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b bg-white shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">Admin Portal</h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              View Site
            </Button>
            <div className="h-8 w-8 rounded-full bg-orange-600/10 text-orange-600 flex items-center justify-center">
              <User className="h-4 w-4" />
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
