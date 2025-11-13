import { useState } from "react";
import { Package, Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useScopedInventory } from "@/hooks/useScopedData";
import { getDashboardTitle, getDashboardSubtitle, getNavigationItems } from "@/lib/roleUtils";
import { LayoutDashboard, Users, AlertTriangle, BarChart3, ClipboardList, Activity } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

export default function DashboardInventory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: inventory = [], isLoading } = useScopedInventory();

  // Navigation items with icons
  const navItemsWithIcons = getNavigationItems(user?.role).map((item) => {
    const iconMap: Record<string, any> = {
      LayoutDashboard,
      Users,
      AlertTriangle,
      Package,
      BarChart3,
      ClipboardList,
    };
    return {
      ...item,
      icon: iconMap[item.icon] || Activity,
    };
  });

  const filteredInventory = inventory.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = filteredInventory.filter((item) => item.quantity < 10);
  const needsRepairItems = filteredInventory.filter((item) => item.condition === "needs_repair");
  const goodConditionItems = filteredInventory.filter(
    (item) => item.condition === "excellent" || item.condition === "good"
  );

  const getConditionBadge = (condition: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string; className?: string }> = {
      excellent: { variant: "default", label: "Excellent", className: "bg-green-600 hover:bg-green-700" },
      good: { variant: "default", label: "Good" },
      fair: { variant: "outline", label: "Fair" },
      poor: { variant: "secondary", label: "Poor" },
      needs_repair: { variant: "default", label: "Needs Repair", className: "bg-red-600 hover:bg-red-700" },
    };
    const config = variants[condition || "good"] || variants.good;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout 
      navItems={navItemsWithIcons} 
      title={getDashboardTitle(user?.role)}
      subtitle={getDashboardSubtitle(user?.role, user?.district)}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage equipment and supplies
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-inventory"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-total-items">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : filteredInventory.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-low-stock">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : lowStockItems.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-needs-repair">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Repair</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : needsRepairItems.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Inventory ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory items found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`inventory-${item.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.location} • {item.district}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} • Category: {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getConditionBadge(item.condition)}
                      {item.quantity < 10 && (
                        <Badge variant="secondary">Low Stock</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailsDialog(true);
                        }}
                        data-testid={`button-view-${item.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
            <DialogDescription>
              Detailed information about the inventory item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name</Label>
                  <p className="text-sm">{selectedItem.name}</p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm">{selectedItem.category}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p className="text-sm">{selectedItem.quantity}</p>
                </div>
                <div>
                  <Label>Condition</Label>
                  <div className="mt-1">{getConditionBadge(selectedItem.condition)}</div>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedItem.location}</p>
                </div>
                <div>
                  <Label>District</Label>
                  <p className="text-sm">{selectedItem.district}</p>
                </div>
                <div>
                  <Label>Last Inspection</Label>
                  <p className="text-sm">
                    {selectedItem.lastInspection
                      ? new Date(selectedItem.lastInspection).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
