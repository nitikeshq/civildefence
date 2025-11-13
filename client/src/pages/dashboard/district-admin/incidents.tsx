import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, MapPin, Calendar, AlertCircle } from "lucide-react";
import type { Incident } from "@shared/schema";
import { format } from "date-fns";

export default function DistrictAdminIncidents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const filteredIncidents = incidents.filter(
    (i) =>
      i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportedIncidents = filteredIncidents.filter((i) => i.status === "reported");
  const assignedIncidents = filteredIncidents.filter((i) => i.status === "assigned");
  const inProgressIncidents = filteredIncidents.filter((i) => i.status === "in_progress");
  const resolvedIncidents = filteredIncidents.filter((i) => i.status === "resolved");
  const closedIncidents = filteredIncidents.filter((i) => i.status === "closed");

  const activeIncidents = filteredIncidents.filter(
    (i) => i.status === "reported" || i.status === "assigned" || i.status === "in_progress"
  );

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

  const IncidentTable = ({ incidents }: { incidents: Incident[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reported</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No incidents found
            </TableCell>
          </TableRow>
        ) : (
          incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{incident.location}</span>
                </div>
              </TableCell>
              <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
              <TableCell>{getStatusBadge(incident.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(incident.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedIncident(incident);
                    setShowDetailsDialog(true);
                  }}
                  data-testid={`button-view-${incident.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Incident Management</h1>
          <p className="text-muted-foreground">Monitor and manage emergency incidents</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-incidents"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportedIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Being handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" data-testid="tab-active">
                Active ({activeIncidents.length})
              </TabsTrigger>
              <TabsTrigger value="reported" data-testid="tab-reported">
                Reported ({reportedIncidents.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" data-testid="tab-resolved">
                Resolved ({resolvedIncidents.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({filteredIncidents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <IncidentTable incidents={activeIncidents} />
            </TabsContent>

            <TabsContent value="reported" className="mt-4">
              <IncidentTable incidents={reportedIncidents} />
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              <IncidentTable incidents={resolvedIncidents} />
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <IncidentTable incidents={filteredIncidents} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>Complete information about this incident</DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedIncident.title}</h3>
                <div className="flex gap-2 mt-2">
                  {getSeverityBadge(selectedIncident.severity)}
                  {getStatusBadge(selectedIncident.status)}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{selectedIncident.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">District</p>
                  <p className="text-sm text-muted-foreground">{selectedIncident.district}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reported On</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedIncident.createdAt), "PPP p")}
                  </p>
                </div>
                {selectedIncident.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium">Resolved On</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedIncident.resolvedAt), "PPP p")}
                    </p>
                  </div>
                )}
              </div>

              {selectedIncident.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedIncident.description}
                  </p>
                </div>
              )}

              {selectedIncident.assignedVolunteers && selectedIncident.assignedVolunteers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Assigned Volunteers</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.assignedVolunteers.length} volunteer(s) assigned
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
