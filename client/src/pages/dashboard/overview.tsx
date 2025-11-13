import { useLocation } from "wouter";
import { Users, AlertTriangle, Package, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useScopedVolunteers, useScopedIncidents, useScopedInventory } from "@/hooks/useScopedData";
import { getAdminNavItems, getRolePermissions } from "@/lib/roleUtils";

export default function DashboardOverview() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: volunteers = [], isLoading: loadingVolunteers } = useScopedVolunteers();
  const { data: incidents = [], isLoading: loadingIncidents } = useScopedIncidents();
  const { data: inventory = [], isLoading: loadingInventory } = useScopedInventory();

  const permissions = getRolePermissions(user?.role);
  
  // Get consistent navigation items for all admin pages
  const navItems = user ? getAdminNavItems(user.role || "volunteer") : [];
  const isDistrictAdmin = user?.role === "district_admin";
  const isDepartmentAdmin = user?.role === "department_admin" || user?.role === "state_admin";

  // Calculate metrics
  const totalVolunteers = volunteers.length;
  const activeVolunteers = volunteers.filter((v) => v.status === "approved").length;
  const pendingApprovals = volunteers.filter((v) => v.status === "pending").length;

  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(
    (i) => i.status === "reported" || i.status === "assigned" || i.status === "in_progress"
  ).length;
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved").length;

  const totalInventory = inventory.length;
  const lowStockItems = inventory.filter((item) => item.quantity < 10).length;

  const isLoading = loadingVolunteers || loadingIncidents || loadingInventory;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            {permissions.scope === "district" 
              ? `${user?.district || ""} District Operations`
              : "Statewide Civil Defence Operations"}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Volunteers */}
          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation("/dashboard/volunteers")}
            data-testid="card-total-volunteers"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-total-volunteers">
                    {totalVolunteers}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeVolunteers} active, {pendingApprovals} pending
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Incidents */}
          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation("/dashboard/incidents")}
            data-testid="card-active-incidents"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-active-incidents">
                    {activeIncidents}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalIncidents} total, {resolvedIncidents} resolved
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation("/dashboard/inventory")}
            data-testid="card-inventory-items"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-inventory-items">
                    {totalInventory}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowStockItems} items low stock
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reports (State-level only) */}
          {permissions.scope === "state" && (
            <Card 
              className="hover-elevate cursor-pointer" 
              onClick={() => setLocation("/dashboard/reports")}
              data-testid="card-reports"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports & Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comprehensive insights
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-volunteer-stats">
            <CardHeader>
              <CardTitle>Volunteer Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="font-medium">{activeVolunteers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium">{pendingApprovals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-medium">{totalVolunteers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-incident-stats">
            <CardHeader>
              <CardTitle>Incident Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-medium">{activeIncidents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Resolved</span>
                  <span className="font-medium">{resolvedIncidents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-medium">{totalIncidents}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
