import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Package,
  BarChart3,
} from "lucide-react";

export const stateAdminNav = [
  { label: "Dashboard", path: "/dashboard/state-admin", icon: LayoutDashboard },
  { label: "Volunteers", path: "/dashboard/state-admin/volunteers", icon: Users },
  { label: "Incidents", path: "/dashboard/state-admin/incidents", icon: AlertTriangle },
  { label: "Inventory", path: "/dashboard/state-admin/inventory", icon: Package },
  { label: "Reports", path: "/dashboard/state-admin/reports", icon: BarChart3 },
];
