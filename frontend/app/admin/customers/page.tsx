"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Search, UserCheck, UserX, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
};


function downloadCsv(customers: Customer[]) {
  const header = ["Customer ID", "Name", "Email", "Phone", "Status"];
  const rows = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.email,
    customer.phone,
    customer.status,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "customers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch("http://localhost:9400/admin/customers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchText =
        `${customer.id} ${customer.name} ${customer.email}`.toLowerCase();
      const matchesQuery =
        query.trim() === "" || searchText.includes(query.toLowerCase());
      
      const isActive = !customer.is_suspended;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, statusFilter]);

  const toggleStatus = async (id: string) => {
    const token = localStorage.getItem("transly_token");
    try {
      const res = await fetch(`http://localhost:9400/admin/users/${id}/suspend`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(current => 
          current.map(c => c.id === id ? { ...c, is_suspended: data.is_suspended } : c)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-slate-500">
            Manage registered user accounts and corporate clients.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => downloadCsv(filteredCustomers)}
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by customer ID, name, or email"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading customers...</td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No customers match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {customer.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-500 flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-2" /> {customer.email}
                        </div>
                        <div className="text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-2" /> {customer.phone || 'N/A'}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${!customer.is_suspended ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {!customer.is_suspended ? "Active" : "Suspended"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            !customer.is_suspended
                              ? "text-slate-400 hover:text-red-500"
                              : "text-slate-400 hover:text-emerald-500"
                          }
                          onClick={() => toggleStatus(customer.id)}
                          aria-label={
                            !customer.is_suspended
                              ? "Mark inactive"
                              : "Mark active"
                          }
                        >
                          {!customer.is_suspended ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
