import { LayoutDashboard, Users, AlertTriangle, Package } from "lucide-react";

export const districtAdminNav = [
  { label: "Dashboard", path: "/dashboard/district-admin", icon: LayoutDashboard },
  { label: "Volunteers", path: "/dashboard/district-admin/volunteers", icon: Users },
  { label: "Incidents", path: "/dashboard/district-admin/incidents", icon: AlertTriangle },
  { label: "Inventory", path: "/dashboard/district-admin/inventory", icon: Package },
];
