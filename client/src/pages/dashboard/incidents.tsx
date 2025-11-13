import { useState } from "react";
import { AlertTriangle, Search, Eye } from "lucide-react";
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
import { useScopedIncidents } from "@/hooks/useScopedData";
import { getDashboardTitle, getDashboardSubtitle, getNavigationItems } from "@/lib/roleUtils";
import { LayoutDashboard, Users, Package, BarChart3, ClipboardList, Activity } from "lucide-react";
import type { Incident } from "@shared/schema";

export default function DashboardIncidents() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: incidents = [], isLoading } = useScopedIncidents();

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

  const filteredIncidents = incidents.filter(
    (i) =>
      i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportedIncidents = filteredIncidents.filter((i) => i.status === "reported");
  const activeIncidents = filteredIncidents.filter(
    (i) => i.status === "assigned" || i.status === "in_progress"
  );
  const resolvedIncidents = filteredIncidents.filter((i) => i.status === "resolved" || i.status === "closed");

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      reported: { variant: "secondary", label: "Reported" },
      assigned: { variant: "outline", label: "Assigned" },
      in_progress: { variant: "default", label: "In Progress" },
      resolved: { variant: "default", label: "Resolved" },
      closed: { variant: "outline", label: "Closed" },
    };
    const config = variants[status || "reported"] || variants.reported;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string | null) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string; className?: string }> = {
      low: { variant: "secondary", label: "Low" },
      medium: { variant: "outline", label: "Medium" },
      high: { variant: "default", label: "High", className: "bg-orange-500 hover:bg-orange-600" },
      critical: { variant: "default", label: "Critical", className: "bg-red-600 hover:bg-red-700" },
    };
    const config = variants[severity || "medium"] || variants.medium;
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
            <h1 className="text-3xl font-bold text-foreground">Incidents Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage emergency incidents
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-incidents"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-reported-incidents">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : reportedIncidents.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-active-incidents">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : activeIncidents.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-resolved-incidents">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : resolvedIncidents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Incidents ({filteredIncidents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No incidents found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`incident-${incident.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{incident.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {incident.location} • {incident.district}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reported: {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowDetailsDialog(true);
                        }}
                        data-testid={`button-view-${incident.id}`}
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

      {/* Incident Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              Detailed information about the incident
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <p className="text-sm">{selectedIncident.title}</p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedIncident.location}</p>
                </div>
                <div>
                  <Label>District</Label>
                  <p className="text-sm">{selectedIncident.district}</p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedIncident.severity)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedIncident.status)}</div>
                </div>
                <div>
                  <Label>Reported By</Label>
                  <p className="text-sm">{selectedIncident.reportedBy || "Unknown"}</p>
                </div>
                <div>
                  <Label>Reported On</Label>
                  <p className="text-sm">
                    {selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : "N/A"}
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
