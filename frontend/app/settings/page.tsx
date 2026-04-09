import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { User, Bell, Shield, MapPin } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-1">
            <Button variant="ghost" className="w-full justify-start text-orange-600 bg-orange-600/5">
              <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600">
              <MapPin className="mr-2 h-4 w-4" /> Addresses
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-600">
              <Shield className="mr-2 h-4 w-4" /> Security
            </Button>
          </div>

          <div className="md:col-span-3 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and how we can reach you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <Input defaultValue="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <Input type="email" defaultValue="jane.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <Input type="tel" defaultValue="(555) 123-4567" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
