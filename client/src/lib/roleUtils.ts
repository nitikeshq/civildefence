// Centralized role-based permission and filtering utilities

export type UserRole = "volunteer" | "district_admin" | "department_admin" | "state_admin" | "cms_manager";

export interface RolePermissions {
  canApproveVolunteers: boolean;
  canManageIncidents: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canViewAllDistricts: boolean;
  canManageUsers: boolean;
  canManageCMS: boolean;
  scope: "district" | "state" | "volunteer";
}

export function getRolePermissions(role: UserRole | null | undefined): RolePermissions {
  if (!role) {
    return {
      canApproveVolunteers: false,
      canManageIncidents: false,
      canManageInventory: false,
      canViewReports: false,
      canExportData: false,
      canViewAllDistricts: false,
      canManageUsers: false,
      canManageCMS: false,
      scope: "volunteer",
    };
  }

  const permissions: Record<UserRole, RolePermissions> = {
    volunteer: {
      canApproveVolunteers: false,
      canManageIncidents: false,
      canManageInventory: false,
      canViewReports: false,
      canExportData: false,
      canViewAllDistricts: false,
      canManageUsers: false,
      canManageCMS: false,
      scope: "volunteer",
    },
    district_admin: {
      canApproveVolunteers: true,
      canManageIncidents: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canViewAllDistricts: false,
      canManageUsers: false,
      canManageCMS: false,
      scope: "district",
    },
    department_admin: {
      canApproveVolunteers: true,
      canManageIncidents: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canViewAllDistricts: true,
      canManageUsers: true,
      canManageCMS: true,
      scope: "state",
    },
    state_admin: {
      canApproveVolunteers: true,
      canManageIncidents: true,
      canManageInventory: true,
      canViewReports: true,
      canExportData: true,
      canViewAllDistricts: true,
      canManageUsers: true,
      canManageCMS: true,
      scope: "state",
    },
    cms_manager: {
      canApproveVolunteers: false,
      canManageIncidents: false,
      canManageInventory: false,
      canViewReports: false,
      canExportData: false,
      canViewAllDistricts: false,
      canManageUsers: false,
      canManageCMS: true,
      scope: "state",
    },
  };

  return permissions[role];
}

export function getNavigationItems(role: UserRole | null | undefined) {
  const permissions = getRolePermissions(role);
  
  const items = [];
  
  // Dashboard - always visible for admin roles
  if (permissions.scope === "district" || permissions.scope === "state") {
    items.push({
      label: "Dashboard",
      path: "/dashboard/overview",
      icon: "LayoutDashboard",
    });
  }

  // Volunteers management
  if (permissions.canApproveVolunteers) {
    items.push({
      label: "Volunteers",
      path: "/dashboard/volunteers",
      icon: "Users",
    });
  }

  // Incidents management
  if (permissions.canManageIncidents) {
    items.push({
      label: "Incidents",
      path: "/dashboard/incidents",
      icon: "AlertTriangle",
    });
  }

  // Inventory management
  if (permissions.canManageInventory) {
    items.push({
      label: "Inventory",
      path: "/dashboard/inventory",
      icon: "Package",
    });
  }

  // Reports (only for state-level)
  if (permissions.canViewReports && permissions.scope === "state") {
    items.push({
      label: "Reports",
      path: "/dashboard/reports",
      icon: "BarChart3",
    });
  }

  return items;
}

export function filterDataByRole<T extends { district?: string | null }>(
  data: T[],
  role: UserRole | null | undefined,
  userDistrict: string | null | undefined
): T[] {
  const permissions = getRolePermissions(role);
  
  // State-level users see all data
  if (permissions.scope === "state") {
    return data;
  }
  
  // District-level users see only their district
  if (permissions.scope === "district" && userDistrict) {
    return data.filter((item) => item.district === userDistrict);
  }
  
  // Default: return empty array
  return [];
}

export function getDashboardTitle(role: UserRole | null | undefined): string {
  if (!role) return "Dashboard";
  
  const titles: Record<UserRole, string> = {
    volunteer: "Volunteer",
    district_admin: "District Admin",
    department_admin: "Department Admin",
    state_admin: "State Admin",
    cms_manager: "CMS Manager",
  };
  
  return titles[role];
}

export function getDashboardSubtitle(role: UserRole | null | undefined, district?: string | null): string {
  const permissions = getRolePermissions(role);
  
  if (permissions.scope === "district" && district) {
    return `${district} District Operations`;
  }
  
  if (permissions.scope === "state") {
    return "Statewide Civil Defence Operations";
  }
  
  return "Civil Defence, Odisha";
}

// Import icons for navigation
import { LayoutDashboard, Users, AlertTriangle, ClipboardList, Package, FileText, GraduationCap, Settings } from "lucide-react";

export function getAdminNavItems(role: string) {
  const permissions = getRolePermissions(role as UserRole);
  
  const baseItems = [
    { label: "Overview", path: "/dashboard/overview", icon: LayoutDashboard },
    { label: "Volunteers", path: "/dashboard/volunteers", icon: Users },
    { label: "Incidents", path: "/dashboard/incidents", icon: AlertTriangle },
    { label: "Tasks", path: "/dashboard/tasks", icon: ClipboardList },
    { label: "Trainings", path: "/dashboard/trainings", icon: GraduationCap },
    { label: "Inventory", path: "/dashboard/inventory", icon: Package },
    { label: "Reports", path: "/dashboard/reports", icon: FileText },
  ];

  // Add CMS navigation for authorized roles
  if (permissions.canManageCMS) {
    baseItems.push({ label: "CMS Manager", path: "/dashboard/cms", icon: Settings });
  }

  return baseItems;
}

// Get constant sidebar header title based on role and district
export function getSidebarTitle(role: UserRole | null | undefined, district?: string | null): string {
  if (!role) return "Volunteer Management";
  
  switch (role) {
    case "district_admin":
      return district ? `District Admin - ${district}` : "District Admin";
    case "department_admin":
      return "Department Admin - Odisha";
    case "state_admin":
      return "State Admin - Odisha";
    case "volunteer":
      return "Volunteer Portal";
    case "cms_manager":
      return "CMS Manager - Odisha";
    default:
      return "Volunteer Management";
  }
}
