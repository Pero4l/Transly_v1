"use client";

import { useMemo, useState } from "react";
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

const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: "CUS-1029",
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1 555-0100",
    status: "Active",
  },
  {
    id: "CUS-1030",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 555-0122",
    status: "Active",
  },
  {
    id: "CUS-1031",
    name: "TechGadgets Inc.",
    email: "shipping@techgadgets.io",
    phone: "+1 555-0199",
    status: "Active",
  },
  {
    id: "CUS-1032",
    name: "Nova Logistics",
    email: "help@novalogistics.co",
    phone: "+1 555-0133",
    status: "Inactive",
  },
];

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
  const [customers, setCustomers] = useState<Customer[]>(DUMMY_CUSTOMERS);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchText =
        `${customer.id} ${customer.name} ${customer.email}`.toLowerCase();
      const matchesQuery =
        query.trim() === "" || searchText.includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && customer.status === "Active") ||
        (statusFilter === "inactive" && customer.status === "Inactive");
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, statusFilter]);

  const toggleStatus = (id: string) => {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              status: customer.status === "Active" ? "Inactive" : "Active",
            }
          : customer,
      ),
    );
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
                {filteredCustomers.length === 0 ? (
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
                        {customer.id}
                      </td>
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-500 flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-2" /> {customer.email}
                        </div>
                        <div className="text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-2" /> {customer.phone}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${customer.status === "Active" ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {customer.status}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            customer.status === "Active"
                              ? "text-slate-400 hover:text-red-500"
                              : "text-slate-400 hover:text-emerald-500"
                          }
                          onClick={() => toggleStatus(customer.id)}
                          aria-label={
                            customer.status === "Active"
                              ? "Mark inactive"
                              : "Mark active"
                          }
                        >
                          {customer.status === "Active" ? (
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
