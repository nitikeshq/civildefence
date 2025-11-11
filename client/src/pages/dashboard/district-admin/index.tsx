import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoutCard from "@/components/LogoutCard";
import type { Volunteer, Incident, InventoryItem } from "@shared/schema";
import { redirectToSignIn } from "@/lib/authRedirect";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  Package, 
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
  Plus,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DistrictAdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        redirectToSignIn();
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
    enabled: isAuthenticated,
  });

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    enabled: isAuthenticated,
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const districtVolunteers = volunteers.filter(v => v.district === user?.district);
  const districtIncidents = incidents.filter(i => i.district === user?.district);
  const districtInventory = inventory.filter(i => i.district === user?.district);

  const pendingVolunteers = districtVolunteers.filter(v => v.status === "pending");
  const approvedVolunteers = districtVolunteers.filter(v => v.status === "approved");
  const activeIncidents = districtIncidents.filter(i => i.status !== "closed");
  const criticalIncidents = districtIncidents.filter(i => i.severity === "critical");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              District Administration Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage volunteers and incidents in {user?.district} District
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtVolunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedVolunteers.length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingVolunteers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Need your review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{activeIncidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {criticalIncidents.length} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtInventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Items in district
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volunteer Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Volunteer Management
                </CardTitle>
                <CardDescription>
                  Review and approve volunteer registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingVolunteers.length > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        {pendingVolunteers.length} application{pendingVolunteers.length !== 1 ? 's' : ''} awaiting approval
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/volunteers/approval" asChild>
                      <Button className="w-full" variant="default" data-testid="button-approve-volunteers">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review Applications ({pendingVolunteers.length})
                      </Button>
                    </Link>
                    <Link href="/volunteers/approval" asChild>
                      <Button className="w-full" variant="outline" data-testid="button-all-volunteers">
                        <Users className="mr-2 h-4 w-4" />
                        View All Volunteers ({districtVolunteers.length})
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Management
                </CardTitle>
                <CardDescription>
                  Create and manage district incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalIncidents.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm font-medium text-destructive">
                        {criticalIncidents.length} critical incident{criticalIncidents.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/incident-reporting" asChild>
                      <Button className="w-full" variant="default" data-testid="button-report-incident">
                        <Plus className="mr-2 h-4 w-4" />
                        Report New Incident
                      </Button>
                    </Link>
                    <Link href="/incident-reporting" asChild>
                      <Button className="w-full" variant="outline" data-testid="button-manage-incidents">
                        <MapPin className="mr-2 h-4 w-4" />
                        Manage Incidents ({districtIncidents.length})
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
                <CardDescription>
                  Track district equipment and supplies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/inventory" asChild>
                    <Button className="w-full" variant="default" data-testid="button-manage-inventory">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Inventory ({districtInventory.length})
                    </Button>
                  </Link>
                  <Link href="/inventory" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-add-equipment">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Equipment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  District Reports
                </CardTitle>
                <CardDescription>
                  Generate reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="default" data-testid="button-district-report">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate District Report
                    </Button>
                  </Link>
                  <Link href="/mis-reports" asChild>
                    <Button className="w-full" variant="outline" data-testid="button-export-data">
                      <FileText className="mr-2 h-4 w-4" />
                      Export Data (Excel/PDF)
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Volunteer Applications</CardTitle>
                <CardDescription>Latest registrations in your district</CardDescription>
              </CardHeader>
              <CardContent>
                {districtVolunteers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No volunteer applications yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {districtVolunteers.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{volunteer.fullName}</p>
                          <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                        </div>
                        <Badge variant={volunteer.status === "approved" ? "default" : volunteer.status === "pending" ? "secondary" : "destructive"}>
                          {volunteer.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
                <CardDescription>Current incidents in {user?.district}</CardDescription>
              </CardHeader>
              <CardContent>
                {activeIncidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No active incidents
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeIncidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${incident.severity === 'critical' ? 'text-destructive' : 'text-orange-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">{incident.location}</p>
                        </div>
                        <Badge variant={incident.severity === "critical" ? "destructive" : "default"}>
                          {incident.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <LogoutCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
