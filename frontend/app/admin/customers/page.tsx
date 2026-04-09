import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Filter, Search, UserX, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";

const DUMMY_CUSTOMERS = [
  { id: "CUS-1029", name: "Acme Corp", email: "contact@acme.com", phone: "+1 555-0100", status: "Active" },
  { id: "CUS-1030", name: "Jane Doe", email: "jane.doe@example.com", phone: "+1 555-0122", status: "Active" },
  { id: "CUS-1031", name: "TechGadgets Inc.", email: "shipping@techgadgets.io", phone: "+1 555-0199", status: "Active" },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-sm text-slate-500">Manage registered user accounts and corporate clients.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2"/> Filter</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2"/> Export</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_CUSTOMERS.map((cus, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cus.id}</td>
                    <td className="px-6 py-4 font-medium">{cus.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-500 flex items-center mb-1"><Mail className="w-3 h-3 mr-2" /> {cus.email}</div>
                      <div className="text-slate-500 flex items-center"><Phone className="w-3 h-3 mr-2" /> {cus.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{cus.status}</td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500"><UserX className="h-4 w-4" /></Button>
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
