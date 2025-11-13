import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, AlertTriangle, Package, TrendingUp } from "lucide-react";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { stateAdminNav } from "./nav-config";

export default function StateAdminReports() {
  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const isLoading = loadingVolunteers || loadingIncidents || loadingInventory;

  const totalVolunteers = volunteers.length;
  const approvedVolunteers = volunteers.filter((v) => v.status === "approved").length;
  const pendingVolunteers = volunteers.filter((v) => v.status === "pending").length;

  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(
    (i) => i.status === "reported" || i.status === "assigned" || i.status === "in_progress"
  ).length;
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved" || i.status === "closed").length;

  const totalInventory = inventory.length;
  const lowStockItems = inventory.filter((item) => item.quantity < 10).length;

  return (
    <DashboardLayout navItems={stateAdminNav} title="State Admin" subtitle="Manage state-wide operations">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">State-wide statistics and insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volunteer Statistics</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Volunteers</span>
                <span className="text-lg font-bold">{isLoading ? "..." : totalVolunteers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="text-lg font-bold text-green-600">{isLoading ? "..." : approvedVolunteers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Approval</span>
                <span className="text-lg font-bold text-yellow-600">{isLoading ? "..." : pendingVolunteers}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incident Statistics</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Incidents</span>
                <span className="text-lg font-bold">{isLoading ? "..." : totalIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="text-lg font-bold text-red-600">{isLoading ? "..." : activeIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="text-lg font-bold text-green-600">{isLoading ? "..." : resolvedIncidents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Statistics</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="text-lg font-bold">{isLoading ? "..." : totalInventory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low Stock</span>
                <span className="text-lg font-bold text-yellow-600">{isLoading ? "..." : lowStockItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Good Condition</span>
                <span className="text-lg font-bold text-green-600">{isLoading ? "..." : totalInventory - lowStockItems}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Volunteer Approval Rate</span>
                <span className="text-sm font-bold">
                  {totalVolunteers > 0 ? Math.round((approvedVolunteers / totalVolunteers) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${totalVolunteers > 0 ? (approvedVolunteers / totalVolunteers) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Incident Resolution Rate</span>
                <span className="text-sm font-bold">
                  {totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Inventory Health</span>
                <span className="text-sm font-bold">
                  {totalInventory > 0 ? Math.round(((totalInventory - lowStockItems) / totalInventory) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${totalInventory > 0 ? ((totalInventory - lowStockItems) / totalInventory) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Metrics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Volunteers</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Total registered: {isLoading ? "..." : totalVolunteers}</li>
                  <li>Active volunteers: {isLoading ? "..." : approvedVolunteers}</li>
                  <li>Pending approvals: {isLoading ? "..." : pendingVolunteers}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Incidents</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Total incidents: {isLoading ? "..." : totalIncidents}</li>
                  <li>Active cases: {isLoading ? "..." : activeIncidents}</li>
                  <li>Resolved cases: {isLoading ? "..." : resolvedIncidents}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
