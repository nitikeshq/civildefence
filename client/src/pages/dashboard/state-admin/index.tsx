import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { UserCheck, ClipboardList, BoxIcon, Users, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { stateAdminNav } from "./nav-config";

export default function StateAdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: allVolunteers = [], isLoading: loadingVolunteers } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const { data: allIncidents = [], isLoading: loadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: allInventory = [], isLoading: loadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const pendingVolunteers = allVolunteers.filter((v) => v.status === "pending").length;
  const totalVolunteers = allVolunteers.length;
  const activeIncidents = allIncidents.filter((i) => i.status === "reported" || i.status === "assigned" || i.status === "in_progress").length;
  const totalIncidents = allIncidents.length;
  const totalInventory = allInventory.length;
  const lowStockItems = allInventory.filter((item) => item.quantity < 10).length;

  const isLoading = loadingVolunteers || loadingIncidents || loadingInventory;

  return (
    <DashboardLayout navItems={stateAdminNav} title="State Admin" subtitle="Manage state-wide operations">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            State Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            State-wide overview and management
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/dashboard/state-admin/volunteers")} data-testid="card-volunteers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalVolunteers}</div>
              <p className="text-xs text-muted-foreground">
                {pendingVolunteers} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/dashboard/state-admin/incidents")} data-testid="card-incidents">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalIncidents}</div>
              <p className="text-xs text-muted-foreground">
                {activeIncidents} currently active
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/dashboard/state-admin/inventory")} data-testid="card-inventory">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalInventory}</div>
              <p className="text-xs text-muted-foreground">
                {lowStockItems} items low stock
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => setLocation("/dashboard/state-admin/volunteers")} 
                className="w-full" 
                variant="outline"
                data-testid="button-manage-volunteers"
              >
                Manage Volunteers
              </Button>
              <Button 
                onClick={() => setLocation("/dashboard/state-admin/incidents")} 
                className="w-full" 
                variant="outline"
                data-testid="button-view-incidents"
              >
                View Incidents
              </Button>
              <Button 
                onClick={() => setLocation("/dashboard/state-admin/inventory")} 
                className="w-full" 
                variant="outline"
                data-testid="button-check-inventory"
              >
                Check Inventory
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Pending Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Volunteers</span>
                <span className="text-lg font-bold">{isLoading ? "..." : pendingVolunteers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Incidents</span>
                <span className="text-lg font-bold">{isLoading ? "..." : activeIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low Stock Items</span>
                <span className="text-lg font-bold">{isLoading ? "..." : lowStockItems}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BoxIcon className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">All Districts</span>
                <span className="text-lg font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-lg font-bold text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Services</span>
                <span className="text-lg font-bold text-green-600">Running</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
