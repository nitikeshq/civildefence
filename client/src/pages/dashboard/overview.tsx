import { useLocation } from "wouter";
import { Users, AlertTriangle, Package, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useScopedVolunteers, useScopedIncidents, useScopedInventory } from "@/hooks/useScopedData";
import { getAdminNavItems, getRolePermissions } from "@/lib/roleUtils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";

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

  // Chart data - volunteer status distribution
  const volunteerStatusData = useMemo(() => [
    { name: "Approved", value: activeVolunteers, color: "#22c55e" },
    { name: "Pending", value: pendingApprovals, color: "#eab308" },
    { name: "Rejected", value: volunteers.filter((v) => v.status === "rejected").length, color: "#ef4444" },
  ], [activeVolunteers, pendingApprovals, volunteers]);

  // Chart data - incident severity distribution
  const incidentSeverityData = useMemo(() => {
    const severityCounts = {
      low: incidents.filter((i) => i.severity === "low").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      high: incidents.filter((i) => i.severity === "high").length,
      critical: incidents.filter((i) => i.severity === "critical").length,
    };
    return [
      { name: "Low", value: severityCounts.low, color: "#3b82f6" },
      { name: "Medium", value: severityCounts.medium, color: "#eab308" },
      { name: "High", value: severityCounts.high, color: "#f97316" },
      { name: "Critical", value: severityCounts.critical, color: "#ef4444" },
    ];
  }, [incidents]);

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

        {/* Analytics Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Volunteer Status Distribution Chart */}
          <Card data-testid="card-volunteer-chart">
            <CardHeader>
              <CardTitle>Volunteer Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 bg-muted animate-pulse rounded" />
              ) : totalVolunteers > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={volunteerStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volunteerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No volunteer data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Severity Distribution Chart */}
          <Card data-testid="card-incident-chart">
            <CardHeader>
              <CardTitle>Incident Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 bg-muted animate-pulse rounded" />
              ) : totalIncidents > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {incidentSeverityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No incident data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
