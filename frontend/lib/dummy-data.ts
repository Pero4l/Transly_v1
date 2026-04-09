import { Package, CheckCircle2, Clock, Truck, AlertCircle } from "lucide-react";

export const DUMMY_USER = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  role: "customer", // or 'admin'
};

export const DUMMY_SHIPMENTS = [
  {
    id: "TRK-009841",
    sender: "Acme Corp",
    recipient: "Jane Doe",
    origin: "San Francisco, CA",
    destination: "New York, NY",
    status: "in-transit",
    date: "2026-04-10",
    estimatedDelivery: "2026-04-12",
  },
  {
    id: "TRK-009842",
    sender: "Jane Doe",
    recipient: "Bob Smith",
    origin: "New York, NY",
    destination: "Austin, TX",
    status: "delivered",
    date: "2026-04-05",
    estimatedDelivery: "2026-04-08",
  },
  {
    id: "TRK-009843",
    sender: "TechGadgets Inc.",
    recipient: "Jane Doe",
    origin: "Seattle, WA",
    destination: "New York, NY",
    status: "pending",
    date: "2026-04-11",
    estimatedDelivery: "2026-04-15",
  },
];

export const TRACKING_HISTORY = [
  {
    status: "Package Delivered",
    location: "New York, NY",
    time: "2026-04-08 14:30",
    completed: true,
  },
  {
    status: "Out for Delivery",
    location: "New York, NY",
    time: "2026-04-08 08:15",
    completed: true,
  },
  {
    status: "Arrived at Local Facility",
    location: "New York, NY",
    time: "2026-04-07 22:40",
    completed: true,
  },
  {
    status: "In Transit",
    location: "Chicago, IL",
    time: "2026-04-06 15:20",
    completed: true,
  },
  {
    status: "Package Picked Up",
    location: "San Francisco, CA",
    time: "2026-04-05 10:00",
    completed: true,
  },
];

export const ADMIN_STATS = {
  totalDeliveries: 12450,
  activeDeliveries: 342,
  successRate: "98.5%",
  revenueThisMonth: "$45,200",
};

export const ADMIN_RECENT_REQUESTS = [
  { id: "REQ-101", customer: "Alice Brown", route: "LA -> SEA", status: "pending", amount: "$120" },
  { id: "REQ-102", customer: "Charlie Davis", route: "NY -> MIA", status: "assigned", amount: "$85" },
  { id: "REQ-103", customer: "Eve Miller", route: "CHI -> HOU", status: "in-transit", amount: "$210" },
  { id: "REQ-104", customer: "Frank Wilson", route: "BOS -> DEN", status: "delivered", amount: "$145" },
];
