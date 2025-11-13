import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { UserCheck, ClipboardList, BoxIcon, Users, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { districtAdminNav } from "./nav-config";

export default function DistrictAdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: volunteers = [], isLoading: loadingVolunteers } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Filter data for this district only
  const userDistrict = user?.district || "";
  const districtVolunteers = volunteers.filter((v) => v.district === userDistrict);
  const districtIncidents = incidents.filter((i) => i.district === userDistrict);
  const districtInventory = inventory.filter((i) => i.district === userDistrict);

  // Calculate key metrics
  const totalVolunteers = districtVolunteers.length;
  const activeVolunteers = districtVolunteers.filter((v) => v.status === "approved").length;
  const pendingApprovals = districtVolunteers.filter((v) => v.status === "pending").length;

  const activeIncidents = districtIncidents.filter(
    (i) => i.status === "reported" || i.status === "assigned" || i.status === "in_progress"
  ).length;

  const totalInventory = districtInventory.length;
  const lowStockItems = districtInventory.filter((item) => item.quantity < 10).length;

  const isLoading = loadingVolunteers || loadingIncidents || loadingInventory;

  return (
    <DashboardLayout navItems={districtAdminNav} title="District Admin" subtitle="Manage district operations">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {userDistrict} District Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage volunteers, incidents, and inventory in your district
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Volunteers */}
          <Card data-testid="card-total-volunteers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">District Volunteers</CardTitle>
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
                    {activeVolunteers} active
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
                    Requires attention
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
                    Approvals needed
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Alert */}
        {pendingApprovals > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-900 dark:text-orange-100">
                  Pending Volunteer Approvals
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-800 dark:text-orange-200 mb-4">
                You have <strong>{pendingApprovals}</strong> volunteer application(s) waiting for approval.
                Please review and approve or reject these applications.
              </p>
              <Button
                onClick={() => setLocation("/dashboard/district-admin/volunteers")}
                variant="default"
                data-testid="button-review-volunteers"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Review Pending Volunteers
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/district-admin/volunteers")}
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
              onClick={() => setLocation("/dashboard/district-admin/incidents")}
              data-testid="button-review-incidents"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Review Incidents</div>
                <div className="text-xs text-muted-foreground">
                  Monitor district emergencies
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => setLocation("/dashboard/district-admin/inventory")}
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
          </CardContent>
        </Card>

        {/* Attention Required */}
        {pendingApprovals > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-base">Attention Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-bold text-foreground">{pendingApprovals}</span>{" "}
                volunteer{pendingApprovals !== 1 ? "s" : ""} waiting for approval in your district.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/dashboard/district-admin/volunteers")}
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
