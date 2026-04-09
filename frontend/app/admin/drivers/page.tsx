import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Truck } from "lucide-react";

export default function AdminDriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet & Drivers</h1>
          <p className="text-sm text-slate-500">Manage your active driver fleet.</p>
        </div>
        <Button>
          <Truck className="h-4 w-4 mr-2" /> Register Driver
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
           <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-slate-900 mb-1">No drivers available</h3>
           <p className="text-slate-500 max-w-sm mx-auto">Get started by onboarding your first fleet member.</p>
        </CardContent>
      </Card>
    </div>
  );
}
