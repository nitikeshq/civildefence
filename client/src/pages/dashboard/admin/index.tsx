import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Package,
  FileText,
  UserCheck,
  ClipboardList,
  BoxIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { User, Volunteer, Incident, InventoryItem } from "@shared/schema";

const navItems = [
  { label: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Volunteers", path: "/dashboard/admin/volunteers", icon: Users },
  { label: "Incidents", path: "/dashboard/admin/incidents", icon: AlertTriangle },
  { label: "Inventory", path: "/dashboard/admin/inventory", icon: Package },
  { label: "Reports", path: "/dashboard/admin/reports", icon: FileText },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Calculate key metrics
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
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage volunteers, incidents, and inventory across Odisha
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Volunteers */}
          <Card data-testid="card-total-volunteers">
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
          <Card data-testid="card-active-incidents">
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
          <Card data-testid="card-inventory-items">
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
                    {lowStockItems > 0 ? (
                      <span className="text-destructive font-medium">
                        {lowStockItems} low stock
                      </span>
                    ) : (
                      "All items in stock"
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card data-testid="card-pending-actions">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-pending-actions">
                    {pendingApprovals}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Volunteer approvals required
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/admin/volunteers")}
              data-testid="button-manage-volunteers"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Volunteers</div>
                <div className="text-xs text-muted-foreground">
                  Approve and assign volunteers
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/admin/incidents")}
              data-testid="button-review-incidents"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Review Incidents</div>
                <div className="text-xs text-muted-foreground">
                  Monitor active emergencies
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/admin/inventory")}
              data-testid="button-manage-inventory"
            >
              <BoxIcon className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Inventory</div>
                <div className="text-xs text-muted-foreground">
                  Update stock levels
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/admin/reports")}
              data-testid="button-view-reports"
            >
              <FileText className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Reports</div>
                <div className="text-xs text-muted-foreground">
                  Analytics and insights
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        {pendingApprovals > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-base">Attention Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-bold text-foreground">{pendingApprovals}</span>{" "}
                volunteer{pendingApprovals !== 1 ? "s" : ""} waiting for approval.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/dashboard/admin/volunteers")}
                data-testid="button-approve-volunteers"
              >
                Review Pending Volunteers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
