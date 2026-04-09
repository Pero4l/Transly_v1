import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ADMIN_RECENT_REQUESTS } from "@/lib/dummy-data";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function AdminShipmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Shipments</h1>
          <p className="text-sm text-slate-500">View and assign all active, pending, and completed deliveries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2"/> Filter</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2"/> Export</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="py-4 border-b">
          <div className="flex justify-between items-center w-full">
             <div className="relative w-72">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
               <Input className="pl-9 bg-slate-50 border-transparent focus:bg-white" placeholder="Search by ID or customer..." />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Tracking ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Route</th>
                  <th className="px-6 py-4 font- medium">Driver</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_RECENT_REQUESTS.map((req, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{req.id}</td>
                    <td className="px-6 py-4">{req.customer}</td>
                    <td className="px-6 py-4 text-slate-500">{req.route}</td>
                    <td className="px-6 py-4 text-slate-500">{req.status === 'pending' ? 'Unassigned' : 'D. Rogers'}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge 
                        variant={req.status === 'delivered' ? 'success' : req.status === 'in-transit' ? 'info' : req.status === 'assigned' ? 'warning' : 'default'}
                      >
                        {req.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-orange-600">Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
