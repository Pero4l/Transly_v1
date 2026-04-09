import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ADMIN_STATS, ADMIN_RECENT_REQUESTS } from "@/lib/dummy-data";
import { Package, Truck, Activity, DollarSign, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500">Monitor your logistical operations in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-500">Active Deliveries</p>
                <div className="flex items-center justify-end">
                  <h3 className="text-2xl font-bold text-slate-900">{ADMIN_STATS.activeDeliveries}</h3>
                  <span className="text-emerald-500 text-xs font-medium ml-2 flex items-center">
                    +12 <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-3 bg-emerald-100 rounded-full text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-500">Success Rate</p>
                <h3 className="text-2xl font-bold text-slate-900">{ADMIN_STATS.successRate}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-3 bg-amber-100 rounded-full text-amber-600">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-500">Total Lifetime</p>
                <h3 className="text-2xl font-bold text-slate-900">{ADMIN_STATS.totalDeliveries}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-3 bg-purple-100 rounded-full text-purple-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900">{ADMIN_STATS.revenueThisMonth}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest delivery requests from customers that need attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Request ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_RECENT_REQUESTS.map((req, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{req.id}</td>
                      <td className="px-4 py-4">{req.customer}</td>
                      <td className="px-4 py-4 text-slate-500">{req.route}</td>
                      <td className="px-4 py-4 font-medium">{req.amount}</td>
                      <td className="px-4 py-4 text-right">
                        <Badge 
                          variant={
                            req.status === 'delivered' ? 'success' : 
                            req.status === 'in-transit' ? 'info' : 
                            req.status === 'assigned' ? 'warning' : 'default'
                          }
                        >
                          {req.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-orange-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Admin Actions</CardTitle>
            <CardDescription className="text-white/80">Quick shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg flex items-center font-medium text-left">
              <Truck className="h-5 w-5 mr-3 opacity-80" /> Dispatch Fleet Dashboard
            </button>
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg flex items-center font-medium text-left">
              <Package className="h-5 w-5 mr-3 opacity-80" /> Manage Warehouses
            </button>
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg flex items-center font-medium text-left mb-6">
              <DollarSign className="h-5 w-5 mr-3 opacity-80" /> Transaction History
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
